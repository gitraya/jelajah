from rest_framework import status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q
from django.contrib.auth import get_user_model
import time

from .models import Trip, TripStatus, MemberStatus, TripMember
from rest_framework.permissions import IsAuthenticated
from .serializers import TripSerializer, TripMemberSerializer
from .permissions import IsTripAccessible
from backend.services import send_templated_email

User = get_user_model()

class TripViewSet(ModelViewSet):
    """
    ViewSet for Trip CRUD operations with custom actions
    """
    serializer_class = TripSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsTripAccessible]
        else:
            permission_classes = [IsAuthenticated, IsTripAccessible]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        qs = Trip.objects.select_related("owner", "location").prefetch_related("trip_members__user")

        if self.action == "list":
            is_public = self.request.query_params.get("is_public")
            if not self.request.user.is_authenticated or is_public:
                return qs.filter(is_public=True).exclude(status=TripStatus.DELETED)
            user = self.request.user
            return qs.filter(
                (Q(is_public=True) | Q(owner=user) | 
                 Q(trip_members__user=user, trip_members__status=MemberStatus.ACCEPTED)) & ~Q(status=TripStatus.DELETED)
            ).distinct()

        return qs
    
    def destroy(self, request, *args, **kwargs):
        trip = self.get_object()
        self.check_object_permissions(request, trip)

        trip.update(status=TripStatus.DELETED)
        return Response(status=204)
    
class TripMemberViewSet(ModelViewSet):
    """
    ViewSet for TripMember CRUD operations
    """
    serializer_class = TripMemberSerializer
    permission_classes = [IsAuthenticated, IsTripAccessible]

    def get_queryset(self):
        return TripMember.objects.select_related('trip', 'user').all()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['trip_id'] = self.kwargs.get('trip_id')
        return context
