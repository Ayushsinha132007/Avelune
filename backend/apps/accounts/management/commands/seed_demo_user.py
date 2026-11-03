from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.accounts.models import Profile


class Command(BaseCommand):
    help = 'Seed demo client (Ayush Kumar) and admin superuser into SQLite'

    def handle(self, *args, **options):
        # 1. Seed Demo Client
        demo_email = 'demo@avelune.com'
        demo_pass = 'Avelune@123'

        demo_user, created = User.objects.get_or_create(
            username=demo_email,
            defaults={
                'email': demo_email,
                'first_name': 'Ayush',
                'last_name': 'Kumar',
                'is_staff': False,
            }
        )
        demo_user.set_password(demo_pass)
        demo_user.save()

        # Update profile details
        profile = demo_user.profile
        profile.phone = '+91 98765 43210'
        profile.preferred_city = 'Mumbai, India'
        profile.membership_tier = 'Atelier Private Client'
        profile.avatar_initials = 'A'
        profile.street_address = 'Apartment 14B, Altamount Road'
        profile.city = 'Mumbai'
        profile.state = 'Maharashtra'
        profile.postal_code = '400026'
        profile.country = 'India'
        profile.save()

        # 2. Seed Admin Superuser
        admin_email = 'admin@avelune.com'
        admin_pass = 'Admin@123'
        admin_user, admin_created = User.objects.get_or_create(
            username=admin_email,
            defaults={
                'email': admin_email,
                'first_name': 'Atelier',
                'last_name': 'Director',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password(admin_pass)
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()

        self.stdout.write(self.style.SUCCESS(
            f"✅ Seeded Demo Client: {demo_email} (Password: {demo_pass})\n"
            f"✅ Seeded Admin Superuser: {admin_email} (Password: {admin_pass})"
        ))

