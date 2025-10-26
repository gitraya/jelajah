from rest_framework import serializers
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.contrib.auth import get_user_model
from .models import Trip, TripMember, MemberStatus

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone']
        read_only_fields = ['id']

class TripMemberSerializer(serializers.ModelSerializer):
    """Serializer for TripMember model with user details"""
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
        required=False
    )
    first_name = serializers.CharField(
        source='user.first_name',
        write_only=True,
        required=False
    )
    last_name = serializers.CharField(
        source='user.last_name',
        write_only=True,
        required=False
    )
    email = serializers.EmailField(
        source='user.email',
        write_only=True,
        required=False
    )
    phone = serializers.CharField(
        source='user.phone',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = TripMember
        fields = ['id', 'user', 'user_id', 'joined_at', 'status', 'role', 'emergency_contact_name', 'emergency_contact_phone', 'dietary_restrictions', 'first_name', 'last_name', 'email', 'phone']
        read_only_fields = ['id', 'joined_at']
        
    def validate(self, attrs):
        """Ensure that user information is provided either by user_id or email"""
        user = attrs.get('user')
        if not user:
            email = attrs.get('email')
            if not email:
                raise serializers.ValidationError("Either user_id or email must be provided.")
            
            try:
                user = User.objects.get(email=email)
                attrs['user'] = user
            except User.DoesNotExist:
                first_name = user.get('first_name', '')
                last_name = user.get('last_name', '')
                phone = user.get('phone', '')
                user = User.objects.create(email=email, first_name=first_name, last_name=last_name, phone=phone)
                attrs['user'] = user
                
        if TripMember.objects.filter(user=attrs['user'], trip_id=self.context['trip']).exists():
            raise serializers.ValidationError("This user is already a member of the trip.")
        
        return attrs
        
    def create(self, validated_data):
        validated_data.pop('first_name', None)
        validated_data.pop('last_name', None)
        validated_data.pop('email', None)
        validated_data.pop('phone', None)
             
        trip_id = self.context['trip']
        validated_data['trip_id'] = trip_id
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Remove user because we only need on create"""
        validated_data.pop('first_name', None)
        validated_data.pop('last_name', None)
        validated_data.pop('email', None)
        validated_data.pop('phone', None)
        validated_data.pop('user', None)
        
        return super().update(instance, validated_data)

class TripSerializer(serializers.ModelSerializer):
    """Detailed serializer for Trip model"""
    owner = UserSerializer(read_only=True)
    members = TripMemberSerializer(source='trip_members', many=True, read_only=True)
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
    
    def create(self, validated_data):
        request = self.context['request']
        owner = request.user
        
        trip = Trip.objects.create(owner=owner, **validated_data)
        TripMember.objects.create(user=owner, trip=trip, status=MemberStatus.ACCEPTED, role='ORGANIZER')

        return trip
    
    def update(self, instance, validated_data):
        """Remove owner because we don't want to update it"""
        validated_data.pop('owner', None)
        return super().update(instance, validated_data)
    
    def get_is_editable(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        user = request.user
        if user == obj.owner and obj.status != 'DELETED':
            return True
        elif obj.trip_members.filter(user=user, status=MemberStatus.ACCEPTED).exists() and obj.status != 'DELETED':
            return True
        return False

    def get_is_deletable(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        user = request.user
        if user == obj.owner and obj.status != 'DELETED':
            return True
        return False
