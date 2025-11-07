#!/bin/bash

# ImpactNet Backend API Setup Script
# This script creates all necessary API files for the application

set -e

echo "🚀 Setting up ImpactNet Backend API..."

# Navigate to backend
cd /Users/xpiral/Projects/ImpactNet/backend/impactnet

# Create posts serializers
echo "📝 Creating posts serializers..."
cat > posts/serializers.py << 'EOF'
from rest_framework import serializers
from .models import Post, Comment, Goal, GoalContribution, GoalContributionComment, PostLike
from users.serializers import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    likes_count = serializers.ReadOnlyField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'parent_comment',
                  'likes_count', 'created_at', 'updated_at', 'replies']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'likes_count']

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []


class GoalContributionCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = GoalContributionComment
        fields = '__all__'
        read_only_fields = ['author', 'created_at', 'updated_at']


class GoalContributionSerializer(serializers.ModelSerializer):
    supporter = UserSerializer(read_only=True)
    comments = GoalContributionCommentSerializer(many=True, read_only=True)

    class Meta:
        model = GoalContribution
        fields = '__all__'
        read_only_fields = ['supporter', 'created_at', 'updated_at']


class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    supporters_count = serializers.ReadOnlyField()
    contributions = GoalContributionSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['raised_amount', 'created_at', 'updated_at',
                            'progress_percentage', 'supporters_count']


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    goal = GoalSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author', 'post_type', 'content', 'images', 'video_url',
                  'goal', 'comments', 'likes_count', 'comments_count', 'shares_count',
                  'is_public', 'is_pinned', 'is_featured', 'created_at', 'updated_at',
                  'is_liked']
        read_only_fields = ['id', 'author', 'likes_count', 'comments_count',
                            'shares_count', 'created_at', 'updated_at']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(post=obj, user=request.user).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    goal_data = GoalSerializer(required=False, write_only=True)

    class Meta:
        model = Post
        fields = ['content', 'post_type', 'images', 'video_url',
                  'is_public', 'goal_data']

    def create(self, validated_data):
        goal_data = validated_data.pop('goal_data', None)
        post = Post.objects.create(**validated_data)

        # Create goal if provided
        if goal_data:
            Goal.objects.create(post=post, **goal_data)

        return post
EOF

# Create posts views
echo "📝 Creating posts views..."
cat > posts/views.py << 'EOF'
from rest_framework import viewsets, decorators, status, permissions
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Post, Comment, Goal, GoalContribution, PostLike, CommentLike
from .serializers import (PostSerializer, PostCreateSerializer, CommentSerializer,
                          GoalSerializer, GoalContributionSerializer)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_approved=True).select_related('author').prefetch_related('comments', 'goal')
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PostCreateSerializer
        return PostSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(post_type=category)

        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(content__icontains=search) |
                Q(author__username__icontains=search)
            )

        return queryset.order_by('-is_pinned', '-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @decorators.action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user

        like, created = PostLike.objects.get_or_create(post=post, user=user)

        if not created:
            like.delete()
            post.likes_count = max(0, post.likes_count - 1)
            post.save()
            return Response({'liked': False, 'likes_count': post.likes_count})
        else:
            post.likes_count += 1
            post.save()
            return Response({'liked': True, 'likes_count': post.likes_count})

    @decorators.action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        post = self.get_object()

        if request.method == 'GET':
            comments = post.comments.filter(parent_comment=None)
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = CommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(post=post, author=request.user)
                post.comments_count += 1
                post.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @decorators.action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        post = self.get_object()
        post.shares_count += 1
        post.save()

        from .models import PostShare
        PostShare.objects.create(
            post=post,
            user=request.user,
            share_message=request.data.get('message', '')
        )

        return Response({'shares_count': post.shares_count})


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @decorators.action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        user = request.user

        like, created = CommentLike.objects.get_or_create(comment=comment, user=user)

        if not created:
            like.delete()
            comment.likes_count = max(0, comment.likes_count - 1)
            comment.save()
            return Response({'liked': False})
        else:
            comment.likes_count += 1
            comment.save()
            return Response({'liked': True})


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.filter(is_active=True).select_related('post')
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @decorators.action(detail=True, methods=['get'])
    def contributions(self, request, pk=None):
        goal = self.get_object()
        contributions = goal.contributions.filter(payment_status='completed').order_by('-created_at')
        serializer = GoalContributionSerializer(contributions, many=True)
        return Response(serializer.data)

    @decorators.action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def contribute(self, request, pk=None):
        goal = self.get_object()
        amount = request.data.get('amount')
        message = request.data.get('message', '')

        if not amount or float(amount) <= 0:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        contribution = GoalContribution.objects.create(
            goal=goal,
            supporter=request.user,
            amount=amount,
            message=message,
            payment_status='completed'  # In production, this would be 'pending' until Stripe confirms
        )

        # Update goal raised amount
        from decimal import Decimal
        goal.raised_amount += Decimal(str(amount))
        goal.save()

        serializer = GoalContributionSerializer(contribution)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
EOF

# Create posts URLs
echo "📝 Creating posts URLs..."
cat > posts/urls.py << 'EOF'
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, GoalViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('', include(router.urls)),
]
EOF

