from django.urls import path
from .admin_views import (
    AdminDirectLoginView,
    AdminOverviewMetricsView,
    AdminUsersListView,
    AdminUserDetailView,
    AdminOrdersListView,
    AdminOrderUpdateStatusView,
    AdminProductsManageView,
    AdminProductDetailManageView,
)

urlpatterns = [
    # Direct One-Click Auth for ayushsinha53467@gmail.com
    path('auth/direct-login/', AdminDirectLoginView.as_view(), name='admin-direct-login'),
    path('auth/direct-login', AdminDirectLoginView.as_view(), name='admin-direct-login-noslash'),

    # Live Atelier Overview Metrics
    path('overview/', AdminOverviewMetricsView.as_view(), name='admin-overview'),
    path('overview', AdminOverviewMetricsView.as_view(), name='admin-overview-noslash'),

    # Users Registry & User Dossier
    path('users/', AdminUsersListView.as_view(), name='admin-users-list'),
    path('users', AdminUsersListView.as_view(), name='admin-users-list-noslash'),
    path('users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:user_id>', AdminUserDetailView.as_view(), name='admin-user-detail-noslash'),

    # Orders & Logistics Dispatch Management
    path('orders/', AdminOrdersListView.as_view(), name='admin-orders-list'),
    path('orders', AdminOrdersListView.as_view(), name='admin-orders-list-noslash'),
    path('orders/<str:order_number>/status/', AdminOrderUpdateStatusView.as_view(), name='admin-order-update-status'),
    path('orders/<str:order_number>/status', AdminOrderUpdateStatusView.as_view(), name='admin-order-update-status-noslash'),

    # Product Catalogue Management (List, Add, Update, Soft-Delete)
    path('products/', AdminProductsManageView.as_view(), name='admin-products-manage'),
    path('products', AdminProductsManageView.as_view(), name='admin-products-manage-noslash'),
    path('products/<str:product_id>/', AdminProductDetailManageView.as_view(), name='admin-product-detail-manage'),
    path('products/<str:product_id>', AdminProductDetailManageView.as_view(), name='admin-product-detail-manage-noslash'),
]

