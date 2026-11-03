from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
from apps.catalog.models import Product


class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('Pending', 'Pending Payment'),
        ('Processing', 'Payment Processing'),
        ('Paid', 'Paid'),
        ('Failed', 'Payment Failed'),
        ('Refunded', 'Refunded'),
    ]

    order_number = models.CharField(max_length=64, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=30)

    order_status = models.CharField(max_length=30, choices=ORDER_STATUS_CHOICES, default='Pending')
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default='Pending')

    # Delivery Address Snapshot
    shipping_name = models.CharField(max_length=150)
    shipping_street = models.CharField(max_length=255)
    shipping_apartment = models.CharField(max_length=120, blank=True)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_postal_code = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100, default='India')

    # Billing Address Snapshot
    billing_address = models.JSONField(default=dict, blank=True)

    # Financials
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    coupon_code = models.CharField(max_length=50, blank=True)
    delivery_charges = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    final_amount = models.DecimalField(max_digits=12, decimal_places=2)

    # Logistics
    carrier = models.CharField(max_length=100, default='Blue Dart Luxury Express')
    tracking_number = models.CharField(max_length=100, blank=True)
    estimated_delivery = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.customer_name} (₹{self.final_amount})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_entries')
    product_id_snapshot = models.CharField(max_length=64)
    product_name_snapshot = models.CharField(max_length=255)
    image_snapshot = models.URLField(max_length=500, blank=True)
    selected_size = models.CharField(max_length=30, blank=True)
    selected_color = models.CharField(max_length=50, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        return f"{self.quantity}x {self.product_name_snapshot} ({self.order.order_number})"

