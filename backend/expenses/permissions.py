from rest_framework import permissions
from trips.models import Trip, MemberStatus, MemberRole

class IsExpenseAccessible(permissions.BasePermission):
    """
    - Only trip owners or members with accepted status can access expenses of a trip
    - Trip owners have full access (create, update, delete) to expenses
    - Members with roles other than 'MEMBER' can create, update, and delete expenses
    - Members with 'MEMBER' role can only view expenses
    """
    
    def has_permission(self, request, view):
        trip_id = view.kwargs.get('trip_id')
        if not trip_id:
            return False
        
        if not request.user.is_authenticated:
            return False

        trip = Trip.objects.filter(id=trip_id).first()
        if not trip:
            return False
        
        user = request.user
        is_member = trip.trip_members.filter(
            user=user,
            status=MemberStatus.ACCEPTED
        ).exists()

        if view.action in ['list', 'retrieve']:
            return trip.owner == user or is_member

        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            if trip.owner == user:
                return True
            member = trip.trip_members.filter(
                user=user,
                status=MemberStatus.ACCEPTED
            ).first()
            if member and member.role != MemberRole.MEMBER:
                return True
        
        return False
