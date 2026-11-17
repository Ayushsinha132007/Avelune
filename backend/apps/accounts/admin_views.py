from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.contrib.auth.models import User
from django.utils.text import slugify
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment
from apps.catalog.models import Product, Category
from apps.catalog.serializers import ProductSerializer
from apps.accounts.models import Profile
from apps.accounts.serializers import UserProfileSerializer

ADMIN_EMAIL = 'ayushsinha53467@gmail.com'


class IsDesignatedAdmin(permissions.BasePermission):
    """
    Strict permission class ensuring ONLY the designated administrator
    (ayushsinha53467@gmail.com) can access admin suite endpoints.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.email.strip().lower() == ADMIN_EMAIL.lower()


class AdminDirectLoginView(APIView):
    """
    Instant One-Click Admin Authentication for ayushsinha53467@gmail.com.
    Zero OTP required. Strictly validates the designated admin email.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if email != ADMIN_EMAIL.lower():
            return Response({
                'success': False,
                'error': f'Access Denied. Only {ADMIN_EMAIL} is authorized to access the Atelier Admin Suite.',
                'message': 'Unauthorized email address for administrator portal.',
            }, status=status.HTTP_403_FORBIDDEN)

        user = User.objects.filter(email__iexact=ADMIN_EMAIL).first()
        if not user:
            user = User.objects.filter(username__iexact=ADMIN_EMAIL).first()

        if not user:
            user = User.objects.create_user(
                username=ADMIN_EMAIL,
                email=ADMIN_EMAIL,
                first_name='Ayush',
                last_name='Sinha',
                is_staff=True,
                is_superuser=True,
            )
            user.set_unusable_password()
            user.save()
        else:
            if not user.is_staff or not user.is_superuser:
                user.is_staff = True
                user.is_superuser = True
                user.save(update_fields=['is_staff', 'is_superuser'])

        # Update profile membership
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.membership_tier = 'Atelier Director / Administrator'
        profile.avatar_initials = 'AS'
        profile.save()

        token, _ = Token.objects.get_or_create(user=user)

        user_data = UserProfileSerializer(profile).data
        user_data['isAdmin'] = True
        user_data['role'] = 'admin'

        return Response({
            'success': True,
            'message': 'Atelier Director authenticated successfully. Welcome to the Admin Suite.',
            'token': token.key,
            'isAdmin': True,
            'user': user_data,
        }, status=status.HTTP_200_OK)


class AdminOverviewMetricsView(APIView):
    """
    Live Atelier Metrics: Revenue, Total Orders, Paid vs Pending, Dispatches, Users, Products.
    """
    permission_classes = [IsDesignatedAdmin]

    def get(self, request):
        total_orders = Order.objects.count()
        paid_orders = Order.objects.filter(payment_status='Paid')
        paid_orders_count = paid_orders.count()

        total_revenue = paid_orders.aggregate(total=Sum('final_amount'))['total'] or Decimal('0.00')

        pending_dispatch_count = Order.objects.filter(
            Q(order_status__in=['Pending', 'Confirmed', 'Processing']) |
            Q(payment_status='Paid', order_status__in=['Confirmed', 'Processing'])
        ).exclude(order_status__in=['Shipped', 'Delivered', 'Cancelled']).count()

        shipped_count = Order.objects.filter(order_status='Shipped').count()
        delivered_count = Order.objects.filter(order_status='Delivered').count()
        cancelled_count = Order.objects.filter(order_status='Cancelled').count()

        total_users = User.objects.exclude(email='').count()
        total_products = Product.objects.filter(is_active=True).count()
        low_stock_count = Product.objects.filter(is_active=True, stock_quantity__lte=10).count()

        recent_orders = []
        for o in Order.objects.all().order_by('-created_at')[:8]:
            recent_orders.append({
                'orderNumber': o.order_number,
                'customerName': o.customer_name,
                'customerEmail': o.customer_email,
                'orderStatus': o.order_status,
                'paymentStatus': o.payment_status,
                'finalAmount': float(o.final_amount),
                'itemCount': o.items.count(),
                'createdAt': o.created_at.isoformat(),
            })

        return Response({
            'success': True,
            'metrics': {
                'totalRevenue': float(total_revenue),
                'totalOrders': total_orders,
                'paidOrdersCount': paid_orders_count,
                'pendingDispatchCount': pending_dispatch_count,
                'shippedCount': shipped_count,
                'deliveredCount': delivered_count,
                'cancelledCount': cancelled_count,
                'totalUsers': total_users,
                'totalProducts': total_products,
                'lowStockCount': low_stock_count,
            },
            'recentOrders': recent_orders,
        }, status=status.HTTP_200_OK)


