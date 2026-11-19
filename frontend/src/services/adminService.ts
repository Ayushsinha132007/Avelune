import { apiRequest, setAuthToken } from './api';
import {
  AdminOverviewResponse,
  AdminUserSummary,
  AdminUserDetail,
  AdminOrder,
  AdminCategory,
  AdminProductPayload,
} from '../types/admin';
import { Product } from '../types';

export const ADMIN_DESIGNATED_EMAIL = 'ayushsinha53467@gmail.com';

export const adminService = {
  /**
   * One-click direct authentication for ayushsinha53467@gmail.com (No OTP)
   */
  async directLogin(email: string = ADMIN_DESIGNATED_EMAIL): Promise<{
    success: boolean;
    token?: string;
    user?: any;
    error?: string;
  }> {
    try {
      const data = await apiRequest<{
        success: boolean;
        token: string;
        user: any;
        message?: string;
        error?: string;
      }>('/admin-suite/auth/direct-login/', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (data.token) {
        setAuthToken(data.token);
      }

      return {
        success: true,
        token: data.token,
        user: data.user,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Direct admin login failed. Only designated email authorized.',
      };
    }
  },

  /**
   * Fetch live atelier metrics & recent orders
   */
  async getOverview(): Promise<AdminOverviewResponse> {
    return await apiRequest<AdminOverviewResponse>('/admin-suite/overview/', {
      method: 'GET',
    });
  },

  /**
   * Fetch all registered clients
   */
  async getUsers(searchQuery: string = ''): Promise<{
    success: boolean;
    totalUsers: number;
    users: AdminUserSummary[];
  }> {
    const qParam = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
    return await apiRequest<{
      success: boolean;
      totalUsers: number;
      users: AdminUserSummary[];
    }>(`/admin-suite/users/${qParam}`, {
      method: 'GET',
    });
  },

  /**
   * Fetch full user dossier with complete order history, payment status, & shipping address
   */
  async getUserDetail(userId: number): Promise<AdminUserDetail> {
    return await apiRequest<AdminUserDetail>(`/admin-suite/users/${userId}/`, {
      method: 'GET',
    });
  },

  /**
   * Fetch all orders with optional status, payment, and search filters
   */
  async getOrders(params?: {
    status?: string;
    payment_status?: string;
    q?: string;
  }): Promise<{
    success: boolean;
    totalOrders: number;
    orders: AdminOrder[];
  }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.payment_status && params.payment_status !== 'all')
      query.append('payment_status', params.payment_status);
    if (params?.q) query.append('q', params.q);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiRequest<{
      success: boolean;
      totalOrders: number;
      orders: AdminOrder[];
    }>(`/admin-suite/orders/${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * Update order status, payment status, tracking number, carrier
   */
  async updateOrderStatus(
    orderNumber: string,
    updates: {
      order_status?: string;
      payment_status?: string;
      carrier?: string;
      tracking_number?: string;
      estimated_delivery?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    order: any;
  }> {
    return await apiRequest<{
      success: boolean;
      message: string;
      order: any;
    }>(`/admin-suite/orders/${orderNumber}/status/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Fetch products catalogue & category options for admin management
   */
  async getProducts(params?: {
    q?: string;
    gender?: string;
    category?: string;
  }): Promise<{
    success: boolean;
    total: number;
    products: Product[];
    categories: AdminCategory[];
  }> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.gender && params.gender !== 'all') query.append('gender', params.gender);
    if (params?.category && params.category !== 'all') query.append('category', params.category);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiRequest<{
      success: boolean;
      total: number;
      products: Product[];
      categories: AdminCategory[];
    }>(`/admin-suite/products/${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * Add a new product to catalogue
   */
  async createProduct(payload: AdminProductPayload): Promise<{
    success: boolean;
    message: string;
    product: Product;
  }> {
    return await apiRequest<{
      success: boolean;
      message: string;
      product: Product;
    }>('/admin-suite/products/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update existing product details, price, or stock
   */
  async updateProduct(
    productId: string,
    updates: Partial<AdminProductPayload>
  ): Promise<{
    success: boolean;
    message: string;
    product: Product;
  }> {
    return await apiRequest<{
      success: boolean;
      message: string;
      product: Product;
    }>(`/admin-suite/products/${productId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Remove/deactivate product from catalogue
   */
  async deleteProduct(productId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return await apiRequest<{
      success: boolean;
      message: string;
    }>(`/admin-suite/products/${productId}/`, {
      method: 'DELETE',
    });
  },
};

