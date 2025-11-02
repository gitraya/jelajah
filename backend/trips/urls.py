from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, TripMemberViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

trip_router = DefaultRouter()
trip_router.register(r'members', TripMemberViewSet, basename='trip-member')

urlpatterns = [
    path('', include(router.urls)),
    path('trips/<uuid:trip_id>/', include(trip_router.urls)),
]
