from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PackingCategoryViewSet, PackingItemViewSet, PackingItemStatisticsView

router = DefaultRouter()
router.register(r'packing/categories', PackingCategoryViewSet, basename='packing-category')

trip_router = DefaultRouter()
trip_router.register(r'items', PackingItemViewSet, basename='packing-item')

urlpatterns = [
    path('', include(router.urls)),
    path('trips/<uuid:trip_id>/packing/', include(trip_router.urls)),
    path('trips/<uuid:trip_id>/packing/statistics/', PackingItemStatisticsView.as_view(), name='packing-statistics'),
]
