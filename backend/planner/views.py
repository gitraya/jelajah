from rest_framework import viewsets
from .models import Trip
from .serializers import TripSerializer
from rest_framework.permissions import IsAuthenticated

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
