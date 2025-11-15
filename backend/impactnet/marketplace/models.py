from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class KYCVerification(models.Model):
    """KYC Verification - Users must verify before posting to marketplace"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]

    DOCUMENT_TYPES = [
        ('passport', 'Passport'),
        ('drivers_license', 'Driver\'s License'),
        ('national_id', 'National ID'),
        ('residence_permit', 'Residence Permit'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc_verification')

    # Personal Information
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=20)

    # Document Upload
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    document_front = models.ImageField(upload_to='kyc/documents/')
    document_back = models.ImageField(upload_to='kyc/documents/', null=True, blank=True)
    selfie_with_document = models.ImageField(upload_to='kyc/selfies/')

    # Verification Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    # Reviewer Notes
    reviewer_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)

    # Trust Score (0-100)
    trust_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    class Meta:
        verbose_name = 'KYC Verification'
        verbose_name_plural = 'KYC Verifications'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user.username} - {self.status}"

    @property
    def is_verified(self):
        return self.status == 'approved'


class SellerProfile(models.Model):
    """Seller Profile - Only KYC verified users can become sellers"""

    SELLER_TYPES = [
        ('individual', 'Individual Seller'),
        ('merchant', 'Merchant/Business'),
        ('agency', 'Agency'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    seller_type = models.CharField(max_length=20, choices=SELLER_TYPES, default='individual')

    # Business Information (for merchants)
    business_name = models.CharField(max_length=255, blank=True)
    business_registration = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)

    # Seller Stats
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    reviews_count = models.IntegerField(default=0)

    # Status
    is_active = models.BooleanField(default=True)
    is_verified_seller = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    # Badges
    is_top_seller = models.BooleanField(default=False)
    is_trusted = models.BooleanField(default=False)
    response_time_hours = models.IntegerField(default=24)  # Average response time

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Seller Profile'
        verbose_name_plural = 'Seller Profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.seller_type}"


class Category(models.Model):
    """Product Categories"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, default='grid')
    color = models.CharField(max_length=7, default='#3B82F6')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subcategories')
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Product(models.Model):
    """Marketplace Products - Only verified sellers can post"""

    CONDITION_CHOICES = [
        ('new', 'New'),
        ('like_new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('for_parts', 'For Parts'),
    ]

    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')

    # Product Info
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='new')
    quantity = models.IntegerField(default=1)

    # Location
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Delivery Options
    offers_delivery = models.BooleanField(default=False)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    offers_pickup = models.BooleanField(default=True)

    # Promotions
    has_promotion = models.BooleanField(default=False)
    promotion_type = models.CharField(max_length=50, blank=True)  # 'bogo', 'discount', 'flash_sale'
    discount_percentage = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    promotion_expires_at = models.DateTimeField(null=True, blank=True)

    # Status
    is_active = models.BooleanField(default=True)
    is_sold = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    favorites_count = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sold_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def final_price(self):
        """Calculate price after discount"""
        if self.has_promotion and self.discount_percentage > 0:
            discount = self.price * (self.discount_percentage / 100)
            return self.price - discount
        return self.price


class ProductImage(models.Model):
    """Product Images"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.product.title} - Image {self.order}"


class Order(models.Model):
    """Marketplace Orders"""

    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('paid', 'Paid'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    order_number = models.CharField(max_length=20, unique=True)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='marketplace_orders')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    # Order Details
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Delivery
    delivery_address = models.TextField()
    delivery_notes = models.TextField(blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number}"


class DeliveryGig(models.Model):
    """Shopping & Delivery Gigs"""

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('accepted', 'Accepted'),
        ('shopping', 'Shopping'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    gig_number = models.CharField(max_length=20, unique=True)
    shopper = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='delivery_gigs')
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery_gig')

    # Gig Details
    base_pay = models.DecimalField(max_digits=10, decimal_places=2)
    distance_km = models.DecimalField(max_digits=5, decimal_places=2)
    estimated_minutes = models.IntegerField()
    fuel_cost = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Time Bonuses
    posted_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    acceptance_time_minutes = models.IntegerField(default=0)
    time_bonus_percentage = models.IntegerField(default=100)  # 100%, 95%, 90%, 80%

    # Final Pay
    final_pay = models.DecimalField(max_digits=10, decimal_places=2)
    tip_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')

    # Location Tracking
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    dropoff_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    dropoff_longitude = models.DecimalField(max_digits=9, decimal_places=6)

    # Timestamps
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Delivery Gig'
        verbose_name_plural = 'Delivery Gigs'
        ordering = ['-posted_at']

    def __str__(self):
        return f"Gig {self.gig_number}"
