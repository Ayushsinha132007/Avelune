import { CartItem, Product } from './index';

export interface CheckoutAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderPayload {
  items: {
    productId: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }[];
  deliveryAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  couponCode?: string;
  userId?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  internalOrderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number; // in Paise
  currency: string;
  keyId: string;
  summary: {
    subtotal: number;
    discount: number;
    couponCode?: string;
    deliveryFee: number;
    tax: number;
    totalAmount: number;
    amountInPaise: number;
    currency: string;
  };
  customer: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface RazorpaySuccessHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentPayload {
  internalOrderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ServerOrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image?: string;
  totalPrice: number;
}

export interface ServerOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  status:
    | 'PENDING_PAYMENT'
    | 'PAYMENT_PROCESSING'
    | 'PAID'
    | 'PAYMENT_FAILED'
    | 'CANCELLED'
    | 'REFUND_PENDING'
    | 'REFUNDED';
  items: ServerOrderItem[];
  deliveryAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  summary: {
    subtotal: number;
    discount: number;
    couponCode?: string;
    deliveryFee: number;
    tax: number;
    totalAmount: number;
    amountInPaise: number;
    currency: string;
  };
  payment: {
    gateway: 'razorpay';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: string;
    paidAt?: string;
    failureReason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  alreadyPaid?: boolean;
  order: ServerOrder;
  error?: string;
}

