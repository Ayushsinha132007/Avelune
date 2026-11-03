from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from apps.catalog.models import Product


def get_user_cart(request):
    """Retrieve or initialize the active cart for user or guest."""
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    # Guest session fallback
    session_key = request.headers.get('X-Session-Key') or request.session.session_key
    if not session_key:
        if not request.session.exists(request.session.session_key):
            request.session.create()
        session_key = request.session.session_key

    cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None)
    return cart


class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = get_user_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        cart = get_user_cart(request)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemAddView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        cart = get_user_cart(request)
        product_id = request.data.get('productId')
        quantity = int(request.data.get('quantity', 1))
        selected_size = request.data.get('selectedSize', '').strip()
        selected_color = request.data.get('selectedColor', '').strip()

        if not product_id:
            return Response({'error': 'productId is required.'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id, is_active=True)

        if not product.in_stock:
            return Response({'error': f'{product.name} is currently out of stock.'}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce max 10 per SKU per luxury order
        quantity = max(1, min(quantity, 10))

        # Check existing item
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            selected_size=selected_size,
            selected_color=selected_color,
            defaults={
                'quantity': quantity,
                'unit_price_snapshot': product.price,
            }
        )

        if not created:
            item.quantity = min(item.quantity + quantity, 10)
            item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, item_id):
        cart = get_user_cart(request)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)

        quantity = request.data.get('quantity')
        if quantity is not None:
            qty = int(quantity)
            if qty <= 0:
                item.delete()
            else:
                item.quantity = min(qty, 10)
                item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def delete(self, request, item_id):
        cart = get_user_cart(request)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

