from rest_framework import viewsets, permissions
from .models import ChecklistItem
from .serializers import ChecklistItemSerializer
from backend.permissions import TripAccessPermission
from rest_framework.response import Response
from django.db.models import Count, Case, When
from django.utils import timezone

class ChecklistItemViewSet(viewsets.ModelViewSet):
    """Checklist items for a specific trip."""
    serializer_class = ChecklistItemSerializer
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]
    
    def get_queryset(self):
        category = self.request.query_params.get("category")
        upcoming = self.request.query_params.get("upcoming")
        trip_id = self.kwargs.get('trip_id')
        queryset = ChecklistItem.objects.filter(trip_id=trip_id)
        if category:
            queryset = queryset.filter(category=category)
        if upcoming == 'true':
            now = timezone.now()
            queryset = queryset.filter(is_completed=False, due_date__gte=now).order_by('due_date')[:3]
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trip_id'] = self.kwargs.get('trip_id')
        return context
    
class ChecklistStatisticsViewSet(viewsets.ViewSet):
    """Statistics for checklist items in a trip."""
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]
    
    def list(self, request, trip_id=None):
        total_items = ChecklistItem.objects.filter(trip_id=trip_id).count()
        completed_items = ChecklistItem.objects.filter(trip_id=trip_id, is_completed=True).count()
        
        # list of categories with counts of total and completed items
        category_stats = ChecklistItem.objects.filter(trip_id=trip_id).values('category').annotate(
            total=Count('id'),
            completed=Count(Case(When(is_completed=True, then=1)))
        )

        return Response({
            'total_items': total_items,
            'completed_items': completed_items,
            'pending_items': total_items - completed_items,
            'category_stats': category_stats,
        })
