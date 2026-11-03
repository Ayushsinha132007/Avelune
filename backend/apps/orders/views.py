import random
from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem
from .serializers import OrderSerializer
from apps.catalog.models import Product
from apps.promotions.models import Promotion


class OrderCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            orders = Order.objects.filter(user=request.user)
        else:
            email = request.query_params.get('email', '').strip().lower()
            if email:
                orders = Order.objects.filter(customer_email__iexact=email)
            else:
                orders = Order.objects.none()

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        items_data = data.get('items', [])
        delivery_data = data.get('deliveryAddress', {})
        billing_data = data.get('billingAddress', delivery_data)
        coupon_code = data.get('couponCode', '').strip().upper()

        if not items_data:
            return Response({'error': 'Cannot create order: Bag is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate delivery fields
        full_name = delivery_data.get('fullName', '').strip()
        email = delivery_data.get('email', '').strip().lower()
        phone = delivery_data.get('phone', '').strip()
        address = delivery_data.get('addressLine1', '').strip()
        city = delivery_data.get('city', '').strip()
        state = delivery_data.get('state', '').strip()
        pin = delivery_data.get('postalCode', '').strip()

        if not all([full_name, email, phone, address, city, state, pin]):
            return Response({
                'error': 'Please provide complete delivery details (Full Name, Email, Phone, Address, City, State, PIN).'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 1. Authoritative Server-side Price & Stock Calculation
        validated_items = []
        subtotal = Decimal('0.00')

        for entry in items_data:
            prod_id = entry.get('productId')
            qty = int(entry.get('quantity', 1))
            size = entry.get('selectedSize', '')
            color = entry.get('selectedColor', '')

            try:
                product = Product.objects.get(id=prod_id, is_active=True)
            except Product.DoesNotExist:
                return Response({
                    'error': f'Product ID "{prod_id}" is unavailable or removed from the atelier catalogue.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not product.in_stock or product.stock_quantity < qty:
                return Response({
                    'error': f'Insufficient atelier stock for "{product.name}".'
                }, status=status.HTTP_400_BAD_REQUEST)

            line_total = Decimal(str(product.price)) * qty
            subtotal += line_total

            validated_items.append({
                'product': product,
                'quantity': qty,
                'selected_size': size or (product.sizes[0] if product.sizes else ''),
                'selected_color': color or (product.colors[0]['name'] if product.colors else ''),
                'unit_price': product.price,
                'line_total': line_total,
                'image': product.primary_image or (product.images[0] if product.images else ''),
            })

        # 2. Coupon Validation & Discount Calculation
        discount_amount = Decimal('0.00')
        applied_coupon_code = ''
        if coupon_code:
            try:
                promo = Promotion.objects.get(code=coupon_code, is_active=True)
                valid, msg = promo.is_valid(subtotal)
                if valid:
                    discount_amount = promo.calculate_discount(subtotal)
                    applied_coupon_code = promo.code
            except Promotion.DoesNotExist:
                pass

        # 3. Delivery Fee (Complimentary for >= ₹1,999)
        delivery_charges = Decimal('0.00') if subtotal >= 1999 else Decimal('250.00')

        # 4. Final Amount & Tax
        final_amount = max(Decimal('0.00'), subtotal - discount_amount) + delivery_charges
        tax_amount = round((final_amount * Decimal('0.18')) / Decimal('1.18'), 2)

        # 5. Unique Order Number & Logistics
        order_num = f"AVL-2026-{random.randint(10000, 99999)}"
        est_deliv_date = (timezone.now() + timedelta(days=3)).strftime('%d %b %Y')
        tracking_num = f"BD-IND-{random.randint(1000000, 9999999)}"

        # 6. Database Transaction
        with transaction.atomic():
            order = Order.objects.create(
                order_number=order_num,
                user=request.user if request.user.is_authenticated else None,
                customer_name=full_name,
                customer_email=email,
                customer_phone=phone,
                order_status='Confirmed',
                payment_status='Pending',
                shipping_name=full_name,
                shipping_street=address,
                shipping_apartment=delivery_data.get('apartment', ''),
                shipping_city=city,
                shipping_state=state,
                shipping_postal_code=pin,
                shipping_country=delivery_data.get('country', 'India'),
                billing_address=billing_data,
                subtotal=subtotal,
                discount_amount=discount_amount,
                coupon_code=applied_coupon_code,
                delivery_charges=delivery_charges,
                tax_amount=tax_amount,
                final_amount=final_amount,
                carrier='Blue Dart Luxury Express',
                tracking_number=tracking_num,
                estimated_delivery=est_deliv_date,
            )

            for vi in validated_items:
                OrderItem.objects.create(
                    order=order,
                    product=vi['product'],
                    product_id_snapshot=vi['product'].id,
                    product_name_snapshot=vi['product'].name,
                    image_snapshot=vi['image'],
                    selected_size=vi['selected_size'],
                    selected_color=vi['selected_color'],
                    quantity=vi['quantity'],
                    unit_price=vi['unit_price'],
                    line_total=vi['line_total'],
                )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            orders = Order.objects.filter(user=request.user)
        else:
            email = request.query_params.get('email', '').strip().lower()
            if email:
                orders = Order.objects.filter(customer_email__iexact=email)
            else:
                orders = Order.objects.none()

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_id):
        try:
            if order_id.isdigit():
                order = Order.objects.get(id=int(order_id))
            else:
                order = Order.objects.get(order_number__iexact=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found in atelier records.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class OrderCancelView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, order_id):
        order = get_object_or_404(Order, order_number__iexact=order_id)

        if order.order_status in ('Shipped', 'Delivered', 'Cancelled'):
            return Response({
                'error': f'Order cannot be cancelled because it is already {order.order_status.lower()}.'
            }, status=status.HTTP_400_BAD_REQUEST)

        order.order_status = 'Cancelled'
        order.save()

        return Response({
            'success': True,
            'message': f'Order {order.order_number} has been cancelled.',
            'order': OrderSerializer(order).data,
        }, status=status.HTTP_200_OK)
