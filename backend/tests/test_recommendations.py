from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.catalog.models import Category, Product
from apps.recommendations.services import RecommendationEngine
from apps.recommendations.gemini_boundary import GeminiStylistBoundary


class RecommendationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category_apparel = Category.objects.create(
            slug='shirts',
            name='Shirts',
            target_audience='men',
            display_order=1
        )
        self.category_accessories = Category.objects.create(
            slug='accessories',
            name='Bags and Accessories',
            target_audience='unisex',
            display_order=2
        )

        self.prod_shirt = Product.objects.create(
            id='test-shirt-001',
            name='Atelier Linen Shirt',
            slug='atelier-linen-shirt',
            category=self.category_apparel,
            gender='men',
            price=Decimal('2800.00'),
            original_price=Decimal('3500.00'),
            description='Crisp breathable linen shirt for everyday wear and vacation travel.',
            tags=['linen', 'everyday', 'summer', 'minimal'],
            colors=[{'name': 'Ivory', 'hex': '#F8F6F1'}],
            sizes=['38', '40', '42'],
            in_stock=True,
            stock_quantity=10,
            rating=4.8,
            is_new_arrival=True,
        )

        self.prod_luxury = Product.objects.create(
            id='test-luxury-002',
            name='Raw Silk Festive Kurta',
            slug='raw-silk-festive-kurta',
            category=self.category_apparel,
            gender='men',
            price=Decimal('8500.00'),
            description='Handcrafted raw silk kurta with intricate embroidery for weddings and celebrations.',
            tags=['silk', 'festive', 'wedding', 'ethnic'],
            colors=[{'name': 'Champagne Gold', 'hex': '#D8C6AA'}],
            sizes=['38', '40', '42'],
            in_stock=True,
            stock_quantity=5,
            rating=4.9,
            is_bestseller=True,
        )

        self.prod_bag = Product.objects.create(
            id='test-bag-003',
            name='Leather Weekend Duffel',
            slug='leather-weekend-duffel',
            category=self.category_accessories,
            gender='unisex',
            price=Decimal('12000.00'),
            description='Full-grain artisanal leather duffel for vacation and weekend travel.',
            tags=['leather', 'travel', 'duffel', 'classic'],
            colors=[{'name': 'Cognac', 'hex': '#8B4513'}],
            sizes=['One Size'],
            in_stock=True,
            stock_quantity=8,
            rating=4.7,
        )

    def test_recommendation_engine_budget_filtering(self):
        # Under 5000 budget should only return prod_shirt
        results = RecommendationEngine.recommend(
            occasion='Everyday Wear',
            gender='men',
            min_budget=0,
            max_budget=5000,
            styles=['Minimal'],
        )
        all_ids = [it['product']['id'] for it in results['bestMatches'] + results['withinBudget']]
        self.assertIn('test-shirt-001', all_ids)
        self.assertNotIn('test-luxury-002', all_ids)
        self.assertNotIn('test-bag-003', all_ids)

    def test_recommendation_engine_wedding_occasion(self):
        # Wedding occasion should prioritize silk festive kurta
        results = RecommendationEngine.recommend(
            occasion='Wedding',
            gender='men',
            min_budget=0,
            max_budget=15000,
            styles=['Ethnic'],
        )
        best_ids = [it['product']['id'] for it in results['bestMatches']]
        self.assertIn('test-luxury-002', best_ids)

    def test_recommendation_api_endpoint(self):
        payload = {
            'occasion': 'Vacation / Travel',
            'gender': 'men',
            'minBudget': 1000,
            'maxBudget': 20000,
            'styles': ['Classic'],
        }
        response = self.client.post('/api/recommendations/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('bestMatches', data)
        self.assertIn('summaryCopy', data)
        self.assertIn('diagnostic', data)
        self.assertIn(data.get('ai_status'), ['active', 'awaiting_credentials'])

    def test_gemini_boundary_awaiting_credentials_diagnostic(self):
        from unittest.mock import patch
        with patch.object(GeminiStylistBoundary, 'is_configured', return_value=False):
            results = GeminiStylistBoundary.generate_recommendations(
                occasion='Party',
                gender='anyone',
            )
            self.assertEqual(results['ai_status'], 'awaiting_credentials')
            self.assertIn('awaiting GEMINI_API_KEY', results['diagnostic'])

    def test_strict_intent_garment_filtering(self):
        # Adding a trouser product
        cat_trousers = Category.objects.create(
            slug='trousers-and-jeans',
            name='Trousers and Jeans',
            target_audience='men',
            display_order=3
        )
        Product.objects.create(
            id='test-trouser-004',
            name='Tailored Evening Trousers',
            slug='tailored-evening-trousers',
            category=cat_trousers,
            gender='men',
            price=Decimal('2500.00'),
            description='Tailored trousers for evening wear.',
            tags=['trousers', 'party', 'formal'],
            in_stock=True,
            stock_quantity=5,
        )

        # When asking specifically for shirts, trousers must NEVER appear
        res_shirt = RecommendationEngine.recommend(
            user_message='men party shirts under 3000'
        )
        returned_ids = [it['product']['id'] for it in res_shirt['bestMatches']]
        self.assertNotIn('test-trouser-004', returned_ids)

        # When asking specifically for trousers, shirts must NEVER appear
        res_trouser = RecommendationEngine.recommend(
            user_message='men party trousers under 3000'
        )
        returned_ids_tr = [it['product']['id'] for it in res_trouser['bestMatches']]
        self.assertIn('test-trouser-004', returned_ids_tr)
        self.assertNotIn('test-shirt-001', returned_ids_tr)

    def test_unsolicited_accessories_strictly_excluded(self):
        # When asking for clothing, bags and accessories must NEVER be returned
        res = RecommendationEngine.recommend(
            user_message='Men, Vacation, ₹15,000'
        )
        returned_ids = [it['product']['id'] for it in res['bestMatches']]
        self.assertNotIn('test-bag-003', returned_ids)
