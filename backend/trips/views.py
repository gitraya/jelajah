from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Trip
from .serializers import TripSerializer
from django.db import models

class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Get trips owned by the user or where user is a member
        return Trip.objects.filter(
            models.Q(owner=user) | models.Q(members=user)
        ).distinct()
