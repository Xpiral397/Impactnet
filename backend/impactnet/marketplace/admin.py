from django.contrib import admin
from .models import (
    KYCVerification,
    SellerProfile,
    Category,
    Product,
    ProductImage,
    Order,
    DeliveryGig,
)


@admin.register(KYCVerification)
class KYCVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'trust_score', 'submitted_at', 'verified_at']
    list_filter = ['status', 'document_type']
    search_fields = ['user__username', 'full_name', 'phone_number']
    readonly_fields = ['submitted_at', 'reviewed_at', 'verified_at']

    fieldsets = (
        ('User', {
            'fields': ('user', 'status', 'trust_score')
        }),
        ('Personal Information', {
            'fields': ('full_name', 'date_of_birth', 'phone_number', 'address', 'city', 'country', 'postal_code')
        }),
        ('Documents', {
            'fields': ('document_type', 'document_front', 'document_back', 'selfie_with_document')
        }),
        ('Verification', {
            'fields': ('reviewer_notes', 'rejection_reason', 'submitted_at', 'reviewed_at', 'verified_at', 'expires_at')
        }),
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'seller_type', 'rating', 'total_orders', 'is_verified_seller', 'is_top_seller']
    list_filter = ['seller_type', 'is_verified_seller', 'is_top_seller', 'is_trusted']
    search_fields = ['user__username', 'business_name']
    readonly_fields = ['total_sales', 'total_orders', 'rating', 'reviews_count', 'created_at', 'updated_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon', 'color', 'parent', 'order']
    list_filter = ['parent']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'price', 'condition', 'is_active', 'has_promotion', 'created_at']
    list_filter = ['condition', 'is_active', 'has_promotion', 'promotion_type', 'offers_delivery']
    search_fields = ['title', 'description', 'seller__user__username']
    readonly_fields = ['views_count', 'favorites_count', 'created_at', 'updated_at']
    inlines = [ProductImageInline]

    fieldsets = (
        ('Basic Info', {
            'fields': ('seller', 'category', 'title', 'description', 'price', 'condition', 'quantity')
        }),
        ('Location', {
            'fields': ('location', 'latitude', 'longitude')
        }),
        ('Delivery', {
            'fields': ('offers_delivery', 'delivery_fee', 'offers_pickup')
        }),
        ('Promotions', {
            'fields': ('has_promotion', 'promotion_type', 'discount_percentage', 'promotion_expires_at')
        }),
        ('Status', {
            'fields': ('is_active', 'is_sold', 'views_count', 'favorites_count', 'sold_at')
        }),
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'buyer', 'product', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'buyer__username', 'product__title']
    readonly_fields = ['order_number', 'created_at', 'paid_at', 'shipped_at', 'delivered_at', 'completed_at']


@admin.register(DeliveryGig)
class DeliveryGigAdmin(admin.ModelAdmin):
    list_display = ['gig_number', 'shopper', 'base_pay', 'time_bonus_percentage', 'status', 'posted_at']
    list_filter = ['status', 'posted_at']
    search_fields = ['gig_number', 'shopper__username']
    readonly_fields = ['gig_number', 'acceptance_time_minutes', 'posted_at', 'accepted_at', 'completed_at']
