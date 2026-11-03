from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from decimal import Decimal
from apps.promotions.models import Promotion


class PromotionAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.coupon = Promotion.objects.create(
            name='10% Off',
            code='AVELUNE10',
            description='10% discount',
            discount_type='percentage',
            discount_value=Decimal('10.00'),
            min_purchase_amount=Decimal('0.00'),
            is_active=True
        )
        self.min_coupon = Promotion.objects.create(
            name='15% Above 5000',
            code='ATELIER15',
            description='15% above 5000',
            discount_type='percentage',
            discount_value=Decimal('15.00'),
            min_purchase_amount=Decimal('5000.00'),
            is_active=True
        )

    def test_validate_valid_coupon(self):
        url = reverse('coupon-validate')
        payload = {'code': 'avelune10', 'subtotal': 10000}
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['valid'])
        self.assertEqual(res.data['discount'], 1000.0)

    def test_validate_coupon_min_amount_failure(self):
        url = reverse('coupon-validate')
        payload = {'code': 'ATELIER15', 'subtotal': 3000}
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertFalse(res.data['valid'])

    def test_validate_nonexistent_coupon(self):
        url = reverse('coupon-validate')
        payload = {'code': 'INVALID999', 'subtotal': 5000}
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, 404)
        self.assertFalse(res.data['valid'])

