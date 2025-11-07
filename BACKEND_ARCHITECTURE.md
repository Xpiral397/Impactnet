# ImpactNet Backend Architecture

## Professional Django + PostgreSQL + Blockchain Structure

### 🏗️ Architecture Overview

```
backend/
├── impactnet/               # Django project
│   ├── settings.py          # Django settings with PostgreSQL config
│   ├── urls.py              # Main URL routing
│   ├── wsgi.py             # WSGI for deployment
│   └── asgi.py             # ASGI for WebSockets
│
├── users/                   # User management app
│   ├── models.py            # CustomUser, Profile, Roles
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # Auth endpoints (JWT)
│   └── permissions.py       # Custom permissions
│
├── programs/                # Programs management
│   ├── models.py            # ✅ CREATED - Program, Qualifications, etc.
│   ├── serializers.py       # DRF serializers for all models
│   ├── views.py             # CRUD + List/Detail endpoints
│   ├── filters.py           # Django-filter for search
│   └── permissions.py       # Program-level permissions
│
├── applications/            # Application workflow
│   ├── models.py            # Application, VideoApplication, AIInterview
│   ├── serializers.py       # Full application flow serializers
│   ├── views.py             # Application CRUD + AI chat
│   ├── tasks.py             # Celery tasks for video processing
│   └── ai_service.py        # OpenAI integration for AI chat
│
├── transactions/            # Financial transactions
│   ├── models.py            # Transaction, Disbursement, Receipt
│   ├── serializers.py       # Transaction serializers
│   ├── views.py             # Transaction endpoints
│   └── services.py          # Payment processing logic
│
├── blockchain/              # Blockchain transparency layer
│   ├── models.py            # BlockchainTransaction, TransactionChain
│   ├── serializers.py       # Blockchain serializers
│   ├── views.py             # Chain query endpoints
│   ├── chain_service.py     # Blockchain creation & validation
│   └── graph_generator.py   # Transaction graph visualization
│
├── posts/                   # Social feed
│   ├── models.py            # Post, Reply, ImpactPost
│   ├── serializers.py       # Post serializers
│   ├── views.py             # Feed endpoints
│   └── permissions.py       # Post permissions
│
└── api/                     # Centralized API routing
    ├── v1/
    │   ├── urls.py          # API v1 routes
    │   └── views.py         # API overview
    └── middleware.py        # Custom middleware (rate limiting, etc.)
```

### 📊 Database Models Structure

#### 1. Programs App (✅ COMPLETED)
- **Program**: Main program with all details
- **ProgramQualification**: Requirements list
- **ProgramRequirement**: Documents needed
- **ProgramCriteria**: Evaluation criteria with weights
- **ProgramBenefit**: Benefits provided
- **ProgramTimeline**: Application phases
- **ProgramExecutive**: Review board members
- **ProgramUpdate**: Updates/announcements

#### 2. Applications App (TO BUILD)
```python
# applications/models.py

class ApplicationStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    VIDEO_PENDING = 'video_pending', 'Video Pending'
    AI_INTERVIEW_PENDING = 'ai_interview_pending', 'AI Interview Pending'
    AI_INTERVIEW_COMPLETED = 'ai_interview_completed', 'AI Interview Completed'
    UNDER_REVIEW = 'under_review', 'Under Executive Review'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'
    WITHDRAWN = 'withdrawn', 'Withdrawn'

class Application(models.Model):
    """Main application model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE)
    status = models.CharField(max_length=30, choices=ApplicationStatus.choices)

    # Application data
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    # Scoring
    final_score = models.DecimalField(max_digits=5, decimal_places=2, null=True)

    # Blockchain reference
    blockchain_hash = models.CharField(max_length=64, unique=True, null=True)

class VideoApplication(models.Model):
    """Video application submission"""
    application = models.OneToOneField(Application, on_delete=models.CASCADE)
    video_url = models.URLField(max_length=500)  # S3/CloudFlare URL
    duration = models.PositiveIntegerField()  # seconds
    thumbnail_url = models.URLField(max_length=500, null=True)
    transcript = models.TextField(null=True)  # AI-generated transcript
    uploaded_at = models.DateTimeField(auto_now_add=True)

class AIInterview(models.Model):
    """AI chat interview session"""
    application = models.OneToOneField(Application, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True)

    # AI evaluation
    ai_score = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    ai_recommendation = models.TextField(null=True)

    # Full transcript recorded
    full_transcript = models.JSONField(default=list)  # [{role, message, timestamp}]

class AIInterviewMessage(models.Model):
    """Individual AI chat messages - recorded permanently"""
    interview = models.ForeignKey(AIInterview, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20)  # 'user' or 'assistant'
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    # Verification check
    answer_verified = models.BooleanField(default=False)
    flagged_for_review = models.BooleanField(default=False)

class ExecutiveReview(models.Model):
    """Executive review and scoring"""
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='reviews')
    executive = models.ForeignKey('programs.ProgramExecutive', on_delete=models.CASCADE)

    # Individual criterion scores
    scores = models.JSONField()  # {criterion_id: score}
    total_score = models.DecimalField(max_digits=5, decimal_places=2)

    # Review notes
    notes = models.TextField(blank=True)
    recommendation = models.CharField(max_length=20)  # approve/reject/revise

    reviewed_at = models.DateTimeField(auto_now_add=True)
```

