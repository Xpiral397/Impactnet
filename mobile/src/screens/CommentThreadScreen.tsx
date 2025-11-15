import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { postsAPI, aiAPI } from '../services/api';
import PostCard from '../components/cards/PostCard';

interface Comment {
  id: number;
  author: {
    username: string;
    avatar?: string;
  };
  content: string;
  created_at: string;
  replies?: Comment[];
  parent?: number;
}

interface Post {
  id: number;
  author: {
    username: string;
    avatar?: string;
  };
  content: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface CommentThreadScreenProps {
  route: {
    params: {
      post: Post;
    };
  };
  navigation: any;
}

export default function CommentThreadScreen({ route, navigation }: CommentThreadScreenProps) {
  const { post } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyingToComment, setReplyingToComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rewriting, setRewriting] = useState(false);

  useEffect(() => {
    if (post && post.id) {
      loadComments();
    }
  }, [post?.id]);

  const loadComments = async () => {
    if (!post || !post.id) {
      console.error('Cannot load comments: post is undefined');
      return;
    }

    setLoading(true);
    try {
      const data = await postsAPI.getComments(post.id);

      // API already returns nested structure with replies
      // Just use it directly - no need to rebuild the tree
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    console.log('Submitting comment:', {
      content: newComment,
      parentId: replyingTo,
      postId: post.id
    });

    setSubmitting(true);
    try {
      await postsAPI.commentOnPost(post.id, newComment, replyingTo);
      console.log('Comment submitted successfully');
      setNewComment('');
      setReplyingTo(null);
      setReplyingToComment(null);
      await loadComments();
    } catch (error: any) {
      console.error('Comment error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to post comment. Please try logging in again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIRewrite = async () => {
    if (!newComment.trim()) {
      Alert.alert('Info', 'Please enter some text first');
      return;
    }

    setRewriting(true);
    try {
      const result = await aiAPI.rewriteText(newComment, 'comment');
      if (result.success && result.rewritten) {
        setNewComment(result.rewritten);
      } else if (result.message) {
        Alert.alert('Info', result.message);
      }
    } catch (error: any) {
      console.error('AI rewrite error:', error);
      Alert.alert('Info', 'AI help is not available right now');
    } finally {
      setRewriting(false);
    }
  };

  const formatDateRelative = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderComment = (comment: Comment, level: number = 0, isLast: boolean = false, isFirstChild: boolean = false) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const replyCount = comment.replies?.length || 0;

    return (
      <View key={comment.id} style={styles.commentWrapper}>
        <View style={[styles.commentRow, { marginLeft: level * 28 }]}>
          {/* Thread lines - only show if has parent */}
          {level > 0 && (
            <View style={styles.threadLineContainer}>
              {/* Vertical line from parent (only if not first child or if not last sibling) */}
              {!isLast && (
                <View style={[
                  styles.threadVerticalLine,
                  { height: '100%' }
                ]} />
              )}

              {/* Curved L-shape connecting to parent */}
              <View style={[
                styles.threadCurvedConnector,
                isLast && styles.threadCurvedConnectorLast
              ]} />
            </View>
          )}

          {/* Comment Card */}
          <View style={styles.commentContainer}>
            <TouchableOpacity
              style={styles.commentHeader}
              onPress={() =>
                navigation.navigate('UserProfile', {
                  username: comment.author.username,
                })
              }
              activeOpacity={0.7}
            >
              <View style={[
                styles.commentAvatar,
                { backgroundColor: level === 0 ? '#3B82F6' : level === 1 ? '#8B5CF6' : level === 2 ? '#EC4899' : '#F59E0B' }
              ]}>
                <Text style={styles.commentAvatarText}>
                  {comment.author.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.commentInfo}>
                <Text style={styles.commentAuthor}>{comment.author.username}</Text>
                <Text style={styles.commentDate}>{formatDateRelative(comment.created_at)}</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.commentContent}>{comment.content}</Text>

            <View style={styles.commentActions}>
              <TouchableOpacity style={styles.commentActionButton}>
                <Icon name="heart-outline" size={16} color="#6B7280" />
                <Text style={styles.commentActionText}>{comment.likes_count || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.replyButton}
                onPress={() => {
                  setReplyingTo(comment.id);
                  setReplyingToComment(comment);
                  console.log('Replying to comment:', comment.author.username, comment.content);
                }}
              >
                <Icon name="arrow-undo-outline" size={14} color="#6B7280" />
                <Text style={styles.replyButtonText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Nested replies */}
        {hasReplies && (
          <View>
            {comment.replies!.map((reply, index) =>
              renderComment(reply, level + 1, index === replyCount - 1, index === 0)
            )}
          </View>
        )}
      </View>
    );
  };

  if (!post) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Original Post - Full PostCard */}
      <View style={styles.originalPostContainer}>
        <PostCard
          username={post.author.username}
          date={formatDate(post.created_at)}
          content={post.content}
          likes={post.likes_count}
          comments={post.comments_count}
          avatar={post.author.avatar}
          verified={false}
          images={post.images}
          postId={post.id}
          onProfilePress={() =>
            navigation.navigate('UserProfile', {
              username: post.author.username,
            })
          }
        />
      </View>

      {/* Comments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={({ item }) => renderComment(item)}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.commentsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
          }
        />
      )}

      {/* Comment Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          {replyingTo && replyingToComment && (
            <View style={styles.replyingToBar}>
              <View style={styles.replyingToContent}>
                <Icon name="arrow-undo" size={14} color="#3B82F6" />
                <Text style={styles.replyingToText}>
                  Replying to <Text style={styles.replyingToUsername}>@{replyingToComment.author.username}</Text>
                </Text>
                <Text style={styles.replyingToPreview} numberOfLines={1}>
                  {replyingToComment.content}
                </Text>
              </View>
              <TouchableOpacity onPress={() => {
                setReplyingTo(null);
                setReplyingToComment(null);
              }}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              placeholderTextColor="#9CA3AF"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={() => Alert.alert('Voice Recording', 'Coming soon!')}
            >
              <Icon name="mic-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={() => Alert.alert('Video Recording', 'Coming soon!')}
            >
              <Icon name="videocam-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  originalPostContainer: {
    borderBottomWidth: 8,
    borderBottomColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    padding: 16,
  },
  commentWrapper: {
    marginBottom: 0,
  },
  commentRow: {
    flexDirection: 'row',
    position: 'relative',
  },
  commentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  threadLineContainer: {
    position: 'absolute',
    left: -22,
    top: -8,
    bottom: 0,
    width: 22,
  },
  threadVerticalLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 1,
    backgroundColor: '#2563EB',
    opacity: 0.6,
  },
  threadCurvedConnector: {
    position: 'absolute',
    left: 0,
    top: 24,
    width: 22,
    height: 20,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2563EB',
    opacity: 0.6,
    borderBottomLeftRadius: 10,
  },
  threadCurvedConnectorLast: {
    borderLeftWidth: 1,
    borderBottomWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  commentDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  commentContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 23,
    marginBottom: 10,
    letterSpacing: -0.2,
    fontWeight: '400',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginLeft: -8,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  commentActionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  replyButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  repliesContainer: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 32,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 12,
  },
  replyingToBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  replyingToContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  replyingToText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  replyingToUsername: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  replyingToPreview: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 100,
  },
  mediaButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
