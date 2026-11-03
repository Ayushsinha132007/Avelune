import { DemoUser, DemoOrder } from '../types/auth';
import { MOCK_PRODUCTS } from '../data/products';

/**
 * =========================================================================
 * AVELUNE Centralized Demo Authentication Configuration
 * 
 * NOTE: This configuration is for development and client-side demonstration only.
 * In production, this service will be replaced with real backend OAuth/JWT endpoints.
 * Never use these demo credentials in production environments.
 * =========================================================================
 */
export const DEMO_CREDENTIALS = {
  EMAIL: 'demo@avelune.com',
  PASSWORD: 'Avelune@123',
  USER_PROFILE: {
    id: 'usr_demo_ayush_2026',
    firstName: 'Ayush',
    lastName: '',
    fullName: 'Ayush',
    email: 'demo@avelune.com',
    membershipTier: 'Atelier Private Client',
    memberSince: 'October 2026',
    avatarInitials: 'A',
    phone: '+91 98765 43210',
    preferredCity: 'Mumbai, India',
  } as DemoUser,
};

const DEMO_SESSION_KEY = 'avelune_demo_session_v1';

export const demoAuthService = {
  /**
   * Check if there is an existing persisted demo session
   */
  getPersistedSession(): DemoUser | null {
    try {
      const raw = localStorage.getItem(DEMO_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Ensure user has valid structure
      if (parsed && parsed.email) {
        return parsed as DemoUser;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Validate demo login credentials
   */
  async login(email: string, password: string): Promise<{ success: boolean; user?: DemoUser; error?: string }> {
    // Simulate luxury network delay (700ms)
    await new Promise((resolve) => setTimeout(resolve, 700));

    const normalizedEmail = email.trim().toLowerCase();

    // Check credentials against centralized configuration
    if (
      normalizedEmail === DEMO_CREDENTIALS.EMAIL.toLowerCase() &&
      password === DEMO_CREDENTIALS.PASSWORD
    ) {
      const user = { ...DEMO_CREDENTIALS.USER_PROFILE };
      
      // Persist only non-sensitive demo user information (no password)
      try {
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
      } catch (err) {
        console.warn('Unable to persist demo session', err);
      }

      return {
        success: true,
        user,
      };
    }

    // Invalid credentials
    return {
      success: false,
      error: 'Invalid email or password. Please try again.',
    };
  },

  /**
   * Logout and clear demo session
   */
  logout(): void {
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
    } catch (err) {
      console.warn('Unable to remove demo session', err);
    }
  },

  /**
   * Update demo user profile locally
   */
  updateProfile(updates: Partial<DemoUser>): DemoUser {
    const current = this.getPersistedSession() || DEMO_CREDENTIALS.USER_PROFILE;
    const updatedUser: DemoUser = {
      ...current,
      ...updates,
      avatarInitials: (updates.firstName ? updates.firstName[0] : current.firstName[0]).toUpperCase(),
    };

    try {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(updatedUser));
    } catch (err) {
      console.warn('Unable to save profile update', err);
    }

    return updatedUser;
  },

  /**
   * Realistic Local Demo Orders
   */
  getDemoOrders(): DemoOrder[] {
    const trenchProduct = MOCK_PRODUCTS.find((p) => p.name.includes('Trench')) || MOCK_PRODUCTS[0];
    const linenProduct = MOCK_PRODUCTS.find((p) => p.name.includes('Linen')) || MOCK_PRODUCTS[1];
    const woolProduct = MOCK_PRODUCTS.find((p) => p.name.includes('Merino') || p.name.includes('Wool')) || MOCK_PRODUCTS[2];

    return [
      {
        id: 'ord-8941',
        orderNumber: 'AVL-2026-8941',
        date: '28 Oct 2026',
        status: 'In Transit',
        totalAmount: (trenchProduct.price || 18400) + (linenProduct.price || 3450),
        carrier: 'Blue Dart Luxury Express',
        trackingNumber: 'BD-IND-8829104',
        estimatedDelivery: '02 Nov 2026',
        shippingAddress: {
          name: 'Ayush',
          street: 'Apartment 14B, Altamount Road',
          city: 'Mumbai',
          postalCode: '400026',
          state: 'Maharashtra',
        },
        items: [
          {
            product: trenchProduct,
            quantity: 1,
            size: 'M',
            color: 'Warm Khaki',
            price: trenchProduct.price,
          },
          {
            product: linenProduct,
            quantity: 1,
            size: 'L',
            color: 'Warm Ivory',
            price: linenProduct.price,
          },
        ],
        isDemoRecord: true,
      },
      {
        id: 'ord-7203',
        orderNumber: 'AVL-2026-7203',
        date: '14 Oct 2026',
        status: 'Delivered',
        totalAmount: woolProduct.price || 4800,
        carrier: 'Blue Dart Luxury Express',
        trackingNumber: 'BD-IND-7719203',
        estimatedDelivery: '17 Oct 2026',
        shippingAddress: {
          name: 'Ayush',
          street: 'Apartment 14B, Altamount Road',
          city: 'Mumbai',
          postalCode: '400026',
          state: 'Maharashtra',
        },
        items: [
          {
            product: woolProduct,
            quantity: 1,
            size: '32',
            color: 'Deep Charcoal',
            price: woolProduct.price,
          },
        ],
        isDemoRecord: true,
      },
    ];
  },
};

