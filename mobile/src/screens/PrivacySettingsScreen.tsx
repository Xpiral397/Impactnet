import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

interface PrivacySettings {
  allowChat: boolean;
  allowSingleMessage: boolean;
  allowVoiceCall: boolean;
  allowVideoCall: boolean;
  allowDonateRequest: boolean;
  allowTagging: boolean;
}

export default function PrivacySettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<PrivacySettings>({
    allowChat: true,
    allowSingleMessage: false,
    allowVoiceCall: true,
    allowVideoCall: true,
    allowDonateRequest: true,
    allowTagging: true,
  });

  const toggleSetting = (key: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Section: Communication */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="chatbubbles" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Communication</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Control who can contact you and how
          </Text>

          <View style={styles.settingsList}>
            {/* Allow Chat */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Icon name="chatbox-ellipses" size={22} color="#3B82F6" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Allow Chat Messages</Text>
                  <Text style={styles.settingSubtitle}>
                    Let other users send you messages
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.allowChat}
                onValueChange={() => toggleSetting('allowChat')}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={settings.allowChat ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            {/* Single Message Only */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Icon name="mail" size={22} color="#8B5CF6" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Single Message Only</Text>
                  <Text style={styles.settingSubtitle}>
                    Users can only send one message until you reply
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.allowSingleMessage}
                onValueChange={() => toggleSetting('allowSingleMessage')}
                trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
                thumbColor={settings.allowSingleMessage ? '#8B5CF6' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Section: Calls */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="call" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Calls</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Manage voice and video call permissions
          </Text>

          <View style={styles.settingsList}>
            {/* Voice Calls */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Icon name="call" size={22} color="#10B981" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Allow Voice Calls</Text>
                  <Text style={styles.settingSubtitle}>
                    Let users call you via voice
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.allowVoiceCall}
                onValueChange={() => toggleSetting('allowVoiceCall')}
                trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
                thumbColor={settings.allowVoiceCall ? '#10B981' : '#F3F4F6'}
              />
            </View>

            {/* Video Calls */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Icon name="videocam" size={22} color="#F59E0B" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Allow Video Calls</Text>
                  <Text style={styles.settingSubtitle}>
                    Let users video call you
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.allowVideoCall}
                onValueChange={() => toggleSetting('allowVideoCall')}
                trackColor={{ false: '#D1D5DB', true: '#FCD34D' }}
                thumbColor={settings.allowVideoCall ? '#F59E0B' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Section: Interactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="people" size={20} color="#EF4444" />
            <Text style={styles.sectionTitle}>Interactions</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Control how others can interact with you
          </Text>

          <View style={styles.settingsList}>
            {/* Donate Requests */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Icon name="heart" size={22} color="#EF4444" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Allow Donate Requests</Text>
                  <Text style={styles.settingSubtitle}>
                    Let users send you donation requests
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.allowDonateRequest}
                onValueChange={() => toggleSetting('allowDonateRequest')}
                trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
                thumbColor={settings.allowDonateRequest ? '#EF4444' : '#F3F4F6'}
              />
            </View>

            {/* Tagging */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIcon}>
                  <Icon name="at" size={22} color="#6366F1" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Allow Tagging</Text>
                  <Text style={styles.settingSubtitle}>
                    Let users tag you in posts and comments
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.allowTagging}
                onValueChange={() => toggleSetting('allowTagging')}
                trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
                thumbColor={settings.allowTagging ? '#6366F1' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            These settings help you control your privacy and how others can contact you.
            Changes are saved automatically.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Icon name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
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
    paddingVertical: 16,
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  settingsList: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
