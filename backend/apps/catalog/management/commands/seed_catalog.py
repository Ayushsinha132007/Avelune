import json
import os
from pathlib import Path
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.catalog.models import Category, Product


CORE_CATEGORIES = [
    {
        'name': "Men's Collection",
        'slug': 'mens-collection',
        'subtitle': 'Tailored silhouettes, relaxed linen, and refined layers',
        'image': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop',
        'target_audience': 'men',
        'display_order': 1,
    },
    {
        'name': "Women's Atelier",
        'slug': 'womens-atelier',
        'subtitle': 'Flowing dresses, silk shirts, and sculptural tailoring',
        'image': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        'target_audience': 'women',
        'display_order': 2,
    },
    {
        'name': 'Kids & Juniors',
        'slug': 'kids-juniors',
        'subtitle': 'Gentle organic cottons, playful cuts, and festive sets',
        'image': 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=1000&auto=format&fit=crop',
        'target_audience': 'kids',
        'display_order': 3,
    },
    {
        'name': 'Under ₹999 Edit',
        'slug': 'under-999',
        'subtitle': 'Consciously priced everyday essentials and staples',
        'image': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
        'target_audience': 'all',
        'display_order': 4,
    },
    {
        'name': 'New Arrivals',
        'slug': 'new-arrivals',
        'subtitle': 'The latest drops crafted in limited atelier batches',
        'image': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
        'target_audience': 'all',
        'display_order': 5,
    },
    {
        'name': 'Bestsellers',
        'slug': 'bestsellers',
        'subtitle': 'Client-favourite staples with exceptional reviews',
        'image': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
        'target_audience': 'all',
        'display_order': 6,
    },
    {
        'name': 'The Signature Collection',
        'slug': 'signature',
        'subtitle': 'Limited numbered editions, raw silks, and tailored outerwear',
        'image': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
        'target_audience': 'all',
        'display_order': 7,
    },
    {
        'name': 'Everyday Essentials',
        'slug': 'everyday-essentials',
        'subtitle': 'Understated luxury for daily wear',
        'image': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
        'target_audience': 'all',
        'display_order': 8,
    },
    {
        'name': 'Contemporary Living',
        'slug': 'contemporary-living',
        'subtitle': 'Sculptural homeware and tactile lifestyle additions',
        'image': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop',
        'target_audience': 'all',
        'display_order': 9,
    },
]


class Command(BaseCommand):
    help = 'Seed the AVELUNE catalogue with authentic categories and products'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('\n✨ Seeding AVELUNE Luxury Catalogue into SQLite...'))

        # 1. Seed Core Categories
        category_map = {}
        for cat_data in CORE_CATEGORIES:
            category, created = Category.objects.update_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'subtitle': cat_data.get('subtitle', ''),
                    'image': cat_data.get('image', ''),
                    'target_audience': cat_data.get('target_audience', 'all'),
                    'display_order': cat_data.get('display_order', 0),
                    'is_active': True,
                }
            )
            category_map[category.name.lower()] = category
            category_map[category.slug] = category

        # 2. Read Products from Fixture
        fixture_path = Path(__file__).resolve().parent.parent.parent / 'fixtures' / 'initial_catalog.json'
        if not fixture_path.exists():
            self.stdout.write(self.style.ERROR(f'Fixture file not found at: {fixture_path}'))
            return

        with open(fixture_path, 'r', encoding='utf-8') as f:
            raw_products = json.load(f)

        created_count = 0
        updated_count = 0

        for p in raw_products:
            prod_id = p.get('id')
            name = p.get('name')
            category_name = p.get('category', 'Atelier Selection')

            # Ensure category exists in DB for foreign key
            category_obj = Category.objects.filter(name__iexact=category_name).first()
            if not category_obj:
                category_obj, _ = Category.objects.get_or_create(
                    slug=slugify(category_name),
                    defaults={
                        'name': category_name,
                        'target_audience': p.get('gender', 'unisex'),
                        'is_active': True,
                    }
                )

            price_dec = Decimal(str(p.get('price', 0)))
            orig_price_dec = Decimal(str(p.get('originalPrice'))) if p.get('originalPrice') is not None else None
            rating_dec = Decimal(str(p.get('rating', 4.8)))

            product, created = Product.objects.update_or_create(
                id=prod_id,
                defaults={
                    'name': name,
                    'slug': slugify(f"{name}-{prod_id}"),
                    'subtitle': p.get('subtitle', ''),
                    'description': p.get('description', ''),
                    'category': category_obj,
                    'category_name': category_name,
                    'sub_category': p.get('subCategory', ''),
                    'gender': p.get('gender', 'unisex'),
                    'price': price_dec,
                    'original_price': orig_price_dec,
                    'rating': rating_dec,
                    'review_count': p.get('reviewCount', 0),
                    'badge': p.get('badge', ''),
                    'images': p.get('images', []),
                    'primary_image': p.get('images', [''])[0] if p.get('images') else '',
                    'details': p.get('details', []),
                    'materials': p.get('materials', ''),
                    'dimensions': p.get('dimensions', ''),
                    'stock_quantity': 50,
                    'in_stock': p.get('inStock', True),
                    'sizes': p.get('sizes', []),
                    'colors': p.get('colors', []),
                    'tags': p.get('tags', []),
                    'collections': p.get('collections', []),
                    'collection_slug': p.get('collectionSlug', ''),
                    'is_active': True,
                    'is_featured': p.get('isFeatured', False),
                    'is_bestseller': p.get('isBestseller', False),
                    'is_new_arrival': p.get('isNewArrival', False),
                }
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'✅ Successfully seeded catalogue: {Category.objects.count()} Categories, '
            f'{created_count} Products Created, {updated_count} Products Updated. Total: {Product.objects.count()} Products in SQLite.\n'
        ))

