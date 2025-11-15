from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .face_verification_service import face_verification_service
from .models import FaceVerification
from django.utils import timezone
from django.conf import settings

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


class StartFaceVerificationView(APIView):
    """Start face verification process"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Generate random liveness actions
        actions = face_verification_service.generate_liveness_challenge(num_actions=3)

        # Create verification record
        verification = FaceVerification.objects.create(
            user=request.user,
            reference_image_url=request.data.get('reference_image'),
            verification_image_url='',
            liveness_required=True,
            liveness_actions_required=actions
        )

        return Response({
            'verification_id': verification.id,
            'liveness_actions': actions,
            'message': 'Please complete the liveness actions'
        })


class VerifyFaceView(APIView):
    """Verify face with liveness detection"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        verification_id = request.data.get('verification_id')
        verification_image = request.data.get('verification_image')
        liveness_actions = request.data.get('liveness_actions', [])

        try:
            verification = FaceVerification.objects.get(id=verification_id, user=request.user)
        except FaceVerification.DoesNotExist:
            return Response({'error': 'Verification not found'}, status=status.HTTP_404_NOT_FOUND)

        verification.verification_image_url = verification_image

        result = face_verification_service.verify_with_liveness(
            verification.reference_image_url,
            verification_image,
            liveness_actions
        )

        verification.face_match_score = result.get('face_match_score', 0)
        verification.liveness_score = result.get('liveness_score', 0)
        verification.confidence_score = result.get('confidence_score', 0)
        verification.liveness_actions_completed = liveness_actions
        verification.analysis_results = result
        verification.completed_at = timezone.now()

        if result.get('verification_passed'):
            verification.pass_verification()
        else:
            verification.fail_verification('Verification failed')

        verification.save()

        return Response({
            'success': result.get('success'),
            'verification_passed': result.get('verification_passed'),
            'face_match_score': result.get('face_match_score'),
            'liveness_score': result.get('liveness_score'),
            'confidence_score': result.get('confidence_score'),
            'message': 'Verification passed!' if result.get('verification_passed') else 'Verification failed'
        })


class CheckLivenessActionView(APIView):
    """Check if a single liveness action was performed"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action = request.data.get('action')
        image = request.data.get('image')

        result = face_verification_service.detect_liveness(image, action)

        return Response(result)


class AIRewriteTextView(APIView):
    """Rewrite text using AI to make it better"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '')
        context = request.data.get('context', 'comment')  # comment, post, message

        if not text or not text.strip():
            return Response(
                {'error': 'Text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Check if anthropic is available
            if not ANTHROPIC_AVAILABLE:
                return Response({
                    'original': text,
                    'rewritten': text,
                    'message': 'AI service not available'
                })

            # Initialize Anthropic client
            api_key = getattr(settings, 'ANTHROPIC_API_KEY', None)
            if not api_key:
                # Return original text if no API key
                return Response({
                    'original': text,
                    'rewritten': text,
                    'message': 'AI service not configured'
                })

            client = anthropic.Anthropic(api_key=api_key)

            # Create prompt based on context
            prompts = {
                'comment': 'Rewrite this comment to be more clear, concise, and professional while maintaining the original meaning. Keep it friendly and authentic:',
                'post': 'Rewrite this post to be more engaging and impactful while maintaining authenticity:',
                'message': 'Rewrite this message to be more clear and friendly:'
            }

            prompt = prompts.get(context, prompts['comment'])

            # Call Claude API
            message = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1024,
                messages=[{
                    "role": "user",
                    "content": f"{prompt}\n\n{text}"
                }]
            )

            rewritten_text = message.content[0].text.strip()

            return Response({
                'success': True,
                'original': text,
                'rewritten': rewritten_text
            })

        except Exception as e:
            return Response(
                {'error': f'AI service error: {str(e)}', 'original': text, 'rewritten': text},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
