from rest_framework import viewsets, permissions
from .models import ItineraryDay, ItineraryItem
from .serializers import ItineraryDaySerializer, ItineraryDayDetailSerializer, ItineraryItemSerializer
from trips.models import Trip
from django.db import models

class TripAccessPermission(permissions.BasePermission):
    """Permission to only allow trip members or owners to access itinerary"""
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

class ItineraryDayViewSet(viewsets.ModelViewSet):
    serializer_class = ItineraryDaySerializer
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]
    
    def get_queryset(self):
        trip_id = self.kwargs.get('trip_id')
        return ItineraryDay.objects.filter(trip_id=trip_id).order_by('date')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trip_id'] = self.kwargs.get('trip_id')
        return context
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return ItineraryDayDetailSerializer
        return ItineraryDaySerializer

class ItineraryItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItineraryItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        day_id = self.kwargs.get('day_id')
        return ItineraryItem.objects.filter(day_id=day_id).order_by('time')
    
    def perform_create(self, serializer):
        day_id = self.kwargs.get('day_id')
        serializer.save(day_id=day_id)
