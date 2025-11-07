import { useState, useEffect } from 'react';
import { postsAPI } from '@/lib/api';

export interface Post {
  id: number;
  author: {
    id: number;
    username: string;
    full_name: string;
    avatar: string;
  };
  content: string;
  post_type: string;
  images: string[];
  video_url: string;
  goal: any;
  comments: any[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

export function usePosts(category?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [category, page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.list({ page, category });

      if (page === 1) {
        setPosts(response.results || response);
      } else {
        setPosts((prev) => [...prev, ...(response.results || response)]);
      }

      setHasMore(!!response.next);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: number) => {
    try {
      const response = await postsAPI.like(postId);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: response.liked,
                likes_count: response.likes_count || (response.liked ? post.likes_count + 1 : post.likes_count - 1),
              }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const createPost = async (data: any) => {
    try {
      const newPost = await postsAPI.create(data);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      console.error('Failed to create post:', err);
      throw err;
    }
  };

  const addComment = async (postId: number, content: string, parentCommentId?: number) => {
    try {
      const comment = await postsAPI.addComment(postId, content, parentCommentId);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments_count: post.comments_count + 1,
              }
            : post
        )
      );

      return comment;
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  const sharePost = async (postId: number, message?: string) => {
    try {
      const response = await postsAPI.share(postId, message);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                shares_count: response.shares_count,
              }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to share post:', err);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    setPosts([]);
    loadPosts();
  };

  return {
    posts,
    loading,
    error,
    hasMore,
    likePost,
    createPost,
    addComment,
    sharePost,
    loadMore,
    refresh,
  };
}