# Update posts admin
echo "📝 Updating posts admin..."
cat > posts/admin.py << 'EOF'
from django.contrib import admin
from .models import Post, Goal, GoalContribution, GoalContributionComment, Comment, PostLike, CommentLike, PostShare


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'post_type', 'created_at', 'likes_count', 'is_public']
    list_filter = ['post_type', 'is_public', 'is_approved', 'created_at']
    search_fields = ['content', 'author__username']
    date_hierarchy = 'created_at'


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'goal_type', 'raised_amount', 'target_amount', 'is_active']
    list_filter = ['goal_type', 'is_active']
    search_fields = ['post__content']


@admin.register(GoalContribution)
class GoalContributionAdmin(admin.ModelAdmin):
    list_display = ['id', 'goal', 'supporter', 'amount', 'payment_status', 'created_at']
    list_filter = ['payment_status', 'created_at']
    search_fields = ['supporter__username', 'message']


@admin.register(GoalContributionComment)
class GoalContributionCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'contribution', 'author', 'created_at']
    search_fields = ['content', 'author__username']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'author', 'created_at', 'likes_count']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username']


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'reaction_type', 'created_at']
    list_filter = ['reaction_type', 'created_at']


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'comment', 'user', 'created_at']


@admin.register(PostShare)
class PostShareAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'shared_at']
    list_filter = ['shared_at']
EOF

# Update users admin
echo "📝 Updating users admin..."
cat > users/admin.py << 'EOF'
from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Profile, TwoFactorAuth, EmailOTP, PhoneOTP, ActivityLog, Notification

User = get_user_model()


@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'role', 'is_verified', 'is_active', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    date_hierarchy = 'created_at'


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'occupation', 'education_level']
    search_fields = ['user__username', 'occupation']


@admin.register(TwoFactorAuth)
class TwoFactorAuthAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'is_enabled', 'enabled_at']
    list_filter = ['is_enabled']


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'purpose', 'is_used', 'expires_at', 'created_at']
    list_filter = ['purpose', 'is_used', 'created_at']


@admin.register(PhoneOTP)
class PhoneOTPAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'phone_number', 'purpose', 'is_used', 'expires_at']
    list_filter = ['purpose', 'is_used']


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'action_type', 'timestamp']
    list_filter = ['action_type', 'timestamp']
    search_fields = ['user__username', 'description']
    date_hierarchy = 'timestamp'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title', 'message']
EOF

# Create users views
echo "📝 Creating users views..."
cat > users/views.py << 'EOF'
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import *
from .models import TwoFactorAuth, ActivityLog
import pyotp
import qrcode
import io
import base64

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
EOF

# Create users URLs
echo "📝 Creating users URLs..."
cat > users/urls.py << 'EOF'
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('2fa/enable/', TwoFactorEnableView.as_view(), name='2fa-enable'),
    path('2fa/disable/', TwoFactorDisableView.as_view(), name='2fa-disable'),
    path('activity/', ActivityLogListView.as_view(), name='activity-log'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
]
EOF

echo "✅ API files created successfully!"
echo "📍 Next steps:"
echo "   1. Update impactnet/urls.py to include the API URLs"
echo "   2. Update settings.py with REST Framework configuration"
echo "   3. Run: python manage.py runserver"
echo "   4. Test APIs at: http://localhost:8000/api/"
