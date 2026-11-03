from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from decimal import Decimal
from apps.catalog.models import Product, Category
from apps.promotions.models import Promotion
from apps.orders.models import Order


class OrderAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = Category.objects.create(name='Outerwear', slug='outerwear')
        self.product = Product.objects.create(
            id='men-001',
            name='Atelier Linen Shirt',
            price=Decimal('3450.00'),
            in_stock=True,
            stock_quantity=50,
            category=self.cat
        )
        self.promo = Promotion.objects.create(
            name='10% Off',
            code='AVELUNE10',
            discount_type='percentage',
            discount_value=Decimal('10.00'),
            is_active=True
        )

    def test_create_order_with_server_calculation(self):
        url = reverse('order-create')
        payload = {
            'items': [
                {'productId': 'men-001', 'quantity': 2, 'selectedSize': 'L', 'selectedColor': 'White'}
            ],
            'deliveryAddress': {
                'fullName': 'Ayush Kumar',
                'email': 'ayush@example.com',
                'phone': '9876543210',
                'addressLine1': 'Altamount Road, Apt 14B',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'postalCode': '400026',
            },
            'couponCode': 'AVELUNE10',
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertIn('orderNumber', res.data)
        # Subtotal: 3450 * 2 = 6900
        self.assertEqual(res.data['subtotal'], 6900.0)
        # Discount: 10% of 6900 = 690
        self.assertEqual(res.data['discountAmount'], 690.0)
        # Delivery free since subtotal >= 1999
        self.assertEqual(res.data['deliveryCharges'], 0.0)
        # Final: 6900 - 690 = 6210
        self.assertEqual(res.data['totalAmount'], 6210.0)
        self.assertEqual(len(res.data['items']), 1)
        self.assertEqual(res.data['items'][0]['productId'], 'men-001')

    def test_cancel_order(self):
        # Create an order
        url = reverse('order-create')
        payload = {
            'items': [{'productId': 'men-001', 'quantity': 1}],
            'deliveryAddress': {
                'fullName': 'Ayush Kumar',
                'email': 'ayush@example.com',
                'phone': '9876543210',
                'addressLine1': 'Altamount Road, Apt 14B',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'postalCode': '400026',
            },
        }
        create_res = self.client.post(url, payload, format='json')
        order_num = create_res.data['orderNumber']

        cancel_url = reverse('order-cancel', kwargs={'order_id': order_num})
        cancel_res = self.client.post(cancel_url)
        self.assertEqual(cancel_res.status_code, 200)
        self.assertEqual(cancel_res.data['order']['status'], 'Cancelled')

