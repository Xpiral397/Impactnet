#!/bin/bash

# Script to connect Frontend to Backend API

echo "🔗 Connecting Frontend to Backend API..."

cd /Users/xpiral/Projects/ImpactNet/frontend

# Update root layout to include AuthProvider
echo "📝 Updating root layout with AuthProvider..."

cat > app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ImpactNet - Making a Difference Together",
  description: "Connect, share stories, and create impact in your community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
EOF

# Create a simple login page
echo "📝 Creating login page..."
mkdir -p app/login
cat > app/login/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(username, password);

      if (response.requires_2fa) {
        // Handle 2FA later
        alert('2FA is enabled. This feature will be implemented soon!');
      } else {
        router.push('/member');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600 mb-8">Sign in to your ImpactNet account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-medium">
            Sign up
          </a>
        </p>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            For development: Use any username/password or create account via API
          </p>
        </div>
      </div>
    </div>
  );
}
EOF

# Update member page to use API (simplified version)
echo "📝 Creating API-connected member page wrapper..."
cat > app/member/page-with-api.tsx << 'EOF'
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useRouter } from 'next/navigation';
import EnhancedPost from './components/EnhancedPost';

export default function MemberPageWithAPI() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { posts, loading: postsLoading, likePost, addComment, sharePost } = usePosts();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Feed: 'bg-blue-100 text-blue-800',
      Request: 'bg-purple-100 text-purple-800',
      Testimony: 'bg-green-100 text-green-800',
      Encourage: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">ImpactNet</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.full_name || user?.username}!</span>
              <img
                src={user?.avatar || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Feed</h2>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <EnhancedPost
                key={post.id}
                post={post}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
EOF

echo ""
echo "✅ Frontend API connection files created!"
echo ""
echo "📍 Files created:"
echo "   ✓ lib/api.ts - API service layer"
echo "   ✓ contexts/AuthContext.tsx - Authentication context"
echo "   ✓ hooks/usePosts.ts - Posts hook"
echo "   ✓ app/layout.tsx - Root layout with AuthProvider"
echo "   ✓ app/login/page.tsx - Login page"
echo "   ✓ app/member/page-with-api.tsx - API-connected member page"
echo "   ✓ .env.local - Environment variables"
echo ""
echo "🎯 Next steps:"
echo "   1. Rename app/member/page-with-api.tsx to page.tsx (backup old one first)"
echo "   2. Restart Next.js dev server"
echo "   3. Visit http://localhost:3000/login"
echo "   4. Create a user via Django admin or API"
echo "   5. Login and see real data from API!"
echo ""
echo "🔧 To create test user via API:"
echo '   curl -X POST http://localhost:8000/api/auth/register/ \'
echo '     -H "Content-Type: application/json" \'
echo '     -d'"'"'{"username":"testuser","email":"test@test.com","password":"test123456","password_confirm":"test123456"}'"'"
