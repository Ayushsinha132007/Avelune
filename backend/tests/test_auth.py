from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token


class AuthAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.me_url = reverse('auth-me')
        self.profile_url = reverse('auth-profile')
        self.logout_url = reverse('auth-logout')

        self.user = User.objects.create_user(
            username='client@avelune.com',
            email='client@avelune.com',
            password='Password@123',
            first_name='Aarav',
            last_name='Mehta'
        )

    def test_registration_success(self):
        payload = {
            'fullName': 'Priya Sharma',
            'email': 'priya@example.com',
            'password': 'StrongPassword@123',
            'confirmPassword': 'StrongPassword@123',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['fullName'], 'Priya Sharma')
        self.assertEqual(response.data['user']['email'], 'priya@example.com')

    def test_duplicate_registration_rejection(self):
        payload = {
            'fullName': 'Duplicate User',
            'email': 'client@avelune.com',
            'password': 'StrongPassword@123',
            'confirmPassword': 'StrongPassword@123',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    def test_login_success(self):
        payload = {
            'email': 'client@avelune.com',
            'password': 'Password@123',
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['firstName'], 'Aarav')

    def test_login_invalid_password(self):
        payload = {
            'email': 'client@avelune.com',
            'password': 'WrongPassword@999',
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    def test_current_user_me_endpoint(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['email'], 'client@avelune.com')

    def test_unauthenticated_me_rejected(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, 401)

    def test_profile_update(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        payload = {
            'phone': '+91 99999 88888',
            'preferredCity': 'New Delhi, India',
        }
        response = self.client.patch(self.profile_url, payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['phone'], '+91 99999 88888')
        self.assertEqual(response.data['user']['preferredCity'], 'New Delhi, India')

    def test_logout(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Token.objects.filter(key=token.key).exists())

    def test_google_auth_new_user(self):
        payload = {
            'email': 'riya.kapoor@gmail.com',
            'fullName': 'Riya Kapoor',
        }
        response = self.client.post('/api/auth/google/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'riya.kapoor@gmail.com')
        self.assertEqual(response.data['user']['fullName'], 'Riya Kapoor')

        # Check DB
        user = User.objects.get(email='riya.kapoor@gmail.com')
        self.assertEqual(user.first_name, 'Riya')
        self.assertEqual(user.last_name, 'Kapoor')

    def test_google_auth_existing_user(self):
        payload = {
            'email': 'client@avelune.com',
            'fullName': 'Aarav Mehta',
        }
        response = self.client.post('/api/auth/google/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['email'], 'client@avelune.com')

    def test_send_otp_success(self):
        payload = {'email': 'official.me@company.com'}
        response = self.client.post('/api/auth/send-otp/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertIn('expiresIn', response.data)

    def test_verify_otp_flow(self):
        # 1. Dispatch OTP
        self.client.post('/api/auth/send-otp/', {'email': 'official.me@company.com'}, format='json')
        from apps.accounts.models import EmailOTP
        otp_record = EmailOTP.objects.filter(email='official.me@company.com').latest('created_at')
        # In test, set known OTP to test hashing and verification
        otp_record.set_otp('654321')
        otp_record.save()

        # 2. Verify with valid OTP (auto provisions new user)
        res_verify = self.client.post('/api/auth/verify-otp/', {
            'email': 'official.me@company.com',
            'otp': '654321',
            'fullName': 'Vikram Malhotra',
        }, format='json')

        self.assertEqual(res_verify.status_code, 200)
        self.assertTrue(res_verify.data['success'])
        self.assertIn('token', res_verify.data)
        self.assertEqual(res_verify.data['user']['email'], 'official.me@company.com')
        self.assertEqual(res_verify.data['user']['firstName'], 'Vikram')

    def test_verify_otp_invalid_code(self):
        self.client.post('/api/auth/send-otp/', {'email': 'test@domain.com'}, format='json')
        res_verify = self.client.post('/api/auth/verify-otp/', {
            'email': 'test@domain.com',
            'otp': '999999',
        }, format='json')
        self.assertEqual(res_verify.status_code, 400)
        self.assertFalse(res_verify.data['success'])

    def test_otp_resend_cooldown_rate_limit(self):
        # First send
        res1 = self.client.post('/api/auth/send-otp/', {'email': 'cooldown@company.com'}, format='json')
        self.assertEqual(res1.status_code, 200)

        # Immediate second send should hit 429 rate limit
        res2 = self.client.post('/api/auth/send-otp/', {'email': 'cooldown@company.com'}, format='json')
        self.assertEqual(res2.status_code, 429)
        self.assertFalse(res2.data['success'])
        self.assertTrue(res2.data.get('cooldown'))

    def test_password_reset_otp_flow(self):
        # Request password reset OTP
        res_req = self.client.post('/api/auth/password-reset-otp/', {
            'email': 'client@avelune.com'
        }, format='json')
        self.assertEqual(res_req.status_code, 200)
        self.assertTrue(res_req.data['success'])

        from apps.accounts.models import EmailOTP
        otp_record = EmailOTP.objects.filter(email='client@avelune.com', purpose='password_reset').latest('created_at')
        otp_record.set_otp('789123')
        otp_record.save()

        # Confirm reset with valid OTP and new password
        res_confirm = self.client.post('/api/auth/password-reset-confirm/', {
            'email': 'client@avelune.com',
            'otp': '789123',
            'newPassword': 'NewSecurePassword@2026',
            'confirmPassword': 'NewSecurePassword@2026',
        }, format='json')
        self.assertEqual(res_confirm.status_code, 200)
        self.assertTrue(res_confirm.data['success'])

        # Verify can login with new password
        login_res = self.client.post('/api/auth/login/', {
            'email': 'client@avelune.com',
            'password': 'NewSecurePassword@2026',
        }, format='json')
        self.assertEqual(login_res.status_code, 200)
        self.assertTrue(login_res.data['success'])

