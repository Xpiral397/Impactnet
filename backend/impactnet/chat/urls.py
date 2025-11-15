from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, MessageViewSet, AIResponseViewSet, ChatPrivacySettingsViewSet

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'ai-responses', AIResponseViewSet, basename='ai-response')
router.register(r'privacy-settings', ChatPrivacySettingsViewSet, basename='privacy-settings')

urlpatterns = [
    path('', include(router.urls)),
]
