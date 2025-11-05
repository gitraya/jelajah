from rest_framework import viewsets, permissions, generics
from .models import PackingCategory, PackingItem
from .serializers import PackingCategorySerializer, PackingItemSerializer
from backend.permissions import TripAccessPermission
from rest_framework.response import Response
from django.db.models import Count, Case, When

class PackingCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Packing categories."""
    queryset = PackingCategory.objects.all()
    serializer_class = PackingCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class PackingItemViewSet(viewsets.ModelViewSet):
    """Packing items for a specific trip."""
    serializer_class = PackingItemSerializer
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]
    
    def get_queryset(self):
        category_id = self.request.query_params.get("category_id")
        trip_id = self.kwargs.get('trip_id')
        queryset = PackingItem.objects.filter(trip_id=trip_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trip_id'] = self.kwargs.get('trip_id')
        return context

class PackingItemStatisticsViewSet(generics.GenericAPIView):
    """Statistics for packing items in a trip."""
    permission_classes = [permissions.IsAuthenticated, TripAccessPermission]

    def get(self, request, trip_id=None):
        total_items = PackingItem.objects.filter(trip_id=trip_id).count()
        packed_items = PackingItem.objects.filter(trip_id=trip_id, packed=True).count()
        
        # list of categories with counts of total and packed items
        category_stats = PackingItem.objects.filter(trip_id=trip_id).values('category__name', 'category__id').annotate(
            total=Count('id'),
            packed=Count(Case(When(packed=True, then=1)))
        )
        
        # Transform the values to have nested category object
        category_stats = [
            {
                'category': {
                    'id': item['category__id'],
                    'name': item['category__name']
                },
                'total': item['total'],
                'packed': item['packed']
            }
            for item in category_stats
        ]

        return Response({
            "total_items": total_items,
            "packed_items": packed_items,
            "unpacked_items": total_items - packed_items,
            "category_stats": category_stats
        })
