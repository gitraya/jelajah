from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, TripMemberViewSet, TripMemberStatisticsView

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

members_router = DefaultRouter()
members_router.register(r'items', TripMemberViewSet, basename='trip-member')

urlpatterns = [
    path('', include(router.urls)),
    path('trips/<uuid:trip_id>/members/', include(members_router.urls)),
    path('trips/<uuid:trip_id>/members/statistics/', TripMemberStatisticsView.as_view(), name='trip-member-statistics'),
]
