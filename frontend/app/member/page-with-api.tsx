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
