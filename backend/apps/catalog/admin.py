from django.contrib import admin
from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'target_audience', 'display_order', 'is_active']
    list_filter = ['target_audience', 'is_active']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = [
        'id',
        'name',
        'category_name',
        'gender',
        'price',
        'original_price',
        'stock_quantity',
        'in_stock',
        'is_featured',
        'is_bestseller',
        'is_new_arrival',
        'is_active',
    ]
    list_filter = [
        'gender',
        'is_active',
        'in_stock',
        'is_featured',
        'is_bestseller',
        'is_new_arrival',
        'category',
    ]
    search_fields = ['id', 'name', 'subtitle', 'description', 'materials', 'tags']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'image_url', 'display_order', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__name', 'product__id', 'alt_text']


