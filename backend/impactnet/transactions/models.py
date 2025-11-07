from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import hashlib
import json

User = get_user_model()


class TransactionType(models.TextChoices):
    """Types of financial transactions"""
    DONATION = 'donation', 'Donation Received'
    DISBURSEMENT = 'disbursement', 'Fund Disbursement'
    REFUND = 'refund', 'Refund'
    ADJUSTMENT = 'adjustment', 'Balance Adjustment'
    FEE = 'fee', 'Platform Fee'


class TransactionStatus(models.TextChoices):
    """Transaction processing status"""
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    CANCELLED = 'cancelled', 'Cancelled'


class Transaction(models.Model):
    """Financial transaction record with blockchain integration"""
    # Transaction identification
    transaction_id = models.CharField(max_length=100, unique=True)
    transaction_type = models.CharField(max_length=30, choices=TransactionType.choices)

    # Related entities
    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.PROTECT,
        related_name='transactions',
        null=True,
        blank=True
    )
    program = models.ForeignKey(
        'programs.Program',
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='transactions',
        help_text="User who initiated or is recipient of transaction"
    )

    # Financial details
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    currency = models.CharField(max_length=3, default='NGN')

    # Sender details (for donations)
    sender_name = models.CharField(max_length=255, blank=True)
    sender_email = models.EmailField(blank=True)
    sender_phone = models.CharField(max_length=20, blank=True)

    # Recipient details (for disbursements)
    recipient_name = models.CharField(max_length=255, blank=True)
    recipient_account = models.CharField(max_length=100, blank=True)
    recipient_bank = models.CharField(max_length=100, blank=True)

    # Transaction status
    status = models.CharField(
        max_length=20,
        choices=TransactionStatus.choices,
        default=TransactionStatus.PENDING
    )

    # Blockchain integration
    blockchain_hash = models.CharField(max_length=64, unique=True)
    previous_block_hash = models.CharField(max_length=64, null=True, blank=True)

    # Transaction proof/documentation
    receipt_url = models.URLField(max_length=500, null=True, blank=True)
    invoice_url = models.URLField(max_length=500, null=True, blank=True)
    proof_of_payment_url = models.URLField(max_length=500, null=True, blank=True)

    # Description and notes
    description = models.TextField()
    internal_notes = models.TextField(blank=True, help_text="Private admin notes")

    # Payment gateway reference
    payment_gateway = models.CharField(max_length=50, blank=True)  # Paystack, Flutterwave, etc.
    gateway_reference = models.CharField(max_length=255, blank=True)
    gateway_response = models.JSONField(null=True, blank=True)

    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)

    # Approval tracking
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_transactions'
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-initiated_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['blockchain_hash']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['program', 'status']),
            models.Index(fields=['-initiated_at']),
            models.Index(fields=['status', 'transaction_type']),
        ]

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} {self.currency} ({self.transaction_id})"

    @property
    def is_completed(self):
        return self.status == TransactionStatus.COMPLETED

    @property
    def is_pending(self):
        return self.status == TransactionStatus.PENDING

    def generate_blockchain_hash(self):
        """Generate blockchain hash for this transaction"""
        transaction_data = {
            'transaction_id': self.transaction_id,
            'transaction_type': self.transaction_type,
            'amount': str(self.amount),
            'currency': self.currency,
            'program_id': self.program.id,
            'user_id': self.user.id,
            'timestamp': self.initiated_at.isoformat() if self.initiated_at else timezone.now().isoformat(),
            'previous_hash': self.previous_block_hash or '0',
        }
        transaction_string = json.dumps(transaction_data, sort_keys=True)
        return hashlib.sha256(transaction_string.encode()).hexdigest()

    def complete(self):
        """Mark transaction as completed"""
        if self.status != TransactionStatus.COMPLETED:
            self.status = TransactionStatus.COMPLETED
            self.completed_at = timezone.now()
            if not self.blockchain_hash:
                self.blockchain_hash = self.generate_blockchain_hash()
            self.save()

    def fail(self):
        """Mark transaction as failed"""
        self.status = TransactionStatus.FAILED
        self.failed_at = timezone.now()
        self.save()


