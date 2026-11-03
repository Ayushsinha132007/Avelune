from django.db import models
from django.utils import timezone
from decimal import Decimal


class Promotion(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage (%)'),
        ('fixed', 'Fixed Amount (₹)'),
    ]

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, help_text="Percentage (e.g. 10.00) or Fixed INR")
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    start_date = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    usage_limit = models.PositiveIntegerField(default=1000)
    times_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Promotion & Coupon'
        verbose_name_plural = 'Promotions & Coupons'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def is_valid(self, subtotal: Decimal):
        now = timezone.now()
        if not self.is_active:
            return False, "This privilege voucher is inactive."
        if self.start_date and now < self.start_date:
            return False, "This voucher is not yet active."
        if self.expiry_date and now > self.expiry_date:
            return False, "This voucher has expired."
        if self.times_used >= self.usage_limit:
            return False, "This voucher has reached its redemption limit."
        if subtotal < self.min_purchase_amount:
            return False, f"Minimum purchase of ₹{self.min_purchase_amount:,.0f} required."
        return True, "Valid"

    def calculate_discount(self, subtotal: Decimal) -> Decimal:
        if self.discount_type == 'percentage':
            discount = (subtotal * self.discount_value) / Decimal('100')
            if self.max_discount_amount and discount > self.max_discount_amount:
                discount = self.max_discount_amount
            return round(discount, 2)
        else:
            return min(self.discount_value, subtotal)

    def __str__(self):
        return f"{self.code} ({self.discount_value}{'%' if self.discount_type == 'percentage' else ' INR'})"

