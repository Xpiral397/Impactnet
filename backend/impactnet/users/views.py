from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from .serializers import *
from .models import TwoFactorAuth, ActivityLog, EmailOTP
import pyotp
import qrcode
import io
import base64
import random

User = get_user_model()


def log_activity(user, action_type, description, request):
    """Helper to log user activity"""
    ActivityLog.objects.create(
        user=user,
        action_type=action_type,
        description=description,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Log activity
        log_activity(user, 'other', 'User registered', request)

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'},
                          status=status.HTTP_401_UNAUTHORIZED)

        # Check if 2FA is enabled
        if hasattr(user, 'two_factor') and user.two_factor.is_enabled:
            return Response({
                'requires_2fa': True,
                'user_id': user.id
            })

        # Log activity
        log_activity(user, 'login', 'User logged in', request)

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })


class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        log_activity(request.user, 'logout', 'User logged out', request)
        return Response({'message': 'Logged out successfully'})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        log_activity(request.user, 'profile_update', 'Profile updated', request)
        return response


class TwoFactorSetupView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # Generate secret
        secret = pyotp.random_base32()

        # Create or update 2FA
        two_factor, created = TwoFactorAuth.objects.get_or_create(user=user)
        two_factor.secret_key = secret
        two_factor.save()

        # Generate QR code
        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(
            name=user.email,
            issuer_name='ImpactNet'
        )

        # Create QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()

        return Response({
            'secret_key': secret,
            'qr_code': f'data:image/png;base64,{qr_code_base64}'
        })


class TwoFactorEnableView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')

        try:
            two_factor = TwoFactorAuth.objects.get(user=user)
            totp = pyotp.TOTP(two_factor.secret_key)

            if totp.verify(code):
                two_factor.is_enabled = True
                from django.utils import timezone
                two_factor.enabled_at = timezone.now()
                two_factor.save()

                log_activity(user, '2fa_enabled', '2FA enabled', request)

                return Response({'message': '2FA enabled successfully'})
            else:
                return Response({'error': 'Invalid code'},
                              status=status.HTTP_400_BAD_REQUEST)
        except TwoFactorAuth.DoesNotExist:
            return Response({'error': '2FA not set up'},
                          status=status.HTTP_400_BAD_REQUEST)


class TwoFactorDisableView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        try:
            two_factor = TwoFactorAuth.objects.get(user=user)
            two_factor.is_enabled = False
            two_factor.save()

            log_activity(user, '2fa_disabled', '2FA disabled', request)

            return Response({'message': '2FA disabled successfully'})
        except TwoFactorAuth.DoesNotExist:
            return Response({'error': '2FA not set up'},
                          status=status.HTTP_400_BAD_REQUEST)


class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ActivityLog.objects.filter(user=self.request.user)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.mark_as_read()
            return Response({'message': 'Notification marked as read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'},
                          status=status.HTTP_404_NOT_FOUND)


# ==================== OTP SYSTEM ====================

def generate_otp():
    """Generate 6-digit OTP"""
    return str(random.randint(100000, 999999))


def send_otp_email(user, otp_code, purpose):
    """Send OTP via email"""
    subject_map = {
        'login': 'ImpactNet - Login Verification Code',
        'signup': 'ImpactNet - Verify Your Email',
        'password_reset': 'ImpactNet - Password Reset Code',
    }
    
    message = f"""
Hello {user.first_name or user.username},

Your verification code is: {otp_code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
ImpactNet Team
"""
    
    send_mail(
        subject=subject_map.get(purpose, 'ImpactNet - Verification Code'),
        message=message,
        from_email=None,  # Uses DEFAULT_FROM_EMAIL
        recipient_list=[user.email],
        fail_silently=False,
    )


class SendOTPView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        purpose = request.data.get('purpose', 'login')
        
        if not email:
            return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Generate OTP
        otp_code = generate_otp()
        
        # Save OTP to database
        EmailOTP.objects.create(
            user=user,
            otp_code=otp_code,
            purpose=purpose,
            expires_at=timezone.now() + timedelta(minutes=10),
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Send email
        try:
            send_otp_email(user, otp_code, purpose)
            return Response({
                'message': 'OTP sent successfully',
                'email': user.email
            })
        except Exception as e:
            return Response({
                'error': f'Failed to send OTP: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        
        if not email or not otp_code:
            return Response({'error': 'Email and OTP required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Find valid OTP
        try:
            otp = EmailOTP.objects.filter(
                user=user,
                otp_code=otp_code,
                is_used=False,
                expires_at__gt=timezone.now()
            ).latest('created_at')
            
            # Mark as used
            otp.mark_as_used()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'OTP verified successfully',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
            
        except EmailOTP.DoesNotExist:
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if user exists
            return Response({'message': 'If email exists, reset code has been sent'})
        
        # Generate OTP
        otp_code = generate_otp()
        
        # Save OTP
        EmailOTP.objects.create(
            user=user,
            otp_code=otp_code,
            purpose='password_reset',
            expires_at=timezone.now() + timedelta(minutes=10),
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Send email
        try:
            send_otp_email(user, otp_code, 'password_reset')
        except Exception as e:
            print(f"Failed to send email: {e}")
        
        return Response({'message': 'If email exists, reset code has been sent'})


class PasswordResetConfirmView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        new_password = request.data.get('new_password')
        
        if not all([email, otp_code, new_password]):
            return Response({'error': 'All fields required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verify OTP
        try:
            otp = EmailOTP.objects.filter(
                user=user,
                otp_code=otp_code,
                purpose='password_reset',
                is_used=False,
                expires_at__gt=timezone.now()
            ).latest('created_at')
            
            # Mark as used
            otp.mark_as_used()
            
            # Change password
            user.set_password(new_password)
            user.save()
            
            log_activity(user, 'password_change', 'Password reset via OTP', request)
            
            return Response({'message': 'Password reset successfully'})
            
        except EmailOTP.DoesNotExist:
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
