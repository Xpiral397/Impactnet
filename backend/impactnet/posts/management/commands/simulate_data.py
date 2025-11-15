"""
Data simulation engine for ImpactNet
Generates realistic posts with working images for Feed, Donate, and Request
"""
import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from posts.models import Post, Goal, Comment
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

# Real accessible image URLs from Unsplash
FEED_IMAGES = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",  # Community meeting
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",  # Happy people
    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800",  # Celebration
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",  # Team work
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",  # Group photo
]

DONATE_IMAGES = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",  # Education
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",  # Book learning
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",  # Children studying
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800",  # Healthcare
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",  # Community help
]

REQUEST_IMAGES = [
    "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800",  # Medical need
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800",  # School supplies
    "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800",  # Business startup
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",  # University
    "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800",  # Tools/equipment
]

FEED_CONTENT = [
    "Just launched our community garden project! 🌱 So excited to see the neighborhood come together.",
    "Celebrating 100 students who graduated from our coding bootcamp this year! 🎉",
    "Our small business support program helped 50 entrepreneurs this month. Thank you for your support! 🙏",
    "Amazing turnout at today's youth mentorship workshop! The future is bright! ✨",
    "Proud to announce we've provided clean water access to 500 families this quarter! 💧",
]

DONATE_CONTENT = [
    {
        "content": "Help us build a new computer lab for 200 students in rural communities 💻",
        "goal_title": "Computer Lab for Rural Schools",
        "target": 15000,
        "description": "We need computers, desks, and internet connectivity to provide digital education access."
    },
    {
        "content": "Support our scholarship fund to send 50 girls to university this year 📚",
        "goal_title": "Girls Education Scholarship Fund",
        "target": 25000,
        "description": "Full tuition coverage for underprivileged girls pursuing higher education."
    },
    {
        "content": "Fund medical supplies for our community health clinic serving 1000+ patients monthly 🏥",
        "goal_title": "Community Health Clinic Supplies",
        "target": 10000,
        "description": "Essential medicines, equipment, and supplies for our free health clinic."
    },
]

REQUEST_CONTENT = [
    {
        "content": "I need help funding my final semester of nursing school. Just $2,000 away from my dream! 🏥",
        "goal_title": "Complete Nursing Degree",
        "target": 2000,
        "description": "Tuition for my final semester. I'll be the first in my family to graduate university."
    },
    {
        "content": "Requesting support to buy sewing machines for my tailoring business startup 🧵",
        "goal_title": "Tailoring Business Startup",
        "target": 1500,
        "description": "Need 3 industrial sewing machines to start my tailoring shop and employ 2 assistants."
    },
    {
        "content": "Help me get a laptop for my coding courses. Learning to become a software developer! 💻",
        "goal_title": "Laptop for Coding Education",
        "target": 800,
        "description": "Need a decent laptop to complete my online software development course."
    },
]


