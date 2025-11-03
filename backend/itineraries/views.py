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
        type_id = self.request.query_params.get("type_id")
        status = self.request.query_params.get("status")
        trip_id = self.kwargs.get('trip_id')
        queryset = ItineraryItem.objects.filter(trip_id=trip_id)
        if type_id:
            queryset = queryset.filter(type_id=type_id)
        if status:
            queryset = queryset.filter(status=status.upper())
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trip_id'] = self.kwargs.get('trip_id')
        return context
    
class ItineraryOrganizedListViewSet(viewsets.ViewSet):
    """Itinerary items desc sorted by visit_time & only not skipped items."""
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]

    def list(self, request, trip_id=None):
        items = ItineraryItem.objects.filter(trip_id=trip_id).exclude(status='SKIPPED').order_by('-visit_time')
        serializer = ItineraryItemSerializer(items, many=True)
        return Response(serializer.data)

class ItineraryItemStatisticsViewSet(viewsets.ViewSet):
    """Statistics for itinerary items in a trip."""
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]

    def list(self, request, trip_id=None):
        total = ItineraryItem.objects.filter(trip_id=trip_id).count()
        visited = ItineraryItem.objects.filter(trip_id=trip_id, status='VISITED').count()
        planned = ItineraryItem.objects.filter(trip_id=trip_id, status='PLANNED').count()
        skipped = ItineraryItem.objects.filter(trip_id=trip_id, status='SKIPPED').count()

        return Response({
            "total": total,
            "visited": visited,
            "planned": planned,
            "skipped": skipped
        })
