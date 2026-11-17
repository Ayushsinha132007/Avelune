import { Product } from './index';

export interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingDispatchCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  totalUsers: number;
  totalProducts: number;
  lowStockCount: number;
}

export interface AdminRecentOrder {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderStatus: string;
  paymentStatus: string;
  finalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface AdminOverviewResponse {
  success: boolean;
  metrics: AdminMetrics;
  recentOrders: AdminRecentOrder[];
}

export interface AdminUserSummary {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  city: string;
  state: string;
  dateJoined: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  membershipTier: string;
}

export interface AdminOrderItem {
  id: number;
  productId: string;
  productName: string;
  image: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AdminOrder {
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | string;
  createdAt: string;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  deliveryCharges: number;
  taxAmount?: number;
  finalAmount: number;
  shippingAddress: {
    name?: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  logistics: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
  paymentDetails: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status?: string;
  };
  items: AdminOrderItem[];
}

export interface AdminUserDetail {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    dateJoined: string;
    lastLogin: string | null;
    phone: string;
    membershipTier: string;
    primaryAddress: {
      street: string;
      apartment: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  orderMetrics: {
    totalOrders: number;
    totalSpent: number;
    pendingDispatch: number;
  };
  orders: AdminOrder[];
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  targetAudience: string;
}

export interface AdminProductPayload {
  name: string;
  subtitle?: string;
  description?: string;
  categoryId?: number | string;
  category_id?: number | string;
  gender: 'men' | 'women' | 'kids' | 'living';
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  inStock?: boolean;
  images: string[];
  materials?: string;
  sizes?: string[];
  badge?: string;
  isActive?: boolean;
}
