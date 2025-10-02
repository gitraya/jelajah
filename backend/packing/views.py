from rest_framework import viewsets, permissions, mixins
from .models import PackingCategory, PackingItem
from .serializers import PackingCategorySerializer, PackingItemSerializer
from .permissions import TripAccessPermission

class PackingCategoryViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = PackingCategory.objects.all()
    serializer_class = PackingCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

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
