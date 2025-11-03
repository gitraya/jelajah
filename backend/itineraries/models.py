from django.db import models
from backend.models import BaseModel
from trips.models import Trip

class ItineraryType(BaseModel):
    """Types for itinerary locations (e.g., Nature, Beach)"""
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Itinerary Types"
        
class ItineraryStatus(models.TextChoices):
    PLANNED = 'PLANNED', 'Planned'
    VISITED = 'VISITED', 'Visited'
    SKIPPED = 'SKIPPED', 'Skipped'

class ItineraryItem(BaseModel):
    """Individual activity or event within an itinerary day"""
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255, blank=True)
    type = models.ForeignKey(ItineraryType, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    estimated_time = models.CharField(max_length=50, null=True, blank=True, help_text="e.g., '2-3 hours', 'Half Day'")
    visit_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=ItineraryStatus.choices, default=ItineraryStatus.PLANNED)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='itinerary_items')
    
    
    def __str__(self):
        return f"{self.visit_time} - {self.name}"
    
    class Meta:
        ordering = ['visit_time']
