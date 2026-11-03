from django.urls import path
from .views import WishlistView, WishlistItemAddView, WishlistItemRemoveView

urlpatterns = [
    path('', WishlistView.as_view(), name='wishlist-detail'),
    path('items/', WishlistItemAddView.as_view(), name='wishlist-item-add'),
    path('items/<str:product_id>/', WishlistItemRemoveView.as_view(), name='wishlist-item-remove'),
]