#### 3. Transactions App (TO BUILD)
```python
# transactions/models.py

class Transaction(models.Model):
    """Financial transaction record"""
    application = models.ForeignKey('applications.Application', on_delete=models.PROTECT)
    transaction_type = models.CharField(max_length=30)  # disbursement, refund, etc.

    # Amount
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='NGN')

    # Recipient
    recipient_name = models.CharField(max_length=255)
    recipient_account = models.CharField(max_length=100, blank=True)

    # Status
    status = models.CharField(max_length=20)  # pending, completed, failed

    # Blockchain
    blockchain_hash = models.CharField(max_length=64, unique=True)
    previous_block_hash = models.CharField(max_length=64, null=True)

    # Proof
    receipt_url = models.URLField(max_length=500, null=True)
    invoice_url = models.URLField(max_length=500, null=True)

    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True)

class Beneficiary(models.Model):
    """Program beneficiary record"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    program = models.ForeignKey('programs.Program', on_delete=models.CASCADE)
    application = models.OneToOneField('applications.Application', on_delete=models.CASCADE)

    # Beneficiary details
    story = models.TextField()
    amount_received = models.DecimalField(max_digits=15, decimal_places=2)
    location = models.CharField(max_length=255)

    # Public display
    is_public = models.BooleanField(default=True)
    display_name = models.CharField(max_length=255)

    # Timeline
    joined_date = models.DateField()
    completion_date = models.DateField(null=True)
```

#### 4. Blockchain App (TO BUILD)
```python
# blockchain/models.py

import hashlib
import json
from datetime import datetime

class BlockchainTransaction(models.Model):
    """Blockchain record for full transparency"""
    # Block data
    block_index = models.PositiveIntegerField(unique=True)
    timestamp = models.DateTimeField(default=datetime.now)

    # Transaction data
    transaction_type = models.CharField(max_length=50)  # donation, disbursement, program_create
    transaction_id = models.CharField(max_length=100, unique=True)
    data = models.JSONField()  # Full transaction details

    # Blockchain
    previous_hash = models.CharField(max_length=64)
    hash = models.CharField(max_length=64, unique=True)
    nonce = models.PositiveIntegerField(default=0)

    # Verification
    is_verified = models.BooleanField(default=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def calculate_hash(self):
        """Calculate block hash"""
        block_string = json.dumps({
            'index': self.block_index,
            'timestamp': self.timestamp.isoformat(),
            'data': self.data,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def save(self, *args, **kwargs):
        if not self.hash:
            self.hash = self.calculate_hash()
        super().save(*args, **kwargs)

class TransactionChain(models.Model):
    """Transaction chain linking for graph visualization"""
    from_transaction = models.ForeignKey(BlockchainTransaction, on_delete=models.CASCADE, related_name='outgoing')
    to_transaction = models.ForeignKey(BlockchainTransaction, on_delete=models.CASCADE, related_name='incoming')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 🔐 Authentication & Permissions

```python
# users/models.py

class UserRole(models.TextChoices):
    MEMBER = 'member', 'Member'
    EXECUTIVE = 'executive', 'Executive'
    ADMIN = 'admin', 'Admin'
    SUPER_ADMIN = 'super_admin', 'Super Admin'

class CustomUser(AbstractUser):
    """Extended user model"""
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.MEMBER)
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=255, blank=True)
    avatar = models.URLField(max_length=500, blank=True)

    # Verification
    is_verified = models.BooleanField(default=False)
    nin = models.CharField(max_length=11, unique=True, null=True)  # National ID

    # Stats
    applications_count = models.PositiveIntegerField(default=0)
    approved_applications = models.PositiveIntegerField(default=0)
