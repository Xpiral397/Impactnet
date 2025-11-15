import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { chatAPI, authAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

interface ChatStats {
  totalMessages: number;
  myMessages: number;
  theirMessages: number;
  interactionRatio: string;
  voiceCalls: number;
  videoCalls: number;
  groupsInCommon: number;
}

export default function ChatInfoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, user } = route.params as { chatId: string; user: User };

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ChatStats>({
    totalMessages: 0,
    myMessages: 0,
    theirMessages: 0,
    interactionRatio: '0:0',
    voiceCalls: 0,
    videoCalls: 0,
    groupsInCommon: 0,
  });

  useEffect(() => {
    loadChatStats();
  }, [chatId]);

  const loadChatStats = async () => {
    try {
      setLoading(true);

      // Get current user
      const currentUser = await authAPI.getCurrentUser();

      // Load messages and calculate stats
      const messagesData = await chatAPI.getMessages(chatId);
      const messagesArray = Array.isArray(messagesData) ? messagesData : (messagesData.results || []);

      // Count messages by sender
      let myCount = 0;
      let theirCount = 0;

      messagesArray.forEach((msg: any) => {
        const senderId = msg.sender?.id || msg.sender_id;
        if (senderId === currentUser.id) {
          myCount++;
        } else {
          theirCount++;
        }
      });

      // Calculate interaction ratio (simplified)
      const ratio = `${myCount}:${theirCount}`;

      setStats({
        totalMessages: messagesArray.length,
        myMessages: myCount,
        theirMessages: theirCount,
        interactionRatio: ratio,
        voiceCalls: 0, // TODO: Implement call tracking
        videoCalls: 0, // TODO: Implement video call tracking
        groupsInCommon: 0, // TODO: Implement groups tracking
      });
    } catch (error) {
      console.error('Failed to load chat stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Info</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.first_name[0]}{user.last_name[0]}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.userName}>
            {user.first_name} {user.last_name}
          </Text>
          <Text style={styles.username}>@{user.username}</Text>

          {user.phone && (
            <View style={styles.contactRow}>
              <Icon name="call-outline" size={20} color="#6B7280" />
              <Text style={styles.contactText}>{user.phone}</Text>
            </View>
          )}

          {user.email && (
            <View style={styles.contactRow}>
              <Icon name="mail-outline" size={20} color="#6B7280" />
              <Text style={styles.contactText}>{user.email}</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        ) : (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Chat Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="chatbubbles-outline" size={32} color="#3B82F6" />
                <Text style={styles.statValue}>{stats.totalMessages}</Text>
                <Text style={styles.statLabel}>Total Messages</Text>
              </View>

              <View style={styles.statCard}>
                <Icon name="swap-horizontal-outline" size={32} color="#8B5CF6" />
                <Text style={styles.statValue}>{stats.interactionRatio}</Text>
                <Text style={styles.statLabel}>Interaction Ratio</Text>
              </View>

              <View style={styles.statCard}>
                <Icon name="call-outline" size={32} color="#10B981" />
                <Text style={styles.statValue}>{stats.voiceCalls}</Text>
                <Text style={styles.statLabel}>Voice Calls</Text>
              </View>

              <View style={styles.statCard}>
                <Icon name="videocam-outline" size={32} color="#F59E0B" />
                <Text style={styles.statValue}>{stats.videoCalls}</Text>
                <Text style={styles.statLabel}>Video Calls</Text>
              </View>

              <View style={styles.statCard}>
                <Icon name="people-outline" size={32} color="#EC4899" />
                <Text style={styles.statValue}>{stats.groupsInCommon}</Text>
                <Text style={styles.statLabel}>Groups in Common</Text>
              </View>
            </View>

            {/* Message Breakdown */}
            <View style={styles.breakdownSection}>
              <Text style={styles.breakdownTitle}>Message Breakdown</Text>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <View style={[styles.breakdownDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.breakdownText}>You: {stats.myMessages}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <View style={[styles.breakdownDot, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.breakdownText}>Them: {stats.theirMessages}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="search-outline" size={24} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Search in Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="notifications-outline" size={24} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Mute Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="albums-outline" size={24} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>View Media</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 8,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  breakdownSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  breakdownText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButtonText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#1F2937',
  },
});
