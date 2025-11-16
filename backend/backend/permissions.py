from rest_framework import permissions
from trips.models import Trip
from django.db import models
from trips.models import MemberStatus

class TripAccessPermission(permissions.BasePermission):
    """Permission to only allow trip members or owners to access packing list"""
    def has_permission(self, request, view):
        trip_id = view.kwargs.get('trip_id')
        if not trip_id:
            return False
        
        user = request.user
        return Trip.objects.filter(
            id=trip_id
        ).filter(
            models.Q(owner=user) | models.Q(members=user)
        ).exists()
        
class IsStatisticAccessible(permissions.BasePermission):
    """Permission to only allow trip members or owners or is_public to access trip statistics"""
    def has_permission(self, request, view):
        trip_id = view.kwargs.get('trip_id')
        if not trip_id:
            return False
        
        user = request.user
        trip = Trip.objects.filter(id=trip_id).first()
        if not trip:
            return False
        
        if trip.is_public:
            return True
        
        return Trip.objects.filter(
            id=trip_id
        ).filter(
            models.Q(owner=user) | models.Q(trip_members__user=user, trip_members__status=MemberStatus.ACCEPTED)
        ).exists()
