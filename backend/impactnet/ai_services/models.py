from django.db import models
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class VerificationType(models.TextChoices):
    """Types of AI verification"""
    FACE_VERIFICATION = 'face_verification', 'Face Verification'
    LIVENESS_DETECTION = 'liveness_detection', 'Liveness Detection'
    DOCUMENT_VERIFICATION = 'document_verification', 'Document Verification'
    IMAGE_MODERATION = 'image_moderation', 'Image Content Moderation'


class VerificationStatus(models.TextChoices):
    """Verification status"""
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    PASSED = 'passed', 'Passed'
    FAILED = 'failed', 'Failed'
    REJECTED = 'rejected', 'Rejected'


class LivenessAction(models.TextChoices):
    """Liveness detection actions"""
    SMILE = 'smile', 'Smile'
    OPEN_MOUTH = 'open_mouth', 'Open Mouth'
    CLOSE_EYES = 'close_eyes', 'Close Eyes'
    TURN_LEFT = 'turn_left', 'Turn Head Left'
    TURN_RIGHT = 'turn_right', 'Turn Head Right'
    BLINK = 'blink', 'Blink'


class FaceVerification(models.Model):
    """Face verification and liveness detection records"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='face_verifications'
    )

    # Verification type
    verification_type = models.CharField(
        max_length=30,
        choices=VerificationType.choices,
        default=VerificationType.FACE_VERIFICATION
    )

    # Reference images
    reference_image_url = models.URLField(
        max_length=500,
        help_text="Original profile/ID photo"
    )
    verification_image_url = models.URLField(
        max_length=500,
        help_text="Live captured photo"
    )

    # Liveness detection
    liveness_required = models.BooleanField(default=True)
    liveness_actions_required = models.JSONField(
        default=list,
        help_text="List of required actions: ['smile', 'open_mouth', 'blink']"
    )
    liveness_actions_completed = models.JSONField(
        default=list,
        help_text="List of completed actions with timestamps"
    )
    liveness_video_url = models.URLField(max_length=500, blank=True)

    # AI Analysis Results
    face_match_score = models.FloatField(
        null=True,
        blank=True,
        help_text="Similarity score 0-100"
    )
    liveness_score = models.FloatField(
        null=True,
        blank=True,
        help_text="Liveness detection score 0-100"
    )
    confidence_score = models.FloatField(
        null=True,
        blank=True,
        help_text="Overall confidence 0-100"
    )

    # Verification status
    status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )

    # AI Model info
    ai_model_used = models.CharField(
        max_length=100,
        default='deepface',
        help_text="AI model: deepface, face-api, mediapipe, etc"
    )
    ai_provider = models.CharField(
        max_length=100,
        default='local',
        help_text="Provider: local, aws-rekognition, azure-face, etc"
    )

    # Detailed results
    analysis_results = models.JSONField(
        default=dict,
        help_text="Full AI analysis response"
    )

    # Failure reasons
    failure_reason = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)

    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    device_info = models.JSONField(default=dict, blank=True)

    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-initiated_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['verification_type', 'status']),
            models.Index(fields=['-initiated_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.verification_type} ({self.status})"

    @property
    def is_passed(self):
        return self.status == VerificationStatus.PASSED

    @property
    def all_liveness_actions_completed(self):
        if not self.liveness_required:
            return True
        required = set(self.liveness_actions_required)
        completed = set([a['action'] for a in self.liveness_actions_completed])
        return required.issubset(completed)

    def pass_verification(self):
        """Mark verification as passed"""
        from django.utils import timezone
        self.status = VerificationStatus.PASSED
        self.completed_at = timezone.now()
        self.save()

        # Update user verification status
        self.user.is_verified = True
        self.user.verified_at = timezone.now()
        self.user.save()

    def fail_verification(self, reason=''):
        """Mark verification as failed"""
        from django.utils import timezone
        self.status = VerificationStatus.FAILED
        self.completed_at = timezone.now()
        self.failure_reason = reason
        self.save()


class ImageModeration(models.Model):
    """AI-powered image content moderation"""
    # Image details
    image_url = models.URLField(max_length=500)
    image_type = models.CharField(
        max_length=50,
        choices=[
            ('profile', 'Profile Picture'),
            ('post', 'Post Image'),
            ('document', 'Document'),
            ('other', 'Other'),
        ]
    )

    # Related entities
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='moderated_images'
    )
    post = models.ForeignKey(
        'posts.Post',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_images'
    )

    # Moderation results
    is_safe = models.BooleanField(default=True)
    is_appropriate = models.BooleanField(default=True)

    # Detection categories
    contains_nudity = models.BooleanField(default=False)
    contains_violence = models.BooleanField(default=False)
    contains_offensive_content = models.BooleanField(default=False)
    contains_text = models.BooleanField(default=False)

    # Confidence scores
    nudity_score = models.FloatField(default=0.0)
    violence_score = models.FloatField(default=0.0)
    offensive_score = models.FloatField(default=0.0)

    # AI analysis
    detected_labels = models.JSONField(
        default=list,
        help_text="List of detected labels/objects in image"
    )
    detected_text = models.TextField(blank=True)
    ai_model_used = models.CharField(max_length=100, default='vision-api')

    # Full response
    moderation_results = models.JSONField(default=dict)

    # Actions taken
    auto_rejected = models.BooleanField(default=False)
    flagged_for_review = models.BooleanField(default=False)
    review_notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_safe']),
            models.Index(fields=['image_type', '-created_at']),
        ]

    def __str__(self):
        safety = "Safe" if self.is_safe else "Unsafe"
        return f"{self.image_type} - {safety}"


class DocumentVerification(models.Model):
    """AI document verification (ID, certificates, etc)"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='document_verifications'
    )

    # Document details
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('national_id', 'National ID'),
            ('passport', 'Passport'),
            ('drivers_license', "Driver's License"),
            ('certificate', 'Certificate'),
            ('bank_statement', 'Bank Statement'),
            ('other', 'Other'),
        ]
    )
    document_image_url = models.URLField(max_length=500)
    document_back_image_url = models.URLField(max_length=500, blank=True)

    # Extracted data
    extracted_text = models.TextField(blank=True)
    extracted_data = models.JSONField(
        default=dict,
        help_text="Structured data: name, DOB, ID number, etc"
    )

    # Verification checks
    document_is_valid = models.BooleanField(default=False)
    document_is_authentic = models.BooleanField(default=False)
    document_is_expired = models.BooleanField(default=False)

    # Face matching (if applicable)
    face_match_with_profile = models.BooleanField(null=True, blank=True)
    face_match_score = models.FloatField(null=True, blank=True)

    # Status
    status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )

    # AI results
    verification_results = models.JSONField(default=dict)
    ai_model_used = models.CharField(max_length=100, default='tesseract-ocr')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.document_type} ({self.status})"


class AIModelConfig(models.Model):
    """Configuration for AI models and services"""
    name = models.CharField(max_length=100, unique=True)
    service_type = models.CharField(
        max_length=30,
        choices=VerificationType.choices
    )

    # Provider
    provider = models.CharField(
        max_length=100,
        choices=[
            ('local', 'Local (Self-hosted)'),
            ('openai', 'OpenAI'),
            ('google', 'Google Cloud Vision'),
            ('aws', 'AWS Rekognition'),
            ('azure', 'Azure Face API'),
            ('deepface', 'DeepFace'),
            ('mediapipe', 'MediaPipe'),
        ]
    )

    # API configuration
    api_key = models.CharField(max_length=500, blank=True)
    api_endpoint = models.URLField(max_length=500, blank=True)
    model_version = models.CharField(max_length=50, blank=True)

    # Thresholds
    min_confidence_score = models.FloatField(default=80.0)
    min_face_match_score = models.FloatField(default=85.0)
    min_liveness_score = models.FloatField(default=75.0)

    # Settings
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    config_json = models.JSONField(default=dict)

    # Usage limits
    daily_request_limit = models.IntegerField(default=1000)
    monthly_request_limit = models.IntegerField(default=30000)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.provider})"
