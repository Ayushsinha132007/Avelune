from rest_framework import serializers
from .models import Promotion


class PromotionSerializer(serializers.ModelSerializer):
    discountType = serializers.CharField(source='discount_type')
    discountValue = serializers.FloatField(source='discount_value')
    minPurchaseAmount = serializers.FloatField(source='min_purchase_amount')
    maxDiscountAmount = serializers.FloatField(source='max_discount_amount', allow_null=True)
    expiryDate = serializers.DateTimeField(source='expiry_date', allow_null=True)

    class Meta:
        model = Promotion
        fields = [
            'id',
            'name',
            'code',
            'description',
            'discountType',
            'discountValue',
            'minPurchaseAmount',
            'maxDiscountAmount',
            'expiryDate',
            'is_active',
        ]

