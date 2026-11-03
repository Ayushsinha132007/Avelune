from rest_framework import generics, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryListView(generics.ListAPIView):
    """List active catalogue categories with product counts."""
    queryset = Category.objects.filter(is_active=True).order_by('display_order', 'name')
    serializer_class = CategorySerializer
    pagination_class = None  # Return all categories


class ProductListView(generics.ListAPIView):
    """
    List and filter active products.
    Supports gender, category, collection, price range, search, and sorting.
    """
    serializer_class = ProductSerializer
    pagination_class = None  # Full list or paginated if needed

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)

        # 1. Gender / Audience Filter
        gender = self.request.query_params.get('gender')
        if gender and gender.lower() != 'all':
            queryset = queryset.filter(Q(gender=gender.lower()) | Q(gender='unisex'))

        # 2. Category Filter
        category = self.request.query_params.get('category')
        if category and category.lower() != 'all categories':
            queryset = queryset.filter(
                Q(category_name__iexact=category) |
                Q(category__name__iexact=category) |
                Q(category__slug__iexact=category)
            )

        # 3. Merchandising Collection Filter
        collection = self.request.query_params.get('collection')
        if collection and collection.lower() != 'all':
            col = collection.lower()
            if col == 'under-999':
                queryset = queryset.filter(price__lte=999)
            elif col == 'bestsellers':
                queryset = queryset.filter(is_bestseller=True)
            elif col == 'new-arrivals':
                queryset = queryset.filter(is_new_arrival=True)
            elif col == 'featured':
                queryset = queryset.filter(is_featured=True)
            else:
                queryset = queryset.filter(
                    Q(collections__contains=[col]) |
                    Q(collection_slug__iexact=col)
                )

        # 4. Price Range Filter
        min_price = self.request.query_params.get('min_price') or self.request.query_params.get('minPrice')
        max_price = self.request.query_params.get('max_price') or self.request.query_params.get('maxPrice')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass

        # 5. In-stock Filter
        only_in_stock = self.request.query_params.get('in_stock') or self.request.query_params.get('onlyInStock')
        if only_in_stock and only_in_stock.lower() in ('true', '1'):
            queryset = queryset.filter(in_stock=True)

        # 6. Search Query
        search = self.request.query_params.get('search') or self.request.query_params.get('q')
        if search:
            q_clean = search.strip()
            queryset = queryset.filter(
                Q(name__icontains=q_clean) |
                Q(subtitle__icontains=q_clean) |
                Q(description__icontains=q_clean) |
                Q(category_name__icontains=q_clean) |
                Q(materials__icontains=q_clean) |
                Q(tags__contains=[q_clean.lower()])
            )

        # 7. Sorting
        sort_by = self.request.query_params.get('sort') or self.request.query_params.get('sortBy')
        if sort_by:
            if sort_by in ('price-asc', 'price_asc'):
                queryset = queryset.order_by('price')
            elif sort_by in ('price-desc', 'price_desc'):
                queryset = queryset.order_by('-price')
            elif sort_by in ('newest', 'new'):
                queryset = queryset.order_by('-is_new_arrival', '-created_at')
            elif sort_by in ('bestselling', 'bestseller'):
                queryset = queryset.order_by('-is_bestseller', '-rating')
            elif sort_by == 'rating':
                queryset = queryset.order_by('-rating', '-review_count')
            else:
                queryset = queryset.order_by('-is_featured', '-rating')
        else:
            queryset = queryset.order_by('-is_featured', '-is_bestseller', '-created_at')

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """Retrieve single product by ID (e.g. men-001) or slug."""
    serializer_class = ProductSerializer
    lookup_field = 'id'

    def get_object(self):
        lookup = self.kwargs.get('id')
        try:
            return Product.objects.get(id=lookup, is_active=True)
        except Product.DoesNotExist:
            return generics.get_object_or_404(Product, slug=lookup, is_active=True)


class FeaturedCollectionQuickView(APIView):
    """Quick curations for Homepage sections."""
    def get(self, request, collection_type):
        qs = Product.objects.filter(is_active=True)
        if collection_type == 'featured':
            qs = qs.filter(is_featured=True)
        elif collection_type == 'new-arrivals':
            qs = qs.filter(is_new_arrival=True)
        elif collection_type == 'bestsellers':
            qs = qs.filter(is_bestseller=True)
        elif collection_type == 'under-999':
            qs = qs.filter(price__lte=999)
        else:
            qs = qs.filter(collections__contains=[collection_type])

        serializer = ProductSerializer(qs[:12], many=True)
        return Response(serializer.data)

