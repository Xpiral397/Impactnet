from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class Post(models.Model):
    """
    Social feed posts
    Can be from regular users or ImpactNet organization
    """
    POST_TYPES = [
        ('user', 'User Post'),
        ('impact', 'Impact Update'),
        ('announcement', 'Announcement'),
        ('beneficiary_story', 'Beneficiary Story'),
    ]

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts'
    )

    post_type = models.CharField(max_length=30, choices=POST_TYPES, default='user')

    # Content
    content = models.TextField()

    # Media
    images = models.JSONField(
        default=list,
        help_text="List of image URLs"
    )
    video_url = models.URLField(max_length=500, blank=True)

    # Related entities
    program = models.ForeignKey(
        'programs.Program',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts',
        help_text="Program this post is about (for impact updates)"
    )

    # Engagement stats
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    shares_count = models.PositiveIntegerField(default=0)

    # Visibility
    is_public = models.BooleanField(default=True)
    is_pinned = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    # Moderation
    is_approved = models.BooleanField(default=True)
    flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['author', '-created_at']),
            models.Index(fields=['post_type', '-created_at']),
            models.Index(fields=['is_public', 'is_approved']),
        ]

    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}..."


class ImpactPost(models.Model):
    """
    Special impact posts from ImpactNet organization
    Shows program updates with beneficiary cards
    """
    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name='impact_details'
    )

    program = models.ForeignKey(
        'programs.Program',
        on_delete=models.CASCADE,
        related_name='impact_posts'
    )

    # Impact metrics
    beneficiaries_count = models.PositiveIntegerField(default=0)
    total_impact_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    # Beneficiary stories
    beneficiaries = models.ManyToManyField(
        'transactions.Beneficiary',
        related_name='featured_in_posts',
        blank=True
    )

    # Metrics display
    metrics = models.JSONField(
        default=dict,
        help_text="Custom metrics to display (e.g., {'students_enrolled': 45, 'classes_completed': 12})"
    )

    class Meta:
        ordering = ['-post__created_at']

    def __str__(self):
        return f"Impact Post: {self.program.title}"


class PostLike(models.Model):
    """Post likes/reactions"""
    REACTION_TYPES = [
        ('like', 'Like'),
        ('love', 'Love'),
        ('celebrate', 'Celebrate'),
        ('support', 'Support'),
        ('insightful', 'Insightful'),
    ]

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='post_likes'
    )

    reaction_type = models.CharField(
        max_length=20,
        choices=REACTION_TYPES,
        default='like'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['post', 'user']]
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', 'reaction_type']),
        ]

    def __str__(self):
        return f"{self.user.username} {self.reaction_type}d post {self.post.id}"


class Comment(models.Model):
    """
    Comments on posts
    Supports threaded/nested replies
    """
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments'
    )

    # Comment content
    content = models.TextField()

    # Threading - for nested replies
    parent_comment = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )

    # Engagement
    likes_count = models.PositiveIntegerField(default=0)

    # Moderation
    is_approved = models.BooleanField(default=True)
    flagged = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'created_at']),
            models.Index(fields=['parent_comment', 'created_at']),
            models.Index(fields=['author', '-created_at']),
        ]

    def __str__(self):
        return f"{self.author.username} on post {self.post.id}: {self.content[:50]}..."

    @property
    def is_reply(self):
        return self.parent_comment is not None


class CommentLike(models.Model):
    """Likes on comments"""
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comment_likes'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['comment', 'user']]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} liked comment {self.comment.id}"


class PostShare(models.Model):
    """Track post shares"""
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='shares'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='post_shares'
    )

    # Share details
    share_message = models.TextField(blank=True)

    shared_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-shared_at']
        indexes = [
            models.Index(fields=['post', '-shared_at']),
            models.Index(fields=['user', '-shared_at']),
        ]

    def __str__(self):
        return f"{self.user.username} shared post {self.post.id}"


class Goal(models.Model):
    """
    Fundraising goals attached to posts
    Supports money, job, travel, and other goal types
    """
    GOAL_TYPES = [
        ('money', 'Money/Fundraising'),
        ('job', 'Job/Employment'),
        ('travel', 'Travel/Visit'),
        ('other', 'Other'),
    ]

    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name='goal'
    )

    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES, default='money')

    # For money goals
    target_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Target amount for fundraising"
    )
    raised_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    # For non-money goals
    target_description = models.TextField(
        blank=True,
        help_text="Description of goal (for job, travel, other)"
    )

    # Deadline
    deadline = models.DateField(null=True, blank=True)

    # Milestones (JSON)
    milestones = models.JSONField(
        default=list,
        help_text="List of milestone objects with title, amount, and reached status"
    )

    # Status
    is_active = models.BooleanField(default=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', 'is_active']),
            models.Index(fields=['goal_type', 'is_active']),
        ]

    def __str__(self):
        if self.goal_type == 'money':
            return f"Goal: ${self.raised_amount}/{self.target_amount} for post {self.post.id}"
        return f"Goal: {self.target_description[:50]} for post {self.post.id}"

    @property
    def progress_percentage(self):
        """Calculate progress percentage for money goals"""
        if self.goal_type == 'money' and self.target_amount:
            return (self.raised_amount / self.target_amount) * 100
        return 0

    @property
    def supporters_count(self):
        """Count unique supporters"""
        return self.contributions.values('supporter').distinct().count()


class GoalContribution(models.Model):
    """
    Individual contributions/support for goals
    """
    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name='contributions'
    )
    supporter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='goal_contributions'
    )

    # For money contributions
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    # Support message/note
    message = models.TextField(blank=True)

    # Payment info (if applicable)
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=255, blank=True)
    stripe_payment_intent = models.CharField(max_length=255, blank=True)

    # Status
    is_anonymous = models.BooleanField(default=False)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded'),
        ],
        default='completed'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['goal', '-created_at']),
            models.Index(fields=['supporter', '-created_at']),
            models.Index(fields=['payment_status']),
        ]

    def __str__(self):
        return f"{self.supporter.username} contributed ${self.amount} to goal {self.goal.id}"


class GoalContributionComment(models.Model):
    """
    Comments/replies on individual contributions (thread-style)
    """
    contribution = models.ForeignKey(
        GoalContribution,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='contribution_comments'
    )

    content = models.TextField()

    # Threading - for nested replies
    parent_comment = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['contribution', 'created_at']),
            models.Index(fields=['parent_comment', 'created_at']),
        ]

    def __str__(self):
        return f"{self.author.username} commented on contribution {self.contribution.id}"
