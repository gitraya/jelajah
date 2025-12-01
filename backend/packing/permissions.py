from rest_framework import permissions
from trips.models import Trip, MemberStatus, MemberRole

class IsPackingItemAccessible(permissions.BasePermission):
    """
    - Only trip owners or members with accepted status or is_public can view packing items.
    - Trip owners and members with roles other than 'MEMBER' can create, update, and delete packing items.
    - Members with 'MEMBER' role can view packing items and create, update, delete packing items with assigned_to themselves.
    """
    
    def has_permission(self, request, view):
        trip_id = view.kwargs.get('trip_id')
        if not trip_id:
            return False
        
        user = request.user
        trip = Trip.objects.filter(id=trip_id).first()
        if not trip:
            return False
        
        is_member = trip.trip_members.filter(
            user=user,
            status=MemberStatus.ACCEPTED
        ).exists()

        if view.action in ['list', 'retrieve']:
            return trip.owner == user or is_member or trip.is_public

        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            if trip.owner == user:
                return True
            member = trip.trip_members.filter(
                user=user,
                status=MemberStatus.ACCEPTED
            ).first()
            if member:
                if member.role != MemberRole.MEMBER:
                    return True
                else:
                    if view.action in ['update', 'partial_update', 'destroy']:
                        packing_item = view.get_object()
                        return packing_item.assigned_to and packing_item.assigned_to.user == user
                    elif view.action == 'create':
                        assigned_to_id = request.data.get('assigned_to')
                        return assigned_to_id == member.id
                    
        
        return False
