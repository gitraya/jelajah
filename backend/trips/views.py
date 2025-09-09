from rest_framework import generics, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import Trip, TripMember, Location, TripStatus, MemberStatus
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    TripSerializer,
    TripMemberSerializer, TripMemberManageSerializer, LocationSerializer
)

User = get_user_model()

class TripViewSet(ModelViewSet):
    """
    ViewSet for Trip CRUD operations with custom actions
    """
    serializer_class = TripSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = Trip.objects.select_related('owner', 'location').prefetch_related('trip_members__user')
        
        if self.action == 'list':
            # For unauthenticated users, only show public trips or trips with is_public filter
            is_public = self.request.query_params.get('is_public', None)
            if not self.request.user.is_authenticated or is_public:
                return queryset.filter(is_public=True)
            # For authenticated users, show relevant trips
            else:
                user = self.request.user
                return queryset.filter(
                    Q(owner=user) | 
                    Q(is_public=True) | 
                    Q(trip_members__user=user, trip_members__status=MemberStatus.ACCEPTED)
                ).distinct()
        
        return queryset
    
    def perform_create(self, serializer):
        member_ids = self.request.data.get('member_ids', [])
        
        # Validate and get users
        if member_ids:
            member_ids = list(set(member_ids)) # Remove duplicates
        
            # Remove the current user's ID if it exists in the list
            if self.request.user.id in member_ids:
                member_ids.remove(self.request.user.id)
                
            users = User.objects.filter(id__in=member_ids)
            if users.count() != len(member_ids):
                existing_ids = list(users.values_list('id', flat=True))
                invalid_ids = set(member_ids) - set(existing_ids)
                raise serializers.ValidationError({
                    'member_ids': f'Users with IDs {list(invalid_ids)} do not exist.'
                })
        else:
            users = []
            
        validated_data = serializer.validated_data.copy()
        validated_data.pop('member_ids', None)
        validated_data.pop('status', None)

        # Create location
        location_data = validated_data.pop('location')
        location, _ = Location.objects.get_or_create(**location_data)

        # Create trip
        trip = Trip.objects.create(
            location=location,
            owner=self.request.user,
            **validated_data
        )

        users = list(users) + [self.request.user]  # Ensure owner is included

        # Add members after trip creation
        for user in users:
            TripMember.objects.create(
                trip=trip,
                user=user,
                status=MemberStatus.ACCEPTED
            )
    
    def perform_update(self, serializer):
        validated_data = serializer.validated_data.copy()
        validated_data.pop('member_ids', None)
        
        if 'location' in validated_data:
            location_data = validated_data.pop('location')
            for attr, value in location_data.items():
                setattr(serializer.instance.location, attr, value)
            serializer.instance.location.save()
        
        serializer.save()
    
    def retrieve(self, request, *args, **kwargs):
        trip = self.get_object()
        
        # Check if user has permission to view this trip
        if not self.can_view_trip(trip, request.user):
            return Response(
                {'error': 'You do not have permission to view this trip.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(trip)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        trip = self.get_object()

        self.can_edit_trip(trip, request)

        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        trip = self.get_object()

        self.can_edit_trip(trip, request)

        # Soft delete by changing status
        trip.status = TripStatus.DELETED
        trip.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Allow users to request to join a trip"""
        trip = self.get_object()
        user = request.user
        
        # Check if trip is public or user is invited
        if not trip.is_public and trip.owner != user:
            return Response(
                {'error': 'This trip is not public.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already a member
        existing_member = TripMember.objects.filter(trip=trip, user=user).first()
        if existing_member:
            return Response(
                {'error': f'You are already {existing_member.get_status_display().lower()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create membership request
        member = TripMember.objects.create(
            trip=trip,
            user=user,
            status=MemberStatus.PENDING if trip.owner != user else MemberStatus.ACCEPTED
        )
        
        serializer = TripMemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Allow users to leave a trip"""
        trip = self.get_object()
        user = request.user
        
        # Owner cannot leave their own trip
        if trip.owner == user:
            return Response(
                {'error': 'Trip owner cannot leave the trip. Transfer ownership or delete the trip.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove membership
        try:
            member = TripMember.objects.get(trip=trip, user=user)
            member.delete()
            return Response({'message': 'Successfully left the trip.'})
        except TripMember.DoesNotExist:
            return Response(
                {'error': 'You are not a member of this trip.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get', 'post'])
    def members(self, request, pk=None):
        """Manage trip members"""
        trip = self.get_object()
        
        if request.method == 'GET':
            # List all members
            members = trip.trip_members.select_related('user').all()
            serializer = TripMemberSerializer(members, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Add new member (owner only)
            if trip.owner != request.user:
                return Response(
                    {'error': 'Only the trip owner can add members.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = TripMemberManageSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(trip=trip)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch', 'delete'], url_path='members/(?P<member_id>[^/.]+)')
    def manage_member(self, request, pk=None, member_id=None):
        """Update or remove specific member"""
        trip = self.get_object()
        member = get_object_or_404(TripMember, id=member_id, trip=trip)
        
        # Only owner can manage members (except users managing themselves)
        if trip.owner != request.user and member.user != request.user:
            return Response(
                {'error': 'You do not have permission to manage this member.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.method == 'PATCH':
            # Update member status
            serializer = TripMemberSerializer(member, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            # Remove member
            if member.user == trip.owner:
                return Response(
                    {'error': 'Cannot remove trip owner from the trip.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            member.delete()
            return Response({'message': 'Member removed successfully.'})
    
    @action(detail=False, methods=['get'])
    def my_trips(self, request):
        """Get current user's trips"""
        user = request.user
        trips = Trip.objects.filter(owner=user).exclude(status=TripStatus.DELETED)
        serializer = TripSerializer(trips, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def joined_trips(self, request):
        """Get trips user has joined"""
        user = request.user
        trips = Trip.objects.filter(
            trip_members__user=user,
            trip_members__status=MemberStatus.ACCEPTED
        ).exclude(owner=user).exclude(status=TripStatus.DELETED)
        serializer = TripSerializer(trips, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_invitations(self, request):
        """Get pending trip invitations for user"""
        user = request.user
        pending_members = TripMember.objects.filter(
            user=user,
            status=MemberStatus.PENDING
        ).select_related('trip')
        
        trips = [member.trip for member in pending_members]
        serializer = TripSerializer(trips, many=True)
        return Response(serializer.data)
    
    def can_view_trip(self, trip, user):
        """Check if user can view the trip"""
        return (
            trip.owner == user or 
            trip.is_public or 
            trip.trip_members.filter(user=user, status=MemberStatus.ACCEPTED).exists()
        )
    
    def can_edit_trip(self, trip, request):
        if trip.owner != request.user:
            return Response(
                {'error': 'You do not have permission for this resource.'},
                status=status.HTTP_403_FORBIDDEN
            )

class LocationListCreateView(generics.ListCreateAPIView):
    """
    List all locations or create a new location
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a location
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

class MyTripsView(generics.ListAPIView):
    """
    List current user's owned trips
    """
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Trip.objects.filter(
            owner=self.request.user
        ).exclude(status=TripStatus.DELETED)

class PublicTripsView(generics.ListAPIView):
    """
    List all public trips
    """
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Trip.objects.filter(
            is_public=True
        ).exclude(status=TripStatus.DELETED)

class TripSearchView(generics.ListAPIView):
    """
    Search trips by various criteria
    """
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Trip.objects.filter(is_public=True).exclude(status=TripStatus.DELETED)
        
        # Search parameters
        search = self.request.query_params.get('search', None)
        location = self.request.query_params.get('location', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(location__name__icontains=search)
            )
        
        if location:
            queryset = queryset.filter(location__name__icontains=location)
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        return queryset
