from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    AUDIENCE_CHOICES = [
        ('all', 'All / Universal'),
        ('men', 'Men'),
        ('women', 'Women'),
        ('kids', 'Kids'),
        ('unisex', 'Unisex'),
    ]

    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    image = models.URLField(max_length=500, blank=True)
    target_audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='all')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    GENDER_CHOICES = [
        ('men', 'Men'),
        ('women', 'Women'),
        ('kids', 'Kids'),
        ('unisex', 'Unisex'),
    ]

    id = models.CharField(max_length=64, primary_key=True, help_text="e.g. men-001, wom-002, kid-001")
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    category_name = models.CharField(max_length=120, help_text="Cached category display name for frontend")
    sub_category = models.CharField(max_length=120, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='unisex')

    # Pricing (in INR)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Current sale price in INR")
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Original strikethrough price in INR")

    # Reviews & Quality
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.8)
    review_count = models.PositiveIntegerField(default=0)
    badge = models.CharField(max_length=60, blank=True)

    # Assets & Attributes
    images = models.JSONField(default=list, help_text="Array of image URLs")
    primary_image = models.URLField(max_length=500, blank=True)
    details = models.JSONField(default=list, help_text="List of detail bullet points")
    materials = models.CharField(max_length=255, blank=True)
    dimensions = models.CharField(max_length=255, blank=True)

    # Stock & Inventory
    stock_quantity = models.PositiveIntegerField(default=50)
    in_stock = models.BooleanField(default=True)

    # Variants
    sizes = models.JSONField(default=list, help_text="Available sizes e.g. ['S', 'M', 'L']")
    colors = models.JSONField(default=list, help_text="List of dicts with name & hex")
    tags = models.JSONField(default=list, help_text="Keywords e.g. ['linen', 'band-collar']")
    collections = models.JSONField(default=list, help_text="Collections e.g. ['bestsellers', 'signature']")
    collection_slug = models.CharField(max_length=120, blank=True)

    # Merchandising Flags
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.id}")
        if self.images and not self.primary_image:
            self.primary_image = self.images[0]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.id})"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery_images')
    image_url = models.URLField(max_length=500)
    alt_text = models.CharField(max_length=255, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Product Image'
        verbose_name_plural = 'Product Images'
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Image #{self.display_order} for {self.product.name}"


