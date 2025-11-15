import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { chatAPI, authAPI } from '../services/api';

interface Message {
  id: string;
  content: string;
  sender_id: number;
  timestamp: string;
  is_read: boolean;
  type: 'text' | 'voice' | 'video' | 'image';
  media_url?: string;
  duration?: number; // For voice/video messages
  status?: 'sending' | 'sent' | 'delivered' | 'read'; // Message status
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
}

interface ChatPrivacySettings {
  canViewStatus: boolean;
  canViewProfile: boolean;
  canCall: boolean;
  canVideoCall: boolean;
  canSendDonateRequest: boolean;
  canTag: boolean;
  muteNotifications: boolean;
  blockedUntil: string | null;
}

interface UserPrivacySettings {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showProfile: boolean;
  allowCalls: boolean;
  allowVideoCalls: boolean;
  allowMessages: boolean;
  allowOnlyOneMessage: boolean;
  allowDonateRequests: boolean;
  allowTagging: boolean;
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, user } = route.params as { chatId: string; user: User };

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [chatPrivacy, setChatPrivacy] = useState<ChatPrivacySettings>({
    canViewStatus: true,
    canViewProfile: true,
    canCall: true,
    canVideoCall: true,
    canSendDonateRequest: true,
    canTag: true,
    muteNotifications: false,
    blockedUntil: null,
  });
  const [userPrivacy, setUserPrivacy] = useState<UserPrivacySettings | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const recordingAnimation = useRef(new Animated.Value(1)).current;

  // Calculate what can be shown based on privacy rules
  const canViewStatus = () => {
    // Check chat-level privacy first (most restrictive)
    if (!chatPrivacy.canViewStatus) return false;

    // Check if user is blocked temporarily
    if (chatPrivacy.blockedUntil) {
      const blockedUntilDate = new Date(chatPrivacy.blockedUntil);
      if (blockedUntilDate > new Date()) return false;
    }

    // Check user-level privacy settings
    if (userPrivacy && !userPrivacy.showOnlineStatus && !userPrivacy.showLastSeen) {
      return false;
    }

    return true;
  };

  const getStatusText = () => {
    if (!canViewStatus()) {
      return ''; // Don't show anything if privacy settings don't allow
    }

    // Only show green dot + "Online" if user is ACTUALLY online
    if (user.is_online === true) {
      return 'Online';
    }

    // Show last seen only if allowed and available (no green dot for offline)
    if (user.last_seen && (!userPrivacy || userPrivacy.showLastSeen)) {
      return `Last seen ${user.last_seen}`;
    }

    return ''; // Show nothing - don't indicate offline
  };

  // Load messages from backend
  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading messages for conversation:', chatId);
      const data = await chatAPI.getMessages(chatId);
      console.log('✅ Loaded messages:', data);
      console.log('Is array:', Array.isArray(data));

      // Handle paginated response
      const messagesArray = Array.isArray(data) ? data : (data.results || []);
      console.log('📝 Messages array:', messagesArray, 'length:', messagesArray.length);

      // Transform backend messages to match UI format
      const transformedMessages: Message[] = messagesArray.map((msg: any) => {
        console.log('📝 Transforming message:', msg);
        return {
          id: msg.id.toString(),
          content: msg.content,
          sender_id: msg.sender?.id || msg.sender_id,
          timestamp: msg.timestamp || msg.created_at,
          is_read: msg.is_read,
          type: msg.message_type || msg.type || 'text',
          media_url: msg.media_url,
          duration: msg.duration,
        };
      });
      console.log('✅ Transformed messages:', transformedMessages);
      setMessages(transformedMessages);
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Load current user and privacy settings
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        console.log('📱 Current user:', userData);
        setCurrentUserId(userData.id);

        // Load chat-specific privacy settings from backend
        try {
          const privacyData = await chatAPI.getPrivacySettings(user.id, userData.id);
          console.log('🔒 Loaded privacy settings:', privacyData);

          // Transform backend data to match UI format
          setChatPrivacy({
            canViewStatus: privacyData.can_view_status,
            canViewProfile: privacyData.can_view_profile,
            canCall: privacyData.can_call,
            canVideoCall: privacyData.can_video_call,
            canSendDonateRequest: privacyData.can_send_donate_request,
            canTag: privacyData.can_tag,
            muteNotifications: privacyData.mute_notifications,
            blockedUntil: privacyData.blocked_until,
          });
        } catch (privacyError) {
          console.error('⚠️ Failed to load privacy settings, using defaults:', privacyError);
          // Keep default settings if load fails
        }

        // Load user's general privacy settings (simulated for now)
        // TODO: Fetch from user profile API
        setUserPrivacy({
          showOnlineStatus: true,
          showLastSeen: true,
          showProfile: true,
          allowCalls: true,
          allowVideoCalls: true,
          allowMessages: true,
          allowOnlyOneMessage: false,
          allowDonateRequests: true,
          allowTagging: true,
        });
      } catch (error) {
        console.error('❌ Failed to load current user:', error);
        // Fallback to default
        setCurrentUserId(1);
      }
    };
    loadCurrentUser();
  }, [user.id]);

  // Handle menu actions
  const handleMuteNotifications = () => {
    setChatPrivacy(prev => ({
      ...prev,
      muteNotifications: !prev.muteNotifications,
    }));
    Alert.alert(
      'Notifications',
      chatPrivacy.muteNotifications ? 'Notifications enabled' : 'Notifications muted',
      [{ text: 'OK' }]
    );
    setShowChatMenu(false);
  };

  const handleBlockTemporarily = () => {
    Alert.alert(
      'Block Temporarily',
      'How long do you want to block this user?',
      [
        { text: '1 hour', onPress: () => blockUser(1) },
        { text: '8 hours', onPress: () => blockUser(8) },
        { text: '24 hours', onPress: () => blockUser(24) },
        { text: '1 week', onPress: () => blockUser(168) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
    setShowChatMenu(false);
  };

  const blockUser = (hours: number) => {
    const blockedUntil = new Date();
    blockedUntil.setHours(blockedUntil.getHours() + hours);
    setChatPrivacy(prev => ({
      ...prev,
      blockedUntil: blockedUntil.toISOString(),
    }));
    Alert.alert('User Blocked', `User blocked for ${hours} hour(s)`, [{ text: 'OK' }]);
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to delete all messages in this conversation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            Alert.alert('Chat Cleared', 'All messages have been deleted');
          },
        },
      ]
    );
    setShowChatMenu(false);
  };

  const handleDeleteChat = () => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this entire conversation? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
            Alert.alert('Chat Deleted', 'Conversation has been deleted');
          },
        },
      ]
    );
    setShowChatMenu(false);
  };

  // Load messages on mount
  useEffect(() => {
    if (chatId && currentUserId !== null) {
      loadMessages();
    }
  }, [chatId, currentUserId]);

  useEffect(() => {
    if (isRecording) {
      startRecordingAnimation();
    }
  }, [isRecording]);

  const startRecordingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnimation, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      // Check if timestamp exists
      if (!timestamp) {
        return '';
      }

      // Handle Django's ISO 8601 format with microseconds
      // Format: "2025-11-10T00:45:37.427055+01:00"
      // JavaScript Date can handle this, but we'll be defensive
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
        return '';
      }

      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return '';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (inputText.trim().length === 0) return;

    const tempId = `temp-${Date.now()}`;
    const messageContent = inputText.trim();

    // Optimistic UI update
    const tempMessage: Message = {
      id: tempId,
      content: messageContent,
      sender_id: currentUserId || 1,
      timestamp: new Date().toISOString(),
      is_read: false,
      type: 'text',
      status: 'sending',
    };

    setMessages(prev => Array.isArray(prev) ? [...prev, tempMessage] : [tempMessage]);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Send to backend
    try {
      console.log('📤 Sending message:', messageContent);
      const savedMessage = await chatAPI.sendMessage(chatId, messageContent, 'text');
      console.log('✅ Message sent:', savedMessage);

      // Transform backend message to match UI format
      const transformedMessage: Message = {
        id: savedMessage.id.toString(),
        content: savedMessage.content,
        sender_id: savedMessage.sender?.id || (currentUserId || 1),
        timestamp: savedMessage.timestamp || savedMessage.created_at,
        is_read: savedMessage.is_read,
        type: savedMessage.message_type || 'text',
        media_url: savedMessage.media_url,
        duration: savedMessage.duration,
        status: 'sent',
      };

      // Replace temp message with real one
      setMessages(prev =>
        Array.isArray(prev)
          ? prev.map(msg => msg.id === tempId ? transformedMessage : msg)
          : [transformedMessage]
      );
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
      // Remove temp message on error
      setMessages(prev => Array.isArray(prev) ? prev.filter(msg => msg.id !== tempId) : []);
    }
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      // Stop recording and send
      setIsRecording(false);
      const newMessage: Message = {
        id: Date.now().toString(),
        content: 'Voice message',
        sender_id: currentUserId || 1,
        timestamp: new Date().toISOString(),
        is_read: false,
        type: 'voice',
        duration: recordingDuration,
      };
      setMessages([...messages, newMessage]);
      setRecordingDuration(0);
    } else {
      // Start recording
      setIsRecording(true);
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      // Store interval to clear later
      setTimeout(() => clearInterval(interval), 60000); // Max 1 minute
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.sender_id === currentUserId;
    const showAvatar = !isCurrentUser && (
      index === messages.length - 1 ||
      messages[index + 1]?.sender_id !== item.sender_id
    );

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        {/* Avatar for other user */}
        {!isCurrentUser && (
          <View style={styles.avatarSpace}>
            {showAvatar ? (
              user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.messageAvatar} />
              ) : (
                <View style={[styles.messageAvatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {user.first_name[0]}{user.last_name[0]}
                  </Text>
                </View>
              )
            ) : null}
          </View>
        )}

        {/* Message Bubble */}
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        >
          {item.type === 'text' && (
            <Text
              style={[
                styles.messageText,
                isCurrentUser ? styles.currentUserText : styles.otherUserText,
              ]}
            >
              {item.content}
            </Text>
          )}

          {item.type === 'voice' && (
            <View style={styles.voiceMessageContainer}>
              <TouchableOpacity style={styles.playButton}>
                <Icon
                  name="play"
                  size={20}
                  color={isCurrentUser ? '#FFFFFF' : '#3B82F6'}
                />
              </TouchableOpacity>
              <View style={styles.waveformContainer}>
                {[...Array(20)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveformBar,
                      {
                        height: Math.random() * 20 + 10,
                        backgroundColor: isCurrentUser ? '#FFFFFF' : '#3B82F6',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text
                style={[
                  styles.voiceDuration,
                  isCurrentUser ? styles.currentUserText : styles.otherUserText,
                ]}
              >
                {formatDuration(item.duration || 0)}
              </Text>
            </View>
          )}

          {/* Timestamp and Read Status */}
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.timestamp,
                isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp,
              ]}
            >
              {formatTimestamp(item.timestamp)}
            </Text>
            {isCurrentUser && (
              <>
                {item.status === 'sending' && (
                  <Icon name="time-outline" size={14} color="#93C5FD" style={styles.readIcon} />
                )}
                {item.status === 'sent' && (
                  <Icon name="checkmark" size={14} color="#93C5FD" style={styles.readIcon} />
                )}
                {item.status === 'delivered' && (
                  <Icon name="checkmark-done" size={14} color="#93C5FD" style={styles.readIcon} />
                )}
                {(item.status === 'read' || item.is_read) && (
                  <Icon name="checkmark-done" size={14} color="#60A5FA" style={styles.readIcon} />
                )}
                {!item.status && !item.is_read && (
                  <Icon name="checkmark" size={14} color="#93C5FD" style={styles.readIcon} />
                )}
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.headerAvatarText}>
                {user.first_name[0]}{user.last_name[0]}
              </Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerName}>
              {user.first_name} {user.last_name}
            </Text>
            {getStatusText() && (
              <View style={styles.statusContainer}>
                {user.is_online === true && (
                  <View style={styles.onlineDot} />
                )}
                <Text style={styles.headerStatus}>
                  {getStatusText()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="videocam-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="call-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowChatMenu(!showChatMenu)}
          >
            <Icon name="ellipsis-vertical" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
            </View>
          }
        />
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Animated.View
            style={[
              styles.recordingDot,
              { transform: [{ scale: recordingAnimation }] },
            ]}
          />
          <Text style={styles.recordingText}>
            Recording... {formatDuration(recordingDuration)}
          </Text>
          <TouchableOpacity onPress={handleVoiceRecord}>
            <Text style={styles.recordingStop}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowActions(!showActions)}
          >
            <Icon name="add-circle" size={32} color="#3B82F6" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            {inputText.length === 0 && (
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={handleVoiceRecord}
              >
                <Icon name="mic" size={24} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </View>

          {inputText.length > 0 ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Icon name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cameraButton}>
              <Icon name="camera" size={24} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Actions Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionsMenu}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Icon name="image" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="videocam" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                <Icon name="document" size={24} color="#EF4444" />
              </View>
              <Text style={styles.actionText}>Document</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                <Icon name="location" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Location</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Chat Settings Menu */}
      <Modal
        visible={showChatMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChatMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChatMenu(false)}
        >
          <View style={styles.chatMenu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Chat Settings</Text>
              <TouchableOpacity onPress={() => setShowChatMenu(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowChatMenu(false);
                  // @ts-ignore
                  navigation.navigate('ChatInfo', {
                    chatId,
                    user,
                  });
                }}
              >
                <Icon name="information-circle-outline" size={24} color="#3B82F6" />
                <Text style={styles.menuItemText}>View Info</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleMuteNotifications}
              >
                <Icon
                  name={chatPrivacy.muteNotifications ? "notifications-outline" : "notifications-off-outline"}
                  size={24}
                  color="#F59E0B"
                />
                <Text style={styles.menuItemText}>
                  {chatPrivacy.muteNotifications ? 'Unmute Notifications' : 'Mute Notifications'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItemWithSubtext}
                onPress={() => {
                  setShowChatMenu(false);
                  // @ts-ignore
                  navigation.navigate('ChatPrivacySettings', {
                    chatId,
                    userName: `${user.first_name} ${user.last_name}`,
                    targetUserId: user.id,
                  });
                }}
              >
                <Icon name="shield-checkmark-outline" size={24} color="#8B5CF6" />
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitleText}>Chat Privacy Controls</Text>
                  <Text style={styles.menuItemSubtext}>What this user can do with you</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItemWithSubtext}
                onPress={handleBlockTemporarily}
              >
                <Icon name="time-outline" size={24} color="#8B5CF6" />
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitleText}>Block Temporarily</Text>
                  <Text style={styles.menuItemSubtext}>1hr, 8hrs, 24hrs, 1 week</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleClearChat}
              >
                <Icon name="trash-outline" size={24} color="#EF4444" />
                <Text style={styles.menuItemText}>Clear Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDanger]}
                onPress={handleDeleteChat}
              >
                <Icon name="ban-outline" size={24} color="#EF4444" />
                <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete Chat</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatarPlaceholder: {
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  avatarSpace: {
    width: 32,
    marginRight: 8,
    alignItems: 'center',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  currentUserBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#1F2937',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  currentUserTimestamp: {
    color: '#E0E7FF',
  },
  otherUserTimestamp: {
    color: '#9CA3AF',
  },
  readIcon: {
    marginLeft: 4,
  },
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  voiceDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FEF3C7',
    borderTopWidth: 1,
    borderTopColor: '#FCD34D',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  recordingStop: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    marginRight: 8,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    maxHeight: 80,
  },
  voiceButton: {
    marginLeft: 8,
    marginBottom: 2,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cameraButton: {
    marginLeft: 8,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionsMenu: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  chatMenu: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '75%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuScroll: {
    maxHeight: '85%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  menuItemWithSubtext: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  menuItemTextContainer: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 2,
  },
  menuItemText: {
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  menuItemTitleText: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 0,
  },
  menuItemSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    lineHeight: 14,
  },
  menuItemDanger: {
    backgroundColor: '#FEE2E2',
  },
  menuItemTextDanger: {
    color: '#EF4444',
  },
});
