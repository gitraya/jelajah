from rest_framework import permissions
from trips.models import Trip
from django.db import models

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
