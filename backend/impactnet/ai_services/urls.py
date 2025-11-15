from django.urls import path
from .views import StartFaceVerificationView, VerifyFaceView, CheckLivenessActionView, AIRewriteTextView

urlpatterns = [
    path('face-verify/start/', StartFaceVerificationView.as_view(), name='face-verify-start'),
    path('face-verify/complete/', VerifyFaceView.as_view(), name='face-verify-complete'),
    path('liveness-check/', CheckLivenessActionView.as_view(), name='liveness-check'),
    path('rewrite/', AIRewriteTextView.as_view(), name='ai-rewrite'),
]
