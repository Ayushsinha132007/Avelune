from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = [
        'product',
        'product_id_snapshot',
        'product_name_snapshot',
        'selected_size',
        'selected_color',
        'quantity',
        'unit_price',
        'line_total',
    ]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number',
        'customer_name',
        'customer_email',
        'order_status',
        'payment_status',
        'final_amount',
        'created_at',
    ]
    list_filter = ['order_status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'customer_name', 'customer_email', 'tracking_number']
    inlines = [OrderItemInline]
    readonly_fields = ['order_number', 'created_at', 'updated_at']

