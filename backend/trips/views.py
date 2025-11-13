from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.db import models

from .models import Trip, TripStatus, MemberStatus, TripMember, Tag
from .serializers import TripSerializer, TripMemberSerializer, TagSerializer
from .permissions import IsTripAccessible
from expenses.models import ExpenseSplit
from itineraries.models import ItineraryItem
from checklist.models import ChecklistItem
from datetime import timedelta

User = get_user_model()

class TripViewSet(ModelViewSet):
    """
    ViewSet for Trip CRUD operations with custom actions
    """
    serializer_class = TripSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsTripAccessible]
        else:
            permission_classes = [IsAuthenticated, IsTripAccessible]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        qs = Trip.objects.select_related('owner').prefetch_related('trip_members__user').all()
        
        if self.action == "list":
            is_public = self.request.query_params.get("is_public")
            if not self.request.user.is_authenticated or is_public:
                qs = qs.filter(is_public=True).exclude(status=TripStatus.DELETED).exclude(status=TripStatus.CANCELLED)
            else:
                user = self.request.user
                qs = qs.filter(
                    (Q(is_public=True) | Q(owner=user) | 
                    Q(trip_members__user=user, trip_members__status=MemberStatus.ACCEPTED)) & ~Q(status=TripStatus.DELETED)
                ).distinct()
            
            # Apply additional filters from query params
            destination = self.request.query_params.get("destination")
            if destination:
                qs = qs.filter(destination__icontains=destination)
            
            difficulty = self.request.query_params.get("difficulty")
            if difficulty:
                qs = qs.filter(difficulty=difficulty.upper())
            
            status = self.request.query_params.get("status")
            if status:
                qs = qs.filter(status=status.upper())
            
            title = self.request.query_params.get("title")
            if title:
                qs = qs.filter(title__icontains=title)

        return qs
    
    def destroy(self, request, *args, **kwargs):
        trip = self.get_object()
        self.check_object_permissions(request, trip)

        trip.update(status=TripStatus.DELETED)
        return Response(status=204)
    
class TripMemberViewSet(ModelViewSet):
    """
    ViewSet for TripMember CRUD operations
    """
    serializer_class = TripMemberSerializer
    permission_classes = [IsAuthenticated, IsTripAccessible]

    def get_queryset(self):
        return TripMember.objects.select_related('trip', 'user').all()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trip_id'] = self.kwargs.get('trip_id')
        return context
    
class TripMemberStatisticsView(generics.RetrieveAPIView):
    """
    View to get statistics of trip members by their status
    """
    permission_classes = [IsAuthenticated, IsTripAccessible]

    def get(self, request, trip_id=None):
        total = TripMember.objects.filter(trip_id=trip_id).count()
        pending = TripMember.objects.filter(trip_id=trip_id, status=MemberStatus.PENDING).count()
        accepted = TripMember.objects.filter(trip_id=trip_id, status=MemberStatus.ACCEPTED).count()
        declined = TripMember.objects.filter(trip_id=trip_id, status=MemberStatus.DECLINED).count()
        blocked = TripMember.objects.filter(trip_id=trip_id, status=MemberStatus.BLOCKED).count()
        # Calculate total expenses for all accepted members
        accepted_members = TripMember.objects.filter(trip_id=trip_id, status=MemberStatus.ACCEPTED)
        total_expenses = sum(
            ExpenseSplit.objects.filter(
            expense__trip_id=trip_id,
            member=member
            ).aggregate(total=models.Sum('amount'))['total'] or 0
            for member in accepted_members
        )
        
        # Calculate average expense
        accepted_count = accepted_members.count()
        average_expense = total_expenses / accepted_count if accepted_count > 0 else 0

        return Response({
            "total": total,
            "pending": pending,
            "accepted": accepted,
            "declined": declined,
            "blocked": blocked,
            "average_expense": average_expense,
            "total_expenses": total_expenses,
        })
        
class TripItinerarySummaryView(generics.RetrieveAPIView):
    """
    View to get itinerary summary for a trip
    """
    permission_classes = [IsAuthenticated, IsTripAccessible]
    queryset = Trip.objects.all()

    def get(self, request, trip_id=None):
        trip = Trip.objects.filter(id=trip_id).only('start_date', 'end_date').first()
        start_date, end_date = trip.start_date, trip.end_date
        if not start_date or not end_date:
            return Response({"detail": "Trip dates are not set."}, status=status.HTTP_400_BAD_REQUEST)

        allChecklistItems = ChecklistItem.objects.filter(trip_id=trip_id)
        allLocations = ItineraryItem.objects.filter(trip_id=trip_id)


        summary = []
        day_count = (end_date - start_date).days + 1
        for i in range(day_count):
            d = start_date + timedelta(days=i)
            
            # "Month Day" label like "March 17"
            date_label = f"{d.strftime('%B')} {d.day}"

            tasks = allChecklistItems.filter(due_date=d).count()
            tasks_completed = allChecklistItems.filter(
                due_date=d, is_completed=True
            ).count()
            
            locations = allLocations.filter(
                visit_time__date=d
            ).only('name', 'address', 'status')
            locations_visited = locations.filter(status='VISITED').count()

            summary.append({
                "date": date_label,
                "locations": [loc.address for loc in locations],
                "itineraries": [loc.name for loc in locations],
                "tasks": tasks,
                "locations_visited": locations_visited,
                "tasks_completed": tasks_completed,
            })
        
        
        return Response(summary)

class TripStatisticsView(generics.RetrieveAPIView):
    """
    View to get overall trip statistics
    """
    permission_classes = []
    
    def get(self, request):
        tripObjects = Trip.objects.exclude(status=TripStatus.DELETED).exclude(status=TripStatus.CANCELLED)
        total = tripObjects.count()
        public = tripObjects.filter(is_public=True).count()
        private = tripObjects.filter(is_public=False).count()
        joinable = tripObjects.filter(is_joinable=True).count()
        public_destinations = tripObjects.filter(is_public=True).values_list('destination', flat=True).distinct()
        private_destinations = tripObjects.filter(is_public=False).values_list('destination', flat=True).distinct()
        public_average_budget = tripObjects.filter(is_public=True).aggregate(models.Avg('budget'))['budget__avg'] or 0
        private_average_budget = tripObjects.filter(is_public=False).aggregate(models.Avg('budget'))['budget__avg'] or 0

        return Response({
            "total": total,
            "public": public,
            "private": private,
            "joinable": joinable,
            "public_destinations": list(public_destinations),
            "private_destinations": list(private_destinations),
            "public_average_budget": public_average_budget,
            "private_average_budget": private_average_budget,
        })


class TagListView(generics.ListAPIView):
    """
    View to list all unique tags used in trips
    """
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    queryset = Tag.objects.all()
