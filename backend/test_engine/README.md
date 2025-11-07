# ImpactNet AI Test Engine

An intelligent test automation engine that simulates real user behavior by making concurrent API calls.

## Features

- **Concurrent User Creation**: Creates multiple accounts simultaneously (12 users by default)
- **Automatic OTP Handling**: Retrieves OTP codes from Django database and verifies automatically
- **Post Creation**: AI-generated posts with random images from Unsplash
- **User Engagement**: Likes, comments, and reactions on posts
- **Account Deletion**: Simulates users leaving the platform
- **Realistic Behavior**: Uses Faker for realistic names, emails, and Google Gemini AI for post content
- **Multi-threading**: All actions happen concurrently like real user traffic

## Installation

```bash
cd /Users/xpiral/Projects/ImpactNet/backend
source .venv/bin/activate
pip install -r test_engine/requirements.txt
```

## Usage

### Run Single Test Cycle

```bash
# Make sure Django server is running on port 8000
cd /Users/xpiral/Projects/ImpactNet/backend
source .venv/bin/activate
python test_engine/engine.py
```

### Run Continuous Testing

Edit `engine.py` and uncomment the last line:

```python
# Uncomment to run continuously
engine.run_continuous(interval_seconds=60)
```

### Run with Script

```bash
bash /Users/xpiral/Projects/ImpactNet/backend/test_engine/run.sh
```

## Configuration

### Google Gemini AI (Optional)

For AI-generated post content, set your Gemini API key:

```bash
export GEMINI_API_KEY="your-api-key-here"
```

Get a free API key at: https://makersuite.google.com/app/apikey

Without Gemini, the engine uses predefined realistic post templates.

### Customize Concurrent Actions

Edit the `engine.run_concurrent_actions()` call in `engine.py`:

```python
engine.run_concurrent_actions(
    num_new_accounts=12,  # Number of new accounts to create
    num_deletions=5,      # Number of accounts to delete
    num_posts=4           # Number of posts to create
)
```

## How It Works

1. **Account Creation (Concurrent)**
   - 12 users register simultaneously
   - Each user gets unique realistic data (Faker library)
   - Accounts stored in local SQLite database

2. **OTP Verification (Automatic)**
   - Engine requests OTP via API
   - Automatically retrieves OTP from Django database
   - Verifies OTP and logs in user
   - Stores JWT tokens for authenticated requests

3. **Content Creation (Concurrent)**
   - 4 users create posts simultaneously
   - Posts use AI-generated content (Gemini) or templates
   - Random images from Unsplash API
   - Posts stored with metadata

4. **Engagement (Concurrent)**
   - 10-20 random likes/comments on posts
   - Multiple users engage simultaneously
   - Realistic comment templates

5. **Account Deletion (Concurrent)**
   - 5 random accounts deleted
   - Cleanup from both databases

## Database

Engine maintains its own SQLite database (`test_engine.db`) to track:
- Test user credentials
- OTP codes
- JWT tokens
- Post IDs
- Comment IDs

## Example Output

```
======================================================================
🤖 STARTING TEST ENGINE - Simulating Real User Activity
======================================================================

📝 Creating 12 new accounts...

[14:23:45] john_smith8472: ✓ Account created successfully
[14:23:45] sarah_jones3921: ✓ Account created successfully
[14:23:46] mike_wilson1234: ✓ Account created successfully
...

[14:23:47] john_smith8472: ✓ OTP requested
[14:23:48] john_smith8472: ✓ Retrieved OTP: 582941
[14:23:48] john_smith8472: ✓ Logged in successfully
...

📸 Creating 4 posts with images...

[14:23:50] sarah_jones3921: ✓ Created post #42: Excited to announce that my small shop...
[14:23:51] mike_wilson1234: ✓ Created post #43: Grateful for the opportunity to...
...

💬 Engaging with posts (likes & comments)...

[14:23:52] john_smith8472: ✓ Liked post #42
[14:23:52] linda_brown4567: ✓ Commented on post #42
[14:23:53] robert_davis9876: ✓ Liked post #43
...

🗑️  Deleting 5 accounts...

[14:23:55] user_1234: ✓ Account deleted
[14:23:56] user_5678: ✓ Account deleted
...

======================================================================
✅ TEST ENGINE COMPLETE
======================================================================

📊 Summary:
   - Active users: 7
   - Posts created: 4
   - Accounts deleted: 5
```

## API Endpoints Used

- `POST /api/auth/register/` - Create account
- `POST /api/auth/otp/send/` - Request OTP
- `POST /api/auth/otp/verify/` - Verify OTP and login
- `POST /api/posts/` - Create post
- `POST /api/posts/{id}/like/` - Like post
- `POST /api/posts/{id}/comments/` - Comment on post
- `DELETE /api/auth/user/delete/` - Delete account

## Notes

- Engine requires Django server running on port 8000
- Uses threading for concurrent operations (simulates real traffic)
- All test accounts have email format: `username@test.impactnet.com`
- Default password for all test accounts: `TestPass123!`
- OTP codes are automatically retrieved from Django database
