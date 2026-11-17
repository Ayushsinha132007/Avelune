import { Product } from './index';

export type OccasionType =
  | 'Wedding'
  | 'Party'
  | 'Office'
  | 'Everyday Wear'
  | 'Vacation / Travel'
  | 'Festive Occasion'
  | 'Date Night'
  | 'Gifting'
  | 'Sports / Activewear'
  | 'Something Else'
  | string;

export type ShoppingForGender = 'men' | 'women' | 'kids' | 'anyone';

export type AgeGroup =
  | '0–2 years'
  | '3–5 years'
  | '6–8 years'
  | '9–12 years'
  | '13+ years';

export type StylePreference =
  | 'Minimal'
  | 'Classic'
  | 'Contemporary'
  | 'Trendy'
  | 'Ethnic'
  | 'Streetwear'
  | 'Sporty'
  | 'Elegant'
  | 'Casual'
  | 'Premium Essentials'
  | string;

export interface ShoppingPreferences {
  occasion: string;
  gender: ShoppingForGender;
  ageGroup?: AgeGroup;
  minBudget: number;
  maxBudget: number;
  styles: string[];
  preferredCategories?: string[];
  preferredColours?: string[];
  productTypes?: string[];
}

export interface RecommendationItem {
  product: Product;
  score: number;
  matchingReasons: string[];
  primaryReason: string;
}

export interface CuratedRecommendations {
  bestMatches: RecommendationItem[];
  withinBudget: RecommendationItem[];
  similarStyles: RecommendationItem[];
  completeTheLook?: RecommendationItem[];
  totalFound: number;
  summaryCopy: string;
  message?: string;
  summary?: string;
  isRelaxedFilter?: boolean;
}

export type ConversationStep =
  | 'welcome'
  | 'occasion'
  | 'gender'
  | 'kids_age'
  | 'budget'
  | 'styles'
  | 'optional_preferences'
  | 'recommendations';

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  step?: ConversationStep;
  recommendations?: CuratedRecommendations;
}

