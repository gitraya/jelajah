from rest_framework import serializers
from .models import ItineraryDay, ItineraryItem

class ItineraryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryItem
        fields = ['id', 'time', 'activity', 'location', 'notes', 'completed', 'lat', 'lng']

class ItineraryDaySerializer(serializers.ModelSerializer):
    items = ItineraryItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = ItineraryDay
        fields = ['id', 'date', 'notes', 'items']
        read_only_fields = ['trip']
    
    def create(self, validated_data):
        trip_id = self.context['trip_id']
        validated_data['trip_id'] = trip_id
        return super().create(validated_data)

class ItineraryDayDetailSerializer(serializers.ModelSerializer):
    items = ItineraryItemSerializer(many=True)
    
    class Meta:
        model = ItineraryDay
        fields = ['id', 'date', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        day = ItineraryDay.objects.create(**validated_data)
        
        for item_data in items_data:
            ItineraryItem.objects.create(day=day, **item_data)
        
        return day
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        instance = super().update(instance, validated_data)
        
        # Handle existing items - delete items not in the update
        existing_items = {item.id: item for item in instance.items.all()}
        item_ids_to_keep = []
        
        # Update or create items
        for item_data in items_data:
            item_id = item_data.get('id')
            if item_id and item_id in existing_items:
                # Update existing item
                item = existing_items[item_id]
                for attr, value in item_data.items():
                    setattr(item, attr, value)
                item.save()
                item_ids_to_keep.append(item_id)
            else:
                # Create new item
                new_item = ItineraryItem.objects.create(day=instance, **item_data)
                item_ids_to_keep.append(new_item.id)
        
        # Delete items not included in the update
        for item_id, item in existing_items.items():
            if item_id not in item_ids_to_keep:
                item.delete()
        
        return instance
