from rest_framework import serializers
from .models import ChecklistItem
from trips.models import TripMember, MemberStatus, Trip
from trips.serializers import TripMemberSerializer

class ChecklistItemSerializer(serializers.ModelSerializer):
    assigned_to = TripMemberSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(queryset=TripMember.objects.all(), source='assigned_to', write_only=True)
    
    class Meta:
        model = ChecklistItem
        fields = ['id', 'title', 'description', 'priority', 'due_date', 'position', 'is_completed', 'category', 'assigned_to', 'assigned_to_id', 'created_at', 'updated_at']

    def validate_assigned_to_id(self, value):
        if not value:
            return value    
        
        trip_id = self.context['trip_id']
        trip_member = TripMember.objects.get(id=value.id)
        if trip_member.trip_id != trip_id:
            raise serializers.ValidationError("Assigned member does not belong to this trip.")
        if trip_member.status != MemberStatus.ACCEPTED:
            raise serializers.ValidationError("Assigned member is not an accepted member of the trip.")
        return value

    def create(self, validated_data):
        trip_id = self.context['trip_id']
        validated_data['trip_id'] = trip_id
        return super().create(validated_data)
