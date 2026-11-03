from rest_framework import serializers
from .models import Cart, CartItem
from apps.catalog.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    selectedSize = serializers.CharField(source='selected_size', required=False, allow_blank=True)
    selectedColor = serializers.CharField(source='selected_color', required=False, allow_blank=True)
    lineTotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'product',
            'quantity',
            'selectedSize',
            'selectedColor',
            'lineTotal',
        ]

    def get_lineTotal(self, obj):
        return float(obj.line_total)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    totalCartItems = serializers.IntegerField(source='total_items', read_only=True)
    cartSubtotal = serializers.SerializerMethodField()
    deliveryFee = serializers.SerializerMethodField()
    finalTotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id',
            'items',
            'totalCartItems',
            'cartSubtotal',
            'deliveryFee',
            'finalTotal',
        ]

    def get_cartSubtotal(self, obj):
        return float(obj.subtotal)

    def get_deliveryFee(self, obj):
        return float(obj.delivery_fee)

    def get_finalTotal(self, obj):
        return float(obj.final_total)

