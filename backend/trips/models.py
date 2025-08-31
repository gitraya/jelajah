from django.db import models
from django.conf import settings

class TripStatus(models.TextChoices):
    PLANNED = 'PLANNED', 'Planned'
    ONGOING = 'ONGOING', 'Ongoing'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'
    DELETED = 'DELETED', 'Deleted'

class MemberStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    ACCEPTED = 'ACCEPTED', 'Accepted'
    DECLINED = 'DECLINED', 'Declined'
    BLOCKED = 'BLOCKED', 'Blocked'

class TripMember(models.Model):
    trip = models.ForeignKey('Trip', on_delete=models.CASCADE, related_name='trip_members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=MemberStatus.choices,
        default=MemberStatus.PENDING
    )

class Location(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

class Trip(models.Model):
    """Main trip model for travel planning"""
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_trips')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='trips')
    start_date = models.DateField()
    end_date = models.DateField()
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through=TripMember, related_name='trips')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_public = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=10,
        choices=TripStatus.choices,
        default=TripStatus.PLANNED
    )

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-start_date']
