import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { chatAPI, authAPI } from '../services/api';

interface ChatPrivacySettings {
  canViewStatus: boolean;
  canViewProfile: boolean;
  canCall: boolean;
  canVideoCall: boolean;
  canSendDonateRequest: boolean;
  canTag: boolean;
}

export default function ChatPrivacySettingsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, userName, targetUserId } = route.params as {
    chatId: string;
    userName: string;
    targetUserId: number;
  };

  const [settings, setSettings] = useState<ChatPrivacySettings>({
    canViewStatus: true,
    canViewProfile: true,
    canCall: true,
    canVideoCall: true,
    canSendDonateRequest: true,
    canTag: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Load existing settings when screen opens
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        // Get current user
        const userData = await authAPI.getCurrentUser();
        setCurrentUserId(userData.id);

        // Load existing privacy settings
        const privacyData = await chatAPI.getPrivacySettings(targetUserId, userData.id);
        console.log('🔒 Loaded existing privacy settings:', privacyData);

        // Transform backend data to UI format
        setSettings({
          canViewStatus: privacyData.can_view_status,
          canViewProfile: privacyData.can_view_profile,
          canCall: privacyData.can_call,
          canVideoCall: privacyData.can_video_call,
          canSendDonateRequest: privacyData.can_send_donate_request,
          canTag: privacyData.can_tag,
        });
      } catch (error) {
        console.error('❌ Failed to load privacy settings:', error);
        // Keep default settings if load fails
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [targetUserId]);

  const toggleSetting = (key: keyof ChatPrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const saveSettings = async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setSaving(true);

      // Transform UI format to backend format
      const backendSettings = {
        can_view_status: settings.canViewStatus,
        can_view_profile: settings.canViewProfile,
        can_call: settings.canCall,
        can_video_call: settings.canVideoCall,
        can_send_donate_request: settings.canSendDonateRequest,
        can_tag: settings.canTag,
      };

      console.log('💾 Saving privacy settings:', backendSettings);
      const response = await chatAPI.updatePrivacySettings(
        targetUserId,
        currentUserId,
        backendSettings
      );
      console.log('✅ Settings saved:', response);

      Alert.alert(
        'Settings Saved',
        'Privacy controls for this chat have been updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      Alert.alert(
        'Error',
        'Failed to save privacy settings. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Chat Privacy Controls</Text>
          <Text style={styles.headerSubtitle}>For {userName}</Text>
        </View>
        <TouchableOpacity
          onPress={saveSettings}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
          <Icon name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            These settings apply ONLY to this specific chat. They override your general privacy settings for this user.
          </Text>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What This User Can Do</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="eye-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>View My Status</Text>
                <Text style={styles.settingDescription}>
                  See when you're online and your last seen time
                </Text>
              </View>
            </View>
            <Switch
              value={settings.canViewStatus}
              onValueChange={() => toggleSetting('canViewStatus')}
              trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
              thumbColor={settings.canViewStatus ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="person-circle-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>View My Profile</Text>
                <Text style={styles.settingDescription}>
                  Access your full profile information
                </Text>
              </View>
            </View>
            <Switch
              value={settings.canViewProfile}
              onValueChange={() => toggleSetting('canViewProfile')}
              trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
              thumbColor={settings.canViewProfile ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="call-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Voice Call Me</Text>
                <Text style={styles.settingDescription}>
                  Make voice calls to you
                </Text>
              </View>
            </View>
            <Switch
              value={settings.canCall}
              onValueChange={() => toggleSetting('canCall')}
              trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
              thumbColor={settings.canCall ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="videocam-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Video Call Me</Text>
                <Text style={styles.settingDescription}>
                  Make video calls to you
                </Text>
              </View>
            </View>
            <Switch
              value={settings.canVideoCall}
              onValueChange={() => toggleSetting('canVideoCall')}
              trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
              thumbColor={settings.canVideoCall ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="gift-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Send Donate Requests</Text>
                <Text style={styles.settingDescription}>
                  Ask you for donations
                </Text>
              </View>
            </View>
            <Switch
              value={settings.canSendDonateRequest}
              onValueChange={() => toggleSetting('canSendDonateRequest')}
              trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
              thumbColor={settings.canSendDonateRequest ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="pricetag-outline" size={24} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Tag Me in Posts</Text>
                <Text style={styles.settingDescription}>
                  Mention you in their posts
                </Text>
              </View>
            </View>
            <Switch
              value={settings.canTag}
              onValueChange={() => toggleSetting('canTag')}
              trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
              thumbColor={settings.canTag ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
        </View>

          {/* Warning */}
          <View style={styles.warningCard}>
            <Icon name="warning" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              These settings only affect THIS conversation. To change settings for all users, go to Settings → Privacy.
            </Text>
          </View>
        </ScrollView>
      )}
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
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
});
