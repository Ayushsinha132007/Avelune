import random
from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import OrderSerializer
from apps.catalog.models import Product
from apps.promotions.models import Promotion
from .models import Payment
from .services import RazorpayServiceBoundary


class CreateRazorpayOrderView(APIView):
    permission_classes = [permissions.AllowAny]

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
                    'error': f'Product ID "{prod_id}" is unavailable in catalogue.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not product.in_stock or product.stock_quantity < qty:
                return Response({
                    'error': f'Insufficient stock for "{product.name}".'
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

        # 2. Coupon Validation & Discount
        discount_amount = Decimal('0.00')
        applied_coupon_code = ''
        if coupon_code:
            try:
                promo = Promotion.objects.get(code=coupon_code, is_active=True)
                valid, _ = promo.is_valid(subtotal)
                if valid:
                    discount_amount = promo.calculate_discount(subtotal)
                    applied_coupon_code = promo.code
            except Promotion.DoesNotExist:
                pass

        # 3. Delivery Fee (Complimentary for >= ₹1,999)
        delivery_charges = Decimal('0.00') if subtotal >= 1999 else Decimal('250.00')

        # 4. Final Payable & Tax
        final_amount = max(Decimal('0.00'), subtotal - discount_amount) + delivery_charges
        tax_amount = round((final_amount * Decimal('0.18')) / Decimal('1.18'), 2)

        order_num = f"AVL-2026-{random.randint(10000, 99999)}"
        est_deliv_date = (timezone.now() + timedelta(days=3)).strftime('%d %b %Y')
        tracking_num = f"BD-IND-{random.randint(1000000, 9999999)}"

        with transaction.atomic():
            order = Order.objects.create(
                order_number=order_num,
                user=request.user if request.user.is_authenticated else None,
                customer_name=full_name,
                customer_email=email,
                customer_phone=phone,
                order_status='Pending',
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

            # Generate Razorpay Order via Boundary
            rzp_res = RazorpayServiceBoundary.create_razorpay_order(
                amount_inr=final_amount,
                receipt=order.order_number,
                notes={
                    'order_id': order.id,
                    'order_number': order.order_number,
                    'email': email,
                }
            )

            if not rzp_res.get('success'):
                # Rollback transaction
                raise Exception(rzp_res.get('error', 'Failed to generate Razorpay order.'))

            # Create pending Payment record
            Payment.objects.create(
                order=order,
                razorpay_order_id=rzp_res['razorpay_order_id'],
                amount=final_amount,
                currency='INR',
                status='pending',
            )

        return Response({
            'success': True,
            'internalOrderId': str(order.id),
            'orderNumber': order.order_number,
            'razorpayOrderId': rzp_res['razorpay_order_id'],
            'amount': rzp_res['amount'],
            'currency': rzp_res['currency'],
            'keyId': rzp_res['key_id'],
            'customer': {
                'name': full_name,
                'email': email,
                'contact': phone,
            },
            'diagnostic': rzp_res.get('diagnostic', ''),
        }, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        internal_order_id = data.get('internalOrderId')
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id', '')
        razorpay_signature = data.get('razorpay_signature', '')

        # Lookup Order
        order = None
        if internal_order_id:
            order = Order.objects.filter(id=internal_order_id).first()
            if not order:
                order = Order.objects.filter(order_number=internal_order_id).first()

        if not order and razorpay_order_id:
            payment_match = Payment.objects.filter(razorpay_order_id=razorpay_order_id).first()
            if payment_match:
                order = payment_match.order

        if not order:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Cryptographically verify signature
        is_valid, msg = RazorpayServiceBoundary.verify_payment_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
        )

        if not is_valid:
            Payment.objects.filter(order=order).update(
                status='failed',
                error_code='SIGNATURE_MISMATCH',
                error_description=msg,
            )
            order.payment_status = 'Failed'
            order.save(update_fields=['payment_status'])
            return Response({'success': False, 'error': msg}, status=status.HTTP_400_BAD_REQUEST)

        # On success: Update payment & order
        Payment.objects.filter(order=order).update(
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
            status='captured',
        )
        order.payment_status = 'Paid'
        order.order_status = 'Confirmed'
        order.save(update_fields=['payment_status', 'order_status'])

        return Response({
            'success': True,
            'message': msg,
            'order': OrderSerializer(order).data,
        }, status=status.HTTP_200_OK)


class PaymentStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_id):
        order = Order.objects.filter(id=order_id).first() or Order.objects.filter(order_number=order_id).first()
        if not order:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment = Payment.objects.filter(order=order).first()
        return Response({
            'orderNumber': order.order_number,
            'orderStatus': order.order_status,
            'paymentStatus': order.payment_status,
            'paymentDetails': {
                'razorpayOrderId': payment.razorpay_order_id if payment else '',
                'razorpayPaymentId': payment.razorpay_payment_id if payment else '',
                'status': payment.status if payment else 'unknown',
            } if payment else None,
            'order': OrderSerializer(order).data,
        })


class RazorpayWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        signature_header = request.headers.get('X-Razorpay-Signature', '')
        raw_body = request.body

        if not RazorpayServiceBoundary.verify_webhook_signature(raw_body, signature_header):
            return Response({'error': 'Invalid webhook signature.'}, status=status.HTTP_400_BAD_REQUEST)

        event = request.data.get('event')
        payload = request.data.get('payload', {})

        if event == 'payment.captured':
            payment_entity = payload.get('payment', {}).get('entity', {})
            rzp_order_id = payment_entity.get('order_id')
            rzp_payment_id = payment_entity.get('id')

            payment = Payment.objects.filter(razorpay_order_id=rzp_order_id).first()
            if payment:
                payment.status = 'captured'
                payment.razorpay_payment_id = rzp_payment_id
                payment.save(update_fields=['status', 'razorpay_payment_id'])
                payment.order.payment_status = 'Paid'
                payment.order.order_status = 'Confirmed'
                payment.order.save(update_fields=['payment_status', 'order_status'])

        return Response({'status': 'webhook processed'}, status=status.HTTP_200_OK)

