from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChecklistItemViewSet, ChecklistStatisticsView

trip_router = DefaultRouter()
trip_router.register(r'items', ChecklistItemViewSet, basename='checklist-item')

urlpatterns = [
    path('trips/<uuid:trip_id>/checklist/', include(trip_router.urls)),
    path('trips/<uuid:trip_id>/checklist/statistics/', ChecklistStatisticsView.as_view(), name='checklist-statistics'),
]
