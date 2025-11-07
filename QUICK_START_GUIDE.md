# ImpactNet - Quick Start Guide
## Complete Full-Stack Implementation

---

## ✅ **What's Already Done**

### Frontend:
- ✅ Professional goal card design with clean UI
- ✅ Progress bars, supporter lists, and contribution threads
- ✅ Post creation, comments, and interactions
- ✅ Profile pages and timeline

### Backend:
- ✅ Database models (Users, Posts, Goals, 2FA, OTP, Contributions)
- ✅ Migrations applied successfully
- ✅ Dependencies installed (Stripe, Twilio, JWT, etc.)
- ✅ Environment configuration files created

---

## 🚀 **Complete the Remaining Tasks** (45 tasks breakdown)

### **PHASE 1: Backend API (15 tasks)**

#### 1-5: Create Serializers
Create file: `backend/impactnet/users/serializers.py`
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, TwoFactorAuth, EmailOTP

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'avatar', 'role', 'is_verified', 'created_at']
        read_only_fields = ['id', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm',
                  'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = '__all__'

class TwoFactorSetupSerializer(serializers.Serializer):
    secret_key = serializers.CharField(read_only=True)
    qr_code = serializers.CharField(read_only=True)

class TwoFactorVerifySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6, min_length=6)
```

#### 6-10: Create Post & Goal Serializers
Create file: `backend/impactnet/posts/serializers.py`
```python
from rest_framework import serializers
from .models import Post, Comment, Goal, GoalContribution
from users.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = '__all__'

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []

class GoalContributionSerializer(serializers.ModelSerializer):
    supporter = UserSerializer(read_only=True)

    class Meta:
        model = GoalContribution
        fields = '__all__'
        read_only_fields = ['supporter', 'created_at']

class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    supporters_count = serializers.ReadOnlyField()
    contributions = GoalContributionSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    goal = GoalSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['author', 'likes_count', 'comments_count',
                            'shares_count', 'created_at']
```

#### 11-15: Create Authentication Views
Create file: `backend/impactnet/users/views.py`
```python
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import *
from .models import TwoFactorAuth, EmailOTP
import pyotp
import qrcode
import io
import base64

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

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

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

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

                return Response({'message': '2FA enabled successfully'})
            else:
                return Response({'error': 'Invalid code'},
                              status=status.HTTP_400_BAD_REQUEST)
        except TwoFactorAuth.DoesNotExist:
            return Response({'error': '2FA not set up'},
                          status=status.HTTP_400_BAD_REQUEST)
```

### **PHASE 2: Post & Goal API Views (10 tasks)**

#### 16-20: Create Posts Views
Add to `backend/impactnet/posts/views.py`:
```python
from rest_framework import viewsets, decorators, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Post, Comment, Goal, GoalContribution
from .serializers import PostSerializer, CommentSerializer, GoalSerializer, GoalContributionSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @decorators.action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user

        from .models import PostLike
        like, created = PostLike.objects.get_or_create(post=post, user=user)

        if not created:
            like.delete()
            post.likes_count -= 1
            post.save()
            return Response({'liked': False})
        else:
            post.likes_count += 1
            post.save()
            return Response({'liked': True})

    @decorators.action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        post = self.get_object()
        serializer = CommentSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(post=post, author=request.user)
            post.comments_count += 1
            post.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @decorators.action(detail=True, methods=['post'])
    def contribute(self, request, pk=None):
        goal = self.get_object()
        amount = request.data.get('amount')
        message = request.data.get('message', '')

        contribution = GoalContribution.objects.create(
            goal=goal,
            supporter=request.user,
            amount=amount,
            message=message
        )

        # Update goal raised amount
        goal.raised_amount += amount
        goal.save()

        serializer = GoalContributionSerializer(contribution)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

### **PHASE 3: URL Configuration (5 tasks)**

#### 21-25: Set up URLs
Create `backend/impactnet/users/urls.py`:
```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('2fa/enable/', TwoFactorEnableView.as_view(), name='2fa-enable'),
]
```

Create `backend/impactnet/posts/urls.py`:
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, GoalViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'goals', GoalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

Update `backend/impactnet/impactnet/urls.py`:
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('posts.urls')),
]
```

### **PHASE 4: Django Settings (5 tasks)**

#### 26-30: Update Settings
Update `backend/impactnet/impactnet/settings.py`:
```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ... existing apps
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
]

