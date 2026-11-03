"""
AVELUNE Atelier Recommendation Service
Strict Intent Matching & Professional Shopping Consultant Architecture.

Core Architectural Principles:
1. User input is the single source of truth.
2. Hard constraints (Gender, Category, Budget, Availability, Product Type) strictly exclude ineligible products.
3. Soft preferences (Style, Palette, Popularity) only rank eligible candidates.
4. Database-first: Never invents products, prices, or categories.
5. Accessories & homeware are never recommended unless explicitly requested.
6. Honest zero-match reporting when no product satisfies all hard constraints.
"""

from decimal import Decimal
from typing import Dict, Any, List, Optional, Tuple, Set
from django.db.models import Q
from apps.catalog.models import Product, Category
from apps.catalog.serializers import ProductSerializer

# Category Slug Classifications
APPAREL_CATEGORY_SLUGS: Set[str] = {
    'shirts',
    't-shirts-and-tops',
    'trousers-and-jeans',
    'jackets-and-outerwear',
    'dresses-and-ethnic-wear',
    'kids-clothing',
}

FOOTWEAR_CATEGORY_SLUGS: Set[str] = {
    'footwear',
}

ACCESSORY_CATEGORY_SLUGS: Set[str] = {
    'bags-and-accessories',
    'handbags-and-accessories',
    'watches-and-jewellery',
    'jewellery-and-accessories',
    'kids-accessories',
}

LIVING_CATEGORY_SLUGS: Set[str] = {
    'contemporary-living',
}

# Occasion Tag / Attribute Alignment Maps
OCCASION_COMPATIBILITY_RULES: Dict[str, Dict[str, Any]] = {
    'party': {
        'positive_tags': {
            'party', 'evening', 'formal', 'silk', 'festive', 'cocktail',
            'sateen', 'jacquard', 'tailored', 'blazer', 'derby', 'suit',
            'wrap-dress', 'slip', 'chanderi', 'kurta', 'wool'
        },
        'negative_tags': {
            'pajamas', 'sleepwear', 'sun-hat', 'backpack', 'tote', 'blanket',
            'candle', 'socks', 'basics', 'loungewear'
        },
        'allowed_categories': APPAREL_CATEGORY_SLUGS | FOOTWEAR_CATEGORY_SLUGS,
    },
    'office': {
        'positive_tags': {
            'workwear', 'formal', 'oxford', 'shirt', 'tailored', 'pleated',
            'trousers', 'derby', 'blazer', 'coat', 'trench', 'merino',
            'button-down', 'office', 'classic'
        },
        'negative_tags': {
            'party', 'evening', 'pajamas', 'sleepwear', 'sun-hat', 'backpack',
            'casual-tank', 'slip-dress', 'blanket', 'candle'
        },
        'allowed_categories': APPAREL_CATEGORY_SLUGS | FOOTWEAR_CATEGORY_SLUGS,
    },
    'casual': {
        'positive_tags': {
            'basics', 'cotton', 'everyday', 't-shirt', 'tank', 'jeans',
            'sneakers', 'linen', 'denim', 'casual', 'stripes', 'poplin',
            'summer', 'breathable', 'cardigan', 'knitwear'
        },
        'negative_tags': {
            'suit', 'tuxedo', 'bridal', 'sherwani'
        },
        'allowed_categories': APPAREL_CATEGORY_SLUGS | FOOTWEAR_CATEGORY_SLUGS,
    },
    'everyday wear': {
        'positive_tags': {
            'basics', 'cotton', 'everyday', 't-shirt', 'tank', 'jeans',
            'sneakers', 'linen', 'denim', 'casual', 'stripes', 'poplin',
            'summer', 'breathable', 'cardigan', 'knitwear'
        },
        'negative_tags': {
            'suit', 'tuxedo', 'bridal', 'sherwani'
        },
        'allowed_categories': APPAREL_CATEGORY_SLUGS | FOOTWEAR_CATEGORY_SLUGS,
    },
    'wedding': {
        'positive_tags': {
            'festive', 'chanderi', 'ethnic', 'silk', 'kurta', 'gold',
            'handloom', 'zari', 'wedding', 'formal', 'tailored', 'derby'
        },
        'negative_tags': {
            't-shirt', 'tank', 'jeans', 'denim', 'sneakers', 'pajamas',
            'sleepwear', 'sun-hat', 'basics'
        },
        'allowed_categories': APPAREL_CATEGORY_SLUGS | FOOTWEAR_CATEGORY_SLUGS,
    },
    'festive occasion': {
        'positive_tags': {
            'festive', 'chanderi', 'ethnic', 'silk', 'kurta', 'gold',
            'handloom', 'zari', 'wedding', 'formal', 'tailored'
        },
        'negative_tags': {
            't-shirt', 'tank', 'jeans', 'denim', 'sneakers', 'pajamas'
        },
        'allowed_categories': APPAREL_CATEGORY_SLUGS | FOOTWEAR_CATEGORY_SLUGS,
    },
    'sports / activewear': {
        'positive_tags': {
            'sneakers', 'cotton', 't-shirt', 'socks', 'active', 'sport',
            'running', 'breathable'
        },
        'negative_tags': {
            'silk', 'festive', 'chanderi', 'derby', 'trench', 'wool'
        },
        'allowed_categories': APPAREL_CATEGORY_SLUGS | FOOTWEAR_CATEGORY_SLUGS,
    },
    'vacation / travel': {
        'positive_tags': {
            'linen', 'summer', 'breathable', 'travel', 'sandals', 'poplin',
            'sun-hat', 'resort', 'casual', 'duffel'
        },
        'negative_tags': {
            'suit', 'formal-tuxedo', 'trousers-pleated-heavy'
        },
        'allowed_categories': APPAREL_CATEGORY_SLUGS | FOOTWEAR_CATEGORY_SLUGS | ACCESSORY_CATEGORY_SLUGS,
    },
}

