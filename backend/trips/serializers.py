from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Trip, TripMember, Location, TripStatus, MemberStatus

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
    
    class Meta:
        model = Trip
        fields = "__all__"
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate that end_date is after start_date"""
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError(
                "End date must be after start date."
            )
        if data['start_date'] < timezone.now().date():
            raise serializers.ValidationError(
                "Start date must be in the future."
            )
        return data

class TripMemberManageSerializer(serializers.ModelSerializer):
    """Serializer for managing trip members"""
    user_email = serializers.EmailField(write_only=True, required=False)
    user_username = serializers.CharField(write_only=True, required=False)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TripMember
        fields = ['id', 'user', 'user_email', 'user_username', 'status', 'joined_at']
        read_only_fields = ['id', 'joined_at']
    
    def validate(self, data):
        """Ensure either email or username is provided"""
        if not data.get('user_email') and not data.get('user_username'):
            raise serializers.ValidationError(
                "Either user_email or user_username must be provided."
            )
        return data
    
    def create(self, validated_data):
        user_email = validated_data.pop('user_email', None)
        user_username = validated_data.pop('user_username', None)
        
        try:
            if user_email:
                user = User.objects.get(email=user_email)
            else:
                user = User.objects.get(username=user_username)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        
        # Check if user is already a member
        trip = validated_data['trip']
        if TripMember.objects.filter(trip=trip, user=user).exists():
            raise serializers.ValidationError("User is already a member of this trip.")
        
        return TripMember.objects.create(user=user, **validated_data)
