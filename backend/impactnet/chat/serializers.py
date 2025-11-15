from rest_framework import serializers
from .models import Conversation, Message, AIResponse, ChatPrivacySettings
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar']

    def get_avatar(self, obj):
        # Generate UI Avatar
        full_name = f"{obj.first_name}+{obj.last_name}" if obj.first_name and obj.last_name else obj.username
        return f"https://ui-avatars.com/api/?name={full_name}&background=3B82F6&color=fff&size=128"


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    sender_id = serializers.IntegerField(write_only=True)
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_id', 'content',
                  'message_type', 'media_url', 'duration', 'is_read', 'created_at', 'timestamp']
        read_only_fields = ['id', 'created_at', 'timestamp']


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'participant_ids', 'is_ai_conversation',
                  'last_message', 'unread_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        conversation = Conversation.objects.create(**validated_data)

        if participant_ids:
            users = User.objects.filter(id__in=participant_ids)
            conversation.participants.set(users)

        return conversation


class AIResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIResponse
        fields = ['id', 'user_message', 'ai_response', 'context_tags', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChatPrivacySettingsSerializer(serializers.ModelSerializer):
    target_user_info = UserSerializer(source='target_user', read_only=True)
    is_blocked = serializers.ReadOnlyField()

    class Meta:
        model = ChatPrivacySettings
        fields = [
            'id', 'target_user', 'target_user_info',
            'can_view_status', 'can_view_profile',
            'can_call', 'can_video_call',
            'can_send_donate_request', 'can_tag',
            'mute_notifications', 'blocked_until', 'is_blocked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_blocked']
