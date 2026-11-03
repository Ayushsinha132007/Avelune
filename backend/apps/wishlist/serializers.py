from rest_framework import serializers
from .models import Wishlist, WishlistItem
from apps.catalog.serializers import ProductSerializer


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    productId = serializers.CharField(source='product.id', read_only=True)
    addedAt = serializers.DateTimeField(source='created_at', format='%Y-%m-%dT%H:%M:%S.%fZ', read_only=True)

    class Meta:
        model = WishlistItem
        fields = [
            'id',
            'productId',
            'product',
            'addedAt',
        ]


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    totalWishlistItems = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = [
            'id',
            'items',
            'totalWishlistItems',
        ]

    def get_totalWishlistItems(self, obj):
        return obj.items.count()

