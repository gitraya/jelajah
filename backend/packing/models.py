from django.db import models
from backend.models import BaseModel
from trips.models import Trip, TripMember

class PackingCategory(BaseModel):
    """Categories for packing items (e.g., Clothes, Electronics)"""
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Packing Categories"


class PackingItem(BaseModel):
    """Individual items to pack for a trip"""
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='packing_items')
    name = models.CharField(max_length=100)
    category = models.ForeignKey(PackingCategory, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    packed = models.BooleanField(default=False)
    assigned_to = models.ForeignKey(TripMember, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']
