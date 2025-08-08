from rest_framework import serializers
from .models import Expense, ExpenseSplit
from django.db import transaction
from django.contrib.auth import get_user_model

User = get_user_model()

class ExpenseSplitSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ExpenseSplit
        fields = ['id', 'user', 'username', 'amount', 'paid']
        read_only_fields = ['expense']

class ExpenseSerializer(serializers.ModelSerializer):
    paid_by_username = serializers.CharField(source='paid_by.username', read_only=True)
    splits = ExpenseSplitSerializer(many=True, read_only=True)
    
    class Meta:
        model = Expense
        fields = ['id', 'trip', 'title', 'amount', 'date', 'paid_by', 'paid_by_username', 'notes', 'splits']
        read_only_fields = ['trip']
    
    def create(self, validated_data):
        trip_id = self.context['trip_id']
        validated_data['trip_id'] = trip_id
        return super().create(validated_data)

class ExpenseDetailSerializer(serializers.ModelSerializer):
    paid_by_username = serializers.CharField(source='paid_by.username', read_only=True)
    splits = ExpenseSplitSerializer(many=True)
    
    class Meta:
        model = Expense
        fields = ['id', 'trip', 'title', 'amount', 'date', 'paid_by', 'paid_by_username', 'notes', 'splits']
        read_only_fields = ['trip']
    
    @transaction.atomic
    def create(self, validated_data):
        trip_id = self.context['trip_id']
        splits_data = validated_data.pop('splits', [])
        
        expense = Expense.objects.create(trip_id=trip_id, **validated_data)
        
        for split_data in splits_data:
            ExpenseSplit.objects.create(expense=expense, **split_data)
        
        return expense
    
    @transaction.atomic
    def update(self, instance, validated_data):
        splits_data = validated_data.pop('splits', [])
        instance = super().update(instance, validated_data)
        
        # Handle existing splits
        existing_splits = {split.id: split for split in instance.splits.all()}
        split_ids_to_keep = []
        
        # Update or create splits
        for split_data in splits_data:
            split_id = split_data.get('id')
            if split_id and split_id in existing_splits:
                # Update existing split
                split = existing_splits[split_id]
                for attr, value in split_data.items():
                    if attr != 'id':
                        setattr(split, attr, value)
                split.save()
                split_ids_to_keep.append(split_id)
            else:
                # Create new split
                new_split = ExpenseSplit.objects.create(expense=instance, **split_data)
                split_ids_to_keep.append(new_split.id)
        
        # Delete splits not included in the update
        for split_id, split in existing_splits.items():
            if split_id not in split_ids_to_keep:
                split.delete()
        
        return instance
