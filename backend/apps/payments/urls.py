from django.urls import path
from .views import (
    CreateRazorpayOrderView,
    VerifyPaymentView,
    PaymentStatusView,
    RazorpayWebhookView,
)

urlpatterns = [
    path('create-order/', CreateRazorpayOrderView.as_view(), name='payment-create-order'),
    path('create-order', CreateRazorpayOrderView.as_view(), name='payment-create-order-noslash'),
    path('verify/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('verify', VerifyPaymentView.as_view(), name='payment-verify-noslash'),
    path('status/<str:order_id>/', PaymentStatusView.as_view(), name='payment-status'),
    path('status/<str:order_id>', PaymentStatusView.as_view(), name='payment-status-noslash'),
    path('webhook/', RazorpayWebhookView.as_view(), name='payment-webhook'),
    path('webhook', RazorpayWebhookView.as_view(), name='payment-webhook-noslash'),
]
