import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/products';
import {
  ShoppingPreferences,
  CuratedRecommendations,
} from '../types/shoppingAssistant';
import { recommendationsApi } from './api';

// Category classifications
const APPAREL_CATEGORIES = new Set([
  'Shirts',
  'T-shirts and Tops',
  'Trousers and Jeans',
  'Jackets and Outerwear',
  'Dresses and Ethnic Wear',
  "Kids' Clothing",
]);

const ACCESSORY_CATEGORIES = new Set([
  'Bags and Accessories',
  'Handbags and Accessories',
  'Watches and Jewellery',
  'Jewellery and Accessories',
  "Kids' Accessories",
]);

const LIVING_CATEGORIES = new Set(['Contemporary Living']);

export const productRecommendationService = {
  /**
   * Deterministic local recommendation generator (offline fallback)
   * Strictly enforces hard constraints (Gender, Budget, Category, Occasion).
   */
  getRecommendations(
    preferences: ShoppingPreferences,
    options?: { relaxBudget?: boolean; relaxCategory?: boolean; userMessage?: string }
  ): CuratedRecommendations {
    const minBudget = preferences.minBudget || 0;
    const maxBudget = preferences.maxBudget || 25000;
    const reqGender = (preferences.gender || 'anyone').toLowerCase().trim();
    const occasion = (preferences.occasion || '').toLowerCase().trim();
    const userMsg = (options?.userMessage || '').toLowerCase();

    const isBagRequested = ['bag', 'bags', 'duffel', 'tote', 'handbag', 'wallet'].some((w) => userMsg.includes(w));
    const isAccessoryRequested = isBagRequested || ['accessory', 'accessories', 'watch', 'jewellery'].some((w) => userMsg.includes(w));

    const prefCat = (preferences.preferredCategories && preferences.preferredCategories[0]) || '';
    const reqShirt = prefCat === 'Shirts' || /\b(shirts?|button-downs?)\b/i.test(userMsg);
    const reqTee = prefCat === 'T-shirts and Tops' || /\b(t-shirts?|tshirts?|tees?)\b/i.test(userMsg);
    const reqTrouser = prefCat === 'Trousers and Jeans' || /\b(trousers?|pants?|jeans|denim)\b/i.test(userMsg);
    const reqJacket = prefCat === 'Jackets and Outerwear' || /\b(jackets?|coats?|blazers?|outerwear)\b/i.test(userMsg);
    const reqDress = prefCat === 'Dresses and Ethnic Wear' || /\b(dresses?|gowns?|kurtas?|slips?)\b/i.test(userMsg);
    const reqFootwear = prefCat === 'Footwear' || /\b(shoes?|sneakers?|derby|footwear)\b/i.test(userMsg);

    // 1. Strict Hard Filtering
    const eligibleProducts = MOCK_PRODUCTS.filter((product) => {
      if (!product.inStock) return false;

      // Strict Product Type isolation (NEVER mix product types)
      if (reqShirt && product.category !== 'Shirts') return false;
      if (reqTee && product.category !== 'T-shirts and Tops') return false;
      if (reqTrouser && product.category !== 'Trousers and Jeans') return false;
      if (reqJacket && product.category !== 'Jackets and Outerwear') return false;
      if (reqDress && product.category !== 'Dresses and Ethnic Wear') return false;
      if (reqFootwear && product.category !== 'Footwear') return false;

      // Strict Gender / Target Audience Filter
      const prodGender = product.gender.toLowerCase();
      if (reqGender === 'men' && prodGender !== 'men') return false;
      if (reqGender === 'women' && prodGender !== 'women') return false;
      if (reqGender === 'kids' && prodGender !== 'kids') return false;

      // Exclude living / homeware
      if (LIVING_CATEGORIES.has(product.category)) return false;

      // Exclude accessories / bags unless explicitly requested
      if (ACCESSORY_CATEGORIES.has(product.category) && !isAccessoryRequested) {
        return false;
      }

      // Hard Budget Constraint
      if (product.price < minBudget || product.price > maxBudget) {
        return false;
      }

      // Occasion Filtering
      const prodTags = new Set((product.tags || []).map((t) => t.toLowerCase()));
      const prodDesc = product.description.toLowerCase();
      if (occasion === 'party') {
        const hasPartyAffinity =
          ['party', 'evening', 'formal', 'silk', 'festive', 'cocktail', 'sateen', 'jacquard', 'tailored', 'blazer', 'derby'].some(
            (t) => prodTags.has(t) || prodDesc.includes(t)
          ) || product.category === 'Dresses and Ethnic Wear';
        const isDisqualified = ['pajamas', 'sleepwear', 'basics', 'socks'].some((t) => prodTags.has(t));
        if (!hasPartyAffinity || isDisqualified) return false;
      } else if (occasion === 'office') {
        const hasOfficeAffinity =
          ['workwear', 'formal', 'oxford', 'shirt', 'tailored', 'pleated', 'trousers', 'derby', 'blazer'].some(
            (t) => prodTags.has(t) || prodDesc.includes(t)
          );
        if (!hasOfficeAffinity) return false;
      }

      return true;
    });

    // 2. Handle Zero Matches
    if (eligibleProducts.length === 0) {
      const genderLabel = reqGender === 'men' ? "men's" : reqGender === 'women' ? "women's" : reqGender === 'kids' ? "kids'" : "";
      const occLabel = occasion ? `${occasion}` : "apparel";
      const msg = `No ${genderLabel} ${occLabel} products are currently available under ₹${maxBudget.toLocaleString('en-IN')}. Consider increasing your budget or adjusting your filters.`;

      return {
        bestMatches: [],
        withinBudget: [],
        similarStyles: [],
        completeTheLook: [],
        totalFound: 0,
        summaryCopy: msg,
        isRelaxedFilter: false,
      };
    }

    // 3. Score and Rank Eligible Items
    const scored = eligibleProducts.map((prod) => {
      let score = 10;
      const reasons: string[] = [];

      if (occasion) {
        reasons.push(`Curated for ${preferences.occasion}`);
      }

      if (preferences.styles && preferences.styles.length > 0) {
        reasons.push(`Matches your ${preferences.styles[0]} aesthetic`);
        score += 3;
      }

      if (prod.isBestseller) score += 1;
      if (prod.isNewArrival) score += 1;

      return {
        product: prod,
        score,
        matchingReasons: reasons,
        primaryReason: reasons[0] || `Verified ${prod.gender} recommendation`,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    const bestMatches = scored.slice(0, 6);
    const withinBudget: typeof bestMatches = [];

    const genderDisplay = reqGender === 'men' ? "men's" : reqGender === 'women' ? "women's" : "curated";
    const itemNoun = reqShirt ? 'shirts' : reqTrouser ? 'trousers' : reqJacket ? 'jackets' : reqTee ? 't-shirts' : (occasion ? `${occasion} options` : 'options');
    const summaryCopy = `I found ${bestMatches.length} ${genderDisplay} ${itemNoun} under ₹${maxBudget.toLocaleString('en-IN')}. Here are the closest matches.`;

    return {
      bestMatches,
      withinBudget,
      similarStyles: [],
      completeTheLook: [],
      totalFound: scored.length,
      summaryCopy,
      isRelaxedFilter: false,
    };
  },

  /**
   * Async recommendation generator connecting to Django REST API
   * with seamless fallback to deterministic local engine
   */
  async getRecommendationsAsync(
    preferences: ShoppingPreferences,
    options?: { relaxBudget?: boolean; relaxCategory?: boolean; userMessage?: string }
  ): Promise<CuratedRecommendations> {
    try {
      const backendRes = await recommendationsApi.getRecommendations({
        occasion: preferences.occasion,
        gender: preferences.gender,
        minBudget: preferences.minBudget,
        maxBudget: preferences.maxBudget,
        styles: preferences.styles,
        preferredCategories: preferences.preferredCategories,
        preferredColours: preferences.preferredColours,
        relaxBudget: options?.relaxBudget,
        relaxCategory: options?.relaxCategory,
        message: options?.userMessage,
      });

      if (backendRes && typeof backendRes === 'object' && 'bestMatches' in backendRes) {
        return backendRes as CuratedRecommendations;
      }
    } catch (err) {
      console.warn('Backend recommendation error, using deterministic local engine:', err);
    }

    // Deterministic fallback
    return this.getRecommendations(preferences, options);
  },
};
