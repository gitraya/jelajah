from django.db import models
from django.conf import settings
from backend.models import BaseModel

class TripStatus(models.TextChoices):
    PLANNED = 'PLANNED', 'Planned'
    ONGOING = 'ONGOING', 'Ongoing'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'
    DELETED = 'DELETED', 'Deleted'
    
class TripDifficulty(models.TextChoices):
    EASY = 'EASY', 'Easy'
    MODERATE = 'MODERATE', 'Moderate'
    CHALLENGING = 'CHALLENGING', 'Challenging'

class MemberStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    ACCEPTED = 'ACCEPTED', 'Accepted'
    DECLINED = 'DECLINED', 'Declined'
    BLOCKED = 'BLOCKED', 'Blocked'
    
class MemberRole(models.TextChoices):
    ORGANIZER = 'ORGANIZER', 'Organizer'
    CO_ORGANIZER = 'CO_ORGANIZER', 'Co-Organizer'
    MEMBER = 'MEMBER', 'Member'

class TripMember(BaseModel):
    trip = models.ForeignKey('Trip', on_delete=models.CASCADE, related_name='trip_members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=50, choices=MemberRole.choices, default=MemberRole.MEMBER)
    status = models.CharField(max_length=10, choices=MemberStatus.choices, default=MemberStatus.PENDING)

class Location(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

class Tag(BaseModel):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    is_system = models.BooleanField(default=False)
    usage_count = models.PositiveIntegerField(default=0)

class Trip(BaseModel):
    """Main trip model for travel planning"""
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_trips')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='trips')
    start_date = models.DateField()
    end_date = models.DateField()
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through=TripMember, related_name='trips')
    is_public = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    member_spots = models.PositiveIntegerField(default=1)
    duration = models.PositiveIntegerField(help_text="Duration in days", default=1)
    budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=10, choices=TripStatus.choices, default=TripStatus.PLANNED)
    difficulty = models.CharField(max_length=15, choices=TripDifficulty.choices, default=TripDifficulty.EASY)
    tags = models.ManyToManyField(Tag, related_name='trips', blank=True)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-start_date']
