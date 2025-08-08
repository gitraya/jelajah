from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItineraryDayViewSet, ItineraryItemViewSet

# Nested routers for trip -> days -> items
days_router = DefaultRouter()
days_router.register(r'days', ItineraryDayViewSet, basename='itinerary-day')

items_router = DefaultRouter()
items_router.register(r'items', ItineraryItemViewSet, basename='itinerary-item')

urlpatterns = [
    path('trips/<int:trip_id>/', include(days_router.urls)),
    path('days/<int:day_id>/', include(items_router.urls)),
]
