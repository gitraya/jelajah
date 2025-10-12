from rest_framework import serializers
from .models import Expense, ExpenseSplit, ExpenseCategory
from django.db import transaction
from django.contrib.auth import get_user_model
from trips.models import TripMember

User = get_user_model()

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name']

class ExpenseSplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseSplit
        fields = ['id', 'member', 'amount', 'paid']
        read_only_fields = ['expense']
        
    def validate_member(self, value):
        expense_id = self.context['expense_id']
        if expense_id:
            expense = Expense.objects.get(id=expense_id)
            trip_id = expense.trip_id
            if not TripMember.objects.filter(id=value.id, trip_id=trip_id).exists():
                raise serializers.ValidationError("Member does not belong to the trip associated with this expense.")
        return value
    
    def create(self, validated_data):
        expense_id = self.context['expense_id']
        validated_data['expense_id'] = expense_id
        return super().create(validated_data)

class ExpenseSerializer(serializers.ModelSerializer):
    splits = ExpenseSplitSerializer(many=True)
    
    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'date', 'paid_by', 'notes', 'splits']
    
    def validate_paid_by(self, value):
        trip_id = self.context['trip_id']
        if not TripMember.objects.filter(id=value.id, trip_id=trip_id).exists():
            raise serializers.ValidationError("Assigned member does not belong to this trip.")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        trip_id = self.context['trip_id']
        validated_data['trip_id'] = trip_id
        splits_data = validated_data.pop('splits', [])
        
        expense = super().create(validated_data)

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
