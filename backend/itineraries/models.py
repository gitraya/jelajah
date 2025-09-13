from django.db import models
from backend.models import BaseModel

class ItineraryDay(BaseModel):
    """Represents a single day in a trip itinerary"""
    trip = models.ForeignKey('trips.Trip', on_delete=models.CASCADE, related_name='days')
    date = models.DateField()
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.trip.title} - {self.date}"
    
    class Meta:
        ordering = ['date']
        unique_together = ['trip', 'date']

class ItineraryItem(BaseModel):
    """Individual activity or event within an itinerary day"""
    day = models.ForeignKey(ItineraryDay, on_delete=models.CASCADE, related_name='items')
    time = models.TimeField()
    activity = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.time} - {self.activity}"
    
    class Meta:
        ordering = ['time']
