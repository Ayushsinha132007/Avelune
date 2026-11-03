from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.catalog.models import Category, Product
from apps.orders.models import Order
from apps.payments.models import Payment
from apps.payments.services import RazorpayServiceBoundary


class PaymentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(
            slug='men-shirts',
            name='Shirts',
            target_audience='men',
            display_order=1
        )
        self.product = Product.objects.create(
            id='test-pay-001',
            name='Cashmere Overshirt',
            slug='cashmere-overshirt',
            category=self.category,
            gender='men',
            price=Decimal('5400.00'),
            original_price=Decimal('6000.00'),
            sizes=['38', '40'],
            colors=[{'name': 'Camel', 'hex': '#C19A6B'}],
            in_stock=True,
            stock_quantity=10,
        )

    def test_create_razorpay_order_sandbox(self):
        from unittest.mock import patch
        mock_response_data = {
            'id': 'order_rzp_test_12345',
            'amount': 540000,
            'currency': 'INR',
        }
        with patch('requests.post') as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = mock_response_data

            payload = {
                'items': [
                    {'productId': 'test-pay-001', 'quantity': 1, 'selectedSize': '40', 'selectedColor': 'Camel'}
                ],
                'deliveryAddress': {
                    'fullName': 'Aarav Patel',
                    'email': 'aarav@avelune.com',
                    'phone': '9876543210',
                    'addressLine1': 'Flat 402, Highline Residency',
                    'city': 'Mumbai',
                    'state': 'Maharashtra',
                    'postalCode': '400001',
                    'country': 'India',
                }
            }
            response = self.client.post('/api/payments/create-order/', payload, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            data = response.json()
            self.assertTrue(data['success'])
            self.assertEqual(data['razorpayOrderId'], 'order_rzp_test_12345')
            self.assertEqual(data['amount'], 540000)

            # Verify internal order & payment recorded
            order = Order.objects.get(id=data['internalOrderId'])
            self.assertEqual(order.payment_status, 'Pending')
            self.assertEqual(order.order_status, 'Pending')
            self.assertEqual(order.final_amount, Decimal('5400.00'))

            payment = Payment.objects.get(order=order)
            self.assertEqual(payment.status, 'pending')

    def test_verify_payment_sandbox_signature(self):
        import hmac
        import hashlib
        from django.conf import settings
        from unittest.mock import patch

        mock_response_data = {
            'id': 'order_rzp_test_67890',
            'amount': 540000,
            'currency': 'INR',
        }
        with patch('requests.post') as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = mock_response_data

            # 1. Create order
            payload = {
                'items': [
                    {'productId': 'test-pay-001', 'quantity': 1, 'selectedSize': '40', 'selectedColor': 'Camel'}
                ],
                'deliveryAddress': {
                    'fullName': 'Aarav Patel',
                    'email': 'aarav@avelune.com',
                    'phone': '9876543210',
                    'addressLine1': 'Flat 402, Highline Residency',
                    'city': 'Mumbai',
                    'state': 'Maharashtra',
                    'postalCode': '400001',
                    'country': 'India',
                }
            }
            res_create = self.client.post('/api/payments/create-order/', payload, format='json')
            data_create = res_create.json()

        # Generate genuine HMAC-SHA256 signature
        order_id = data_create['razorpayOrderId']
        payment_id = 'pay_test_987654321'
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'test_secret')
        valid_signature = hmac.new(
            key_secret.encode('utf-8'),
            f"{order_id}|{payment_id}".encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # 2. Verify payment with valid signature
        verify_payload = {
            'internalOrderId': data_create['internalOrderId'],
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': valid_signature,
        }
        res_verify = self.client.post('/api/payments/verify/', verify_payload, format='json')
        self.assertEqual(res_verify.status_code, status.HTTP_200_OK)
        data_verify = res_verify.json()
        self.assertTrue(data_verify['success'])
        self.assertEqual(data_verify['order']['paymentStatus'], 'Paid')
        self.assertEqual(data_verify['order']['status'], 'Confirmed')

        # Check DB states
        order = Order.objects.get(id=data_create['internalOrderId'])
        self.assertEqual(order.payment_status, 'Paid')
        self.assertEqual(order.order_status, 'Confirmed')

        payment = Payment.objects.get(order=order)
        self.assertEqual(payment.status, 'captured')
        self.assertEqual(payment.razorpay_payment_id, payment_id)

    def test_payment_status_endpoint(self):
        from unittest.mock import patch
        mock_response_data = {
            'id': 'order_rzp_test_status_check',
            'amount': 540000,
            'currency': 'INR',
        }
        with patch('requests.post') as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = mock_response_data

            # 1. Create order
            payload = {
                'items': [
                    {'productId': 'test-pay-001', 'quantity': 1, 'selectedSize': '40', 'selectedColor': 'Camel'}
                ],
                'deliveryAddress': {
                    'fullName': 'Aarav Patel',
                    'email': 'aarav@avelune.com',
                    'phone': '9876543210',
                    'addressLine1': 'Flat 402, Highline Residency',
                    'city': 'Mumbai',
                    'state': 'Maharashtra',
                    'postalCode': '400001',
                    'country': 'India',
                }
            }
            res_create = self.client.post('/api/payments/create-order/', payload, format='json')
            order_id = res_create.json()['internalOrderId']

        # 2. Query status
        res_status = self.client.get(f'/api/payments/status/{order_id}/')
        self.assertEqual(res_status.status_code, status.HTTP_200_OK)
        data = res_status.json()
        self.assertEqual(data['paymentStatus'], 'Pending')
        self.assertEqual(data['paymentDetails']['status'], 'pending')
