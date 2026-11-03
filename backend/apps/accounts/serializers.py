from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile


class UserProfileSerializer(serializers.ModelSerializer):
    # CamelCase aliases matching frontend DemoUser interface
    id = serializers.CharField(source='user.id')
    firstName = serializers.CharField(source='user.first_name')
    lastName = serializers.CharField(source='user.last_name')
    fullName = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email')
    membershipTier = serializers.CharField(source='membership_tier')
    memberSince = serializers.SerializerMethodField()
    avatarInitials = serializers.CharField(source='avatar_initials')
    phone = serializers.CharField()
    preferredCity = serializers.CharField(source='preferred_city')

    # Default address fields
    deliveryAddress = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id',
            'firstName',
            'lastName',
            'fullName',
            'email',
            'membershipTier',
            'memberSince',
            'avatarInitials',
            'phone',
            'preferredCity',
            'deliveryAddress',
        ]

    def get_fullName(self, obj):
        name = obj.user.get_full_name()
        return name if name else obj.user.username

    def get_memberSince(self, obj):
        return obj.user.date_joined.strftime('%B %Y')

    def get_deliveryAddress(self, obj):
        return {
            'fullName': self.get_fullName(obj),
            'street': obj.street_address,
            'apartment': obj.apartment,
            'city': obj.city,
            'state': obj.state,
            'postalCode': obj.postal_code,
            'country': obj.country,
        }


class RegisterSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirmPassword = serializers.CharField(write_only=True, required=False)

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('An account with this email address already exists.')
        return normalized

    def validate(self, data):
        if 'confirmPassword' in data and data['password'] != data['confirmPassword']:
            raise serializers.ValidationError({'confirmPassword': 'Passwords do not match.'})
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        email = validated_data['email'].strip().lower()
        full_name = validated_data['fullName'].strip()
        parts = full_name.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class ProfileUpdateSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(required=False, write_only=True)
    firstName = serializers.CharField(source='user.first_name', required=False)
    lastName = serializers.CharField(source='user.last_name', required=False)
    phone = serializers.CharField(required=False)
    preferredCity = serializers.CharField(source='preferred_city', required=False)

    class Meta:
        model = Profile
        fields = [
            'fullName',
            'firstName',
            'lastName',
            'phone',
            'preferredCity',
            'street_address',
            'apartment',
            'city',
            'state',
            'postal_code',
        ]

    def update(self, instance, validated_data):
        user = instance.user
        if 'fullName' in validated_data:
            full_name = validated_data.pop('fullName').strip()
            parts = full_name.split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
            user.save()
        elif 'user' in validated_data:
            user_data = validated_data.pop('user')
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            user.save()

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