class Command(BaseCommand):
    help = 'Simulate realistic data for ImpactNet platform'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Number of users to create'
        )
        parser.add_argument(
            '--posts',
            type=int,
            default=30,
            help='Number of feed posts to create'
        )

    def handle(self, *args, **options):
        num_users = options['users']
        num_posts = options['posts']

        self.stdout.write(self.style.SUCCESS('🚀 Starting data simulation...'))

        # Create users
        users = self.create_users(num_users)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(users)} users'))

        # Create feed posts
        feed_posts = self.create_feed_posts(users, num_posts)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(feed_posts)} feed posts'))

        # Create donate posts
        donate_posts = self.create_donate_posts(users)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(donate_posts)} donate posts'))

        # Create request posts
        request_posts = self.create_request_posts(users)
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(request_posts)} request posts'))

        # Add engagement (likes, comments)
        self.add_engagement(users, feed_posts + donate_posts + request_posts)
        self.stdout.write(self.style.SUCCESS('✅ Added engagement (likes, comments)'))

        self.stdout.write(self.style.SUCCESS('\n🎉 Data simulation complete!'))
        self.stdout.write(f'Total posts created: {len(feed_posts) + len(donate_posts) + len(request_posts)}')

    def create_users(self, count):
        """Create realistic user accounts"""
        first_names = ['Sarah', 'Michael', 'Emma', 'James', 'Olivia', 'David', 'Sophia', 'Daniel',
                       'Ava', 'Matthew', 'Isabella', 'Joseph', 'Mia', 'Christopher', 'Charlotte']
        last_names = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
                      'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas']

        users = []
        for i in range(count):
            first = random.choice(first_names)
            last = random.choice(last_names)
            username = f"{first.lower()}{last.lower()}{random.randint(100, 9999)}"
            email = f"{username}@test.impactnet.com"

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first,
                    'last_name': last,
                    'bio': f"Passionate about making a difference in the community!",
                }
            )
            if created:
                users.append(user)

        return users

    def create_feed_posts(self, users, count):
        """Create regular feed posts with images"""
        posts = []
        for i in range(count):
            user = random.choice(users)
            content = random.choice(FEED_CONTENT)
            images = [random.choice(FEED_IMAGES)]

            # Random date within last 30 days
            days_ago = random.randint(0, 30)
            created_at = timezone.now() - timedelta(days=days_ago)

            post = Post.objects.create(
                author=user,
                post_type='feed',
                content=content,
                images=images,
                likes_count=random.randint(10, 500),
                comments_count=random.randint(2, 50),
                shares_count=random.randint(0, 20),
                created_at=created_at,
                is_public=True,
                is_approved=True
            )
            posts.append(post)

        return posts

    def create_donate_posts(self, users):
        """Create donation campaigns with goals"""
        posts = []
        for donate_data in DONATE_CONTENT:
            user = random.choice(users)
            images = [random.choice(DONATE_IMAGES)]

            post = Post.objects.create(
                author=user,
                post_type='donate',
                content=donate_data['content'],
                images=images,
                likes_count=random.randint(50, 1000),
                comments_count=random.randint(10, 100),
                shares_count=random.randint(5, 50),
                is_public=True,
                is_approved=True
            )

            # Create goal
            raised = random.randint(100, int(donate_data['target'] * 0.8))
            Goal.objects.create(
                post=post,
                goal_type='money',
                target_description=f"{donate_data['goal_title']} - {donate_data['description']}",
                target_amount=Decimal(donate_data['target']),
                raised_amount=Decimal(raised),
                deadline=timezone.now().date() + timedelta(days=random.randint(30, 90))
            )

            posts.append(post)

        return posts

    def create_request_posts(self, users):
        """Create request posts for individual needs"""
        posts = []
        for request_data in REQUEST_CONTENT:
            user = random.choice(users)
            images = [random.choice(REQUEST_IMAGES)]

            post = Post.objects.create(
                author=user,
                post_type='request',
                content=request_data['content'],
                images=images,
                likes_count=random.randint(20, 300),
                comments_count=random.randint(5, 40),
                shares_count=random.randint(2, 15),
                is_public=True,
                is_approved=True
            )

            # Create goal
            raised = random.randint(50, int(request_data['target'] * 0.6))
            Goal.objects.create(
                post=post,
                goal_type='money',
                target_description=f"{request_data['goal_title']} - {request_data['description']}",
                target_amount=Decimal(request_data['target']),
                raised_amount=Decimal(raised),
                deadline=timezone.now().date() + timedelta(days=random.randint(15, 60))
            )

            posts.append(post)

        return posts

    def add_engagement(self, users, posts):
        """Add realistic comments and interactions"""
        comment_templates = [
            "This is amazing! 🙌",
            "So proud of this initiative!",
            "Count me in to help!",
            "Incredible work, keep it up!",
            "This is what community is all about ❤️",
            "Just donated! Hope this helps!",
            "Shared with my network!",
            "Supporting this great cause!",
        ]

        for post in posts:
            # Add 2-5 comments per post
            num_comments = random.randint(2, 5)
            for _ in range(num_comments):
                user = random.choice(users)
                content = random.choice(comment_templates)
                Comment.objects.create(
                    post=post,
                    author=user,
                    content=content,
                    likes_count=random.randint(0, 20)
                )
