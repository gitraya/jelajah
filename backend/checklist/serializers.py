from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import ChecklistItem
from trips.models import TripMember

User = get_user_model()

class ChecklistItemSerializer(serializers.ModelSerializer):
    assigned_to = serializers.StringRelatedField(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='assigned_to', write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = ChecklistItem
        fields = ['id', 'title', 'description', 'trip', 'priority', 'due_date', 'position', 'is_completed', 'category', 'assigned_to', 'assigned_to_id']

    def validate_assigned_to(self, value):
        if not value:
            return value
        trip_id = self.context['trip_id']
        if not TripMember.objects.filter(id=value.id, trip_id=trip_id).exists():
            raise serializers.ValidationError("Assigned member does not belong to this trip.")
        return value
