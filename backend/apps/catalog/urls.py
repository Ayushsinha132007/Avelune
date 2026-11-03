from django.urls import path
from .views import ProductListView, ProductDetailView, CategoryListView, FeaturedCollectionQuickView

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('categories/', CategoryListView.as_view(), name='product-categories'),
    path('collections/<str:collection_type>/', FeaturedCollectionQuickView.as_view(), name='product-collection'),
    path('<str:id>/', ProductDetailView.as_view(), name='product-detail'),
]
