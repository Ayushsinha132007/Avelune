from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from decimal import Decimal
from .models import Promotion
from .serializers import PromotionSerializer


class PromotionListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        promotions = Promotion.objects.filter(is_active=True)
        serializer = PromotionSerializer(promotions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CouponValidateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        subtotal_raw = request.data.get('subtotal', 0)

        if not code:
            return Response({
                'valid': False,
                'error': 'Please enter a voucher privilege code.',
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            subtotal = Decimal(str(subtotal_raw))
        except Exception:
            subtotal = Decimal('0.00')

        try:
            promo = Promotion.objects.get(code=code, is_active=True)
        except Promotion.DoesNotExist:
            return Response({
                'valid': False,
                'error': f'Invalid privilege voucher code: "{code}".',
            }, status=status.HTTP_404_NOT_FOUND)

        is_valid, reason = promo.is_valid(subtotal)
        if not is_valid:
            return Response({
                'valid': False,
                'error': reason,
            }, status=status.HTTP_400_BAD_REQUEST)

        discount = promo.calculate_discount(subtotal)

        return Response({
            'valid': True,
            'code': promo.code,
            'description': promo.description,
            'discount': float(discount),
            'discountType': promo.discount_type,
            'discountValue': float(promo.discount_value),
            'message': promo.description or f"{promo.code} privilege applied.",
        }, status=status.HTTP_200_OK)

