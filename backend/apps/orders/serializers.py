from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    productId = serializers.CharField(source='product_id_snapshot', read_only=True)
    name = serializers.CharField(source='product_name_snapshot', read_only=True)
    image = serializers.URLField(source='image_snapshot', read_only=True)
    size = serializers.CharField(source='selected_size', read_only=True)
    color = serializers.CharField(source='selected_color', read_only=True)
    price = serializers.SerializerMethodField()
    totalPrice = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'productId',
            'name',
            'image',
            'size',
            'color',
            'quantity',
            'price',
            'totalPrice',
        ]

    def get_price(self, obj):
        return float(obj.unit_price)

    def get_totalPrice(self, obj):
        return float(obj.line_total)


class OrderSerializer(serializers.ModelSerializer):
    orderNumber = serializers.CharField(source='order_number', read_only=True)
    status = serializers.CharField(source='order_status', read_only=True)
    paymentStatus = serializers.CharField(source='payment_status', read_only=True)
    date = serializers.SerializerMethodField()
    totalAmount = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    shippingAddress = serializers.SerializerMethodField()
    carrier = serializers.CharField(read_only=True)
    trackingNumber = serializers.CharField(source='tracking_number', read_only=True)
    estimatedDelivery = serializers.CharField(source='estimated_delivery', read_only=True)

    # Financial breakdown
    subtotal = serializers.SerializerMethodField()
    discountAmount = serializers.SerializerMethodField()
    deliveryCharges = serializers.SerializerMethodField()
    taxAmount = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'orderNumber',
            'status',
            'paymentStatus',
            'date',
            'totalAmount',
            'items',
            'shippingAddress',
            'carrier',
            'trackingNumber',
            'estimatedDelivery',
            'subtotal',
            'discountAmount',
            'deliveryCharges',
            'taxAmount',
            'coupon_code',
        ]

    def get_date(self, obj):
        return obj.created_at.strftime('%d %b %Y')

    def get_totalAmount(self, obj):
        return float(obj.final_amount)

    def get_subtotal(self, obj):
        return float(obj.subtotal)

    def get_discountAmount(self, obj):
        return float(obj.discount_amount)

    def get_deliveryCharges(self, obj):
        return float(obj.delivery_charges)

    def get_taxAmount(self, obj):
        return float(obj.tax_amount)

    def get_shippingAddress(self, obj):
        return {
            'name': obj.shipping_name,
            'street': obj.shipping_street,
            'apartment': obj.shipping_apartment,
            'city': obj.shipping_city,
            'state': obj.shipping_state,
            'postalCode': obj.shipping_postal_code,
            'country': obj.shipping_country,
        }

