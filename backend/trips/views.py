from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q
from django.contrib.auth import get_user_model
import time

from .models import Trip, TripStatus, MemberStatus, TripMember
from rest_framework.permissions import IsAuthenticated
from .serializers import TripSerializer
from .permissions import IsTripAccessible
from backend.services import send_templated_email

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
        qs = Trip.objects.select_related("owner", "location").prefetch_related("trip_members__user")

        if self.action == "list":
            is_public = self.request.query_params.get("is_public")
            if not self.request.user.is_authenticated or is_public:
                return qs.filter(is_public=True).exclude(status=TripStatus.DELETED)
            user = self.request.user
            return qs.filter(
                (Q(is_public=True) | Q(owner=user) | 
                 Q(trip_members__user=user, trip_members__status=MemberStatus.ACCEPTED)) & ~Q(status=TripStatus.DELETED)
            ).distinct()

        return qs
    
    def destroy(self, request, *args, **kwargs):
        trip = self.get_object()
        self.check_object_permissions(request, trip)

        trip.update(status=TripStatus.DELETED)
        return Response(status=204)
    
    @action(detail=True, methods=['post'], url_path='invite', url_name='invite-new-members')
    def invite_new_members(self, request, pk=None):
        """Invite new members to a trip"""
        trip = self.get_object()
        self.check_object_permissions(request, trip)

        member_emails = request.data.get('member_emails', [])
        if not isinstance(member_emails, list):
            return Response({"error": "member_emails must be a list"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get existing users by email
        existing_users = User.objects.filter(email__in=member_emails)
        existing_emails = set(existing_users.values_list('email', flat=True))
        new_user_emails = set(member_emails) - existing_emails

        # Create new users for non-existing emails
        if new_user_emails:
            new_users = []
            for email in new_user_emails:
                user = User(email=email, is_active=True)
                user.set_unusable_password()
                new_users.append(user)
            User.objects.bulk_create(new_users)
            
        # Get all user IDs in one query
        all_invited_users = User.objects.filter(email__in=member_emails)
        existing_member_ids = set(trip.trip_members.values_list('user_id', flat=True))
        new_member_ids = set(all_invited_users.values_list('id', flat=True)) - existing_member_ids

        for user_id in new_member_ids:
            TripMember.objects.create(user_id=user_id, trip=trip, status=MemberStatus.PENDING)
            
        new_users_to_invite = User.objects.filter(id__in=new_member_ids)
      
        # Send invitation emails
        for user in new_users_to_invite:
            context = {
                'user_name': user.first_name or user.email,
                'trip_name': trip.title,
                'inviter_name': request.user.first_name or request.user.email,
                'trip_link': f"{request.scheme}://{request.get_host()}/trips/{trip.id}/",
                'current_year': time.strftime("%Y"),
            }

            send_templated_email(
                recipient_email=user.email,
                subject=f"You're invited to join the trip: {trip.title}",
                template_name='trip_invitation',
                context=context
            )

        return Response({"message": "Invitations sent"}, status=status.HTTP_200_OK)
