from django.contrib import admin
from .models import Conversation, Message, AIResponse


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_participants', 'is_ai_conversation', 'created_at', 'updated_at']
    list_filter = ['is_ai_conversation', 'created_at']
    search_fields = ['participants__username']

    def get_participants(self, obj):
        return ', '.join([u.username for u in obj.participants.all()])
    get_participants.short_description = 'Participants'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'get_content_preview', 'message_type', 'is_read', 'created_at']
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['content', 'sender__username']

    def get_content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    get_content_preview.short_description = 'Content'


@admin.register(AIResponse)
class AIResponseAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_user_message_preview', 'get_ai_response_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user_message', 'ai_response']

    def get_user_message_preview(self, obj):
        return obj.user_message[:50] + '...' if len(obj.user_message) > 50 else obj.user_message
    get_user_message_preview.short_description = 'User Message'

    def get_ai_response_preview(self, obj):
        return obj.ai_response[:50] + '...' if len(obj.ai_response) > 50 else obj.ai_response
    get_ai_response_preview.short_description = 'AI Response'
