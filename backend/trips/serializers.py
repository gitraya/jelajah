from rest_framework import serializers
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.contrib.auth import get_user_model
from .models import Trip, TripMember, Location, MemberStatus

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for member information"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class LocationSerializer(serializers.ModelSerializer):
    """Serializer for Location model"""
    class Meta:
        model = Location
        fields = "__all__"
        read_only_fields = ['id']

class TripMemberSerializer(serializers.ModelSerializer):
    """Serializer for TripMember model with user details"""
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TripMember
        fields = ['id', 'user', 'user_id', 'joined_at', 'status']
        read_only_fields = ['id', 'joined_at']

class TripSerializer(serializers.ModelSerializer):
    """Detailed serializer for Trip model"""
    owner = UserSerializer(read_only=True)
    members = TripMemberSerializer(source='trip_members', many=True, read_only=True)
    location = LocationSerializer()
    member_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of user IDs to add as members"
    )
    is_editable = serializers.SerializerMethodField()
    is_deletable = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = "__all__"
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_start_date(self, start_date):
        """Validate that start_date is not in the past"""        
        end_date = parse_date(self.initial_data['end_date'])
        if end_date is None:
            raise serializers.ValidationError("Invalid end date format")
            
        if start_date >= end_date:
            raise serializers.ValidationError("Start date must be before end date")
        elif start_date < timezone.now().date():
            raise serializers.ValidationError("Start date cannot be in the past.")
        return start_date

    def validate_member_ids(self, member_ids):
        """Validate that member IDs correspond to existing users"""
        member_ids = list(set(member_ids))  # Remove duplicates
        
        request = self.context['request']
        if request.user.id in member_ids:
            member_ids.remove(request.user.id)
        
        for user_id in member_ids:
            if not User.objects.filter(id=user_id).exists():
                raise serializers.ValidationError(f"User with ID {user_id} does not exist.")
        return member_ids
    
    def create(self, validated_data):
        location_data = validated_data.pop('location')
        member_ids = validated_data.pop('member_ids', [])
        
        request = self.context['request']
        owner = request.user
        
        location, _ = Location.objects.get_or_create(**location_data)
        trip = Trip.objects.create(owner=owner, location=location, **validated_data)
        
        TripMember.objects.create(user=owner, trip=trip, status=MemberStatus.ACCEPTED)
        
        for user_id in member_ids:
            TripMember.objects.create(user_id=user_id, trip=trip, status=MemberStatus.ACCEPTED)

        return trip
    
    def update(self, instance, validated_data):
        location_data = validated_data.pop('location', None)
        member_ids = validated_data.pop('member_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if location_data:
            location = instance.location
            for attr, value in location_data.items():
                setattr(location, attr, value)
            location.save()
        
        instance.save()
        
        if member_ids is not None:
            current_member_ids = set(instance.trip_members.values_list('user_id', flat=True))
            new_member_ids = set(member_ids)
            
            to_add = new_member_ids - current_member_ids
            to_remove = current_member_ids - new_member_ids
            
            for user_id in to_add:
                TripMember.objects.create(user_id=user_id, trip=instance, status=MemberStatus.ACCEPTED)
            
            for user_id in to_remove:
                TripMember.objects.filter(user_id=user_id, trip=instance).update(status=MemberStatus.BLOCKED)

        return instance
    
    def get_is_editable(self, obj):
        request = self.context.get('request')
        if request and request.user == obj.owner and obj.status != 'DELETED':
            return True
        elif request and obj.trip_members.filter(user=request.user, status=MemberStatus.ACCEPTED).exists() and obj.status != 'DELETED':
            return True
        return False
    
    def get_is_deletable(self, obj):
        request = self.context.get('request')
        if request and request.user == obj.owner and obj.status != 'DELETED':
            return True
        return False
