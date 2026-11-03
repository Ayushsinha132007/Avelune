import { Product, ProductFilterState } from '../types';
import { MOCK_PRODUCTS } from '../data/products';
import { filterAndSortProducts } from '../utils/filterProducts';

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const AUTH_TOKEN_KEY = 'avelune_auth_token_v1';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (err) {
    console.warn('Unable to persist auth token', err);
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMsg =
      data?.error ||
      data?.detail ||
      (typeof data === 'string' ? data : `Request failed with status ${response.status}`);
    throw new Error(errorMsg);
  }

  return data as T;
}

export const catalogApi = {
  /**
   * Fetch products with optional filtering and sorting
   */
  async getProducts(filters?: Partial<ProductFilterState>): Promise<Product[]> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.gender && filters.gender !== 'all') params.set('gender', filters.gender);
      if (filters.category && filters.category !== 'All Categories') params.set('category', filters.category);
      if (filters.collection && filters.collection !== 'all') params.set('collection', filters.collection);
      if (filters.priceRange) {
        if (filters.priceRange[0] > 0) params.set('minPrice', String(filters.priceRange[0]));
        if (filters.priceRange[1] < 25000) params.set('maxPrice', String(filters.priceRange[1]));
      }
      if (filters.sortBy && filters.sortBy !== 'recommended') params.set('sort', filters.sortBy);
      if (filters.searchQuery) params.set('search', filters.searchQuery);
      if (filters.onlyInStock) params.set('in_stock', 'true');
    }

    const query = params.toString() ? `?${params.toString()}` : '';

    try {
      const data = await apiRequest<Product[]>(`/products/${query}`);
      if (Array.isArray(data)) {
        return data;
      }
      return (data as any)?.results || [];
    } catch (err) {
      console.warn('[catalogApi] Django backend offline, falling back to local dataset:', err);
      if (filters) {
        return filterAndSortProducts(MOCK_PRODUCTS, {
          gender: filters.gender || 'all',
          category: filters.category || 'All Categories',
          collection: filters.collection || 'all',
          priceRange: filters.priceRange || [0, 25000],
          sortBy: filters.sortBy || 'recommended',
          onlyNewArrivals: Boolean(filters.onlyNewArrivals),
          onlyBestsellers: Boolean(filters.onlyBestsellers),
          onlyInStock: Boolean(filters.onlyInStock),
          searchQuery: filters.searchQuery || '',
        });
      }
      return MOCK_PRODUCTS;
    }
  },

  /**
   * Fetch single product by ID or slug
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      return await apiRequest<Product>(`/products/${encodeURIComponent(id)}/`);
    } catch (err) {
      console.warn(`[catalogApi] Fetch for product ${id} failed, checking local data:`, err);
      return MOCK_PRODUCTS.find((p) => p.id === id || p.collectionSlug === id) || null;
    }
  },

  /**
   * Fetch active categories
   */
  async getCategories(): Promise<any[]> {
    try {
      return await apiRequest<any[]>('/categories/');
    } catch (err) {
      console.warn('[catalogApi] Failed to fetch categories from backend:', err);
      return [];
    }
  },

  /**
   * Fetch specific collection drop (new-arrivals, bestsellers, under-999, featured)
   */
  async getCollection(collectionType: string): Promise<Product[]> {
    try {
      return await apiRequest<Product[]>(`/collections/${encodeURIComponent(collectionType)}/`);
    } catch {
      return MOCK_PRODUCTS.filter((p) => {
        if (collectionType === 'new-arrivals') return p.isNewArrival;
        if (collectionType === 'bestsellers') return p.isBestseller;
        if (collectionType === 'under-999') return p.price <= 999;
        if (collectionType === 'featured') return p.isFeatured;
        return p.collections?.includes(collectionType as any);
      });
    }
  },
};

export const cartApi = {
  async getCart(): Promise<any> {
    try {
      return await apiRequest('/cart/');
    } catch (err) {
      console.warn('[cartApi] Failed to fetch cart from Django, using local state:', err);
      return null;
    }
  },

  async addItem(productId: string, quantity = 1, selectedSize?: string, selectedColor?: string): Promise<any> {
    try {
      return await apiRequest('/cart/items/', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, selectedSize, selectedColor }),
      });
    } catch (err) {
      console.warn('[cartApi] Add item backend sync failed:', err);
      return null;
    }
  },

  async updateItem(itemId: number, quantity: number): Promise<any> {
    try {
      return await apiRequest(`/cart/items/${itemId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
    } catch (err) {
      console.warn('[cartApi] Update item backend sync failed:', err);
      return null;
    }
  },

  async removeItem(itemId: number): Promise<any> {
    try {
      return await apiRequest(`/cart/items/${itemId}/`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[cartApi] Remove item backend sync failed:', err);
      return null;
    }
  },

  async clearCart(): Promise<any> {
    try {
      return await apiRequest('/cart/', { method: 'DELETE' });
    } catch (err) {
      console.warn('[cartApi] Clear cart backend sync failed:', err);
      return null;
    }
  },
};

export const wishlistApi = {
  async getWishlist(): Promise<any> {
    try {
      return await apiRequest('/wishlist/');
    } catch (err) {
      console.warn('[wishlistApi] Failed to fetch wishlist from Django:', err);
      return null;
    }
  },

  async addItem(productId: string): Promise<any> {
    try {
      return await apiRequest('/wishlist/items/', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
    } catch (err) {
      console.warn('[wishlistApi] Add wishlist item failed:', err);
      return null;
    }
  },

  async removeItem(productId: string): Promise<any> {
    try {
      return await apiRequest(`/wishlist/items/${encodeURIComponent(productId)}/`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('[wishlistApi] Remove wishlist item failed:', err);
      return null;
    }
  },
};

export const promotionsApi = {
  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message?: string; error?: string }> {
    try {
      const data = await apiRequest<any>('/coupons/validate/', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      });
      return data;
    } catch (err: any) {
      return { valid: false, discount: 0, error: err.message };
    }
  },

  async getOffers(): Promise<any[]> {
    try {
      return await apiRequest('/offers/');
    } catch {
      return [];
    }
  },
};

export const ordersApi = {
  async createOrder(payload: any): Promise<any> {
    return await apiRequest('/orders/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getOrderHistory(email?: string): Promise<any[]> {
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      return await apiRequest(`/orders/${q}`);
    } catch {
      return [];
    }
  },

  async getOrder(orderId: string): Promise<any> {
    return await apiRequest(`/orders/${encodeURIComponent(orderId)}/`);
  },

  async cancelOrder(orderNumber: string): Promise<any> {
    return await apiRequest(`/orders/${encodeURIComponent(orderNumber)}/cancel/`, {
      method: 'POST',
    });
  },
};

export const recommendationsApi = {
  async getRecommendations(payload: {
    occasion?: string;
    gender?: string;
    minBudget?: number;
    maxBudget?: number;
    styles?: string[];
    preferredCategories?: string[];
    preferredColours?: string[];
    relaxBudget?: boolean;
    relaxCategory?: boolean;
    message?: string;
  }): Promise<any> {
    try {
      return await apiRequest('/recommendations/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('[recommendationsApi] Backend recommendations call failed:', err);
      return null;
    }
  },
};
