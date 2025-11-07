from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
import hashlib
import secrets
import time

User = get_user_model()


class NetworkType(models.TextChoices):
    """Blockchain network types"""
    TESTNET = 'testnet', 'Test Network'
    MAINNET = 'mainnet', 'Main Network'


class PaymentMethod(models.TextChoices):
    """Payment gateway methods"""
    PAYSTACK = 'paystack', 'Paystack'
    FLUTTERWAVE = 'flutterwave', 'Flutterwave'
    BLOCKCHAIN = 'blockchain', 'Blockchain'
    BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'
    MOBILE_MONEY = 'mobile_money', 'Mobile Money'


class PaymentStatus(models.TextChoices):
    """Payment processing status"""
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    CANCELLED = 'cancelled', 'Cancelled'
    REFUNDED = 'refunded', 'Refunded'


class PaymentGateway(models.Model):
    """Payment gateway configuration"""
    name = models.CharField(max_length=100, unique=True)
    payment_method = models.CharField(max_length=30, choices=PaymentMethod.choices)

    # Network configuration
    network_type = models.CharField(
        max_length=20,
        choices=NetworkType.choices,
        default=NetworkType.TESTNET
    )

    # API credentials (encrypted)
    public_key = models.CharField(max_length=500, blank=True)
    secret_key = models.CharField(max_length=500, blank=True)
    merchant_id = models.CharField(max_length=255, blank=True)

    # Gateway URLs
    api_base_url = models.URLField(max_length=500)
    webhook_url = models.URLField(max_length=500, blank=True)

    # Configuration
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)

    # Fee configuration
    transaction_fee_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    fixed_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    # Limits
    min_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=100,
        validators=[MinValueValidator(0)]
    )
    max_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=1000000,
        validators=[MinValueValidator(0)]
    )

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['payment_method', 'is_active']),
            models.Index(fields=['network_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_network_type_display()})"

    def calculate_fee(self, amount):
        """Calculate transaction fee"""
        percentage_fee = (amount * self.transaction_fee_percentage) / 100
        return percentage_fee + self.fixed_fee


class Payment(models.Model):
    """Payment transaction record"""
    # Transaction identification
    reference = models.CharField(max_length=100, unique=True, db_index=True)
    gateway = models.ForeignKey(
        PaymentGateway,
        on_delete=models.PROTECT,
        related_name='payments'
    )

    # User information
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='payments'
    )
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)

    # Payment details
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='NGN')
    fee = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )

    # Gateway response
    gateway_reference = models.CharField(max_length=255, blank=True, db_index=True)
    gateway_response = models.JSONField(null=True, blank=True)

    # Blockchain (if applicable)
    network_type = models.CharField(
        max_length=20,
        choices=NetworkType.choices,
        default=NetworkType.TESTNET
    )
    blockchain_hash = models.CharField(max_length=100, blank=True, db_index=True)
    blockchain_address = models.CharField(max_length=255, blank=True)

    # Purpose
    purpose = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    # Related entities
    post = models.ForeignKey(
        'posts.Post',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )

    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)

    # Refund tracking
    is_refunded = models.BooleanField(default=False)
    refunded_at = models.DateTimeField(null=True, blank=True)
    refund_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-initiated_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['gateway', 'status']),
            models.Index(fields=['-initiated_at']),
            models.Index(fields=['network_type', 'blockchain_hash']),
        ]

    def __str__(self):
        return f"{self.reference} - {self.amount} {self.currency} ({self.status})"

    @classmethod
    def generate_reference(cls):
        """Generate unique payment reference"""
        timestamp = int(time.time())
        random_str = secrets.token_hex(4).upper()
        return f"PAY-{timestamp}-{random_str}"

    @property
    def total_amount(self):
        """Total amount including fees"""
        return self.amount + self.fee

    @property
    def is_completed(self):
        return self.status == PaymentStatus.COMPLETED

    def complete(self):
        """Mark payment as completed"""
        from django.utils import timezone
        if self.status != PaymentStatus.COMPLETED:
            self.status = PaymentStatus.COMPLETED
            self.completed_at = timezone.now()
            self.save()

    def fail(self, reason=''):
        """Mark payment as failed"""
        from django.utils import timezone
        self.status = PaymentStatus.FAILED
        self.failed_at = timezone.now()
        if reason:
            self.metadata['failure_reason'] = reason
        self.save()


class BlockchainTransaction(models.Model):
    """Blockchain transaction record for transparency"""
    payment = models.OneToOneField(
        Payment,
        on_delete=models.CASCADE,
        related_name='blockchain_tx'
    )

    # Network
    network_type = models.CharField(
        max_length=20,
        choices=NetworkType.choices
    )

    # Transaction details
    tx_hash = models.CharField(max_length=100, unique=True, db_index=True)
    block_number = models.BigIntegerField(null=True, blank=True)
    block_hash = models.CharField(max_length=100, blank=True)

    # Addresses
    from_address = models.CharField(max_length=255)
    to_address = models.CharField(max_length=255)

    # Amount
    amount = models.DecimalField(
        max_digits=30,
        decimal_places=18
    )
    gas_used = models.BigIntegerField(null=True, blank=True)
    gas_price = models.DecimalField(
        max_digits=30,
        decimal_places=18,
        null=True,
        blank=True
    )

    # Confirmation
    confirmations = models.IntegerField(default=0)
    is_confirmed = models.BooleanField(default=False)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    # Raw data
    raw_transaction = models.JSONField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tx_hash']),
            models.Index(fields=['network_type', 'is_confirmed']),
        ]

    def __str__(self):
        return f"{self.tx_hash} ({self.get_network_type_display()})"


class PaymentWebhook(models.Model):
    """Webhook events from payment gateways"""
    gateway = models.ForeignKey(
        PaymentGateway,
        on_delete=models.CASCADE,
        related_name='webhooks'
    )

    # Event details
    event_type = models.CharField(max_length=100)
    event_id = models.CharField(max_length=255, unique=True)

    # Payload
    payload = models.JSONField()
    headers = models.JSONField(default=dict)

    # Processing
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)

    # Related payment
    payment = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='webhooks'
    )

    # Error tracking
    processing_error = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)

    # Timestamps
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-received_at']
        indexes = [
            models.Index(fields=['gateway', 'is_processed']),
            models.Index(fields=['event_type', '-received_at']),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.event_id}"
