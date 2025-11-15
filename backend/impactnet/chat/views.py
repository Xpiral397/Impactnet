from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Max
from .models import Conversation, Message, AIResponse, ChatPrivacySettings
from .serializers import ConversationSerializer, MessageSerializer, AIResponseSerializer, ChatPrivacySettingsSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class ConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing conversations
    """
    serializer_class = ConversationSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing

    def get_queryset(self):
        # Temporarily return all conversations for testing
        return Conversation.objects.all().prefetch_related('participants', 'messages').annotate(
            last_message_time=Max('messages__created_at')
        ).order_by('-last_message_time')

    @action(detail=False, methods=['post'])
    def get_or_create(self, request):
        """
        Get or create a conversation with a specific user
        """
        other_user_id = request.data.get('user_id')

        if not other_user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if conversation already exists
        conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=other_user
        ).first()

        if not conversation:
            # Create new conversation
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, other_user)

        serializer = self.get_serializer(conversation)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing messages
    """
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing

    def get_queryset(self):
        # Temporarily return all messages for testing
        conversation_id = self.request.query_params.get('conversation_id')

        if conversation_id:
            return Message.objects.filter(
                conversation_id=conversation_id
            ).select_related('sender', 'conversation')

        return Message.objects.all().select_related('sender', 'conversation')

    def create(self, request, *args, **kwargs):
        """
        Create a new message and trigger auto-reply if needed
        """
        data = request.data.copy()
        data['sender_id'] = request.user.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()

        # Mark conversation as updated
        message.conversation.save()  # Updates updated_at

        # Trigger auto-reply task (will be implemented with Celery)
        # from .tasks import trigger_auto_reply
        # trigger_auto_reply.delay(message.id)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        """
        Mark messages as read
        """
        message_ids = request.data.get('message_ids', [])

        if not message_ids:
            return Response(
                {'error': 'message_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        Message.objects.filter(
            id__in=message_ids,
            conversation__participants=request.user
        ).exclude(sender=request.user).update(is_read=True)

        return Response({'status': 'messages marked as read'})


class AIResponseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AI responses
    """
    serializer_class = AIResponseSerializer
    permission_classes = [IsAuthenticated]
    queryset = AIResponse.objects.all()

    @action(detail=False, methods=['post'])
    def generate_response(self, request):
        """
        Generate an AI response based on user message
        """
        user_message = request.data.get('message')

        if not user_message:
            return Response(
                {'error': 'message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Simple AI response logic (will be enhanced with Google API)
        ai_response = self._generate_simple_response(user_message)

        # Save the interaction
        ai_response_obj = AIResponse.objects.create(
            user_message=user_message,
            ai_response=ai_response,
            context_tags=self._extract_context_tags(user_message)
        )

        serializer = self.get_serializer(ai_response_obj)
        return Response(serializer.data)

    def _generate_simple_response(self, message):
        """
        Generate a simple rule-based response
        """
        message_lower = message.lower()

        if any(word in message_lower for word in ['donate', 'donation', 'fund', 'money']):
            return "I can help you create a donation campaign! Would you like to start one now?"

        if any(word in message_lower for word in ['volunteer', 'help', 'join']):
            return "That's wonderful! I can connect you with volunteering opportunities. What causes are you interested in?"

        if any(word in message_lower for word in ['project', 'initiative', 'start']):
            return "Starting a community project is great! I can guide you through the process. What kind of impact do you want to make?"

        if any(word in message_lower for word in ['event', 'meetup', 'gathering']):
            return "Planning an event? I can help you organize it and find participants. Tell me more about your event!"

        return "I'm here to help you make an impact! Tell me more about what you're trying to achieve."

    def _extract_context_tags(self, message):
        """
        Extract context tags from message
        """
        tags = []
        message_lower = message.lower()

        keywords_map = {
            'donation': ['donate', 'donation', 'fund', 'money', 'contribute'],
            'volunteer': ['volunteer', 'help', 'join', 'participate'],
            'project': ['project', 'initiative', 'campaign'],
            'event': ['event', 'meetup', 'gathering', 'meeting'],
        }

        for tag, keywords in keywords_map.items():
            if any(keyword in message_lower for keyword in keywords):
                tags.append(tag)

        return tags


class ChatPrivacySettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing per-user chat privacy settings
    Each user can set different privacy rules for each person they chat with
    """
    serializer_class = ChatPrivacySettingsSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing

    def get_queryset(self):
        # Temporarily return all settings for testing
        # In production, this should filter by owner=request.user
        return ChatPrivacySettings.objects.all().select_related('owner', 'target_user')

    @action(detail=False, methods=['get'])
    def for_user(self, request):
        """
        Get privacy settings for a specific target user
        If settings don't exist, create default settings
        """
        target_user_id = request.query_params.get('target_user_id')

        if not target_user_id:
            return Response(
                {'error': 'target_user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Target user not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get or create settings for this user pair
        # For testing, use user ID 1 as owner
        owner_id = request.query_params.get('owner_id', 1)
        try:
            owner = User.objects.get(id=owner_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Owner user not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        settings, created = ChatPrivacySettings.objects.get_or_create(
            owner=owner,
            target_user=target_user,
            defaults={
                'can_view_status': True,
                'can_view_profile': True,
                'can_call': True,
                'can_video_call': True,
                'can_send_donate_request': True,
                'can_tag': True,
                'mute_notifications': False,
            }
        )

        serializer = self.get_serializer(settings)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_for_user(self, request):
        """
        Update privacy settings for a specific target user
        """
        target_user_id = request.data.get('target_user_id')

        if not target_user_id:
            return Response(
                {'error': 'target_user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Target user not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # For testing, use user ID from request or default to 1
        owner_id = request.data.get('owner_id', 1)
        try:
            owner = User.objects.get(id=owner_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Owner user not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get or create settings
        settings, created = ChatPrivacySettings.objects.get_or_create(
            owner=owner,
            target_user=target_user
        )

        # Update settings with provided data
        for field in ['can_view_status', 'can_view_profile', 'can_call',
                     'can_video_call', 'can_send_donate_request', 'can_tag',
                     'mute_notifications', 'blocked_until']:
            if field in request.data:
                setattr(settings, field, request.data[field])

        settings.save()

        serializer = self.get_serializer(settings)
        return Response(serializer.data)
