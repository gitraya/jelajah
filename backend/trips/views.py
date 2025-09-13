from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import Trip, TripStatus, MemberStatus
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import TripSerializer
from .permissions import IsTripAccessible

User = get_user_model()

class TripViewSet(ModelViewSet):
    """
    ViewSet for Trip CRUD operations with custom actions
    """
    serializer_class = TripSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsTripAccessible]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        qs = Trip.objects.select_related("owner", "location").prefetch_related("trip_members__user")

        if self.action == "list":
            is_public = self.request.query_params.get("is_public")
            if not self.request.user.is_authenticated or is_public:
                return qs.filter(is_public=True)
            user = self.request.user
            return qs.filter(
                Q(is_public=True) | Q(owner=user) | 
                Q(trip_members__user=user, trip_members__status=MemberStatus.ACCEPTED)
            ).distinct()

        return qs
    
    def destroy(self, request, *args, **kwargs):
        trip = self.get_object()
        self.check_object_permissions(request, trip)

        trip.update(status=TripStatus.DELETED)
        return Response(status=204)
