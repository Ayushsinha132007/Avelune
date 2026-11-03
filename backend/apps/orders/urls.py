from django.urls import path
from .views import OrderCreateView, OrderListView, OrderDetailView, OrderCancelView

urlpatterns = [
    path('', OrderCreateView.as_view(), name='order-create'),
    path('history/', OrderListView.as_view(), name='order-list'),
    path('history', OrderListView.as_view(), name='order-list-noslash'),
    path('<str:order_id>/', OrderDetailView.as_view(), name='order-detail'),
    path('<str:order_id>', OrderDetailView.as_view(), name='order-detail-noslash'),
    path('<str:order_id>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    path('<str:order_id>/cancel', OrderCancelView.as_view(), name='order-cancel-noslash'),
]
