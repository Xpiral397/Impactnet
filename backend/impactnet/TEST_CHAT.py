#!/usr/bin/env python
"""
Quick test script to simulate 5 users chatting
Run this to see messages being created in real-time
"""
import os
import django
import random
import time
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'impactnet.settings')
django.setup()

from django.contrib.auth import get_user_model
from chat.models import Conversation, Message

User = get_user_model()

# Fun conversation starters
MESSAGES = [
    "Hey! How's your project going?",
    "I just donated to your cause! 💙",
    "Thanks so much! Really appreciate it!",
    "Can I help volunteer this weekend?",
    "Absolutely! We need all the help we can get!",
    "What time should I arrive?",
    "10 AM at the community center",
    "Perfect! See you there! 🎉",
    "This is going to be amazing!",
    "I'm so excited! Let's make an impact! 💪",
]

def create_test_conversation():
    """Create a conversation between 2 random users"""
    users = list(User.objects.all()[:5])  # Get first 5 users

    if len(users) < 2:
        print("❌ Need at least 2 users. Run: python manage.py simulate_data --users=5")
        return

    # Pick 2 random users
    user1, user2 = random.sample(users, 2)

    # Get or create conversation
    conversation = Conversation.objects.filter(
        participants=user1
    ).filter(
        participants=user2
    ).first()

    if not conversation:
        conversation = Conversation.objects.create()
        conversation.participants.add(user1, user2)
        print(f"\n✨ New conversation: {user1.username} ↔️ {user2.username}")

    # Send a few messages back and forth
    current_sender = user1
    other_user = user2

    for i in range(random.randint(2, 5)):
        message_text = random.choice(MESSAGES)

        message = Message.objects.create(
            conversation=conversation,
            sender=current_sender,
            content=message_text,
            message_type='text',
            is_read=False
        )

        print(f"  💬 {current_sender.username}: {message_text}")

        # Swap sender for next message
        current_sender, other_user = other_user, current_sender

        # Small delay for realism
        time.sleep(0.5)

    print(f"  ✅ Conversation updated!\n")

def main():
    print("🚀 Starting Chat Test Simulation...\n")
    print("=" * 60)

    # Check if we have users
    user_count = User.objects.count()
    print(f"👥 Found {user_count} users in database")

    if user_count < 5:
        print("⚠️  Creating test users...")
        from posts.management.commands.simulate_data import Command
        cmd = Command()
        cmd.create_users(5)
        print("✅ Created 5 test users\n")

    # Create 3 random conversations
    print("\n📱 Simulating conversations...\n")
    for i in range(3):
        create_test_conversation()
        time.sleep(1)

    # Show stats
    total_conversations = Conversation.objects.count()
    total_messages = Message.objects.count()

    print("=" * 60)
    print("\n📊 Final Stats:")
    print(f"   💬 Total Conversations: {total_conversations}")
    print(f"   📨 Total Messages: {total_messages}")
    print("\n✅ Test Complete!")
    print("\n🔍 Check the messages:")
    print("   - Admin: http://127.0.0.1:8000/admin/chat/")
    print("   - API: http://127.0.0.1:8000/api/chat/conversations/")
    print("\n")

if __name__ == '__main__':
    main()
