from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'razorpay_order_id',
            'razorpay_payment_id',
            'razorpay_signature',
            'amount',
            'currency',
            'status',
            'error_code',
            'error_description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
