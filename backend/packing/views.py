from rest_framework import viewsets, permissions
from .models import PackingCategory, PackingItem
from .serializers import PackingCategorySerializer, PackingItemSerializer
from trips.models import Trip
from django.db import models

class PackingCategoryViewSet(viewsets.ModelViewSet):
    queryset = PackingCategory.objects.all()
    serializer_class = PackingCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

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

class PackingItemViewSet(viewsets.ModelViewSet):
    serializer_class = PackingItemSerializer
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]
    
    def get_queryset(self):
        trip_id = self.kwargs.get('trip_id')
        return PackingItem.objects.filter(trip_id=trip_id)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trip_id'] = self.kwargs.get('trip_id')
        return context
