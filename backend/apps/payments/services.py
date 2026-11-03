"""
Razorpay Payment Gateway Integration Boundary Service
Supports both live production calls and sandboxed mock responses
when awaiting credentials. Cryptographically validates payment signatures
using HMAC-SHA256.
"""

import hmac
import hashlib
import time
import requests
from decimal import Decimal
from typing import Dict, Any, Tuple
from django.conf import settings


class RazorpayServiceBoundary:
    @staticmethod
    def get_credentials() -> Tuple[str, str, str]:
        key_id = getattr(settings, 'RAZORPAY_KEY_ID', '').strip()
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '').strip()
        webhook_secret = getattr(settings, 'RAZORPAY_WEBHOOK_SECRET', '').strip()
        return key_id, key_secret, webhook_secret

    @classmethod
    def is_live_configured(cls) -> bool:
        key_id, key_secret, _ = cls.get_credentials()
        return bool(
            key_id and key_secret
            and not key_id.startswith('rzp_test_placeholder')
            and not key_secret.startswith('placeholder')
        )

    @classmethod
    def create_razorpay_order(
        cls,
        amount_inr: Decimal,
        receipt: str,
        notes: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Creates an order with Razorpay.
        Amount must be in Paise (1 INR = 100 Paise).
        """
        amount_paise = int(round(amount_inr * Decimal('100')))
        key_id, key_secret, _ = cls.get_credentials()
        notes = notes or {}

        if cls.is_live_configured():
            try:
                # Direct HTTPS call to Razorpay standard API
                response = requests.post(
                    'https://api.razorpay.com/v1/orders',
                    auth=(key_id, key_secret),
                    json={
                        'amount': amount_paise,
                        'currency': 'INR',
                        'receipt': receipt,
                        'notes': notes,
                        'payment_capture': 1,
                    },
                    timeout=10,
                )
                if response.status_code == 200 or response.status_code == 201:
                    data = response.json()
                    return {
                        'success': True,
                        'is_live': True,
                        'razorpay_order_id': data['id'],
                        'amount': data['amount'],
                        'currency': data['currency'],
                        'key_id': key_id,
                        'diagnostic': 'Live Razorpay order created successfully.',
                    }
                else:
                    return {
                        'success': False,
                        'error': f"Razorpay API responded with {response.status_code}: {response.text}",
                    }
            except Exception as e:
                return {
                    'success': False,
                    'error': f"Failed to connect to Razorpay API: {str(e)}",
                }

        # Sandbox / Mock fallback when waiting for user credentials
        mock_order_id = f"order_mock_{receipt}_{int(time.time())}"
        return {
            'success': True,
            'is_live': False,
            'razorpay_order_id': mock_order_id,
            'amount': amount_paise,
            'currency': 'INR',
            'key_id': key_id or 'rzp_test_placeholder_key',
            'diagnostic': 'Payment gateway awaiting live credentials in .env. Running in sandbox mode.',
        }

    @classmethod
    def verify_payment_signature(
        cls,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> Tuple[bool, str]:
        """
        Verifies Razorpay payment signature via HMAC-SHA256:
        signature = hmac_sha256(order_id + "|" + payment_id, secret)
        """
        key_id, key_secret, _ = cls.get_credentials()

        if cls.is_live_configured():
            generated_signature = hmac.new(
                key_secret.encode('utf-8'),
                f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            if hmac.compare_digest(generated_signature, razorpay_signature):
                return True, "Payment signature cryptographically verified."
            else:
                return False, "Signature verification failed. Potential tampering detected."

        # In sandbox mode, accept test signatures or mock payloads
        if razorpay_signature in ['test_sandbox_signature', 'test_signature'] or razorpay_order_id.startswith('order_mock_'):
            return True, "Sandbox payment verified successfully."

        return True, "Signature accepted in sandbox mode."

    @classmethod
    def verify_webhook_signature(cls, raw_body: bytes, signature_header: str) -> bool:
        _, _, webhook_secret = cls.get_credentials()
        if not webhook_secret or webhook_secret.startswith('placeholder'):
            return True

        expected_signature = hmac.new(
            webhook_secret.encode('utf-8'),
            raw_body,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_signature, signature_header)

