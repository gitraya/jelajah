from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChecklistItemViewSet, ChecklistStatisticsViewSet

# Trip-specific checklist items router
trip_router = DefaultRouter()
trip_router.register(r'items', ChecklistItemViewSet, basename='checklist-item')
trip_router.register(r'statistics', ChecklistStatisticsViewSet, basename='checklist-statistics')

urlpatterns = [
    path('trips/<uuid:trip_id>/checklist/', include(trip_router.urls)),
]
