from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import PackingCategory, PackingItem
from trips.serializers import TripMemberSerializer
from trips.models import TripMember, MemberStatus

User = get_user_model()

class PackingCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingCategory
        fields = ['id', 'name']

class PackingItemSerializer(serializers.ModelSerializer):
    assigned_to = TripMemberSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(queryset=TripMember.objects.all(), source='assigned_to', write_only=True, required=False, allow_null=True)
    category = PackingCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=PackingCategory.objects.all(), source='category', write_only=True, required=True)

    class Meta:
        model = PackingItem
        fields = ['id', 'name', 'category', 'quantity', 'packed', 'assigned_to', 'category_id', 'assigned_to_id', 'created_at', 'updated_at']
    
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
