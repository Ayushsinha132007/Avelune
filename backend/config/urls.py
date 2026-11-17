"""
AVELUNE URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'name': 'AVELUNE Luxury E-Commerce API',
        'status': 'online',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health/',
            'auth': '/api/auth/',
            'products': '/api/products/',
            'categories': '/api/categories/',
            'cart': '/api/cart/',
            'wishlist': '/api/wishlist/',
            'offers': '/api/offers/',
            'coupons': '/api/coupons/',
            'orders': '/api/orders/',
            'payments': '/api/payments/',
            'recommendations': '/api/recommendations/',
        }
    })

def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'service': 'avelune-django-backend',
        'database': 'sqlite3',
    })

from apps.catalog.views import CategoryListView, FeaturedCollectionQuickView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health-check'),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/admin-suite/', include('apps.accounts.admin_urls')),
    path('api/products/', include('apps.catalog.urls')),
    path('api/categories/', CategoryListView.as_view(), name='api-categories'),
    path('api/collections/<str:collection_type>/', FeaturedCollectionQuickView.as_view(), name='api-collections'),
    path('api/cart/', include('apps.cart.urls')),
    path('api/wishlist/', include('apps.wishlist.urls')),
    path('api/promotions/', include('apps.promotions.urls')),
    path('api/coupons/', include('apps.promotions.urls')),
    path('api/offers/', include('apps.promotions.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/recommendations/', include('apps.recommendations.urls')),
]
