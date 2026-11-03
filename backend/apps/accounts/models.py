import hmac
import hashlib
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.conf import settings


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=25, blank=True)
    preferred_city = models.CharField(max_length=120, default='Mumbai, India')
    membership_tier = models.CharField(max_length=100, default='Atelier Private Client')
    avatar_initials = models.CharField(max_length=5, blank=True)

    # Primary delivery address defaults
    street_address = models.CharField(max_length=255, blank=True)
    apartment = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=100, default='Mumbai')
    state = models.CharField(max_length=100, default='Maharashtra')
    postal_code = models.CharField(max_length=20, default='400026')
    country = models.CharField(max_length=100, default='India')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Client Profile'
        verbose_name_plural = 'Client Profiles'

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.user.email})"

    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username


class EmailOTP(models.Model):
    PURPOSE_CHOICES = [
        ('login', 'Login'),
        ('signup', 'Sign Up'),
        ('password_reset', 'Password Reset'),
        ('verify', 'Email Verification'),
    ]

    email = models.EmailField(db_index=True)
    otp_hash = models.CharField(max_length=128, blank=True)
    purpose = models.CharField(max_length=30, choices=PURPOSE_CHOICES, default='login')
    attempts = models.PositiveIntegerField(default=0)
    max_attempts = models.PositiveIntegerField(default=5)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        verbose_name = 'Email OTP'
        verbose_name_plural = 'Email OTPs'
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.email} ({self.purpose}) - {'Used' if self.is_used else 'Active'}"

    @classmethod
    def hash_value(cls, email: str, raw_otp: str) -> str:
        secret = getattr(settings, 'SECRET_KEY', 'avelune-default-salt')
        payload = f"{email.strip().lower()}:{raw_otp.strip()}:{secret}"
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    def set_otp(self, raw_otp: str):
        self.otp_hash = self.hash_value(self.email, raw_otp)

    def check_otp(self, candidate_otp: str) -> bool:
        if not candidate_otp or not self.otp_hash:
            return False
        candidate_hash = self.hash_value(self.email, candidate_otp)
        return hmac.compare_digest(self.otp_hash, candidate_hash)

    def is_valid(self):
        return (
            not self.is_used
            and timezone.now() <= self.expires_at
            and self.attempts < self.max_attempts
        )


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        initials = ''
        if instance.first_name:
            initials += instance.first_name[0]
        if instance.last_name:
            initials += instance.last_name[0]
        if not initials and instance.email:
            initials = instance.email[0].upper()

        Profile.objects.create(
            user=instance,
            avatar_initials=initials.upper() or 'A'
        )
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()
