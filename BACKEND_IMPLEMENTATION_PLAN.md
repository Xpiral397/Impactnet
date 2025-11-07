# ImpactNet Backend Implementation Plan

## Overview
Complete backend implementation with authentication, 2FA, payments, and full API.

---

## Phase 1: Database & Models ✅ (COMPLETED)

### Completed:
- ✅ Custom User model with roles
- ✅ Profile model
- ✅ Activity logging
- ✅ Post models (Post, Comment, Likes, Shares)
- ✅ Goal models (Goal, GoalContribution, GoalContributionComment)
- ✅ 2FA models (TwoFactorAuth, EmailOTP, PhoneOTP)

---

## Phase 2: Install Dependencies & Migrations

### Tasks:
1. Install new packages:
   ```bash
   cd backend
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Create and run migrations:
   ```bash
   cd backend/impactnet
   python manage.py makemigrations
   python manage.py migrate
   ```

3. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

---

## Phase 3: Authentication API

### Endpoints to Create:

#### `/api/auth/`
- `POST /signup/` - User registration
- `POST /login/` - Login (returns JWT + requires 2FA if enabled)
- `POST /logout/` - Logout
- `POST /refresh/` - Refresh JWT token
- `GET /me/` - Get current user profile
- `PUT /me/` - Update profile

#### `/api/auth/2fa/`
- `POST /setup/` - Setup 2FA (generates secret, returns QR code)
- `POST /enable/` - Enable 2FA (verify code)
- `POST /disable/` - Disable 2FA
- `POST /verify/` - Verify 2FA code during login
- `POST /backup-codes/` - Generate backup codes

#### `/api/auth/otp/`
- `POST /send-email/` - Send email OTP
- `POST /send-sms/` - Send SMS OTP
- `POST /verify-email/` - Verify email OTP
- `POST /verify-sms/` - Verify SMS OTP

#### `/api/auth/password/`
- `POST /change/` - Change password (requires old password)
- `POST /reset/request/` - Request password reset (sends OTP)
- `POST /reset/confirm/` - Confirm password reset with OTP

---

## Phase 4: Posts & Goals API

#### `/api/posts/`
- `GET /` - List posts (with pagination, filters)
- `POST /` - Create post
- `GET /{id}/` - Get single post
- `PUT /{id}/` - Update post
- `DELETE /{id}/` - Delete post
- `POST /{id}/like/` - Like/unlike post
- `GET /{id}/likes/` - Get post likes
- `POST /{id}/share/` - Share post

#### `/api/posts/{id}/comments/`
- `GET /` - List comments
- `POST /` - Create comment
- `POST /{comment_id}/reply/` - Reply to comment
- `POST /{comment_id}/like/` - Like comment
- `DELETE /{comment_id}/` - Delete comment

#### `/api/goals/`
- `GET /` - List goals
- `POST /` - Create goal (attached to post)
- `GET /{id}/` - Get goal details
- `PUT /{id}/` - Update goal
- `GET /{id}/contributions/` - List contributions
- `POST /{id}/contribute/` - Create contribution (initiates payment)

---

## Phase 5: Payment Integration (Stripe)

#### `/api/payments/`
- `POST /create-payment-intent/` - Create Stripe payment intent
- `POST /confirm-payment/` - Confirm payment
- `GET /history/` - Payment history
- `POST /refund/` - Request refund
- `GET /webhooks/stripe/` - Stripe webhook handler

### Stripe Setup:
1. Create Stripe account
2. Get API keys (test & live)
3. Set up webhooks
4. Configure payment methods

---

## Phase 6: Activity & Notifications API

#### `/api/activity/`
- `GET /logs/` - Get user activity logs
- `GET /notifications/` - Get notifications
- `POST /notifications/{id}/read/` - Mark as read
- `POST /notifications/read-all/` - Mark all as read

---

## Phase 7: Environment Configuration

### Create `.env` file:
```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=7  # days

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SendGrid/Mailgun)
EMAIL_BACKEND=anymail.backends.sendgrid.EmailBackend
SENDGRID_API_KEY=your-sendgrid-key
DEFAULT_FROM_EMAIL=noreply@impactnet.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## Phase 8: Django Settings Configuration

### Update `settings.py`:
1. Add installed apps
2. Configure REST Framework
3. Configure JWT authentication
4. Configure CORS
5. Configure email backend
6. Configure Stripe
7. Add middleware

---

## Phase 9: Admin Panel

### Register models in admin:
- CustomUser
- Profile
- Post
- Goal
- GoalContribution
- TwoFactorAuth
- EmailOTP
- PhoneOTP
- ActivityLog

---

## Phase 10: Frontend Integration

### Create API service in Next.js:
```typescript
// frontend/lib/api.ts
- Authentication service
- Posts service
- Goals service
- Payments service
```

### Create hooks:
```typescript
// frontend/hooks/
- useAuth.ts
- usePosts.ts
- useGoals.ts
- usePayments.ts
```

---

## Phase 11: Testing

### Test endpoints:
1. Authentication flow
2. 2FA flow
3. Post CRUD
4. Goal contributions
5. Stripe payments
6. Email/SMS sending

---

## Phase 12: Deployment Preparation

### Tasks:
1. Set `DEBUG=False`
2. Configure static files
3. Set up PostgreSQL (production)
4. Configure Redis (caching)
5. Set up Celery (background tasks)
6. Configure domain & SSL
7. Set environment variables
8. Deploy to:
   - Heroku
   - Railway
   - DigitalOcean
   - AWS

---

## Security Checklist

- ✅ HTTPS only in production
- ✅ Secure JWT tokens
- ✅ Hash OTP codes
- ✅ Rate limiting on auth endpoints
- ✅ CORS configuration
- ✅ SQL injection protection (Django ORM)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Secure password hashing
- ✅ Activity logging
- ✅ 2FA support

---

## Next Steps

1. Run migrations
2. Create API serializers
3. Create API views
4. Create URL routing
5. Test with Postman/Thunder Client
6. Connect frontend
7. Deploy!