```

### 🚀 API Endpoints Structure

```
/api/v1/
├── /auth/
│   ├── POST   /register/
│   ├── POST   /login/
│   ├── POST   /refresh/
│   ├── POST   /logout/
│   └── GET    /me/
│
├── /programs/
│   ├── GET    /                     # List all programs
│   ├── POST   /                     # Create program (admin)
│   ├── GET    /{id}/                # Get program details
│   ├── PATCH  /{id}/                # Update program
│   ├── DELETE /{id}/                # Delete program
│   ├── GET    /{id}/executives/     # Get review board
│   └── POST   /{id}/apply/          # Start application
│
├── /applications/
│   ├── GET    /                     # My applications
│   ├── GET    /{id}/                # Application detail
│   ├── POST   /{id}/video/          # Upload video
│   ├── POST   /{id}/ai-interview/   # Start AI chat
│   ├── GET    /{id}/ai-interview/messages/  # Get chat history
│   ├── POST   /{id}/ai-interview/message/   # Send message to AI
│   ├── POST   /{id}/submit/         # Submit application
│   └── GET    /{id}/status/         # Check status
│
├── /executive/
│   ├── GET    /applications/        # Applications to review
│   ├── GET    /applications/{id}/   # Review detail
│   ├── POST   /applications/{id}/score/  # Submit scores
│   ├── POST   /applications/{id}/approve/
│   └── POST   /applications/{id}/reject/
│
├── /transactions/
│   ├── GET    /                     # Transaction history
│   ├── GET    /{id}/                # Transaction detail
│   ├── GET    /{id}/receipt/        # Get receipt
│   └── GET    /blockchain/{hash}/   # Blockchain verification
│
├── /blockchain/
│   ├── GET    /chain/               # Full blockchain
│   ├── GET    /verify/{hash}/       # Verify transaction
│   ├── GET    /graph/               # Transaction graph data
│   └── GET    /stats/               # Blockchain stats
│
└── /posts/
    ├── GET    /feed/                # Social feed
    ├── POST   /create/              # Create post
    ├── GET    /{id}/                # Post detail
    ├── POST   /{id}/like/
    ├── POST   /{id}/comment/
    └── GET    /{id}/replies/
```

### 🔄 WebSocket Endpoints (Real-time)

```python
# WebSocket connections for live updates
ws://api.impactnet.ng/ws/

/ws/applications/{application_id}/       # Real-time application updates
/ws/ai-interview/{application_id}/       # AI chat real-time
/ws/notifications/                       # User notifications
/ws/executive/dashboard/                 # Executive dashboard updates
```

### 📦 Technology Stack

**Backend:**
- Django 5.0
- Django REST Framework
- PostgreSQL 15
- Redis (Caching + Celery)
- Celery (Background tasks)
- Channels (WebSockets)

**Blockchain:**
- Custom Python implementation
- SHA-256 hashing
- Transaction chain linking
- D3.js graph visualization

**AI/ML:**
- OpenAI GPT-4 (AI interviews)
- Whisper API (Video transcription)
- LangChain (Conversation management)

**Storage:**
- AWS S3 / CloudFlare R2 (Videos, documents)
- PostgreSQL (All structured data)

**Deployment:**
- Docker + Docker Compose
- Nginx (Load balancer)
- Gunicorn (WSGI server)
- Daphne (ASGI for WebSockets)
- AWS / Digital Ocean

### 🔧 Load Balancer Configuration

```nginx
# nginx.conf
upstream django_backend {
    least_conn;  # Load balancing method
    server backend1:8000 weight=3;
    server backend2:8000 weight=3;
    server backend3:8000 weight=2;
}

upstream websocket_backend {
    server backend1:8001;
    server backend2:8001;
}

server {
    listen 80;
    server_name api.impactnet.ng;

    # API requests
    location /api/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 📊 Database Indexes & Optimization

```python
# Key indexes for performance
class Program(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['status', 'category']),  # Filtering
            models.Index(fields=['close_date']),          # Date queries
            models.Index(fields=['-created_at']),         # Ordering
        ]

class Application(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['program', 'status']),
            models.Index(fields=['blockchain_hash']),     # Blockchain lookups
        ]

class BlockchainTransaction(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['hash']),                # Hash lookups
            models.Index(fields=['transaction_id']),      # Transaction searches
            models.Index(fields=['-timestamp']),          # Time-series
        ]
```

### 🚀 Next Steps

1. ✅ Programs models created
2. Create Applications models with AI chat
3. Create Transactions models with blockchain
4. Create Blockchain models with chain
5. Build REST API serializers & views
6. Implement AI chat service (OpenAI)
7. Build blockchain service
8. Setup WebSockets for real-time
9. Connect Next.js frontend
10. Deploy with load balancer

---

This architecture provides:
- ✅ **Full transparency** via blockchain
- ✅ **Real-time updates** via WebSockets
- ✅ **Scalability** via load balancing
- ✅ **AI-powered** application screening
- ✅ **End-to-end tracking** of every naira
- ✅ **Professional code structure**
