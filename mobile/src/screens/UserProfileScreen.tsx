import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import PostCard from '../components/cards/PostCard';
import { postsAPI } from '../services/api';

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

interface UserProfileScreenProps {
  route: {
    params: {
      username: string;
    };
  };
  navigation: any;
}

export default function UserProfileScreen({ route, navigation }: UserProfileScreenProps) {
  const { username } = route.params;
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    bio: '',
    verified: false,
  });

  useEffect(() => {
    loadUserProfile();
  }, [username]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // For now, we'll use the feed API filtered by username
      // In production, you'd have a dedicated user profile endpoint
      const data = await postsAPI.getFeed();
      const userPosts = (data.results || data).filter(
        (post: Post) => post.author.username === username
      );
      setPosts(userPosts);
      setUserStats({
        postsCount: userPosts.length,
        followersCount: Math.floor(Math.random() * 1000),
        followingCount: Math.floor(Math.random() * 500),
        bio: 'Making an impact, one post at a time.',
        verified: false,
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
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

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      username={item.author.username}
      date={formatDate(item.created_at)}
      content={item.content}
      likes={item.likes_count}
      comments={item.comments_count}
      avatar={item.author.avatar}
      verified={false}
      images={item.images}
      postId={item.id}
      onCommentPress={() =>
        navigation.navigate('CommentThread', {
          post: item,
        })
      }
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#3B82F6" />
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
        <Text style={styles.headerTitle}>{username}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
              </View>
            </View>

            {/* Username */}
            <Text style={styles.username}>{username}</Text>

            {/* Bio */}
            <Text style={styles.bio}>{userStats.bio}</Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.postsCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageButton}>
                <Icon name="chatbubble-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>

            {/* Posts Header */}
            <View style={styles.postsHeader}>
              <Text style={styles.postsHeaderText}>Posts</Text>
            </View>
          </View>
        }
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    marginBottom: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postsHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  postsHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  feedContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