class Beneficiary(models.Model):
    """Program beneficiary record - approved applicants"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='beneficiary_records'
    )
    program = models.ForeignKey(
        'programs.Program',
        on_delete=models.CASCADE,
        related_name='beneficiaries'
    )
    application = models.OneToOneField(
        'applications.Application',
        on_delete=models.CASCADE,
        related_name='beneficiary_record'
    )

    # Beneficiary story
    story = models.TextField(help_text="Beneficiary's story and background")
    impact_statement = models.TextField(blank=True, help_text="How the program impacted them")

    # Financial tracking
    amount_received = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    amount_spent = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    # Location and demographics
    location = models.CharField(max_length=255)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Nigeria')

    # Age bracket for privacy
    age_bracket = models.CharField(
        max_length=20,
        choices=[
            ('18-24', '18-24 years'),
            ('25-34', '25-34 years'),
            ('35-44', '35-44 years'),
            ('45-54', '45-54 years'),
            ('55+', '55+ years'),
        ],
        blank=True
    )

    # Public display settings
    is_public = models.BooleanField(
        default=True,
        help_text="Show on public transparency page"
    )
    display_name = models.CharField(
        max_length=255,
        help_text="Public display name (can be anonymized)"
    )
    profile_image_url = models.URLField(max_length=500, blank=True)

    # Program participation timeline
    joined_date = models.DateField()
    expected_completion_date = models.DateField(null=True, blank=True)
    actual_completion_date = models.DateField(null=True, blank=True)

    # Progress tracking
    completion_percentage = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    milestones_completed = models.PositiveIntegerField(default=0)
    total_milestones = models.PositiveIntegerField(default=0)

    # Status
    is_active = models.BooleanField(default=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('discontinued', 'Discontinued'),
        ],
        default='active'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Beneficiaries'
        indexes = [
            models.Index(fields=['program', 'is_public']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['-joined_date']),
        ]

    def __str__(self):
        return f"{self.display_name} - {self.program.title}"

    @property
    def amount_remaining(self):
        return self.amount_received - self.amount_spent

    @property
    def is_completed(self):
        return self.status == 'completed' and self.actual_completion_date is not None


class Disbursement(models.Model):
    """Individual fund disbursement record - links to transactions"""
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        related_name='disbursement_detail'
    )
    beneficiary = models.ForeignKey(
        Beneficiary,
        on_delete=models.CASCADE,
        related_name='disbursements'
    )

    # Disbursement details
    purpose = models.CharField(max_length=255)
    category = models.CharField(
        max_length=50,
        choices=[
            ('tuition', 'Tuition Fee'),
            ('materials', 'Learning Materials'),
            ('equipment', 'Equipment'),
            ('stipend', 'Living Stipend'),
            ('transportation', 'Transportation'),
            ('accommodation', 'Accommodation'),
            ('healthcare', 'Healthcare'),
            ('other', 'Other'),
        ]
    )

    # Supporting documentation
    budget_breakdown = models.JSONField(
        null=True,
        blank=True,
        help_text="Detailed breakdown of how funds will be used"
    )
    supporting_documents = models.JSONField(
        default=list,
        help_text="List of document URLs"
    )

    # Approval workflow
    requested_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='requested_disbursements'
    )
    requested_at = models.DateTimeField(auto_now_add=True)

    # Disbursement schedule
    scheduled_date = models.DateField()
    actual_date = models.DateField(null=True, blank=True)

    # Verification
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_disbursements'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-requested_at']
        indexes = [
            models.Index(fields=['beneficiary', '-requested_at']),
            models.Index(fields=['scheduled_date']),
        ]

    def __str__(self):
        return f"Disbursement: {self.purpose} - {self.transaction.amount} {self.transaction.currency}"


class Receipt(models.Model):
    """Receipt/proof of transaction"""
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='receipts'
    )

    # Receipt details
    receipt_number = models.CharField(max_length=100, unique=True)
    receipt_url = models.URLField(max_length=500)

    # Receipt metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='generated_receipts'
    )

    # Email tracking
    emailed_to = models.EmailField(blank=True)
    emailed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f"Receipt {self.receipt_number}"
