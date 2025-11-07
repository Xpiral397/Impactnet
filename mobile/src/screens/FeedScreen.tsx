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
}

interface FeedScreenProps {
  navigation: any;
}

export default function FeedScreen({ navigation }: FeedScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await postsAPI.getFeed();
      setPosts(data.results || data);
    } catch (error) {
      // Show mock data if API fails
      setPosts([
        {
          id: 1,
          author: { username: 'kimberly857932' },
          content: 'Learning new skills every day. This opportunity has changed my life!',
          images: [],
          likes_count: 0,
          comments_count: 0,
          created_at: '2025-11-06',
        },
        {
          id: 2,
          author: { username: 'laura075387' },
          content: 'The skills training I received has opened so many doors. Grateful for this platform!',
          images: [],
          likes_count: 0,
          comments_count: 0,
          created_at: '2025-11-06',
        },
      ]);
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
          postId: item.id,
          postContent: item.content,
          postAuthor: item.author.username,
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
      />
      
      <FlatList
        data={posts}
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
