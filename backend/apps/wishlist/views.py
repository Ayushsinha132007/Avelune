from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer
from apps.catalog.models import Product


def get_user_wishlist(request):
    """Retrieve or initialize the active wishlist for user or guest."""
    if request.user.is_authenticated:
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        return wishlist

    session_key = request.headers.get('X-Session-Key') or request.session.session_key
    if not session_key:
        if not request.session.exists(request.session.session_key):
            request.session.create()
        session_key = request.session.session_key

    wishlist, _ = Wishlist.objects.get_or_create(session_key=session_key, user=None)
    return wishlist


class WishlistView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        wishlist = get_user_wishlist(request)
        return Response(WishlistSerializer(wishlist).data, status=status.HTTP_200_OK)


class WishlistItemAddView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        wishlist = get_user_wishlist(request)
        product_id = request.data.get('productId')

        if not product_id:
            return Response({'error': 'productId is required.'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id, is_active=True)

        # Prevent duplicate entries (idempotent)
        WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)

        return Response(WishlistSerializer(wishlist).data, status=status.HTTP_200_OK)


class WishlistItemRemoveView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, product_id):
        wishlist = get_user_wishlist(request)
        WishlistItem.objects.filter(wishlist=wishlist, product__id=product_id).delete()
        return Response(WishlistSerializer(wishlist).data, status=status.HTTP_200_OK)

