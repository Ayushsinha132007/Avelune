export type Gender = 'all' | 'men' | 'women' | 'kids' | 'unisex';

export type CategoryType = 
  | 'Everyday Essentials'
  | 'Contemporary Living'
  | 'Modern Accessories'
  | 'The Signature Collection'
  | string;

export type ProductCategory = 
  | 'All Categories'
  | 'T-shirts and Tops'
  | 'Shirts'
  | 'Trousers and Jeans'
  | 'Dresses and Ethnic Wear'
  | 'Jackets and Outerwear'
  | 'Footwear'
  | 'Bags and Accessories'
  | 'Watches and Jewellery'
  | "Kids' Clothing"
  | "Kids' Accessories"
  | 'Contemporary Living'
  | 'Everyday Essentials';

export type MerchandisingCollection = 
  | 'all'
  | 'new-arrivals'
  | 'bestsellers'
  | 'everyday-essentials'
  | 'signature'
  | 'under-999'
  | 'premium-picks';

export type ProductBadge = 
  | 'Bestseller' 
  | 'Customer Favourite' 
  | 'New Arrival' 
  | 'Limited Edition'
  | 'Curated Pick'
  | 'Atelier Exclusive'
  | 'Under ₹999';

export type SortOption = 
  | 'recommended' 
  | 'price-asc' 
  | 'price-desc' 
  | 'newest' 
  | 'bestselling' 
  | 'rating';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  subCategory?: string;
  gender: 'men' | 'women' | 'kids' | 'unisex';
  price: number; // in INR
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: ProductBadge;
  images: string[];
  primaryImage?: string;
  stockQuantity?: number;
  description: string;
  details: string[];
  materials: string;
  dimensions?: string;
  inStock: boolean;
  sizes?: string[];
  colors?: ProductColor[];
  tags: string[];
  collections?: MerchandisingCollection[];
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  collectionSlug?: string;
}

export interface CategoryCardData {
  id: string;
  title: string;
  subtitle: string;
  itemCount: number;
  image: string;
  gridSpanDesktop?: string;
  tag: string;
  genderFilter?: Gender;
  categoryFilter?: string;
  collectionFilter?: MerchandisingCollection;
}

export interface CarouselCategoryItem {
  id: string;
  title: string;
  subtitle: string;
  itemCount: number;
  image: string;
  gender?: Gender;
  collection?: MerchandisingCollection;
  category?: string;
  tag: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  image?: string;
  type: 'cart' | 'wishlist' | 'info';
}

export interface ProductFilterState {
  gender: Gender;
  category: string;
  collection: MerchandisingCollection;
  priceRange: [number, number];
  sortBy: SortOption;
  onlyNewArrivals: boolean;
  onlyBestsellers: boolean;
  onlyInStock: boolean;
  searchQuery?: string;
}