STYLE_TAG_MAP: Dict[str, List[str]] = {
    'minimal': ['minimal', 'clean', 'basics', 'plain', 'neutral', 'monochrome'],
    'classic': ['classic', 'tailored', 'oxford', 'trench', 'derby', 'denim', 'heritage'],
    'contemporary': ['modern', 'architectural', 'sculptural', 'clean'],
    'trendy': ['new-arrival', 'oversized', 'wide-leg', 'drop'],
    'ethnic': ['ethnic', 'handloom', 'chanderi', 'kurta', 'zari', 'festive'],
    'streetwear': ['sneakers', 't-shirt', 'denim', 'selvedge'],
    'sporty': ['sneakers', 'socks', 'active'],
    'elegant': ['silk', 'cashmere', 'dress', 'gold', 'tailored', 'evening'],
    'casual': ['basics', 'linen', 't-shirt', 'jeans', 'sandals', 'tank'],
    'premium essentials': ['cashmere', 'merino', 'titanium', 'alpaca', 'supima', 'signature'],
}


class RecommendationEngine:
    @staticmethod
    def is_eligible(product: Product, prefs: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Strict eligibility gatekeeper function.
        Returns (is_eligible, failure_reason).
        A single violation of any hard constraint immediately disqualifies the product.
        """
        # Constraint 1: Availability
        if not product.is_active:
            return False, "Product is inactive"
        if not product.in_stock or product.stock_quantity <= 0:
            return False, "Product is currently out of stock"

        # Constraint 2: Strict Gender / Audience Isolation
        req_gender = (prefs.get('gender') or 'anyone').lower().strip()
        prod_gender = product.gender.lower()

        if req_gender in ['men', 'man', 'male']:
            if prod_gender != 'men':
                return False, f"Gender mismatch (requested men, got {product.gender})"
        elif req_gender in ['women', 'woman', 'female']:
            if prod_gender != 'women':
                return False, f"Gender mismatch (requested women, got {product.gender})"
        elif req_gender in ['kids', 'kid', 'children', 'juniors']:
            if prod_gender != 'kids':
                return False, f"Gender mismatch (requested kids, got {product.gender})"

        # Constraint 3: Strict Living / Homeware Isolation
        prod_cat_slug = product.category.slug if product.category else ''
        if prod_cat_slug in LIVING_CATEGORY_SLUGS:
            req_living = prefs.get('include_living', False) or any(
                w in (prefs.get('user_message') or '').lower()
                for w in ['living', 'home', 'candle', 'homeware', 'decor', 'blanket']
            )
            if not req_living:
                return False, "Contemporary living / homeware excluded from personal apparel request"

        # Constraint 4: Maximum Budget (HARD CONSTRAINT)
        max_budget = prefs.get('max_budget')
        if max_budget is not None:
            try:
                max_b_dec = Decimal(str(max_budget))
                if max_b_dec > 0 and product.price > max_b_dec:
                    return False, f"Price exceeds maximum budget of ₹{max_budget}"
            except Exception:
                pass

        min_budget = prefs.get('min_budget')
        if min_budget is not None:
            try:
                min_b_dec = Decimal(str(min_budget))
                if min_b_dec > 0 and product.price < min_b_dec:
                    return False, f"Price below minimum budget of ₹{min_budget}"
            except Exception:
                pass

        # Constraint 5: Product Type & Accessories Enforcement
        # Rule: Accessories & Bags are NEVER returned unless explicitly requested
        req_product_type = (prefs.get('product_type') or '').lower().strip()
        user_msg = (prefs.get('user_message') or '').lower()
        include_accessories = bool(prefs.get('include_accessories', False))
        exclude_accessories = bool(prefs.get('exclude_accessories', True))

        bag_keywords = ['bag', 'bags', 'duffel', 'tote', 'handbag', 'backpack', 'wallet', 'cardholder']
        is_bag_explicitly_requested = (
            any(w in user_msg for w in bag_keywords)
            or req_product_type in ['bag', 'bags', 'handbag', 'duffel']
        )

        accessory_keywords = ['accessory', 'accessories', 'jewellery', 'watch', 'cuff', 'earrings', 'belt']
        is_accessory_explicitly_requested = (
            any(w in user_msg for w in accessory_keywords)
            or req_product_type in ['accessory', 'accessories', 'jewellery', 'watch']
        )

        is_any_accessory_allowed = include_accessories or is_bag_explicitly_requested or is_accessory_explicitly_requested

        if prod_cat_slug in ACCESSORY_CATEGORY_SLUGS:
            if not is_any_accessory_allowed:
                return False, "Accessories and bags not requested"
            if exclude_accessories and not is_bag_explicitly_requested and not is_accessory_explicitly_requested:
                return False, "Accessories explicitly excluded"

        # If user explicitly requested clothing/apparel, exclude bags/accessories/footwear
        if req_product_type in ['clothing', 'apparel', 'outfit']:
            if prod_cat_slug not in APPAREL_CATEGORY_SLUGS:
                return False, "Non-clothing category excluded"
        elif req_product_type in ['bag', 'bags']:
            if prod_cat_slug not in ['bags-and-accessories', 'handbags-and-accessories', 'kids-accessories']:
                return False, "Non-bag category excluded"
        elif req_product_type in ['footwear', 'shoes']:
            if prod_cat_slug not in FOOTWEAR_CATEGORY_SLUGS:
                return False, "Non-footwear category excluded"

        # Constraint 6: Database Category ID & Category Slug validation
        req_cat_id = prefs.get('category_id')
        if req_cat_id:
            cat_id_str = str(req_cat_id).strip()
            prod_cat_id_str = str(product.category.id) if product.category else ''
            if cat_id_str != prod_cat_id_str and cat_id_str != prod_cat_slug:
                return False, f"Category ID mismatch (expected {cat_id_str}, got {prod_cat_id_str})"

        # Constraint 7: Occasion Compatibility Validation
        occasion = (prefs.get('occasion') or '').lower().strip()
        if occasion and occasion in OCCASION_COMPATIBILITY_RULES:
            rules = OCCASION_COMPATIBILITY_RULES[occasion]
            # Check allowed category types
            if prod_cat_slug not in rules['allowed_categories']:
                # If product is accessory and bag was explicitly requested, allow
                if not (prod_cat_slug in ACCESSORY_CATEGORY_SLUGS and is_any_accessory_allowed):
                    return False, f"Category {prod_cat_slug} not suitable for occasion {occasion}"

            prod_tags = set(t.lower() for t in (product.tags or []))
            prod_name_lower = product.name.lower()
            prod_desc_lower = product.description.lower()

            # Check for negative disqualifying tags
            negative_tags = rules['negative_tags']
            if any(t in prod_tags for t in negative_tags):
                # Basic t-shirt or pajamas cannot be partywear
                return False, f"Product features conflict with occasion {occasion}"

            # Check for positive affinity or appropriate category
            pos_tags = rules['positive_tags']
            has_pos_tag = any(t in prod_tags for t in pos_tags) or any(t in prod_name_lower or t in prod_desc_lower for t in pos_tags)

            # Special case for formal / party / wedding clothing:
            if occasion in ['party', 'wedding', 'festive occasion']:
                # Shirts, Trousers, Jackets, Dresses with tailored/sateen/jacquard/silk/formal attributes
                is_party_garment = (
                    has_pos_tag
                    or ('sateen' in prod_desc_lower or 'party' in prod_desc_lower or 'evening' in prod_desc_lower)
                    or (prod_cat_slug == 'shirts' and ('formal' in prod_tags or 'tailored' in prod_tags or 'sateen' in prod_tags))
                    or (prod_cat_slug == 'trousers-and-jeans' and ('tailored' in prod_tags or 'pleated' in prod_tags or 'jacquard' in prod_tags))
                    or (prod_cat_slug == 'jackets-and-outerwear' and ('overshirt' in prod_tags or 'trench' in prod_tags or 'coat' in prod_tags))
                    or (prod_cat_slug == 'dresses-and-ethnic-wear')
                    or (prod_cat_slug == 'footwear' and 'formal' in prod_tags)
                )
                if not is_party_garment:
                    return False, f"Product is not suitable for partywear or evening celebrations"

            elif occasion == 'office':
                is_office_garment = (
                    has_pos_tag
                    or ('oxford' in prod_tags or 'workwear' in prod_tags or 'tailored' in prod_tags or 'pleated' in prod_tags)
                    or (prod_cat_slug == 'shirts' and 'shirt' in prod_tags)
                    or (prod_cat_slug == 'trousers-and-jeans' and ('tailored' in prod_tags or 'pleated' in prod_tags))
                    or (prod_cat_slug == 'footwear' and 'derby' in prod_tags)
                )
                if not is_office_garment:
                    return False, f"Product is not suitable for professional office wear"

        return True, None

    @classmethod
    def recommend(
        cls,
        occasion: str = '',
        gender: str = 'anyone',
        min_budget: Optional[float] = None,
        max_budget: Optional[float] = None,
        styles: Optional[List[str]] = None,
        preferred_categories: Optional[List[str]] = None,
        preferred_colours: Optional[List[str]] = None,
        product_type: Optional[str] = None,
        category_id: Optional[Any] = None,
        include_accessories: bool = False,
        exclude_accessories: bool = True,
        user_message: str = '',
        relax_budget: bool = False,
        relax_category: bool = False,
    ) -> Dict[str, Any]:
        """
        Database-First Recommendation Pipeline.
        1. Query authentic active catalog from SQLite.
        2. Filter strictly through is_eligible (Hard Constraints).
        3. Rank remaining candidates using soft preferences.
        4. Return structured response. If 0 matches, return honest diagnostics.
        """
        styles = [s.strip() for s in (styles or []) if s.strip()]
        preferred_categories = [c.strip() for c in (preferred_categories or []) if c.strip()]
        preferred_colours = [c.strip() for c in (preferred_colours or []) if c.strip()]

        effective_max = max_budget if max_budget is not None and max_budget > 0 else None
        effective_min = min_budget if min_budget is not None and min_budget > 0 else None

        prefs = {
            'gender': gender,
            'occasion': occasion,
            'min_budget': effective_min,
            'max_budget': effective_max,
            'product_type': product_type,
            'category_id': category_id,
            'include_accessories': include_accessories,
            'exclude_accessories': exclude_accessories,
            'user_message': user_message,
        }

        # Step 1: Query all active catalog products
        products_qs = Product.objects.filter(is_active=True, in_stock=True)

        # Apply basic DB-level filters
        req_g = gender.lower().strip()
        if req_g in ['men', 'man', 'male']:
            products_qs = products_qs.filter(gender='men')
        elif req_g in ['women', 'woman', 'female']:
            products_qs = products_qs.filter(gender='women')
        elif req_g in ['kids', 'kid', 'children', 'juniors']:
            products_qs = products_qs.filter(gender='kids')

        if effective_max is not None:
            products_qs = products_qs.filter(price__lte=Decimal(str(effective_max)))
        if effective_min is not None:
            products_qs = products_qs.filter(price__gte=Decimal(str(effective_min)))

        all_candidates = list(products_qs)

        # Step 2: Strict Eligibility Evaluation
        eligible_items: List[Tuple[Product, List[str]]] = []
        disqualified_reasons: Dict[str, int] = {}

        for prod in all_candidates:
            ok, reason = cls.is_eligible(prod, prefs)
            if ok:
                eligible_items.append((prod, []))
            else:
                disqualified_reasons[reason] = disqualified_reasons.get(reason, 0) + 1

        # Step 3: Handle Zero Matches with Honest Professional Diagnostic
        if not eligible_items:
            # Diagnose constraint breakdown
            gender_label = "men's" if req_g == 'men' else ("women's" if req_g == 'women' else ("kids'" if req_g == 'kids' else ''))
            occ_label = f"{occasion.lower()}" if occasion else "clothing"

            if effective_max is not None:
                # Check if products exist for this gender & occasion at a higher price
                higher_priced_qs = Product.objects.filter(is_active=True, in_stock=True)
                if req_g in ['men', 'women', 'kids']:
                    higher_priced_qs = higher_priced_qs.filter(gender=req_g)
                higher_candidates = [
                    p for p in higher_priced_qs
                    if cls.is_eligible(p, {**prefs, 'max_budget': None, 'min_budget': None})[0]
                ]

                if higher_candidates:
                    min_available = min(p.price for p in higher_candidates)
                    msg = (
                        f"No {gender_label} {occ_label} products are currently available under ₹{int(effective_max):,}. "
                        f"Available tailored options start at ₹{int(min_available):,}."
                    )
                    summary = f"No {gender_label} {occ_label} under ₹{int(effective_max):,}"
                else:
                    msg = f"I couldn't find an exact match within your budget. You can increase your budget or change your preferences."
                    summary = f"No {gender_label} {occ_label} found"
            else:
                msg = f"No {gender_label} products matching {occ_label} are currently available in the atelier."
                summary = f"No matching {gender_label} {occ_label}"

            return {
                'summary': summary,
                'products': [],
                'bestMatches': [],
                'withinBudget': [],
                'similarStyles': [],
                'completeTheLook': [],
                'totalFound': 0,
                'message': msg,
                'summaryCopy': msg,
                'isRelaxedFilter': False,
                'engine': 'strict-intent-matching-engine',
                'diagnostic': 'Zero products satisfied all hard constraints.',
                'ai_status': 'active',
            }

        # Step 4: Multi-Factor Soft Preference Scoring (on ELIGIBLE items only)
        scored_products = []
        occ_lower = occasion.lower().strip()
        rules = OCCASION_COMPATIBILITY_RULES.get(occ_lower, {})
        pos_occ_tags = rules.get('positive_tags', set())

        for prod, _ in eligible_items:
            score = 10  # Baseline eligibility score
            reasons = []

            prod_tags = set(t.lower() for t in (prod.tags or []))
            prod_name_lower = prod.name.lower()
            prod_desc_lower = prod.description.lower()

            # A. Occasion Affinity (+5)
            if pos_occ_tags and any(t in prod_tags for t in pos_occ_tags):
                score += 5
                reasons.append(f"Tailored for {occasion}")
            elif occasion:
                score += 3
                reasons.append(f"Suitable for {occasion}")

            # B. Style Preference (+3 each)
            for st in styles:
                st_kw = STYLE_TAG_MAP.get(st.lower(), [st.lower()])
                if any(k in prod_tags or k in prod_name_lower or k in prod_desc_lower for k in st_kw):
                    score += 3
                    reasons.append(f"Matches your {st} aesthetic")

            # C. Color Palette Preference (+2)
            if preferred_colours and prod.colors:
                matched_col = any(
                    any(pcol.lower() in c.get('name', '').lower() for pcol in preferred_colours)
                    for c in prod.colors
                )
                if matched_col:
                    score += 2
                    reasons.append("Crafted in your preferred palette")

            # D. Category Match (+3)
            if preferred_categories:
                prod_cat_name = prod.category.name.lower() if prod.category else ''
                if any(pc.lower() in prod_cat_name for pc in preferred_categories):
                    score += 3
                    reasons.append("Matches preferred category")

            # E. Quality & Merchandising Indicators (+1)
            if prod.is_bestseller:
                score += 1
                reasons.append("Atelier client favourite")
            if prod.is_new_arrival:
                score += 1
                reasons.append("New seasonal arrival")

            primary_reason = reasons[0] if reasons else f"Verified {prod.gender} {prod.category_name} within budget"

            scored_products.append({
                'product': prod,
                'score': score,
                'matchingReasons': reasons,
                'primaryReason': primary_reason,
            })

        # Sort strictly by score descending, then rating descending, then price ascending
        scored_products.sort(key=lambda x: (x['score'], x['product'].rating, -x['product'].price), reverse=True)

        # Step 5: Format Standard Response Packages
        best_matches_raw = scored_products[:4]
        within_budget_raw = scored_products[4:8]

        def format_product_cards(items_list):
            out = []
            for it in items_list:
                prod_data = ProductSerializer(it['product']).data
                out.append({
                    'product': prod_data,
                    'score': it['score'],
                    'matchingReasons': it['matchingReasons'],
                    'primaryReason': it['primaryReason'],
                })
            return out

        best_matches = format_product_cards(best_matches_raw)
        within_budget = format_product_cards(within_budget_raw)

        # Formulate structured products list per Section 12 specification
        structured_products = [
            {
                'product_id': it['product'].id,
                'reason': it['primaryReason'],
                'product': ProductSerializer(it['product']).data,
            }
            for it in best_matches_raw
        ]

        gender_display = req_g.capitalize() if req_g in ['men', 'women', 'kids'] else 'Curated'
        occ_display = occasion.capitalize() if occasion else 'Wardrobe'
        budget_display = f" under ₹{int(effective_max):,}" if effective_max else ""
        summary_title = f"{gender_display} {occ_display}{budget_display}"

        summary_msg = f"I found {len(best_matches_raw)} {gender_display.lower()} {occ_display.lower()} options{budget_display}. Here are the closest matches."

        return {
            'summary': summary_title,
            'products': structured_products,
            'bestMatches': best_matches,
            'withinBudget': within_budget,
            'similarStyles': [],  # Strict intent matching: do not invent out-of-intent similar styles
            'completeTheLook': [],  # Strict intent matching: zero unrequested bags or accessories
            'totalFound': len(scored_products),
            'message': summary_msg,
            'summaryCopy': summary_msg,
            'isRelaxedFilter': False,
            'engine': 'strict-intent-matching-engine',
            'diagnostic': f"Verified {len(scored_products)} strictly eligible database products.",
            'ai_status': 'active',
        }
