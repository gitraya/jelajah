from rest_framework import serializers
from .models import ChecklistItem, ChecklistCategory
from trips.models import TripMember, MemberStatus, Trip
from trips.serializers import TripMemberSerializer

class ChecklistItemSerializer(serializers.ModelSerializer):
    assigned_to = TripMemberSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(queryset=TripMember.objects.all(), source='assigned_to', write_only=True)
    
    class Meta:
        model = ChecklistItem
        fields = ['id', 'title', 'description', 'priority', 'due_date', 'position', 'is_completed', 'category', 'assigned_to', 'assigned_to_id', 'created_at', 'updated_at']
        read_only_fields = ['id','category', 'created_at', 'updated_at']

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
        
        # Determine category based on due_date
        trip = Trip.objects.get(id=trip_id)
        due_date = validated_data.get('due_date')
        category = ChecklistCategory.DURING_TRIP
        if due_date:
            if due_date < trip.start_date:
                category = ChecklistCategory.PRE_TRIP
            elif due_date > trip.end_date:
                category = ChecklistCategory.POST_TRIP
        validated_data['category'] = category
        
        return super().create(validated_data)
