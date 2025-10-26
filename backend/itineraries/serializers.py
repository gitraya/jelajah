from rest_framework import serializers
from .models import  ItineraryItem, ItineraryType

class ItineraryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryType
        fields = ['id', 'name']

class ItineraryItemSerializer(serializers.ModelSerializer):
    type = ItineraryTypeSerializer(read_only=True)
    type_id = serializers.PrimaryKeyRelatedField(queryset=ItineraryType.objects.all(), source='type', write_only=True, required=True)
    
    class Meta:
        model = ItineraryItem
        fields = [
            'id',
            'name',
            'address',
            'type',
            'description',
            'latitude',
            'longitude',
            'estimated_time',
            'visit_time',
            'notes',
            'status',
            'type_id'
        ]
    
    def create(self, validated_data):
        trip_id = self.context['trip_id']
        validated_data['trip_id'] = trip_id
        return super().create(validated_data)
