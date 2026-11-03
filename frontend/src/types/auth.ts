import { Product } from './index';

export interface DemoUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  membershipTier: string;
  memberSince: string;
  avatarInitials: string;
  phone?: string;
  preferredCity?: string;
}

export interface AuthState {
  user: DemoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DemoOrderItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  selectedSize?: string;
  selectedColor?: string;
  price: number;
}

export interface DemoOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: 'In Transit' | 'Delivered' | 'Atelier Preparing' | 'Processing';
  totalAmount: number;
  items: DemoOrderItem[];
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    state: string;
  };
  isDemoRecord: true;
}
