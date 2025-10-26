from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItineraryTypeViewSet, ItineraryItemViewSet, ItineraryItemStatisticsViewSet

router = DefaultRouter()
router.register(r'itinerary/types', ItineraryTypeViewSet, basename='itinerary-type')

trip_router = DefaultRouter()
trip_router.register(r'items', ItineraryItemViewSet, basename='itinerary-item')
trip_router.register(r'statistics', ItineraryItemStatisticsViewSet, basename='itinerary-statistics')


urlpatterns = [
    path('', include(router.urls)),
    path('trips/<uuid:trip_id>/itinerary/', include(trip_router.urls)),
]
