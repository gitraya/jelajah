from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PackingCategoryViewSet, PackingItemViewSet

router = DefaultRouter()
router.register(r'packing/categories', PackingCategoryViewSet)

packing_items_router = DefaultRouter()
packing_items_router.register(r'items', PackingItemViewSet, basename='packing-item')

urlpatterns = [
    path('', include(router.urls)),
    path('trips/<uuid:trip_id>/packing/', include(packing_items_router.urls)),
]
