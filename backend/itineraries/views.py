from rest_framework import viewsets, permissions
from rest_framework.response import Response
from backend.permissions import TripAccessPermission
from .models import ItineraryType, ItineraryItem
from .serializers import ItineraryTypeSerializer, ItineraryItemSerializer

class ItineraryTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """Itinerary types."""
    queryset = ItineraryType.objects.all()
    serializer_class = ItineraryTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class ItineraryItemViewSet(viewsets.ModelViewSet):
    """Itinerary items for a specific trip."""
    serializer_class = ItineraryItemSerializer
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]
    
    def get_queryset(self):
        trip_id = self.kwargs.get('trip_id')
        return ItineraryItem.objects.filter(trip_id=trip_id)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trip_id'] = self.kwargs.get('trip_id')
        return context

class ItineraryItemStatisticsViewSet(viewsets.ViewSet):
    """Statistics for itinerary items in a trip."""
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]

    def list(self, request, trip_id=None):
        total_items = ItineraryItem.objects.filter(trip_id=trip_id).count()
        visited_items = ItineraryItem.objects.filter(trip_id=trip_id, status='VISITED').count()
        planned_items = ItineraryItem.objects.filter(trip_id=trip_id, status='PLANNED').count()
        skipped_items = ItineraryItem.objects.filter(trip_id=trip_id, status='SKIPPED').count()

        return Response({
            "total_items": total_items,
            "visited_items": visited_items,
            "planned_items": planned_items,
            "skipped_items": skipped_items
        })
