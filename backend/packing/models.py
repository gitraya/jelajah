from django.db import models
from django.conf import settings
from backend.models import BaseModel

class PackingCategory(BaseModel):
    """Categories for packing items (e.g., Clothes, Electronics)"""
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Packing Categories"

class PackingItem(BaseModel):
    """Individual items to pack for a trip"""
    trip = models.ForeignKey('trips.Trip', on_delete=models.CASCADE, related_name='packing_items')
    name = models.CharField(max_length=100)
    category = models.ForeignKey(PackingCategory, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    packed = models.BooleanField(default=False)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return self.name
