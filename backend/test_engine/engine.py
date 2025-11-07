"""
AI Agent Engine for ImpactNet Testing
Simulates real-world user behavior like a game simulation
Actions happen randomly over time, not all at once
"""
import requests
import random
import time
import threading
from datetime import datetime, timedelta
from faker import Faker
import os
import sqlite3

# Configuration
API_BASE_URL = "http://localhost:8000/api"
# Use Django's main database instead of separate test DB
import sys
sys.path.append('/Users/xpiral/Projects/ImpactNet/backend/impactnet')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'impactnet.settings')

# Initialize Faker for realistic data
fake = Faker()

# Global flag to control the simulation
running = True

# Database for tracking test users and their OTPs
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS test_users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE,
                  email TEXT UNIQUE,
                  password TEXT,
                  first_name TEXT,
                  last_name TEXT,
                  otp TEXT,
                  access_token TEXT,
                  refresh_token TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS test_posts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER,
                  post_id INTEGER,
                  content TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS test_comments
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER,
                  post_id INTEGER,
                  comment_id INTEGER,
                  content TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()


class TestUserAgent:
    """Individual AI agent simulating a real user"""

    def __init__(self, user_data=None):
        self.username = user_data['username'] if user_data else fake.user_name() + str(random.randint(1000, 9999))
        self.email = user_data['email'] if user_data else f"{self.username}@test.impactnet.com"
        self.password = user_data['password'] if user_data else "TestPass123!"
        self.first_name = user_data.get('first_name') if user_data else fake.first_name()
        self.last_name = user_data.get('last_name') if user_data else fake.last_name()
        self.access_token = user_data.get('access_token') if user_data else None
        self.refresh_token = user_data.get('refresh_token') if user_data else None
        self.otp = None
        self.db_id = user_data.get('db_id') if user_data else None

    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {self.username}: {message}")

    def register_account(self):
        """Create a new user account via API"""
        try:
            response = requests.post(
                f"{API_BASE_URL}/auth/register/",
                json={
                    "username": self.username,
                    "email": self.email,
                    "password": self.password,
                    "password_confirm": self.password,
                    "first_name": self.first_name,
                    "last_name": self.last_name
                },
                timeout=10
            )

            if response.status_code in [200, 201]:
                self.log(f"✓ Registered account")

                # Save to database
                conn = sqlite3.connect(DB_PATH)
                c = conn.cursor()
                c.execute("""INSERT INTO test_users
                            (username, email, password, first_name, last_name)
                            VALUES (?, ?, ?, ?, ?)""",
                         (self.username, self.email, self.password, self.first_name, self.last_name))
                self.db_id = c.lastrowid
                conn.commit()
                conn.close()

                return True
            else:
                self.log(f"✗ Registration failed: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"✗ Registration error: {str(e)}")
            return False

    def request_otp(self):
        """Request OTP for login"""
        try:
            response = requests.post(
                f"{API_BASE_URL}/auth/otp/send/",
                json={
                    "email": self.email,
                    "purpose": "login"
                },
                timeout=10
            )

            if response.status_code == 200:
                self.log(f"✓ Requested OTP")
                time.sleep(2)  # Wait for OTP to be generated
                self.retrieve_otp()
                return True
            else:
                self.log(f"✗ OTP request failed")
                return False
        except Exception as e:
            self.log(f"✗ OTP request error: {str(e)}")
            return False

    def retrieve_otp(self):
        """Retrieve OTP from database"""
        try:
            import sys
            sys.path.append('/Users/xpiral/Projects/ImpactNet/backend/impactnet')
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'impactnet.settings')
            import django
            django.setup()

            from users.models import CustomUser, EmailOTP
            user = CustomUser.objects.get(email=self.email)
            latest_otp = EmailOTP.objects.filter(user=user, is_used=False).order_by('-created_at').first()

            if latest_otp and latest_otp.is_valid():
                self.otp = latest_otp.otp_code
                self.log(f"✓ Got OTP: {self.otp}")

                # Save to our DB
                conn = sqlite3.connect(DB_PATH)
                c = conn.cursor()
                c.execute("UPDATE test_users SET otp = ? WHERE email = ?", (self.otp, self.email))
                conn.commit()
                conn.close()

                return True
        except Exception as e:
            self.log(f"✗ OTP retrieval failed: {str(e)}")
            return False

    def verify_otp_login(self):
        """Login using OTP"""
        if not self.otp:
            self.log("✗ No OTP available")
            return False

        try:
            response = requests.post(
                f"{API_BASE_URL}/auth/otp/verify/",
                json={
                    "email": self.email,
                    "otp_code": self.otp
                },
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get('access')
                self.refresh_token = data.get('refresh')

                # Update database
                conn = sqlite3.connect(DB_PATH)
                c = conn.cursor()
                c.execute("""UPDATE test_users
                            SET access_token = ?, refresh_token = ?
                            WHERE email = ?""",
                         (self.access_token, self.refresh_token, self.email))
                conn.commit()
                conn.close()

                self.log(f"✓ Logged in successfully")
                return True
            else:
                self.log(f"✗ Login failed")
                return False
        except Exception as e:
            self.log(f"✗ Login error: {str(e)}")
            return False

    def generate_post_content(self):
        """Generate realistic post content"""
        fallback_posts = [
            "Just received amazing support from the community! This will help me grow my business. Thank you! 🙏",
            "Excited to announce that my small shop is now serving 20+ customers daily. Grateful for the support!",
            "Today marks 6 months since I joined the program. The journey has been incredible! 🎉",
            "Huge thanks to ImpactNet for believing in my vision. My business is thriving!",
            "The skills training I received has opened so many doors. Forever grateful! ❤️",
            "Never thought I'd be able to afford school supplies. Thank you for making education accessible!",
            "From struggling to thriving - that's what this program has done for me!",
            "My small business just hit 50 sales this month! Thank you for the support! 💪",
            "Learning new skills every day. This opportunity has changed my life!",
            "Proud to say I can now support my family thanks to this program! 🙌"
        ]
        return random.choice(fallback_posts)

    def create_post(self):
        """Create a post via API"""
        if not self.access_token:
            self.log("✗ Not logged in")
            return False

        content = self.generate_post_content()

        # Random image URLs
        image_topics = ['business', 'education', 'community', 'success', 'people', 'work', 'happy']
        images = []
        if random.random() > 0.3:  # 70% chance to include images
            num_images = random.randint(1, 2)
            for _ in range(num_images):
                # Use picsum.photos for placeholder images (unsplash source API is deprecated)
                images.append(f"https://picsum.photos/800/600?random={random.randint(1,10000)}")

        try:
            response = requests.post(
                f"{API_BASE_URL}/posts/",
                json={
                    "content": content,
                    "post_type": random.choice(['user', 'beneficiary_story']),
                    "images": images
                },
                headers={"Authorization": f"Bearer {self.access_token}"},
                timeout=10
            )

            if response.status_code in [200, 201]:
                post_data = response.json()
                post_id = post_data.get('id')

                # Save to database
                conn = sqlite3.connect(DB_PATH)
                c = conn.cursor()
                c.execute("""INSERT INTO test_posts (user_id, post_id, content)
                            VALUES (?, ?, ?)""",
                         (self.db_id, post_id, content))
                conn.commit()
                conn.close()

                self.log(f"✓ Created post: {content[:40]}...")
                return post_id
            else:
                self.log(f"✗ Post creation failed")
                return False
        except Exception as e:
            self.log(f"✗ Post error: {str(e)}")
            return False

    def comment_on_post(self, post_id):
        """Comment on a post"""
        if not self.access_token:
            return False

        comments = [
            "This is so inspiring! Keep up the great work! 💪",
            "Congratulations! 🎉",
            "Your story is truly motivating!",
            "Amazing progress! Keep going!",
            "This is why community support matters!",
            "Proud to see people thriving!",
            "So happy for you! ❤️",
            "Keep shining! ✨",
            "You're doing great!",
            "Love seeing this! 🙌"
        ]

        content = random.choice(comments)

        try:
            response = requests.post(
                f"{API_BASE_URL}/posts/{post_id}/comments/",
                json={"content": content},
                headers={"Authorization": f"Bearer {self.access_token}"},
                timeout=10
            )

            if response.status_code in [200, 201]:
                self.log(f"✓ Commented: {content}")
                return True
            else:
                return False
        except:
            return False

    def like_post(self, post_id):
        """Like a post"""
        if not self.access_token:
            return False

        try:
            response = requests.post(
                f"{API_BASE_URL}/posts/{post_id}/like/",
                json={"reaction_type": random.choice(['like', 'love', 'celebrate', 'support'])},
                headers={"Authorization": f"Bearer {self.access_token}"},
                timeout=10
            )

            if response.status_code in [200, 201]:
                self.log(f"✓ Liked post #{post_id}")
                return True
            else:
                return False
        except:
            return False

    def delete_account(self):
        """Delete user account"""
        if not self.access_token:
            return False

        try:
            response = requests.delete(
                f"{API_BASE_URL}/auth/user/delete/",
                headers={"Authorization": f"Bearer {self.access_token}"},
                timeout=10
            )

            if response.status_code in [200, 204]:
                self.log(f"✓ Deleted account")

                # Remove from database
                conn = sqlite3.connect(DB_PATH)
                c = conn.cursor()
                c.execute("DELETE FROM test_users WHERE email = ?", (self.email,))
                conn.commit()
                conn.close()

                return True
            else:
                return False
        except Exception as e:
            return False


class SimulationEngine:
    """Game-like simulation engine that runs continuously"""

    def __init__(self):
        init_db()
        self.agents = []
        self.all_post_ids = []
        self.running = True

    def load_existing_users(self):
        """Load existing test users from database"""
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""SELECT id, username, email, password, first_name, last_name,
                     access_token, refresh_token FROM test_users""")
        rows = c.fetchall()
        conn.close()

        for row in rows:
            user_data = {
                'db_id': row[0],
                'username': row[1],
                'email': row[2],
                'password': row[3],
                'first_name': row[4],
                'last_name': row[5],
                'access_token': row[6],
                'refresh_token': row[7]
            }
            agent = TestUserAgent(user_data)
            self.agents.append(agent)

        print(f"📊 Loaded {len(self.agents)} existing users")

    def get_all_posts(self):
        """Get all post IDs from database"""
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT DISTINCT post_id FROM test_posts WHERE post_id IS NOT NULL")
        rows = c.fetchall()
        conn.close()
        return [row[0] for row in rows]

    def random_action(self):
        """Perform a random action like in a game simulation"""

        # Decide what action to perform (weighted probabilities)
        action = random.choices(
            ['create_user', 'login_user', 'create_post', 'like_post', 'comment_post', 'delete_user', 'idle'],
            weights=[5, 8, 10, 15, 12, 2, 50]  # idle happens most often
        )[0]

        if action == 'create_user':
            agent = TestUserAgent()
            if agent.register_account():
                self.agents.append(agent)

        elif action == 'login_user':
            # Find a user that's not logged in
            logged_out = [a for a in self.agents if not a.access_token]
            if logged_out:
                agent = random.choice(logged_out)
                if agent.request_otp():
                    time.sleep(2)
                    agent.verify_otp_login()

        elif action == 'create_post':
            logged_in = [a for a in self.agents if a.access_token]
            if logged_in:
                agent = random.choice(logged_in)
                post_id = agent.create_post()
                if post_id:
                    self.all_post_ids.append(post_id)

        elif action == 'like_post':
            logged_in = [a for a in self.agents if a.access_token]
            posts = self.get_all_posts()
            if logged_in and posts:
                agent = random.choice(logged_in)
                post_id = random.choice(posts)
                agent.like_post(post_id)

        elif action == 'comment_post':
            logged_in = [a for a in self.agents if a.access_token]
            posts = self.get_all_posts()
            if logged_in and posts:
                agent = random.choice(logged_in)
                post_id = random.choice(posts)
                agent.comment_on_post(post_id)

        elif action == 'delete_user':
            if len(self.agents) > 3:  # Keep at least 3 users
                agent = random.choice(self.agents)
                if agent.delete_account():
                    self.agents.remove(agent)

    def run_simulation(self):
        """Run continuous simulation like a game"""
        print("\n" + "="*70)
        print("🎮 IMPACTNET SIMULATION ENGINE")
        print("   Real-world user behavior simulation running...")
        print("   Press Ctrl+C to stop")
        print("="*70 + "\n")

        # Load existing users
        self.load_existing_users()

        # Get existing posts
        self.all_post_ids = self.get_all_posts()

        try:
            while self.running:
                # Random delay between actions (1-10 seconds)
                wait_time = random.uniform(1, 10)
                time.sleep(wait_time)

                # Perform random action
                self.random_action()

                # Every 30-60 seconds, print status
                if random.random() < 0.1:  # 10% chance each cycle
                    logged_in = len([a for a in self.agents if a.access_token])
                    print(f"\n📊 Status: {len(self.agents)} users ({logged_in} online), {len(self.get_all_posts())} posts\n")

        except KeyboardInterrupt:
            print("\n\n🛑 Simulation stopped")
            print(f"📊 Final stats:")
            print(f"   - Total users: {len(self.agents)}")
            print(f"   - Online users: {len([a for a in self.agents if a.access_token])}")
            print(f"   - Total posts: {len(self.get_all_posts())}")


if __name__ == "__main__":
    engine = SimulationEngine()
    engine.run_simulation()
