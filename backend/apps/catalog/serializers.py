from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    itemCount = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'subtitle',
            'description',
            'image',
            'target_audience',
            'display_order',
            'is_active',
            'itemCount',
        ]

    def get_itemCount(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductSerializer(serializers.ModelSerializer):
    # CamelCase aliases matching frontend TypeScript Product interface
    originalPrice = serializers.SerializerMethodField()
    subCategory = serializers.CharField(source='sub_category', required=False, allow_blank=True)
    reviewCount = serializers.IntegerField(source='review_count')
    inStock = serializers.BooleanField(source='in_stock')
    isFeatured = serializers.BooleanField(source='is_featured')
    isBestseller = serializers.BooleanField(source='is_bestseller')
    isNewArrival = serializers.BooleanField(source='is_new_arrival')
    collectionSlug = serializers.CharField(source='collection_slug', required=False, allow_blank=True)
    category = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'subtitle',
            'category',
            'subCategory',
            'gender',
            'price',
            'originalPrice',
            'rating',
            'reviewCount',
            'badge',
            'images',
            'description',
            'details',
            'materials',
            'dimensions',
            'inStock',
            'sizes',
            'colors',
            'tags',
            'collections',
            'collectionSlug',
            'isFeatured',
            'isBestseller',
            'isNewArrival',
            'stock_quantity',
            'created_at',
        ]

    def get_originalPrice(self, obj):
        return float(obj.original_price) if obj.original_price is not None else None

    def get_price(self, obj):
        return float(obj.price)

    def get_rating(self, obj):
        return float(obj.rating)

    def get_category(self, obj):
        return obj.category_name or (obj.category.name if obj.category else '')

