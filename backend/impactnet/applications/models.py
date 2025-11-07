from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

User = get_user_model()


class ApplicationStatus(models.TextChoices):
    """Application workflow statuses"""
    DRAFT = 'draft', 'Draft'
    VIDEO_PENDING = 'video_pending', 'Video Pending'
    AI_INTERVIEW_PENDING = 'ai_interview_pending', 'AI Interview Pending'
    AI_INTERVIEW_COMPLETED = 'ai_interview_completed', 'AI Interview Completed'
    UNDER_REVIEW = 'under_review', 'Under Executive Review'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'
    WITHDRAWN = 'withdrawn', 'Withdrawn'


class Application(models.Model):
    """Main application model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE, related_name='applications')

    # Application status
    status = models.CharField(
        max_length=30,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.DRAFT
    )

    # Application data
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)

    # Rejection reason
    rejection_reason = models.TextField(blank=True)

    # Scoring
    final_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    # Blockchain reference for transparency
    blockchain_hash = models.CharField(max_length=64, unique=True, null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['program', 'status']),
            models.Index(fields=['blockchain_hash']),
            models.Index(fields=['-submitted_at']),
        ]
        unique_together = [['user', 'program']]  # One application per user per program

    def __str__(self):
        return f"{self.user.username} - {self.program.title} ({self.status})"

    @property
    def is_submitted(self):
        return self.submitted_at is not None

    @property
    def is_approved(self):
        return self.status == ApplicationStatus.APPROVED

    @property
    def is_rejected(self):
        return self.status == ApplicationStatus.REJECTED

    def submit(self):
        """Mark application as submitted"""
        if not self.submitted_at:
            self.submitted_at = timezone.now()
            self.status = ApplicationStatus.UNDER_REVIEW
            self.save()

    def approve(self):
        """Approve application"""
        self.status = ApplicationStatus.APPROVED
        self.approved_at = timezone.now()
        self.save()

    def reject(self, reason=''):
        """Reject application"""
        self.status = ApplicationStatus.REJECTED
        self.rejected_at = timezone.now()
        self.rejection_reason = reason
        self.save()


class VideoApplication(models.Model):
    """Video application submission"""
    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        related_name='video'
    )

    # Video storage (S3/CloudFlare R2)
    video_url = models.URLField(max_length=500)
    thumbnail_url = models.URLField(max_length=500, null=True, blank=True)

    # Video metadata
    duration = models.PositiveIntegerField(help_text="Duration in seconds")
    file_size = models.PositiveIntegerField(help_text="File size in bytes", null=True, blank=True)
    format = models.CharField(max_length=10, default='mp4')

    # AI-generated content
    transcript = models.TextField(null=True, blank=True, help_text="AI-generated transcript via Whisper")
    transcript_generated_at = models.DateTimeField(null=True, blank=True)

    # Upload info
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processing_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"Video for {self.application}"


class AIInterview(models.Model):
    """AI chat interview session"""
    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        related_name='ai_interview'
    )

    # Session timing
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_interaction_at = models.DateTimeField(auto_now=True)

    # AI evaluation
    ai_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    ai_recommendation = models.TextField(null=True, blank=True)

    # Interview metadata
    total_messages = models.PositiveIntegerField(default=0)
    flagged_responses = models.PositiveIntegerField(default=0)

    # Full transcript stored as JSON for quick access
    full_transcript = models.JSONField(
        default=list,
        help_text="List of {role, message, timestamp} objects"
    )

    # Session status
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"AI Interview for {self.application}"

    @property
    def is_completed(self):
        return self.completed_at is not None

    @property
    def duration_minutes(self):
        if self.completed_at and self.started_at:
            delta = self.completed_at - self.started_at
            return delta.total_seconds() / 60
        return None

    def complete(self):
        """Mark interview as completed"""
        if not self.completed_at:
            self.completed_at = timezone.now()
            self.is_active = False
            self.save()


class AIInterviewMessage(models.Model):
    """Individual AI chat messages - recorded permanently"""
    interview = models.ForeignKey(
        AIInterview,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    # Message content
    role = models.CharField(
        max_length=20,
        choices=[
            ('user', 'User'),
            ('assistant', 'AI Assistant'),
            ('system', 'System'),
        ]
    )
    content = models.TextField()

    # Message metadata
    timestamp = models.DateTimeField(auto_now_add=True)
    message_index = models.PositiveIntegerField(help_text="Order in conversation")

    # Verification and flags
    answer_verified = models.BooleanField(default=False)
    flagged_for_review = models.BooleanField(default=False)
    flag_reason = models.CharField(max_length=255, blank=True)

    # AI analysis
    sentiment_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Sentiment analysis score from -1 to 1"
    )

    class Meta:
        ordering = ['interview', 'message_index']
        indexes = [
            models.Index(fields=['interview', 'timestamp']),
            models.Index(fields=['interview', 'message_index']),
        ]

    def __str__(self):
        return f"{self.role} message at {self.timestamp}"


class ExecutiveReview(models.Model):
    """Executive review and scoring"""
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='executive_reviews'
    )
    executive = models.ForeignKey(
        'programs.ProgramExecutive',
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    # Individual criterion scores
    scores = models.JSONField(
        help_text="Dictionary mapping criterion_id to score value"
    )

    # Calculated total score
    total_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    # Review feedback
    notes = models.TextField(blank=True)
    strengths = models.TextField(blank=True, help_text="What the applicant did well")
    weaknesses = models.TextField(blank=True, help_text="Areas of concern")

    # Recommendation
    recommendation = models.CharField(
        max_length=20,
        choices=[
            ('approve', 'Approve'),
            ('reject', 'Reject'),
            ('revise', 'Request Revision'),
        ]
    )

    # Review metadata
    reviewed_at = models.DateTimeField(auto_now_add=True)
    time_spent_minutes = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-reviewed_at']
        unique_together = [['application', 'executive']]  # One review per executive per application
        indexes = [
            models.Index(fields=['application', 'recommendation']),
            models.Index(fields=['executive', '-reviewed_at']),
        ]

    def __str__(self):
        return f"Review by {self.executive.user.username} for {self.application}"

    @property
    def is_approved(self):
        return self.recommendation == 'approve'

    @property
    def is_rejected(self):
        return self.recommendation == 'reject'


class ApplicationDocument(models.Model):
    """Documents uploaded for application requirements"""
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    requirement = models.ForeignKey(
        'programs.ProgramRequirement',
        on_delete=models.CASCADE,
        related_name='uploaded_documents'
    )

    # Document storage
    document_url = models.URLField(max_length=500)
    document_name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=50)  # pdf, jpg, png, etc.
    file_size = models.PositiveIntegerField(help_text="File size in bytes")

    # Verification
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True)

    # Upload info
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        unique_together = [['application', 'requirement']]  # One document per requirement
        indexes = [
            models.Index(fields=['application', 'requirement']),
            models.Index(fields=['is_verified']),
        ]

    def __str__(self):
        return f"{self.document_name} for {self.application}"
