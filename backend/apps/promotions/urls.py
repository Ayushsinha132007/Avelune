from django.urls import path
from .views import PromotionListView, CouponValidateView

urlpatterns = [
    path('', PromotionListView.as_view(), name='promotion-list'),
    path('validate/', CouponValidateView.as_view(), name='coupon-validate'),
]
