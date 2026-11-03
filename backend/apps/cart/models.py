from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
from apps.catalog.models import Product


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='carts')
    session_key = models.CharField(max_length=64, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Shopping Cart'
        verbose_name_plural = 'Shopping Carts'

    def __str__(self):
        owner = self.user.email if self.user else f"Guest ({self.session_key[:8]}...)"
        return f"Cart #{self.id} for {owner}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        return sum(Decimal(str(item.product.price)) * item.quantity for item in self.items.all())

    @property
    def delivery_fee(self):
        sub = self.subtotal
        if sub >= 1999 or sub == 0:
            return Decimal('0.00')
        return Decimal('250.00')

    @property
    def final_total(self):
        return self.subtotal + self.delivery_fee


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_entries')
    quantity = models.PositiveIntegerField(default=1)
    selected_size = models.CharField(max_length=30, blank=True)
    selected_color = models.CharField(max_length=50, blank=True)
    unit_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
        unique_together = ('cart', 'product', 'selected_size', 'selected_color')

    def save(self, *args, **kwargs):
        if not self.unit_price_snapshot:
            self.unit_price_snapshot = self.product.price
        super().save(*args, **kwargs)

    @property
    def line_total(self):
        return Decimal(str(self.product.price)) * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.product.name} ({self.selected_size})"