class AdminUsersListView(APIView):
    """
    List all registered clients with order summaries, spending, and join dates.
    """
    permission_classes = [IsDesignatedAdmin]

    def get(self, request):
        q = request.query_params.get('q', '').strip().lower()
        users_qs = User.objects.all().order_by('-date_joined')

        if q:
            users_qs = users_qs.filter(
                Q(email__icontains=q) |
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q) |
                Q(username__icontains=q)
            )

        users_list = []
        for u in users_qs:
            # Calculate order metrics for this user (either via user FK or matching customer_email)
            user_orders = Order.objects.filter(Q(user=u) | Q(customer_email__iexact=u.email))
            orders_count = user_orders.count()
            paid_orders = user_orders.filter(payment_status='Paid')
            total_spent = paid_orders.aggregate(total=Sum('final_amount'))['total'] or Decimal('0.00')

            last_order = user_orders.order_by('-created_at').first()
            last_order_date = last_order.created_at.isoformat() if last_order else None

            profile = getattr(u, 'profile', None)
            phone = profile.phone if profile else ''
            city = profile.city if profile else ''
            state = profile.state if profile else ''

            users_list.append({
                'id': u.id,
                'email': u.email or u.username,
                'firstName': u.first_name,
                'lastName': u.last_name,
                'fullName': f"{u.first_name} {u.last_name}".strip() or u.username,
                'phone': phone,
                'city': city,
                'state': state,
                'dateJoined': u.date_joined.isoformat(),
                'totalOrders': orders_count,
                'totalSpent': float(total_spent),
                'lastOrderDate': last_order_date,
                'membershipTier': profile.membership_tier if profile else 'Atelier Client',
            })

        return Response({
            'success': True,
            'totalUsers': len(users_list),
            'users': users_list,
        }, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    """
    Comprehensive User Dossier:
    - User account info & join date
    - All orders placed by this user
    - For each order: items, photos, price, payment status, dispatch status, address
    """
    permission_classes = [IsDesignatedAdmin]

    def get(self, request, user_id):
        try:
            u = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'success': False, 'error': f'User ID {user_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile = getattr(u, 'profile', None)
        user_orders_qs = Order.objects.filter(Q(user=u) | Q(customer_email__iexact=u.email)).order_by('-created_at')

        orders_data = []
        for o in user_orders_qs:
            items_data = []
            for item in o.items.all():
                items_data.append({
                    'id': item.id,
                    'productId': item.product_id_snapshot,
                    'productName': item.product_name_snapshot,
                    'image': item.image_snapshot,
                    'selectedSize': item.selected_size,
                    'selectedColor': item.selected_color,
                    'quantity': item.quantity,
                    'unitPrice': float(item.unit_price),
                    'lineTotal': float(item.line_total),
                })

            payment = o.payments.order_by('-created_at').first()

            orders_data.append({
                'orderNumber': o.order_number,
                'orderStatus': o.order_status,
                'paymentStatus': o.payment_status,
                'createdAt': o.created_at.isoformat(),
                'subtotal': float(o.subtotal),
                'discountAmount': float(o.discount_amount),
                'couponCode': o.coupon_code,
                'deliveryCharges': float(o.delivery_charges),
                'taxAmount': float(o.tax_amount),
                'finalAmount': float(o.final_amount),
                'shippingAddress': {
                    'name': o.shipping_name,
                    'street': o.shipping_street,
                    'apartment': o.shipping_apartment,
                    'city': o.shipping_city,
                    'state': o.shipping_state,
                    'postalCode': o.shipping_postal_code,
                    'country': o.shipping_country,
                    'phone': o.customer_phone,
                    'email': o.customer_email,
                },
                'logistics': {
                    'carrier': o.carrier,
                    'trackingNumber': o.tracking_number,
                    'estimatedDelivery': o.estimated_delivery,
                },
                'paymentDetails': {
                    'razorpayOrderId': payment.razorpay_order_id if payment else '',
                    'razorpayPaymentId': payment.razorpay_payment_id if payment else '',
                    'status': payment.status if payment else o.payment_status,
                },
                'items': items_data,
            })

        total_spent = sum(o['finalAmount'] for o in orders_data if o['paymentStatus'] == 'Paid')

        return Response({
            'success': True,
            'user': {
                'id': u.id,
                'email': u.email or u.username,
                'firstName': u.first_name,
                'lastName': u.last_name,
                'fullName': f"{u.first_name} {u.last_name}".strip() or u.username,
                'dateJoined': u.date_joined.isoformat(),
                'lastLogin': u.last_login.isoformat() if u.last_login else None,
                'phone': profile.phone if profile else '',
                'membershipTier': profile.membership_tier if profile else 'Atelier Client',
                'primaryAddress': {
                    'street': profile.street_address if profile else '',
                    'apartment': profile.apartment if profile else '',
                    'city': profile.city if profile else '',
                    'state': profile.state if profile else '',
                    'postalCode': profile.postal_code if profile else '',
                    'country': profile.country if profile else 'India',
                },
            },
            'orderMetrics': {
                'totalOrders': len(orders_data),
                'totalSpent': float(total_spent),
                'pendingDispatch': sum(1 for o in orders_data if o['orderStatus'] in ['Pending', 'Confirmed', 'Processing']),
            },
            'orders': orders_data,
        }, status=status.HTTP_200_OK)


class AdminOrdersListView(APIView):
    """
    List all orders with status filters and customer snapshots.
    """
    permission_classes = [IsDesignatedAdmin]

    def get(self, request):
        status_filter = request.query_params.get('status', '').strip()
        payment_filter = request.query_params.get('payment_status', '').strip()
        q = request.query_params.get('q', '').strip()

        orders_qs = Order.objects.all().order_by('-created_at')

        if status_filter and status_filter.lower() != 'all':
            orders_qs = orders_qs.filter(order_status__iexact=status_filter)

        if payment_filter and payment_filter.lower() != 'all':
            orders_qs = orders_qs.filter(payment_status__iexact=payment_filter)

        if q:
            orders_qs = orders_qs.filter(
                Q(order_number__icontains=q) |
                Q(customer_name__icontains=q) |
                Q(customer_email__icontains=q) |
                Q(customer_phone__icontains=q) |
                Q(shipping_city__icontains=q)
            )

        orders_data = []
        for o in orders_qs:
            items_data = []
            for it in o.items.all():
                items_data.append({
                    'id': it.id,
                    'productId': it.product_id_snapshot,
                    'productName': it.product_name_snapshot,
                    'image': it.image_snapshot,
                    'quantity': it.quantity,
                    'selectedSize': it.selected_size,
                    'selectedColor': it.selected_color,
                    'unitPrice': float(it.unit_price),
                    'lineTotal': float(it.line_total),
                })

            payment = o.payments.order_by('-created_at').first()

            orders_data.append({
                'orderNumber': o.order_number,
                'customerName': o.customer_name,
                'customerEmail': o.customer_email,
                'customerPhone': o.customer_phone,
                'orderStatus': o.order_status,
                'paymentStatus': o.payment_status,
                'finalAmount': float(o.final_amount),
                'subtotal': float(o.subtotal),
                'deliveryCharges': float(o.delivery_charges),
                'createdAt': o.created_at.isoformat(),
                'shippingAddress': {
                    'street': o.shipping_street,
                    'city': o.shipping_city,
                    'state': o.shipping_state,
                    'postalCode': o.shipping_postal_code,
                    'country': o.shipping_country,
                },
                'logistics': {
                    'carrier': o.carrier,
                    'trackingNumber': o.tracking_number,
                    'estimatedDelivery': o.estimated_delivery,
                },
                'paymentDetails': {
                    'razorpayOrderId': payment.razorpay_order_id if payment else '',
                    'razorpayPaymentId': payment.razorpay_payment_id if payment else '',
                },
                'items': items_data,
            })

        return Response({
            'success': True,
            'totalOrders': len(orders_data),
            'orders': orders_data,
        }, status=status.HTTP_200_OK)


class AdminOrderUpdateStatusView(APIView):
    """
    Update order dispatch status, tracking number, and carrier.
    """
    permission_classes = [IsDesignatedAdmin]

    def patch(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'success': False, 'error': f'Order {order_number} not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'order_status' in data:
            order.order_status = data['order_status']
        if 'payment_status' in data:
            order.payment_status = data['payment_status']
        if 'carrier' in data:
            order.carrier = data['carrier']
        if 'tracking_number' in data:
            order.tracking_number = data['tracking_number']
        if 'estimated_delivery' in data:
            order.estimated_delivery = data['estimated_delivery']

        order.save()

        return Response({
            'success': True,
            'message': f"Order {order_number} updated successfully.",
            'order': {
                'orderNumber': order.order_number,
                'orderStatus': order.order_status,
                'paymentStatus': order.payment_status,
                'carrier': order.carrier,
                'trackingNumber': order.tracking_number,
                'estimatedDelivery': order.estimated_delivery,
            }
        }, status=status.HTTP_200_OK)


class AdminProductsManageView(APIView):
    """
    Admin Catalogue Management:
    - GET: List all products with stock and category
    - POST: Create and insert new product
    """
    permission_classes = [IsDesignatedAdmin]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        gender = request.query_params.get('gender', '').strip()
        category_slug = request.query_params.get('category', '').strip()

        qs = Product.objects.all().order_by('-created_at')

        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(id__icontains=q) | Q(description__icontains=q))
        if gender and gender != 'all':
            qs = qs.filter(gender=gender)
        if category_slug and category_slug != 'all':
            qs = qs.filter(category__slug=category_slug)

        products_data = []
        for p in qs:
            products_data.append(ProductSerializer(p).data)

        categories = []
        for c in Category.objects.all():
            categories.append({
                'id': c.id,
                'name': c.name,
                'slug': c.slug,
                'targetAudience': c.target_audience,
            })

        return Response({
            'success': True,
            'total': len(products_data),
            'products': products_data,
            'categories': categories,
        }, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        name = data.get('name', '').strip()
        category_id = data.get('categoryId') or data.get('category_id')
        price = data.get('price')
        gender = data.get('gender', 'men').strip().lower()

        if not name or not price:
            return Response({'success': False, 'error': 'Product name and price are mandatory.'}, status=status.HTTP_400_BAD_REQUEST)

        # Lookup or associate category
        category = None
        if category_id:
            category = Category.objects.filter(id=category_id).first() or Category.objects.filter(slug=category_id).first()
        if not category:
            category = Category.objects.filter(slug='shirts').first()

        # Generate unique product ID
        prefix = 'men' if gender == 'men' else ('wom' if gender == 'women' else ('kid' if gender == 'kids' else 'liv'))
        existing_count = Product.objects.filter(id__startswith=prefix).count()
        new_id = f"{prefix}-{str(existing_count + 1).zfill(3)}"
        while Product.objects.filter(id=new_id).exists():
            existing_count += 1
            new_id = f"{prefix}-{str(existing_count + 1).zfill(3)}"

        images = data.get('images', [])
        if isinstance(images, str):
            images = [images.strip()]
        if not images:
            images = ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop']

        sizes = data.get('sizes', ['38', '40', '42'])
        if isinstance(sizes, str):
            sizes = [s.strip() for s in sizes.split(',') if s.strip()]

        colors = data.get('colors', [{'name': 'Classic', 'hex': '#242522'}])
        tags = data.get('tags', [category.slug, gender])
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(',') if t.strip()]

        product = Product.objects.create(
            id=new_id,
            name=name,
            subtitle=data.get('subtitle', ''),
            description=data.get('description', f"Artisanal {name} crafted for enduring quiet luxury."),
            category=category,
            category_name=category.name if category else 'Catalogue',
            gender=gender,
            price=Decimal(str(price)),
            original_price=Decimal(str(data.get('originalPrice') or data.get('original_price') or price)),
            stock_quantity=int(data.get('stockQuantity', 50)),
            in_stock=bool(data.get('inStock', True)),
            images=images,
            primary_image=images[0],
            materials=data.get('materials', '100% Pure Natural Fiber'),
            sizes=sizes,
            colors=colors if isinstance(colors, list) else [{'name': 'Classic', 'hex': '#242522'}],
            tags=tags,
            is_active=True,
            badge=data.get('badge', 'New Arrival'),
        )

        return Response({
            'success': True,
            'message': f"Product '{product.name}' created with ID {product.id}.",
            'product': ProductSerializer(product).data,
        }, status=status.HTTP_201_CREATED)


class AdminProductDetailManageView(APIView):
    """
    Admin Product Details: Edit or Delete Product.
    """
    permission_classes = [IsDesignatedAdmin]

    def put(self, request, product_id):
        return self.patch(request, product_id)

    def patch(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'success': False, 'error': f'Product {product_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'name' in data and data['name'].strip():
            product.name = data['name'].strip()
        if 'price' in data:
            product.price = Decimal(str(data['price']))
        if 'originalPrice' in data and data['originalPrice']:
            product.original_price = Decimal(str(data['originalPrice']))
        if 'stockQuantity' in data:
            product.stock_quantity = int(data['stockQuantity'])
            product.in_stock = product.stock_quantity > 0
        if 'inStock' in data:
            product.in_stock = bool(data['inStock'])
        if 'materials' in data:
            product.materials = data['materials']
        if 'description' in data:
            product.description = data['description']
        if 'badge' in data:
            product.badge = data['badge']
        if 'isActive' in data:
            product.is_active = bool(data['isActive'])

        product.save()

        return Response({
            'success': True,
            'message': f"Product {product.id} updated successfully.",
            'product': ProductSerializer(product).data,
        }, status=status.HTTP_200_OK)

    def delete(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'success': False, 'error': f'Product {product_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

        prod_name = product.name
        # Soft delete: mark inactive
        product.is_active = False
        product.save(update_fields=['is_active'])

        return Response({
            'success': True,
            'message': f"Product '{prod_name}' ({product_id}) removed from active catalogue.",
        }, status=status.HTTP_200_OK)
