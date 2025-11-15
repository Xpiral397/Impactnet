import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { chatAPI } from '../services/api';

interface ChatPreview {
  id: string;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    phone?: string;
    is_ai?: boolean;
  };
  last_message: {
    content: string;
    timestamp: string;
    is_read: boolean;
    sender_id: number;
  };
  unread_count: number;
}

// Sample data - will be replaced with API data
const SAMPLE_CHATS: ChatPreview[] = [
  {
    id: 'ai-assistant',
    user: {
      id: 0,
      username: 'impactai',
      first_name: 'Impact',
      last_name: 'AI',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=impactai&backgroundColor=8b5cf6',
      is_ai: true,
    },
    last_message: {
      content: 'Hi! I\'m here to help you make an impact. Ask me anything! 🤖',
      timestamp: '2025-01-09T10:35:00Z',
      is_read: true,
      sender_id: 0,
    },
    unread_count: 0,
  },
  {
    id: '1',
    user: {
      id: 2,
      username: 'sarahjohnson',
      first_name: 'Sarah',
      last_name: 'Johnson',
      phone: '+1234567890',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=3B82F6&color=fff&size=128',
    },
    last_message: {
      content: 'Thank you so much for your support! 🙏',
      timestamp: '2025-01-09T10:30:00Z',
      is_read: false,
      sender_id: 2,
    },
    unread_count: 2,
  },
  {
    id: '2',
    user: {
      id: 3,
      username: 'michaelbrown',
      first_name: 'Michael',
      last_name: 'Brown',
      phone: '+1987654321',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=10B981&color=fff&size=128',
    },
    last_message: {
      content: 'When can we schedule the meetup?',
      timestamp: '2025-01-09T09:15:00Z',
      is_read: true,
      sender_id: 1,
    },
    unread_count: 0,
  },
  {
    id: '3',
    user: {
      id: 4,
      username: 'emmawilson',
      first_name: 'Emma',
      last_name: 'Wilson',
      phone: '+1555123456',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=F59E0B&color=fff&size=128',
    },
    last_message: {
      content: 'Great initiative! Count me in 💪',
      timestamp: '2025-01-08T18:45:00Z',
      is_read: true,
      sender_id: 4,
    },
    unread_count: 0,
  },
];

export default function ChatListScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatPreview[]>(SAMPLE_CHATS);
  const [filteredChats, setFilteredChats] = useState<ChatPreview[]>(SAMPLE_CHATS);
  const [loading, setLoading] = useState(false);

  // Load real conversations from backend
  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading conversations from backend...');
      const data = await chatAPI.getConversations();
      const conversations = data.results || data;
      console.log('✅ Loaded conversations:', data);
      console.log('Type of data:', typeof data, 'Is array:', Array.isArray(data));

      // Check if data is an array
      if (!Array.isArray(conversations)) {
        console.warn('⚠️ Backend returned non-array data, using empty array');
        setLoading(false);
        return;
      }

      // Transform backend data to match UI format
      const transformedChats = conversations.map((conv: any) => {
        const otherUser = conv.participants?.find((p: any) => p.username !== 'testuser');
        const lastMsg = conv.last_message;

        return {
          id: conv.id.toString(),
          user: otherUser || conv.participants?.[0] || {
            id: 0,
            username: 'Unknown',
            first_name: 'Unknown',
            last_name: 'User',
          },
          last_message: lastMsg || {
            content: 'No messages yet',
            timestamp: conv.created_at,
            is_read: true,
            sender_id: 0,
          },
          unread_count: conv.unread_count || 0,
        };
      });

      console.log('📋 Transformed chats:', transformedChats);

      if (transformedChats.length > 0) {
        setChats(transformedChats);
        setFilteredChats(transformedChats);
      }
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load conversations when screen appears
  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [])
  );

  // Filter chats based on search query (name, username, or phone)
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chats.filter(chat => {
        const fullName = `${chat.user.first_name} ${chat.user.last_name}`.toLowerCase();
        const username = chat.user.username.toLowerCase();
        const phone = chat.user.phone || '';

        return (
          fullName.includes(query) ||
          username.includes(query) ||
          phone.includes(query)
        );
      });
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const formatTimestamp = (timestamp: string) => {
    try {
      // Check if timestamp exists
      if (!timestamp) {
        return 'No date';
      }

      // Handle Django's ISO 8601 format with microseconds
      // Format: "2025-11-10T00:45:37.427055+01:00"
      let cleanTimestamp = timestamp;

      // If timestamp has more than 3 decimal places (milliseconds), trim to 3
      const microsecondMatch = timestamp.match(/\.(\d+)/);
      if (microsecondMatch && microsecondMatch[1].length > 3) {
        cleanTimestamp = timestamp.replace(/\.\d+/, `.${microsecondMatch[1].substring(0, 3)}`);
      }

      const date = new Date(cleanTimestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', timestamp);
        return 'Invalid date';
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Invalid date';
    }
  };

  const renderChatItem = ({ item }: { item: ChatPreview }) => {
    const isUnread = item.unread_count > 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => {
          // @ts-ignore - navigation types
          navigation.navigate('Chat', { chatId: item.id, user: item.user });
        }}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.user.avatar ? (
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {item.user.first_name[0]}{item.user.last_name[0]}
              </Text>
            </View>
          )}
          {isUnread && <View style={styles.onlineIndicator} />}
        </View>

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <View style={styles.userNameContainer}>
              <Text style={[styles.userName, isUnread && styles.unreadText]}>
                {item.user.first_name} {item.user.last_name}
              </Text>
              {item.user.is_ai && (
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.last_message.timestamp)}
            </Text>
          </View>
          <View style={styles.messagePreview}>
            <Text
              style={[styles.lastMessage, isUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {item.last_message.sender_id === 1 ? 'You: ' : ''}
              {item.last_message.content}
            </Text>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              // @ts-ignore - navigation types
              navigation.navigate('PrivacySettings');
            }}
          >
            <Icon name="shield-checkmark-outline" size={22} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.newChatButton}>
            <Icon name="create-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, username or phone..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Chat List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  listContent: {
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  aiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  unreadText: {
    fontWeight: '600',
    color: '#1F2937',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 84,
  },
});
