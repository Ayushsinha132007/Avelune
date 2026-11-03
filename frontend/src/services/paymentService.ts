import {
  CreateOrderPayload,
  CreateOrderResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
  ServerOrder,
} from '../types/payment';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (import.meta as any).env?.VITE_API_URL ||
  'http://127.0.0.1:8000/api';

const LOCAL_ORDERS_CACHE_KEY = 'avelune_customer_orders_v1';

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const paymentService = {
  /**
   * Load the official Razorpay Checkout SDK dynamically
   */
  async loadRazorpayScript(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (window.Razorpay) return true;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay Checkout script.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  },

  /**
   * Create pending internal order & Razorpay order via Django backend
   */
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const res = await fetch(`${API_BASE_URL}/payments/create-order/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMsg =
        data.error ||
        (data.details && Array.isArray(data.details) ? data.details.join(', ') : 'Failed to create order.');
      throw new Error(errorMsg);
    }

    return data;
  },

  /**
   * Cryptographically verify payment signature on backend
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
    const res = await fetch(`${API_BASE_URL}/payments/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Payment signature verification failed.');
    }

    // Persist verified order in local client cache
    if (data.order) {
      this.cacheOrderLocally(data.order);
    }

    return data;
  },

  /**
   * Check order reconciliation status
   */
  async getOrderStatus(orderId: string): Promise<ServerOrder | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/status/${encodeURIComponent(orderId)}/`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.order || null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch specific order by ID or order number
   */
  async getOrderById(orderId: string): Promise<ServerOrder | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/`);
      if (!res.ok) {
        return this.getLocalCachedOrder(orderId);
      }
      const data = await res.json();
      return data.order || data || null;
    } catch {
      return this.getLocalCachedOrder(orderId);
    }
  },

  /**
   * Fetch orders for current customer
   */
  async getUserOrders(identifier: string): Promise<ServerOrder[]> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/orders/?email=${encodeURIComponent(identifier)}`
      );
      if (res.ok) {
        const data = await res.json();
        const orderList = Array.isArray(data) ? data : (data.orders || []);
        if (orderList.length > 0) {
          return orderList;
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, retrieving local order cache:', err);
    }

    return this.getLocalCachedOrders();
  },

  /**
   * Local storage fallback cache utilities
   */
  cacheOrderLocally(order: ServerOrder): void {
    try {
      const existing = this.getLocalCachedOrders();
      const filtered = existing.filter((o) => o.id !== order.id);
      localStorage.setItem(LOCAL_ORDERS_CACHE_KEY, JSON.stringify([order, ...filtered]));
    } catch (err) {
      console.warn('Unable to cache order locally', err);
    }
  },

  getLocalCachedOrders(): ServerOrder[] {
    try {
      const raw = localStorage.getItem(LOCAL_ORDERS_CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getLocalCachedOrder(orderId: string): ServerOrder | null {
    const list = this.getLocalCachedOrders();
    return list.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
  },
};
