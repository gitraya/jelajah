from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItineraryTypeViewSet, ItineraryItemViewSet, ItineraryItemStatisticsViewSet, ItineraryOrganizedListViewSet

router = DefaultRouter()
router.register(r'itineraries/types', ItineraryTypeViewSet, basename='itinerary-type')

trip_router = DefaultRouter()
trip_router.register(r'items', ItineraryItemViewSet, basename='itinerary-item')
trip_router.register(r'statistics', ItineraryItemStatisticsViewSet, basename='itinerary-statistics')
trip_router.register(r'organized', ItineraryOrganizedListViewSet, basename='itinerary-organized')

urlpatterns = [
    path('', include(router.urls)),
    path('trips/<uuid:trip_id>/itineraries/', include(trip_router.urls)),
]
