from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.catalog.models import Category
from .gemini_boundary import GeminiStylistBoundary


class RecommendationView(APIView):
    """
    Strict Intent Matching & Professional Shopping Consultant API.
    Validates all structured input parameters against database rules.
    Disallows invalid budgets or non-existent category IDs.
    """
    permission_classes = [permissions.AllowAny]

    def _parse_and_validate(self, data: dict):
        # 1. Gender Validation
        gender = str(data.get('gender') or data.get('target_audience') or 'anyone').strip().lower()
        allowed_genders = {'men', 'man', 'male', 'women', 'woman', 'female', 'kids', 'kid', 'children', 'juniors', 'unisex', 'anyone', 'all'}
        if gender not in allowed_genders:
            return None, f"Invalid gender parameter '{gender}'. Allowed choices: men, women, kids, anyone."

        # 2. Budget Validation
        raw_max = data.get('max_budget') or data.get('maxBudget')
        max_budget = None
        if raw_max is not None and str(raw_max).strip() != '':
            try:
                max_budget = float(raw_max)
                if max_budget < 0:
                    return None, "Maximum budget cannot be negative."
            except (ValueError, TypeError):
                return None, f"Invalid maximum budget format: {raw_max}"

        raw_min = data.get('min_budget') or data.get('minBudget')
        min_budget = None
        if raw_min is not None and str(raw_min).strip() != '':
            try:
                min_budget = float(raw_min)
                if min_budget < 0:
                    return None, "Minimum budget cannot be negative."
            except (ValueError, TypeError):
                return None, f"Invalid minimum budget format: {raw_min}"

        if min_budget is not None and max_budget is not None and min_budget > max_budget:
            return None, f"Minimum budget (₹{min_budget}) cannot exceed maximum budget (₹{max_budget})."

        # 3. Category ID Validation (if provided)
        category_id = data.get('category_id') or data.get('categoryId')
        if category_id is not None and str(category_id).strip() != '':
            cat_val = str(category_id).strip()
            # Must exist as numeric ID or slug in Category table
            exists = False
            if cat_val.isdigit():
                exists = Category.objects.filter(id=int(cat_val)).exists()
            if not exists:
                exists = Category.objects.filter(slug=cat_val).exists()
            if not exists:
                return None, f"Category '{category_id}' does not exist in catalogue."

        # 4. Accessories Flags
        raw_include_acc = data.get('include_accessories', data.get('includeAccessories', False))
        include_accessories = str(raw_include_acc).lower() in ('true', '1')

        raw_exclude_acc = data.get('exclude_accessories', data.get('excludeAccessories', not include_accessories))
        exclude_accessories = str(raw_exclude_acc).lower() in ('true', '1')

        # 5. Occasion & Product Type
        occasion = str(data.get('occasion', '')).strip()
        product_type = str(data.get('product_type') or data.get('productType') or '').strip().lower()
        user_message = str(data.get('message') or data.get('userMessage') or '').strip()

        styles = data.get('styles', [])
        if isinstance(styles, str):
            styles = [s.strip() for s in styles.split(',') if s.strip()]

        preferred_categories = data.get('preferred_categories', data.get('preferredCategories', []))
        if isinstance(preferred_categories, str):
            preferred_categories = [c.strip() for c in preferred_categories.split(',') if c.strip()]

        preferred_colours = data.get('preferred_colours', data.get('preferredColours', []))
        if isinstance(preferred_colours, str):
            preferred_colours = [c.strip() for c in preferred_colours.split(',') if c.strip()]

        relax_budget = str(data.get('relax_budget', data.get('relaxBudget', False))).lower() in ('true', '1')
        relax_category = str(data.get('relax_category', data.get('relaxCategory', False))).lower() in ('true', '1')

        clean_params = {
            'occasion': occasion,
            'gender': gender,
            'min_budget': min_budget,
            'max_budget': max_budget,
            'styles': styles,
            'preferred_categories': preferred_categories,
            'preferred_colours': preferred_colours,
            'product_type': product_type,
            'category_id': category_id,
            'include_accessories': include_accessories,
            'exclude_accessories': exclude_accessories,
            'user_message': user_message,
            'relax_budget': relax_budget,
            'relax_category': relax_category,
        }
        return clean_params, None

    def post(self, request):
        clean_params, error_msg = self._parse_and_validate(request.data)
        if error_msg:
            return Response({
                'success': False,
                'error': error_msg,
                'message': error_msg,
                'totalFound': 0,
                'products': [],
                'bestMatches': [],
            }, status=status.HTTP_400_BAD_REQUEST)

        results = GeminiStylistBoundary.generate_recommendations(**clean_params)
        return Response(results, status=status.HTTP_200_OK)

    def get(self, request):
        # Allow query-param access for GET requests
        clean_params, error_msg = self._parse_and_validate(request.query_params)
        if error_msg:
            return Response({
                'success': False,
                'error': error_msg,
                'message': error_msg,
                'totalFound': 0,
                'products': [],
                'bestMatches': [],
            }, status=status.HTTP_400_BAD_REQUEST)

        results = GeminiStylistBoundary.generate_recommendations(**clean_params)
        return Response(results, status=status.HTTP_200_OK)
