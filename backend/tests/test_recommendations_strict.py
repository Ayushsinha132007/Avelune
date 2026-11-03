"""
Automated Test Suite for AVELUNE AI Style Assistant
Strict Intent Matching & Professional Recommendation Engine.
Tests all 14 mandatory test cases specified in Master Architecture requirements.
"""

from decimal import Decimal
from unittest.mock import patch, MagicMock
import requests
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.catalog.models import Category, Product
from apps.recommendations.services import RecommendationEngine
from apps.recommendations.gemini_boundary import GeminiStylistBoundary


class StrictRecommendationEngineTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Seed realistic category hierarchy
        self.cat_mens_shirts = Category.objects.create(
            name='Shirts', slug='shirts', target_audience='men', display_order=1
        )
        self.cat_mens_trousers = Category.objects.create(
            name='Trousers and Jeans', slug='trousers-and-jeans', target_audience='men', display_order=2
        )
        self.cat_mens_jackets = Category.objects.create(
            name='Jackets and Outerwear', slug='jackets-and-outerwear', target_audience='men', display_order=3
        )
        self.cat_mens_footwear = Category.objects.create(
            name='Footwear', slug='footwear', target_audience='men', display_order=4
        )
        self.cat_mens_accessories = Category.objects.create(
            name='Bags and Accessories', slug='bags-and-accessories', target_audience='men', display_order=5
        )
        self.cat_womens_dresses = Category.objects.create(
            name='Dresses and Ethnic Wear', slug='dresses-and-ethnic-wear', target_audience='women', display_order=6
        )
        self.cat_womens_accessories = Category.objects.create(
            name='Handbags and Accessories', slug='handbags-and-accessories', target_audience='women', display_order=7
        )
        self.cat_kids_clothing = Category.objects.create(
            name="Kids' Clothing", slug='kids-clothing', target_audience='kids', display_order=8
        )
        self.cat_living = Category.objects.create(
            name='Contemporary Living', slug='contemporary-living', target_audience='all', display_order=9
        )

        # Seed products across categories
        # Men's partywear shirt (under ₹2000)
        self.men_party_shirt = Product.objects.create(
            id='men-party-001',
            name='Sateen Evening Party Shirt',
            slug='sateen-evening-party-shirt',
            category=self.cat_mens_shirts,
            category_name='Shirts',
            gender='men',
            price=Decimal('1690.00'),
            original_price=Decimal('2200.00'),
            tags=['shirt', 'party', 'evening', 'formal', 'sateen', 'men'],
            description='Tailored for cocktail celebrations in lustrous sateen cotton.',
            in_stock=True,
            stock_quantity=15,
            is_active=True,
            rating=4.9,
        )

        # Men's partywear trousers (under ₹2000)
        self.men_party_trousers = Product.objects.create(
            id='men-party-002',
            name='Slim Jacquard Evening Trousers',
            slug='slim-jacquard-evening-trousers',
            category=self.cat_mens_trousers,
            category_name='Trousers and Jeans',
            gender='men',
            price=Decimal('1950.00'),
            original_price=Decimal('2600.00'),
            tags=['trousers', 'party', 'evening', 'formal', 'jacquard', 'men'],
            description='Tonal jacquard evening trouser for cocktail occasions.',
            in_stock=True,
            stock_quantity=10,
            is_active=True,
            rating=4.8,
        )

        # Men's premium party jacket (above ₹2000)
        self.men_party_blazer = Product.objects.create(
            id='men-party-003',
            name='Midnight Velvet Evening Blazer',
            slug='midnight-velvet-evening-blazer',
            category=self.cat_mens_jackets,
            category_name='Jackets and Outerwear',
            gender='men',
            price=Decimal('7800.00'),
            tags=['blazer', 'party', 'evening', 'formal', 'velvet', 'men'],
            description='Sculptural velvet evening blazer for formal galas.',
            in_stock=True,
            stock_quantity=5,
            is_active=True,
            rating=4.9,
        )

        # Men's office workwear shirt
        self.men_office_shirt = Product.objects.create(
            id='men-office-001',
            name='Organic Oxford Cloth Button-Down',
            slug='organic-oxford-cloth-button-down',
            category=self.cat_mens_shirts,
            category_name='Shirts',
            gender='men',
            price=Decimal('2450.00'),
            tags=['oxford', 'shirt', 'workwear', 'formal', 'cotton', 'men'],
            description='Crisp architectural workwear shirt for office professionals.',
            in_stock=True,
            stock_quantity=20,
            is_active=True,
            rating=4.7,
        )

        # Men's bag
        self.men_leather_bag = Product.objects.create(
            id='men-bag-001',
            name='Full-Grain Leather Weekender Duffel',
            slug='full-grain-leather-weekender-duffel',
            category=self.cat_mens_accessories,
            category_name='Bags and Accessories',
            gender='men',
            price=Decimal('12500.00'),
            tags=['bag', 'duffel', 'leather', 'travel', 'men'],
            description='Artisanal vegetable tanned weekend duffel bag.',
            in_stock=True,
            stock_quantity=6,
            is_active=True,
            rating=4.9,
        )

        # Women's party dress
        self.women_party_dress = Product.objects.create(
            id='wom-party-001',
            name='Raw Mulberry Silk Wrap Dress',
            slug='raw-mulberry-silk-wrap-dress',
            category=self.cat_womens_dresses,
            category_name='Dresses and Ethnic Wear',
            gender='women',
            price=Decimal('6800.00'),
            tags=['dress', 'silk', 'wrap-dress', 'evening', 'party', 'women'],
            description='Biased cut mulberry silk wrap dress for evening celebrations.',
            in_stock=True,
            stock_quantity=8,
            is_active=True,
            rating=4.9,
        )

        # Women's handbag
        self.women_handbag = Product.objects.create(
            id='wom-bag-001',
            name='Structured Leather Baguette Bag',
            slug='structured-leather-baguette-bag',
            category=self.cat_womens_accessories,
            category_name='Handbags and Accessories',
            gender='women',
            price=Decimal('6200.00'),
            tags=['handbag', 'bag', 'leather', 'accessories', 'women'],
            description='Sculptural leather baguette bag with brushed gold clasp.',
            in_stock=True,
            stock_quantity=5,
            is_active=True,
            rating=4.8,
        )

        # Kids casual tee
        self.kids_casual_tee = Product.objects.create(
            id='kid-casual-001',
            name='Organic Cotton Breton Stripe Tee',
            slug='organic-cotton-breton-stripe-tee',
            category=self.cat_kids_clothing,
            category_name="Kids' Clothing",
            gender='kids',
            price=Decimal('650.00'),
            tags=['kids', 't-shirt', 'stripes', 'organic', 'casual'],
            description='Ultra-soft organic cotton daily tee for juniors.',
            in_stock=True,
            stock_quantity=25,
            is_active=True,
            rating=4.8,
        )

        # Homeware candle (unisex)
        self.living_candle = Product.objects.create(
            id='liv-candle-001',
            name='Hinoki Wood & Amber Scented Candle',
            slug='hinoki-wood-amber-candle',
            category=self.cat_living,
            category_name='Contemporary Living',
            gender='unisex',
            price=Decimal('980.00'),
            tags=['candle', 'fragrance', 'living', 'home'],
            description='Smoked amber and hinoki soy wax candle.',
            in_stock=True,
            stock_quantity=30,
            is_active=True,
            rating=4.9,
        )

    # --------------------------------------------------------------------------
    # TEST CASE 1: Men + Party -> No bags, women's clothing, or kids' products
    # --------------------------------------------------------------------------
    def test_case_1_men_party_no_bags_womens_or_kids(self):
        res = RecommendationEngine.recommend(gender='men', occasion='Party')
        self.assertGreater(res['totalFound'], 0)
        returned_products = [it['product'] for it in res['bestMatches'] + res['withinBudget']]

        for p in returned_products:
            # Must strictly be Men's
            self.assertEqual(p['gender'], 'men', f"Expected men's product, got {p['gender']} ({p['id']})")
            # Must not be a bag / accessory
            self.assertNotEqual(p.get('category'), 'Bags and Accessories', "Bag returned for apparel search")
            # Must not be women's dress or kids' clothing
            self.assertNotEqual(p.get('category'), 'Dresses and Ethnic Wear', "Women's dress returned for men")
            self.assertNotEqual(p.get('category'), "Kids' Clothing", "Kids clothing returned for men")
            self.assertNotEqual(p.get('category'), 'Contemporary Living', "Living product returned for men apparel")

    # --------------------------------------------------------------------------
    # TEST CASE 2: Women + Party -> No men's clothing or kids' products
    # --------------------------------------------------------------------------
    def test_case_2_women_party_no_mens_or_kids(self):
        res = RecommendationEngine.recommend(gender='women', occasion='Party')
        self.assertGreater(res['totalFound'], 0)
        returned_products = [it['product'] for it in res['bestMatches'] + res['withinBudget']]

        for p in returned_products:
            self.assertEqual(p['gender'], 'women', f"Cross-gender contamination: {p['id']} has gender {p['gender']}")
            self.assertNotIn(p['id'], ['men-party-001', 'men-party-002', 'kid-casual-001'])

    # --------------------------------------------------------------------------
    # TEST CASE 3: Kids + Casual -> No adult clothing
    # --------------------------------------------------------------------------
    def test_case_3_kids_casual_no_adult_clothing(self):
        res = RecommendationEngine.recommend(gender='kids', occasion='Casual')
        self.assertGreater(res['totalFound'], 0)
        returned_products = [it['product'] for it in res['bestMatches'] + res['withinBudget']]

        for p in returned_products:
            self.assertEqual(p['gender'], 'kids', f"Adult clothing returned for kids query: {p['id']}")
            self.assertNotIn(p['id'], ['men-office-001', 'wom-party-001', 'men-party-001'])

    # --------------------------------------------------------------------------
    # TEST CASE 4: Men + Party + ₹2,000 -> Every returned product is men's partywear <= ₹2,000
    # --------------------------------------------------------------------------
    def test_case_4_men_party_under_2000(self):
        res = RecommendationEngine.recommend(gender='men', occasion='Party', max_budget=2000)
        self.assertGreater(res['totalFound'], 0)
        returned_products = [it['product'] for it in res['bestMatches'] + res['withinBudget']]

        for p in returned_products:
            self.assertEqual(p['gender'], 'men')
            self.assertLessEqual(p['price'], 2000.00, f"Budget exceeded: {p['name']} priced at {p['price']}")
            self.assertIn(p['id'], ['men-party-001', 'men-party-002'])

        # Ensure blazer (₹7,800) was strictly excluded
        returned_ids = [p['id'] for p in returned_products]
        self.assertNotIn('men-party-003', returned_ids)

    # --------------------------------------------------------------------------
    # TEST CASE 5: Men + Office -> No unrelated bags or home products
    # --------------------------------------------------------------------------
    def test_case_5_men_office_no_unrelated_bags_or_home(self):
        res = RecommendationEngine.recommend(gender='men', occasion='Office')
        self.assertGreater(res['totalFound'], 0)
        returned_products = [it['product'] for it in res['bestMatches'] + res['withinBudget']]

        for p in returned_products:
            self.assertEqual(p['gender'], 'men')
            self.assertNotEqual(p.get('category'), 'Bags and Accessories', "Unrelated bag returned for office")
            self.assertNotEqual(p.get('category'), 'Contemporary Living', "Home product returned for office")

    # --------------------------------------------------------------------------
    # TEST CASE 6: User explicitly requests men's bags -> relevant men's bags appear
    # --------------------------------------------------------------------------
    def test_case_6_user_explicitly_requests_mens_bags(self):
        res = RecommendationEngine.recommend(
            gender='men',
            product_type='bags',
            user_message='I need an artisanal leather travel duffel bag for men'
        )
        self.assertGreater(res['totalFound'], 0)
        returned_ids = [it['product']['id'] for it in res['bestMatches']]
        self.assertIn('men-bag-001', returned_ids)

        # Women's bags must NOT contaminate men's search
        self.assertNotIn('wom-bag-001', returned_ids)

    # --------------------------------------------------------------------------
    # TEST CASE 7: User excludes accessories -> accessories never appear
    # --------------------------------------------------------------------------
    def test_case_7_user_excludes_accessories(self):
        res = RecommendationEngine.recommend(
            gender='women',
            occasion='Party',
            exclude_accessories=True
        )
        returned_cats = [it['product'].get('category') for it in res['bestMatches']]
        self.assertNotIn('Handbags and Accessories', returned_cats)
        self.assertNotIn('Bags and Accessories', returned_cats)

    # --------------------------------------------------------------------------
    # TEST CASE 8: No matching products -> Return zero products and honest explanation
    # --------------------------------------------------------------------------
    def test_case_8_no_matching_products_honest_explanation(self):
        # Budget ₹500 (lowest men's partywear is ₹1,690)
        res = RecommendationEngine.recommend(gender='men', occasion='Party', max_budget=500)
        self.assertEqual(res['totalFound'], 0)
        self.assertEqual(len(res['products']), 0)
        self.assertEqual(len(res['bestMatches']), 0)
        self.assertIn('under ₹500', res['message'])
        self.assertIn('₹1,690', res['message'])  # Explains minimum price available

    # --------------------------------------------------------------------------
    # TEST CASE 9: Gemini is unavailable -> Valid database-driven recommendations work
    # --------------------------------------------------------------------------
    def test_case_9_gemini_unavailable_fallback(self):
        with patch('requests.post', side_effect=requests.exceptions.ConnectionError("Network offline")):
            res = GeminiStylistBoundary.generate_recommendations(
                gender='men',
                occasion='Party',
                max_budget=2000
            )
            # Should not crash, should return valid DB items
            self.assertEqual(res['totalFound'], 2)
            self.assertIn('men-party-001', [it['product']['id'] for it in res['bestMatches']])
            self.assertIn('Gemini offline/timeout fallback', res['diagnostic'])

    # --------------------------------------------------------------------------
    # TEST CASE 10: Gemini returns a product outside candidate list -> Reject it
    # --------------------------------------------------------------------------
    def test_case_10_gemini_hallucinated_id_rejected(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'candidates': [{
                'content': {
                    'parts': [{
                        'text': json_dumps({
                            'summary': "Men's partywear",
                            'consultationNote': 'Elevated celebration ensemble.',
                            'recommendedIds': ['invented-gucci-suit-999', 'wom-party-001', 'men-party-001'],
                            'itemReasons': {
                                'men-party-001': 'Refined sateen cotton with liquid drape for cocktail gatherings.'
                            }
                        })
                    }]
                }
            }]
        }

        with patch('requests.post', return_value=mock_response):
            res = GeminiStylistBoundary.generate_recommendations(
                gender='men',
                occasion='Party',
                max_budget=2000
            )
            returned_ids = [it['product']['id'] for it in res['bestMatches']]
            # Only men-party-001 is valid; invented ID and women's dress must be discarded
            self.assertIn('men-party-001', returned_ids)
            self.assertNotIn('invented-gucci-suit-999', returned_ids)
            self.assertNotIn('wom-party-001', returned_ids)

    # --------------------------------------------------------------------------
    # TEST CASE 11: Product becomes unavailable -> Do not recommend it
    # --------------------------------------------------------------------------
    def test_case_11_product_unavailable_not_recommended(self):
        self.men_party_shirt.in_stock = False
        self.men_party_shirt.save()

        res = RecommendationEngine.recommend(gender='men', occasion='Party', max_budget=2000)
        returned_ids = [it['product']['id'] for it in res['bestMatches']]
        self.assertNotIn('men-party-001', returned_ids)
        self.assertIn('men-party-002', returned_ids)

    # --------------------------------------------------------------------------
    # TEST CASE 12: Product price changes -> Use current backend price
    # --------------------------------------------------------------------------
    def test_case_12_product_price_changes_live(self):
        # Update price from ₹1,690 to ₹2,500
        self.men_party_shirt.price = Decimal('2500.00')
        self.men_party_shirt.save()

        res = RecommendationEngine.recommend(gender='men', occasion='Party', max_budget=2000)
        returned_ids = [it['product']['id'] for it in res['bestMatches']]
        # Because budget is ₹2,000, the updated ₹2,500 product must be immediately excluded
        self.assertNotIn('men-party-001', returned_ids)
        self.assertIn('men-party-002', returned_ids)

    # --------------------------------------------------------------------------
    # TEST CASE 13: Invalid category ID or budget -> Reject or safely validate
    # --------------------------------------------------------------------------
    def test_case_13_invalid_category_or_budget(self):
        # Negative budget rejection
        res_neg = self.client.post('/api/recommendations/', {'max_budget': -500})
        self.assertEqual(res_neg.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('negative', res_neg.json()['error'])

        # Min budget > Max budget rejection
        res_inv_range = self.client.post('/api/recommendations/', {'min_budget': 5000, 'max_budget': 2000})
        self.assertEqual(res_inv_range.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot exceed', res_inv_range.json()['error'])

        # Non-existent category ID rejection
        res_cat = self.client.post('/api/recommendations/', {'category_id': 'invalid-non-existent-cat-999'})
        self.assertEqual(res_cat.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('does not exist', res_cat.json()['error'])

    # --------------------------------------------------------------------------
    # TEST CASE 14: Refresh and repeat same request -> Constraints consistently satisfied
    # --------------------------------------------------------------------------
    def test_case_14_refresh_repeat_consistency(self):
        payload = {'gender': 'men', 'occasion': 'Party', 'max_budget': 2000}
        res1 = self.client.post('/api/recommendations/', payload, format='json')
        res2 = self.client.post('/api/recommendations/', payload, format='json')

        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res2.status_code, 200)

        data1 = res1.json()
        data2 = res2.json()

        ids1 = [it['product']['id'] for it in data1['bestMatches']]
        ids2 = [it['product']['id'] for it in data2['bestMatches']]

        self.assertEqual(ids1, ids2)
        for it in data1['bestMatches']:
            self.assertEqual(it['product']['gender'], 'men')
            self.assertLessEqual(it['product']['price'], 2000.00)


def json_dumps(obj):
    import json
    return json.dumps(obj)

