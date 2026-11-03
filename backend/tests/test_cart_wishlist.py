from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.catalog.models import Product, Category
from apps.cart.models import Cart, CartItem
from apps.wishlist.models import Wishlist, WishlistItem


class CartWishlistAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = Category.objects.create(name='Tailoring', slug='tailoring')
        self.product1 = Product.objects.create(
            id='men-001',
            name='Atelier Linen Shirt',
            price=3450.00,
            in_stock=True,
            category=self.cat
        )
        self.product2 = Product.objects.create(
            id='men-002',
            name='Linen Shorts',
            price=1200.00,
            in_stock=True,
            category=self.cat
        )

    def test_add_to_cart_and_summary(self):
        url = reverse('cart-item-add')
        payload = {
            'productId': 'men-001',
            'quantity': 1,
            'selectedSize': 'M',
            'selectedColor': 'Warm Khaki',
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['totalCartItems'], 1)
        self.assertEqual(res.data['cartSubtotal'], 3450.0)
        # Orders >= 1999 get free shipping
        self.assertEqual(res.data['deliveryFee'], 0.0)
        self.assertEqual(res.data['finalTotal'], 3450.0)

    def test_cart_shipping_fee_below_threshold(self):
        url = reverse('cart-item-add')
        payload = {'productId': 'men-002', 'quantity': 1}
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['cartSubtotal'], 1200.0)
        self.assertEqual(res.data['deliveryFee'], 250.0)
        self.assertEqual(res.data['finalTotal'], 1450.0)

    def test_wishlist_add_and_uniqueness(self):
        add_url = reverse('wishlist-item-add')
        # Add once
        res1 = self.client.post(add_url, {'productId': 'men-001'}, format='json')
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res1.data['totalWishlistItems'], 1)

        # Add duplicate
        res2 = self.client.post(add_url, {'productId': 'men-001'}, format='json')
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.data['totalWishlistItems'], 1)

    def test_wishlist_remove(self):
        add_url = reverse('wishlist-item-add')
        self.client.post(add_url, {'productId': 'men-001'}, format='json')

        remove_url = reverse('wishlist-item-remove', kwargs={'product_id': 'men-001'})
        res = self.client.delete(remove_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['totalWishlistItems'], 0)

