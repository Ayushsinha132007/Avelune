from django.core.management.base import BaseCommand
from decimal import Decimal
from apps.promotions.models import Promotion


class Command(BaseCommand):
    help = 'Seed promotions and privilege coupons into SQLite'

    def handle(self, *args, **options):
        coupons = [
            {
                'name': '10% Seasonal Atelier Privilege',
                'code': 'AVELUNE10',
                'description': '10% atelier discount applied to your order.',
                'discount_type': 'percentage',
                'discount_value': Decimal('10.00'),
                'min_purchase_amount': Decimal('0.00'),
                'is_active': True,
            },
            {
                'name': '15% Atelier Connoisseur Privilege',
                'code': 'ATELIER15',
                'description': '15% privilege on curated orders above ₹5,000.',
                'discount_type': 'percentage',
                'discount_value': Decimal('15.00'),
                'min_purchase_amount': Decimal('5000.00'),
                'max_discount_amount': Decimal('3000.00'),
                'is_active': True,
            },
        ]

        for c in coupons:
            promo, created = Promotion.objects.update_or_create(
                code=c['code'],
                defaults=c
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f"  {action} coupon: {promo.code}")

        self.stdout.write(self.style.SUCCESS("✅ Successfully seeded promotions and coupons."))

