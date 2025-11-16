from rest_framework.permissions import BasePermission
from .models import MemberStatus, TripStatus, MemberRole

class IsTripAccessible(BasePermission):
    """
    - Anyone can view public trips
    - Authenticated users can view trips they own or are a member of
    - Only owners or members with elevated roles can update trips
    - Only owners can delete trips
    """

    def has_object_permission(self, request, view, obj):
        if view.action in ["retrieve", "list"]:
            if obj.status == TripStatus.DELETED:
                return False
            if obj.is_public:
                return True
            if not request.user.is_authenticated:
                return False
            return (
                obj.owner == request.user
                or obj.trip_members.filter(
                    user=request.user, status=MemberStatus.ACCEPTED
                ).exists()
            )
        # For update/delete → only owner or members with elevated roles
        if view.action == "destroy":
            return obj.owner == request.user
        return obj.owner == request.user or obj.trip_members.filter(user=request.user, status=MemberStatus.ACCEPTED).exclude(role=MemberRole.MEMBER).exists()


class IsMemberAccessible(BasePermission):
    """
    - Only trip owners or members with role 'ORGANIZER' can manage trip members
    - Members can view their own membership details
    """

    def has_object_permission(self, request, view, obj):
        trip = obj.trip
        if view.action in ["retrieve", "list"]:
            if obj.user == request.user:
                return True
            return trip.owner == request.user or trip.trip_members.filter(
                user=request.user, status=MemberStatus.ACCEPTED
            ).exists()
        # For create/update/delete → only owner or members with elevated roles
        return trip.owner == request.user or trip.trip_members.filter(
            user=request.user, status=MemberStatus.ACCEPTED, role=MemberRole.ORGANIZER
        ).exists()
