from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, TripMemberListView

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    path('', include(router.urls)),
    path('trips/<uuid:trip_id>/members/', TripMemberListView.as_view(), name='trip-members'),
    
]
