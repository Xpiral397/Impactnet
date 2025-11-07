from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, RegexValidator

# ==================== CUSTOM USER MODEL ====================

class UserRole(models.TextChoices):
    """User role choices"""
    MEMBER = 'member', 'Member'
    EXECUTIVE = 'executive', 'Executive'
    MANAGER = 'manager', 'Manager'
    ADMIN = 'admin', 'Admin'
    SUPER_ADMIN = 'super_admin', 'Super Admin'


class CustomUser(AbstractUser):
    """
    Extended user model with role-based access control
    Replaces default Django User model
    """
    # Role management
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.MEMBER
    )

    # Contact information
    phone = models.CharField(
        max_length=20,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
        )],
        blank=True
    )

    # Location
    location = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Nigeria')

    # Profile
    avatar = models.URLField(max_length=500, blank=True, help_text="URL to user avatar image")
    bio = models.TextField(blank=True, max_length=500)

    # Verification
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether user has completed identity verification"
    )
    nin = models.CharField(
        max_length=11,
        unique=True,
        null=True,
        blank=True,
        help_text="National Identification Number (Nigeria)"
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    # Statistics
    applications_count = models.PositiveIntegerField(
        default=0,
        help_text="Total number of applications submitted"
    )
    approved_applications = models.PositiveIntegerField(
        default=0,
        help_text="Number of approved applications"
    )

    # Dates
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['role', 'is_active']),
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['is_verified']),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_member(self):
        return self.role == UserRole.MEMBER

    @property
    def is_executive(self):
        return self.role == UserRole.EXECUTIVE

    @property
    def is_manager(self):
        return self.role == UserRole.MANAGER

    @property
    def is_admin_user(self):
        return self.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username

    @property
    def success_rate(self):
        """Calculate application success rate"""
        if self.applications_count == 0:
            return 0
        return (self.approved_applications / self.applications_count) * 100


class Profile(models.Model):
    """
    Extended profile information for users
    Separated from CustomUser to keep auth model lean
    """
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    # Professional information
    occupation = models.CharField(max_length=255, blank=True)
    education_level = models.CharField(
        max_length=50,
        choices=[
            ('none', 'No Formal Education'),
            ('primary', 'Primary School'),
            ('secondary', 'Secondary School'),
            ('diploma', 'Diploma'),
            ('bachelor', 'Bachelor\'s Degree'),
            ('master', 'Master\'s Degree'),
            ('phd', 'PhD'),
        ],
        blank=True
    )

    # Financial information (for program eligibility)
    monthly_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    household_size = models.PositiveIntegerField(null=True, blank=True)

    # Emergency contact
    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relationship = models.CharField(max_length=100, blank=True)

    # Social links
    facebook_url = models.URLField(max_length=500, blank=True)
    twitter_url = models.URLField(max_length=500, blank=True)
    linkedin_url = models.URLField(max_length=500, blank=True)
    website_url = models.URLField(max_length=500, blank=True)

    # Preferences
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=True)
    newsletter_subscription = models.BooleanField(default=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Profile: {self.user.username}"


class Notification(models.Model):
    """User notifications"""
    NOTIFICATION_TYPES = [
        ('application_status', 'Application Status Update'),
        ('program_update', 'Program Update'),
        ('disbursement', 'Disbursement Notification'),
        ('message', 'New Message'),
        ('system', 'System Notification'),
        ('achievement', 'Achievement Unlocked'),
    ]

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()

    # Related object (optional)
    related_url = models.URLField(max_length=500, blank=True)
    related_id = models.PositiveIntegerField(null=True, blank=True)

    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
            models.Index(fields=['user', 'notification_type']),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.title}"

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class ActivityLog(models.Model):
    """
    Log of user activities for audit trail
    """
    ACTION_TYPES = [
        ('login', 'User Login'),
        ('logout', 'User Logout'),
        ('profile_update', 'Profile Updated'),
        ('application_submit', 'Application Submitted'),
        ('application_withdraw', 'Application Withdrawn'),
        ('document_upload', 'Document Uploaded'),
        ('video_upload', 'Video Uploaded'),
        ('review_submit', 'Review Submitted'),
        ('transaction', 'Transaction'),
        ('2fa_enabled', '2FA Enabled'),
        ('2fa_disabled', '2FA Disabled'),
        ('password_change', 'Password Changed'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )

    action_type = models.CharField(max_length=30, choices=ACTION_TYPES)
    description = models.TextField()

    # Additional data
    metadata = models.JSONField(
        null=True,
        blank=True,
        help_text="Additional context data for the action"
    )

    # IP tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action_type', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.action_type} at {self.timestamp}"


class TwoFactorAuth(models.Model):
    """
    Two-Factor Authentication settings for users
    """
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='two_factor'
    )

    # 2FA enabled/disabled
    is_enabled = models.BooleanField(default=False)

    # Secret key for TOTP (Time-based One-Time Password)
    secret_key = models.CharField(max_length=32, blank=True)

    # Backup codes (hashed)
    backup_codes = models.JSONField(
        default=list,
        help_text="List of hashed backup codes"
    )

    # Timestamps
    enabled_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"2FA for {self.user.username} - {'Enabled' if self.is_enabled else 'Disabled'}"


class EmailOTP(models.Model):
    """
    Email-based OTP for login and sensitive operations
    """
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='email_otps'
    )

    # OTP code (hashed in production)
    otp_code = models.CharField(max_length=6)

    # Purpose of OTP
    purpose = models.CharField(
        max_length=50,
        choices=[
            ('login', 'Login Verification'),
            ('signup', 'Signup Verification'),
            ('password_reset', 'Password Reset'),
            ('email_change', 'Email Change'),
            ('transaction', 'Transaction Verification'),
        ]
    )

    # Status
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)

    # Expiration
    expires_at = models.DateTimeField()

    # IP tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_used', 'expires_at']),
            models.Index(fields=['otp_code', 'is_used']),
        ]

    def __str__(self):
        return f"OTP for {self.user.username} - {self.purpose}"

    def is_valid(self):
        """Check if OTP is still valid"""
        from django.utils import timezone
        return not self.is_used and timezone.now() < self.expires_at

    def mark_as_used(self):
        """Mark OTP as used"""
        from django.utils import timezone
        self.is_used = True
        self.used_at = timezone.now()
        self.save()


class PhoneOTP(models.Model):
    """
    SMS-based OTP for phone verification and sensitive operations
    """
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='phone_otps'
    )

    phone_number = models.CharField(max_length=20)

    # OTP code (hashed in production)
    otp_code = models.CharField(max_length=6)

    # Purpose of OTP
    purpose = models.CharField(
        max_length=50,
        choices=[
            ('phone_verification', 'Phone Verification'),
            ('login', 'Login Verification'),
            ('transaction', 'Transaction Verification'),
        ]
    )

    # Status
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)

    # Expiration
    expires_at = models.DateTimeField()

    # Delivery status
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivery_status = models.CharField(max_length=50, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_used', 'expires_at']),
            models.Index(fields=['phone_number', 'is_used']),
        ]

    def __str__(self):
        return f"Phone OTP for {self.user.username} - {self.purpose}"

    def is_valid(self):
        """Check if OTP is still valid"""
        from django.utils import timezone
        return not self.is_used and timezone.now() < self.expires_at

    def mark_as_used(self):
        """Mark OTP as used"""
        from django.utils import timezone
        self.is_used = True
        self.used_at = timezone.now()
        self.save()
