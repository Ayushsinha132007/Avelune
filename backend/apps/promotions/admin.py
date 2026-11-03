from django.contrib import admin
from .models import Promotion


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'discount_type', 'discount_value', 'min_purchase_amount', 'is_active', 'times_used']
    list_filter = ['discount_type', 'is_active']
    search_fields = ['code', 'name', 'description']

