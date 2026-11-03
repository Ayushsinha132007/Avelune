import { Product, ProductFilterState } from '../types';

export const INITIAL_FILTER_STATE: ProductFilterState = {
  gender: 'all',
  category: 'All Categories',
  collection: 'all',
  priceRange: [0, 25000],
  sortBy: 'recommended',
  onlyNewArrivals: false,
  onlyBestsellers: false,
  onlyInStock: false,
};

export function filterAndSortProducts(
  products: Product[],
  filters: ProductFilterState
): Product[] {
  let result = [...products];

  // 1. Gender filter
  if (filters.gender && filters.gender !== 'all') {
    result = result.filter(
      (p) => p.gender === filters.gender || p.gender === 'unisex'
    );
  }

  // 2. Category filter
  if (filters.category && filters.category !== 'All Categories') {
    const targetCat = filters.category.toLowerCase().trim();
    result = result.filter((p) => {
      const pCat = p.category.toLowerCase();
      const pSub = p.subCategory?.toLowerCase() || '';
      return pCat === targetCat || pSub === targetCat || pCat.includes(targetCat) || targetCat.includes(pCat);
    });
  }

  // 3. Merchandising collection filter
  if (filters.collection && filters.collection !== 'all') {
    result = result.filter((p) => {
      if (filters.collection === 'under-999') {
        return (
          p.price <= 999 ||
          p.collections?.includes('under-999') ||
          p.badge === 'Under ₹999'
        );
      }
      if (filters.collection === 'new-arrivals') {
        return (
          p.isNewArrival ||
          p.badge === 'New Arrival' ||
          p.collections?.includes('new-arrivals')
        );
      }
      if (filters.collection === 'bestsellers') {
        return (
          p.isBestseller ||
          p.badge === 'Bestseller' ||
          p.collections?.includes('bestsellers')
        );
      }
      if (filters.collection === 'everyday-essentials') {
        return (
          p.collections?.includes('everyday-essentials') ||
          p.category === 'Everyday Essentials'
        );
      }
      if (filters.collection === 'signature') {
        return (
          p.collections?.includes('signature') ||
          p.category === 'The Signature Collection'
        );
      }
      if (filters.collection === 'premium-picks') {
        return (
          p.collections?.includes('premium-picks') ||
          p.price >= 5000
        );
      }
      return p.collections?.includes(filters.collection);
    });
  }

  // 4. Price range filter
  if (filters.priceRange) {
    const [minPrice, maxPrice] = filters.priceRange;
    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);
  }

  // 5. In stock only
  if (filters.onlyInStock) {
    result = result.filter((p) => p.inStock);
  }

  // 6. New arrivals toggle
  if (filters.onlyNewArrivals) {
    result = result.filter(
      (p) =>
        p.isNewArrival ||
        p.badge === 'New Arrival' ||
        p.collections?.includes('new-arrivals')
    );
  }

  // 7. Bestsellers toggle
  if (filters.onlyBestsellers) {
    result = result.filter(
      (p) =>
        p.isBestseller ||
        p.badge === 'Bestseller' ||
        p.collections?.includes('bestsellers')
    );
  }

  // 8. Search query filter
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const query = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.subtitle.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        (p.materials && p.materials.toLowerCase().includes(query))
    );
  }

  // 9. Sorting
  switch (filters.sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      result.sort(
        (a, b) =>
          (b.isNewArrival || b.badge === 'New Arrival' ? 1 : 0) -
          (a.isNewArrival || a.badge === 'New Arrival' ? 1 : 0)
      );
      break;
    case 'bestselling':
      result.sort(
        (a, b) =>
          (b.isBestseller || b.badge === 'Bestseller' ? 1 : 0) -
          (a.isBestseller || a.badge === 'Bestseller' ? 1 : 0)
      );
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'recommended':
    default:
      result.sort((a, b) => {
        const aScore =
          (a.isFeatured ? 2 : 0) + (a.isBestseller ? 1 : 0) + a.rating / 10;
        const bScore =
          (b.isFeatured ? 2 : 0) + (b.isBestseller ? 1 : 0) + b.rating / 10;
        return bScore - aScore;
      });
      break;
  }

  return result;
}

