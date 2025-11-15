from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Conversation(models.Model):
    """A conversation between two users or user and AI"""
    participants = models.ManyToManyField(User, related_name='conversations')
    is_ai_conversation = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        participant_names = ', '.join([u.username for u in self.participants.all()[:2]])
        return f"Conversation: {participant_names}"

    @property
    def last_message(self):
        return self.messages.order_by('-created_at').first()


class Message(models.Model):
    """A single message in a conversation"""
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('voice', 'Voice'),
        ('video', 'Video'),
        ('image', 'Image'),
    ]

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    media_url = models.URLField(blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True, help_text='Duration in seconds for voice/video')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"


class AIResponse(models.Model):
    """Tracks AI responses for context-aware replies"""
    user_message = models.TextField()
    ai_response = models.TextField()
    context_tags = models.JSONField(default=list)  # Tags like 'donation', 'volunteer', etc.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI: {self.ai_response[:50]}"


class ChatPrivacySettings(models.Model):
    """Per-user chat privacy settings - each user can set different rules for each person they chat with"""
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chat_privacy_settings',
        help_text='The user who owns these settings'
    )
    target_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_privacy_settings',
        help_text='The user these settings apply to'
    )

    # What the target_user can do
    can_view_status = models.BooleanField(default=True, help_text='Can see online/offline status')
    can_view_profile = models.BooleanField(default=True, help_text='Can view full profile')
    can_call = models.BooleanField(default=True, help_text='Can make voice calls')
    can_video_call = models.BooleanField(default=True, help_text='Can make video calls')
    can_send_donate_request = models.BooleanField(default=True, help_text='Can send donation requests')
    can_tag = models.BooleanField(default=True, help_text='Can tag in posts')

    # Notification settings
    mute_notifications = models.BooleanField(default=False)

    # Temporary blocking
    blocked_until = models.DateTimeField(null=True, blank=True, help_text='Temporary block expiry time')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['owner', 'target_user']
        verbose_name = 'Chat Privacy Setting'
        verbose_name_plural = 'Chat Privacy Settings'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.owner.username}'s settings for {self.target_user.username}"

    @property
    def is_blocked(self):
        """Check if the target user is currently blocked"""
        if not self.blocked_until:
            return False
        from django.utils import timezone
        return timezone.now() < self.blocked_until
