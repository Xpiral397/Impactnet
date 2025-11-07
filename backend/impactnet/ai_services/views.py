from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .face_verification_service import face_verification_service
from .models import FaceVerification
from django.utils import timezone


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
