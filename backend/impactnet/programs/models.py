from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.utils.text import slugify

User = get_user_model()


class ProgramCategory(models.TextChoices):
    HEALTHCARE = 'healthcare', 'Healthcare'
    SKILLS = 'skills', 'Skills Training'
    HOUSING = 'housing', 'Housing Support'
    EDUCATION = 'education', 'Education'


class ProgramStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    OPEN = 'open', 'Open for Applications'
    CLOSING_SOON = 'closing_soon', 'Closing Soon'
    CLOSED = 'closed', 'Closed'
    COMPLETED = 'completed', 'Completed'


class Program(models.Model):
    """Main program model for all support programs"""
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    category = models.CharField(max_length=20, choices=ProgramCategory.choices)
    description = models.TextField()
    reason = models.TextField(help_text="Why this program was established")

    # Images and media
    cover_image = models.URLField(max_length=500)
    thumbnail_image = models.URLField(max_length=500, blank=True, null=True)
    intro_video_url = models.URLField(max_length=500, blank=True, null=True)
    intro_video_thumbnail = models.URLField(max_length=500, blank=True, null=True)
    intro_video_duration = models.CharField(max_length=10, blank=True, null=True)
    intro_video_title = models.CharField(max_length=255, blank=True, null=True)

    # Program capacity
    total_spots = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    spots_filled = models.PositiveIntegerField(default=0)

    # Dates
    start_date = models.DateTimeField()
    close_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Status
    status = models.CharField(max_length=20, choices=ProgramStatus.choices, default=ProgramStatus.DRAFT)

    # Impact metrics
    total_beneficiaries = models.PositiveIntegerField(default=0)
    total_funds_disbursed = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Instructions
    how_to_apply = models.TextField()

    # Created by
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_programs')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'category']),
            models.Index(fields=['close_date']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def spots_available(self):
        return self.total_spots - self.spots_filled

    @property
    def is_full(self):
        return self.spots_filled >= self.total_spots


class ProgramQualification(models.Model):
    """Program qualification requirements"""
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='qualifications')
    requirement = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.program.title} - {self.requirement[:50]}"


class ProgramRequirement(models.Model):
    """Required documents for program application"""
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='requirements')
    document_name = models.CharField(max_length=255)
    is_required = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.program.title} - {self.document_name}"


class ProgramCriteria(models.Model):
    """Evaluation criteria for program applications"""
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='criteria')
    criterion_name = models.CharField(max_length=255)
    criterion_description = models.TextField()
    weight_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage weight in evaluation")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Program criteria'

    def __str__(self):
        return f"{self.program.title} - {self.criterion_name} ({self.weight_percentage}%)"


class ProgramBenefit(models.Model):
    """Benefits provided by the program"""
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='benefits')
    benefit_description = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.program.title} - {self.benefit_description[:50]}"


class ProgramTimeline(models.Model):
    """Application timeline phases"""
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='timeline')
    phase_name = models.CharField(max_length=255)
    duration = models.CharField(max_length=50)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.program.title} - {self.phase_name}"


class ProgramExecutive(models.Model):
    """Program review board / executives"""
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='executives')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='executive_programs')
    role = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)
    can_approve = models.BooleanField(default=True)
    can_reject = models.BooleanField(default=True)
    is_primary_reviewer = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']
        unique_together = ['program', 'user']

    def __str__(self):
        return f"{self.program.title} - {self.user.get_full_name()} ({self.role})"


class ProgramUpdate(models.Model):
    """Program updates and announcements"""
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='updates')
    content = models.TextField()
    image = models.URLField(max_length=500, blank=True, null=True)
    posted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    likes_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-posted_at']

    def __str__(self):
        return f"{self.program.title} - Update {self.posted_at.strftime('%Y-%m-%d')}"
