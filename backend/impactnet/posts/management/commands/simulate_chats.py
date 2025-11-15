"""
Chat simulation engine for ImpactNet
Automatically generates realistic chat conversations between users
"""
import random
import time
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

# Realistic conversation templates
CONVERSATION_TEMPLATES = [
    # Community project discussions
    [
        ("Hey! I saw your post about the community garden project. Count me in!", "sender"),
        ("That's wonderful! We're meeting this Saturday at 10 AM. Can you make it?", "receiver"),
        ("Yes, I'll be there! Should I bring anything?", "sender"),
        ("Just bring some gardening gloves if you have them. We'll provide everything else!", "receiver"),
        ("Perfect! See you Saturday! 🌱", "sender"),
    ],

    # Donation inquiries
    [
        ("Hi! I'm interested in donating to your education fund.", "sender"),
        ("Thank you so much for your support! 🙏", "receiver"),
        ("What's the best way to contribute?", "sender"),
        ("You can donate through our fundraising page. I'll send you the link!", "receiver"),
        ("Great! I'll check it out.", "sender"),
    ],

    # Volunteering
    [
        ("I'd love to volunteer for your literacy program!", "sender"),
        ("That's amazing! We really need more volunteers.", "receiver"),
        ("What kind of time commitment are we looking at?", "sender"),
        ("About 2-3 hours per week. Does that work for you?", "receiver"),
        ("Perfect! When can I start?", "sender"),
        ("How about next Monday? We have orientation at 5 PM.", "receiver"),
        ("I'll be there! Thanks! 😊", "sender"),
    ],

    # Event coordination
    [
        ("Are you coming to the fundraiser next week?", "sender"),
        ("Definitely! What time does it start?", "receiver"),
        ("6 PM at the community center.", "sender"),
        ("Great! Should I bring anything?", "receiver"),
        ("Just yourself! Looking forward to seeing you there! 🎉", "sender"),
    ],

    # Project updates
    [
        ("Quick update: We reached 50% of our fundraising goal!", "sender"),
        ("That's incredible! Congratulations! 🎊", "receiver"),
        ("Thanks! Your support has been amazing!", "sender"),
        ("Happy to help! What's next?", "receiver"),
        ("We're planning a celebration event. I'll keep you posted!", "sender"),
    ],

    # Collaboration
    [
        ("I have an idea for improving our outreach program.", "sender"),
        ("I'd love to hear it! Tell me more.", "receiver"),
        ("What if we partner with local schools?", "sender"),
        ("That's brilliant! Let's set up a meeting to discuss this.", "receiver"),
        ("How about Wednesday afternoon?", "sender"),
        ("Works for me! See you then! 💡", "receiver"),
    ],

    # Thank you messages
    [
        ("Thank you so much for your donation!", "sender"),
        ("You're very welcome! Happy to support the cause! ❤️", "receiver"),
        ("It really makes a difference!", "sender"),
        ("That's what it's all about! Keep up the great work!", "receiver"),
    ],

    # Resource sharing
    [
        ("Do you have any resources on grant writing?", "sender"),
        ("Yes! I'll send you some helpful links.", "receiver"),
        ("That would be amazing! Thank you!", "sender"),
        ("Just sent them over. Let me know if you need anything else!", "receiver"),
        ("This is exactly what I needed! 🙌", "sender"),
    ],
]

# AI Assistant responses
AI_RESPONSES = [
    "I'm here to help you make an impact! What can I assist you with today?",
    "That's a great initiative! Would you like some suggestions on how to get started?",
    "I can help you find volunteers, donors, or resources. What do you need?",
    "Based on your interests, I recommend checking out these projects...",
    "Here are some tips for successful community organizing...",
    "I can connect you with others working on similar projects!",
    "Let me help you create a fundraising campaign!",
    "Great question! Here's what I know about that...",
]

USER_TO_AI_MESSAGES = [
    "Hi! Can you help me start a community project?",
    "What's the best way to raise funds?",
    "How do I find volunteers?",
    "Tell me about successful impact projects",
    "I need help organizing an event",
    "Can you suggest some fundraising strategies?",
    "How can I maximize my impact?",
    "What resources are available?",
]


class Command(BaseCommand):
    help = 'Simulate realistic chat conversations between users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--conversations',
            type=int,
            default=10,
            help='Number of conversations to simulate'
        )
        parser.add_argument(
            '--ai-chats',
            type=int,
            default=5,
            help='Number of AI chat conversations to simulate'
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=0,
            help='Delay between messages in seconds (for real-time simulation)'
        )

    def handle(self, *args, **options):
        num_conversations = options['conversations']
        num_ai_chats = options['ai_chats']
        delay = options['delay']

        self.stdout.write(self.style.SUCCESS('🤖 Starting chat simulation engine...'))

        # Get all users
        users = list(User.objects.all())

        if len(users) < 2:
            self.stdout.write(self.style.ERROR('❌ Need at least 2 users to simulate chats'))
            return

        # Simulate user-to-user conversations
        for i in range(num_conversations):
            self.simulate_conversation(users, delay)
            self.stdout.write(f'✅ Simulated conversation {i+1}/{num_conversations}')

        # Simulate AI conversations
        for i in range(num_ai_chats):
            self.simulate_ai_conversation(users, delay)
            self.stdout.write(f'🤖 Simulated AI chat {i+1}/{num_ai_chats}')

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Chat simulation complete!'))
        self.stdout.write(f'Total conversations: {num_conversations + num_ai_chats}')

    def simulate_conversation(self, users, delay):
        """Simulate a conversation between two random users"""
        # Pick two different users
        sender, receiver = random.sample(users, 2)

        # Pick a random conversation template
        template = random.choice(CONVERSATION_TEMPLATES)

        # Generate messages with realistic timestamps
        base_time = timezone.now() - timedelta(days=random.randint(0, 7))

        for idx, (message_text, role) in enumerate(template):
            # Add random delay between messages (1-30 minutes)
            base_time += timedelta(minutes=random.randint(1, 30))

            # Determine who sends this message
            if role == "sender":
                from_user = sender
                to_user = receiver
            else:
                from_user = receiver
                to_user = sender

            # Here you would create actual Message objects
            # For now, just print to show it's working
            self.stdout.write(
                f'  {from_user.username} → {to_user.username}: {message_text[:50]}...'
            )

            if delay > 0:
                time.sleep(delay)

    def simulate_ai_conversation(self, users, delay):
        """Simulate a conversation between a user and AI assistant"""
        user = random.choice(users)

        # User asks AI a question
        user_message = random.choice(USER_TO_AI_MESSAGES)
        ai_response = random.choice(AI_RESPONSES)

        base_time = timezone.now() - timedelta(days=random.randint(0, 3))

        self.stdout.write(
            f'  {user.username} → Impact AI: {user_message}'
        )

        if delay > 0:
            time.sleep(delay)

        self.stdout.write(
            f'  Impact AI → {user.username}: {ai_response}'
        )

        if delay > 0:
            time.sleep(delay)
