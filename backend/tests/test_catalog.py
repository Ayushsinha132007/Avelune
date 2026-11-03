from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.catalog.models import Category, Product


class CatalogAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(
            name='Shirts',
            slug='shirts',
            target_audience='men',
            is_active=True
        )
        self.product = Product.objects.create(
            id='men-001',
            name='Atelier Structured Linen Shirt',
            slug='atelier-structured-linen-shirt-men-001',
            category=self.category,
            category_name='Shirts',
            gender='men',
            price=3450.00,
            original_price=4200.00,
            in_stock=True,
            is_featured=True,
            is_active=True,
            images=['https://example.com/shirt.jpg'],
            tags=['linen', 'summer']
        )
        self.cheap_product = Product.objects.create(
            id='men-002',
            name='Organic Cotton Tee',
            slug='organic-cotton-tee-men-002',
            category=self.category,
            category_name='Shirts',
            gender='men',
            price=850.00,
            in_stock=True,
            is_active=True,
            images=['https://example.com/tee.jpg'],
            tags=['cotton', 'basic']
        )

    def test_get_product_list(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        # Check camelCase fields match frontend expectations
        item = response.data[0]
        self.assertIn('originalPrice', item)
        self.assertIn('inStock', item)
        self.assertIn('reviewCount', item)

    def test_filter_by_gender(self):
        url = reverse('product-list') + '?gender=men'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_filter_by_price_range(self):
        url = reverse('product-list') + '?maxPrice=1000'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], 'men-002')

    def test_product_detail_lookup(self):
        url = reverse('product-detail', kwargs={'id': 'men-001'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Atelier Structured Linen Shirt')
        self.assertEqual(response.data['price'], 3450.0)

    def test_category_list(self):
        url = reverse('api-categories')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) >= 1)
        self.assertEqual(response.data[0]['slug'], 'shirts')

