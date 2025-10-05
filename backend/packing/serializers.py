from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import PackingCategory, PackingItem
from trips.serializers import TripMemberSerializer

User = get_user_model()

class PackingCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingCategory
        fields = ['id', 'name']

class PackingItemSerializer(serializers.ModelSerializer):
    assigned_to = TripMemberSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='assigned_to', write_only=True, required=True)
    category = PackingCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=PackingCategory.objects.all(), source='category', write_only=True, required=True)

    class Meta:
        model = PackingItem
        fields = ['id', 'name', 'category', 'quantity', 'packed', 'assigned_to', 'category_id', 'assigned_to_id']
        read_only_fields = ['trip']
    
    def create(self, validated_data):
        trip_id = self.context['trip_id']
        validated_data['trip_id'] = trip_id
        return super().create(validated_data)
