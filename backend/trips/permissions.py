from rest_framework.permissions import BasePermission
from .models import MemberStatus


class IsTripAccessible(BasePermission):
    """
    - Anyone can view public trips
    - Authenticated users can view trips they own or are a member of
    - Only owners can edit/delete
    """

    def has_object_permission(self, request, view, obj):
        if view.action in ["retrieve", "list"]:
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
        # For update/delete → only owner
        return obj.owner == request.user
