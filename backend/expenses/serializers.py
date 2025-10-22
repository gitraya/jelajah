from rest_framework import serializers
from .models import Expense, ExpenseSplit, ExpenseCategory
from django.db import transaction
from django.contrib.auth import get_user_model
from trips.serializers import TripMemberSerializer
from trips.models import TripMember

User = get_user_model()

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name']

class ExpenseSplitSerializer(serializers.ModelSerializer):
    member = TripMemberSerializer(read_only=True)
    member_id = serializers.PrimaryKeyRelatedField(queryset=TripMember.objects.all(), source='member', write_only=True)
    amount = serializers.DecimalField(max_digits=14, decimal_places=2, coerce_to_string=False)
    
    class Meta:
        model = ExpenseSplit
        fields = ['id', 'member', 'amount', 'paid', 'member_id']
        read_only_fields = ['expense']
        
    def validate_member_id(self, value):
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
    paid_by = TripMemberSerializer(read_only=True)
    paid_by_id = serializers.PrimaryKeyRelatedField(queryset=TripMember.objects.all(), source='paid_by', write_only=True)
    category = ExpenseCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=ExpenseCategory.objects.all(), source='category', write_only=True, required=True)
    amount = serializers.DecimalField(max_digits=14, decimal_places=2, coerce_to_string=False)
    
    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'date', 'paid_by', 'notes', 'splits', 'category', 'category_id', 'paid_by_id']
    
    def validate(self, attrs):
        splits_data = attrs.get('splits', [])
        total_split_amount = sum([split['amount'] for split in splits_data])
        amount = attrs.get('amount')
        
        if splits_data and total_split_amount != amount:
            raise serializers.ValidationError("Total of split amounts must equal the expense amount.")
        
        return attrs
    
    def validate_splits(self, value):
        if not value:
            raise serializers.ValidationError("At least one split is required.")
        
        trip_id = self.context['trip_id']
        paid_by_id = self.initial_data.get('paid_by_id')
        member_ids = set()
        is_paid_by_in_splits = False
        
        for split in value:
            member_id = split['member_id']
            if not TripMember.objects.filter(id=member_id, trip_id=trip_id).exists():
                raise serializers.ValidationError(f"Member {member_id} does not belong to this trip.")
            if member_id in member_ids:
                raise serializers.ValidationError(f"Member {member_id} is duplicated in splits.")
            member_ids.add(member_id)
            if member_id == paid_by_id:
                is_paid_by_in_splits = True
            if member_id == paid_by_id and not split.get('paid', False):
                raise serializers.ValidationError(f"Paid by member {member_id} must have 'paid' set to True.")

        if not is_paid_by_in_splits:
            raise serializers.ValidationError("The 'paid_by' member must be included in the splits.")
        
        return value
    
    def validate_paid_by_id(self, value):
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
