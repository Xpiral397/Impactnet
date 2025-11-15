import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postsAPI } from '../services/api';
import HomeHeader from '../components/headers/HomeHeader';
import PostCard from '../components/cards/PostCard';

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
  post_type?: string;
}

interface FeedScreenProps {
  navigation: any;
}

type FeedFilter = 'feed' | 'donate' | 'request';
type SocialFilter = 'all' | 'following' | 'trending';

export default function FeedScreen({ navigation }: FeedScreenProps) {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('feed');
  const [activeSocialFilter, setActiveSocialFilter] = useState<SocialFilter>('all');

  useEffect(() => {
    if (allPosts.length === 0) {
      loadFeed();
    }
  }, []);

  useEffect(() => {
    filterPosts();
  }, [activeFilter, activeSocialFilter, allPosts]);

  const filterPosts = () => {
    let filtered = allPosts;

    // Filter by post type if not 'feed'
    if (activeFilter !== 'feed') {
      filtered = filtered.filter(p => p.post_type === activeFilter);
    }

    // Filter by social (following/trending) - for now just show all
    // TODO: Implement following/trending logic when backend ready

    setDisplayedPosts(filtered);
  };

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await postsAPI.getFeed(1);
      const posts = data.results || data;
      setAllPosts(posts);
    } catch (error) {
      console.error('Feed error:', error);
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
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
      onProfilePress={() =>
        navigation.navigate('UserProfile', {
          username: item.author.username,
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
      <HomeHeader
        onNotificationsPress={() => Alert.alert('Notifications', 'Coming soon!')}
        onSearchPress={() => Alert.alert('Search', 'Coming soon!')}
        onMessagesPress={() => {
          const parent = navigation.getParent();
          if (parent) {
            parent.navigate('Messages');
          }
        }}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeSocialFilter={activeSocialFilter}
        onSocialFilterChange={setActiveSocialFilter}
      />

      <FlatList
        data={displayedPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
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
  feedContent: {
    paddingVertical: 8,
  },
});
