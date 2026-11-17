from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from apps.catalog.models import Product, Category
from apps.orders.models import Order, OrderItem
from apps.accounts.models import Profile

class AdminSuiteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_email = 'ayushsinha53467@gmail.com'
        self.user_email = 'client@example.com'

        # Regular user
        self.regular_user = User.objects.create_user(
            username=self.user_email,
            email=self.user_email,
            first_name='Rahul',
            last_name='Verma'
        )
        self.regular_token = Token.objects.create(user=self.regular_user)

        # Admin user
        self.admin_user = User.objects.create_user(
            username=self.admin_email,
            email=self.admin_email,
            first_name='Ayush',
            last_name='Sinha',
            is_staff=True,
            is_superuser=True
        )
        self.admin_token = Token.objects.create(user=self.admin_user)

        # Category & Product
        self.category = Category.objects.create(name='Tailored Shirts', slug='shirts', target_audience='men')
        self.product = Product.objects.create(
            id='men-test-01',
            name='Atelier Linen Shirt',
            category=self.category,
            category_name='Tailored Shirts',
            gender='men',
            price=12500,
            original_price=15000,
            stock_quantity=20,
            in_stock=True,
            is_active=True
        )

        # Order for regular user
        self.order = Order.objects.create(
            order_number='ORD-TEST-1001',
            user=self.regular_user,
            customer_name='Rahul Verma',
            customer_email=self.user_email,
            customer_phone='+919876543210',
            shipping_street='104 Marine Drive',
            shipping_city='Mumbai',
            shipping_state='Maharashtra',
            shipping_postal_code='400020',
            subtotal=12500,
            final_amount=12500,
            payment_status='Paid',
            order_status='Processing'
        )
        OrderItem.objects.create(
            order=self.order,
            product_id_snapshot=self.product.id,
            product_name_snapshot=self.product.name,
            quantity=1,
            unit_price=12500,
            line_total=12500
        )

    def test_direct_login_allowed_only_for_admin_email(self):
        # Admin email succeeds without OTP
        res = self.client.post('/api/admin-suite/auth/direct-login/', {'email': self.admin_email}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data.get('isAdmin'))
        self.assertIn('token', res.data)

        # Non-admin email is rejected
        res2 = self.client.post('/api/admin-suite/auth/direct-login/', {'email': 'hacker@example.com'}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)

    def test_send_otp_bypasses_for_admin_email(self):
        res = self.client.post('/api/auth/send-otp/', {'email': self.admin_email}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data.get('bypassOtp'))
        self.assertTrue(res.data.get('isAdmin'))

    def test_verify_otp_bypasses_for_admin_email(self):
        res = self.client.post('/api/auth/verify-otp/', {'email': self.admin_email}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data.get('isAdmin'))
        self.assertIn('token', res.data)

    def test_admin_endpoints_forbidden_for_regular_users(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.regular_token.key}')
        res = self.client.get('/api/admin-suite/overview/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        res2 = self.client.get('/api/admin-suite/users/')
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_overview_metrics(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        res = self.client.get('/api/admin-suite/overview/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('metrics', res.data)
        metrics = res.data['metrics']
        self.assertEqual(metrics['totalOrders'], 1)
        self.assertEqual(metrics['paidOrdersCount'], 1)
        self.assertEqual(metrics['totalRevenue'], 12500.0)

    def test_admin_users_list_and_user_dossier(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        res = self.client.get('/api/admin-suite/users/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data['users']), 1)

        # Check dossier for regular user
        dossier_res = self.client.get(f'/api/admin-suite/users/{self.regular_user.id}/')
        self.assertEqual(dossier_res.status_code, status.HTTP_200_OK)
        self.assertEqual(dossier_res.data['user']['email'], self.user_email)
        self.assertEqual(len(dossier_res.data['orders']), 1)
        self.assertEqual(dossier_res.data['orders'][0]['orderNumber'], 'ORD-TEST-1001')
        self.assertEqual(dossier_res.data['orders'][0]['paymentStatus'], 'Paid')
        self.assertEqual(dossier_res.data['orders'][0]['shippingAddress']['city'], 'Mumbai')

    def test_admin_order_status_update(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        res = self.client.patch(
            f'/api/admin-suite/orders/{self.order.order_number}/status/',
            {
                'order_status': 'Shipped',
                'carrier': 'BlueDart Express',
                'tracking_number': 'BLUEDART-889900'
            },
            format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.order_status, 'Shipped')
        self.assertEqual(self.order.carrier, 'BlueDart Express')
        self.assertEqual(self.order.tracking_number, 'BLUEDART-889900')

    def test_admin_product_management(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        # Create product
        create_res = self.client.post(
            '/api/admin-suite/products/',
            {
                'name': 'Cashmere Overcoat',
                'price': 48000,
                'gender': 'men',
                'categoryId': self.category.id,
                'stockQuantity': 15,
                'description': 'Handcrafted pure cashmere overcoat.'
            },
            format='json'
        )
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        new_prod_id = create_res.data['product']['id']

        # Edit product
        edit_res = self.client.patch(
            f'/api/admin-suite/products/{new_prod_id}/',
            {'price': 45000, 'stockQuantity': 12},
            format='json'
        )
        self.assertEqual(edit_res.status_code, status.HTTP_200_OK)
        new_prod = Product.objects.get(id=new_prod_id)
        self.assertEqual(float(new_prod.price), 45000.0)
        self.assertEqual(new_prod.stock_quantity, 12)

        # Delete product (soft-delete)
        del_res = self.client.delete(f'/api/admin-suite/products/{new_prod_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        new_prod.refresh_from_db()
        self.assertFalse(new_prod.is_active)
