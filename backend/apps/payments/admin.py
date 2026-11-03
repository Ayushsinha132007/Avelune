from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'order_number',
        'razorpay_order_id',
        'razorpay_payment_id',
        'amount',
        'currency',
        'status',
        'created_at',
    ]
    list_filter = ['status', 'currency', 'created_at']
    search_fields = [
        'razorpay_order_id',
        'razorpay_payment_id',
        'order__order_number',
        'order__customer_email',
    ]
    readonly_fields = [
        'order',
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'amount',
        'currency',
        'created_at',
        'updated_at',
    ]

    def order_number(self, obj):
        return obj.order.order_number if obj.order else '-'
    order_number.short_description = 'Order Number'

