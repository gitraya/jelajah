from django.db import models
from backend.models import BaseModel
from trips.models import Trip, TripMember

class ChecklistCategory(models.TextChoices):
    PRE_TRIP = 'PRE_TRIP', 'Pre-Trip'
    DURING_TRIP = 'DURING_TRIP', 'During Trip'
    POST_TRIP = 'POST_TRIP', 'Post-Trip'
        
class ChecklistPriority(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'

class ChecklistItem(BaseModel):
    """Model representing a checklist item for a trip."""
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='checklist_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, max_length=2000)
    category = models.CharField(max_length=20, choices=ChecklistCategory.choices, default=ChecklistCategory.PRE_TRIP)
    priority = models.CharField(max_length=10, choices=ChecklistPriority.choices, default=ChecklistPriority.MEDIUM)
    due_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    assigned_to = models.ForeignKey(TripMember, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_checklist_items')
    position = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']