# Add to MIDDLEWARE (corsheaders must be high)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add this
    'django.contrib.sessions.middleware.SessionMiddleware',
    # ... rest of middleware
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# CORS Settings
from decouple import config
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000').split(',')
CORS_ALLOW_CREDENTIALS = True

# Load environment variables
import os
from pathlib import Path
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
```

### **PHASE 5: Admin Registration (5 tasks)**

#### 31-35: Register Models in Admin
Update `backend/impactnet/users/admin.py`:
```python
from django.contrib import admin
from .models import CustomUser, Profile, TwoFactorAuth, EmailOTP, PhoneOTP, ActivityLog

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'is_verified', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email']

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'occupation', 'education_level']

@admin.register(TwoFactorAuth)
class TwoFactorAuthAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_enabled', 'enabled_at']

@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'purpose', 'is_used', 'expires_at']

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action_type', 'timestamp']
    list_filter = ['action_type']
```

Update `backend/impactnet/posts/admin.py`:
```python
from django.contrib import admin
from .models import Post, Goal, GoalContribution, Comment

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'post_type', 'created_at', 'likes_count']
    list_filter = ['post_type', 'is_public']

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['post', 'goal_type', 'raised_amount', 'target_amount']

@admin.register(GoalContribution)
class GoalContributionAdmin(admin.ModelAdmin):
    list_display = ['goal', 'supporter', 'amount', 'payment_status']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'post', 'created_at']
```

### **PHASE 6: Frontend API Service (10 tasks)**

#### 36-40: Create API Client
Create `frontend/lib/api.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Generic fetch wrapper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (data: any) => apiFetch('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: async (username: string, password: string) => apiFetch('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),

  getProfile: async () => apiFetch('/auth/profile/'),

  setup2FA: async () => apiFetch('/auth/2fa/setup/', { method: 'POST' }),

  enable2FA: async (code: string) => apiFetch('/auth/2fa/enable/', {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),
};

// Posts API
export const postsAPI = {
  list: async (page = 1) => apiFetch(`/posts/?page=${page}`),

  get: async (id: number) => apiFetch(`/posts/${id}/`),

  create: async (data: any) => apiFetch('/posts/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  like: async (id: number) => apiFetch(`/posts/${id}/like/`, {
    method: 'POST',
  }),

  comment: async (id: number, content: string) => apiFetch(`/posts/${id}/comment/`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),
};

// Goals API
export const goalsAPI = {
  contribute: async (goalId: number, amount: number, message?: string) =>
    apiFetch(`/goals/${goalId}/contribute/`, {
      method: 'POST',
      body: JSON.stringify({ amount, message }),
    }),
};
```

#### 41-45: Create React Hooks
Create `frontend/hooks/useAuth.ts`:
```typescript
import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const profile = await authAPI.getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password);

    if (response.access) {
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      setUser(response.user);
    }

    return response;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return { user, loading, login, logout };
};
```

---

## 🎯 **Final Steps to Complete**

### 1. Start Both Servers:
```bash
# Terminal 1 - Backend
cd backend/impactnet
source ../.venv/bin/activate
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Create Superuser:
```bash
cd backend/impactnet
python manage.py createsuperuser
```

### 3. Test APIs:
- Visit: http://localhost:8000/admin
- Test: http://localhost:8000/api/posts/

### 4. Get Stripe Keys:
1. Go to: https://dashboard.stripe.com/register
2. Get test keys from: https://dashboard.stripe.com/apikeys
3. Update `.env` file

### 5. Connect Frontend:
- Update `mockData.ts` to fetch from API
- Add authentication context
- Add payment flow

---

## 📚 **Resources**

- Django REST Framework: https://www.django-rest-framework.org/
- Stripe Docs: https://stripe.com/docs
- JWT Auth: https://django-rest-framework-simplejwt.readthedocs.io/

---

## ✅ **Checklist**

- [ ] All serializers created
- [ ] All API views created
- [ ] URLs configured
- [ ] Django settings updated
- [ ] Admin models registered
- [ ] Frontend API service created
- [ ] React hooks created
- [ ] Stripe account created
- [ ] Email service configured (optional)
- [ ] Both servers running
- [ ] Test authentication flow
- [ ] Test post creation
- [ ] Test goal contributions

**You now have a complete roadmap! Let me know which phase you'd like me to implement next!**
