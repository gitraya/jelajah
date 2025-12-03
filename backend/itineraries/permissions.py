from rest_framework import permissions
from trips.models import Trip, MemberStatus, MemberRole

class IsItineraryItemAccessible(permissions.BasePermission):
    """
    - Only trip owners or members with accepted status or is_public can view itinerary items.
    - Trip owners and members with roles other than 'MEMBER' can create, update, and delete itinerary items.
    - Members with 'MEMBER' role can only view itinerary items.
    """
    
    def has_permission(self, request, view):
        trip_id = view.kwargs.get('trip_id')
        if not trip_id:
            return False
        
        trip = Trip.objects.filter(id=trip_id).first()
        if not trip:
            return False
        
        is_read_action = view.action in ['list', 'retrieve']
        
        if trip.is_public and is_read_action:
            return True

        if not request.user.is_authenticated:
            return False

        user = request.user
        is_member = trip.trip_members.filter(
            user=user,
            status=MemberStatus.ACCEPTED
        ).exists()
        
        if is_read_action:
            return trip.owner == user or is_member

        if not is_read_action:
            if trip.owner == user:
                return True
            member = trip.trip_members.filter(
                user=user,
                status=MemberStatus.ACCEPTED
            ).first()
            if member and member.role != MemberRole.MEMBER:
                return True
        return False
