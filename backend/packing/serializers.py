from rest_framework import serializers
from .models import PackingCategory, PackingItem

class PackingCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingCategory
        fields = ['id', 'name']

class PackingItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    assigned_to_email = serializers.CharField(source='assigned_to.email', read_only=True, allow_null=True)
    assigned_to_first_name = serializers.CharField(source='assigned_to.first_name', read_only=True, allow_null=True)
    class Meta:
        model = PackingItem
        fields = ['id', 'name', 'category', 'category_name', 'quantity', 'packed', 'assigned_to', 'assigned_to_first_name', 'assigned_to_email']
        read_only_fields = ['trip']
    
    def create(self, validated_data):
        trip_id = self.context['trip_id']
        validated_data['trip_id'] = trip_id
        return super().create(validated_data)
