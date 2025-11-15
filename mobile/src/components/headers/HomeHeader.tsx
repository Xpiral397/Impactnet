import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

type FeedFilter = 'feed' | 'donate' | 'request';
type SocialFilter = 'all' | 'following' | 'trending';

interface HomeHeaderProps {
  onNotificationsPress?: () => void;
  onSearchPress?: () => void;
  onMessagesPress?: () => void;
  activeFilter?: FeedFilter;
  onFilterChange?: (filter: FeedFilter) => void;
  activeSocialFilter?: SocialFilter;
  onSocialFilterChange?: (filter: SocialFilter) => void;
}

export default function HomeHeader({
  onNotificationsPress,
  onSearchPress,
  onMessagesPress,
  activeFilter = 'feed',
  onFilterChange,
  activeSocialFilter = 'all',
  onSocialFilterChange
}: HomeHeaderProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        {/* Logo and Title */}
        <View style={styles.leftSection}>
          <Text style={styles.logoIcon}>∞</Text>
          <Text style={styles.title}>ImpactNet</Text>
        </View>

        {/* Actions */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSearchPress}
          >
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMessagesPress}
          >
            <Icon name="chatbubbles-outline" size={22} color="#1F2937" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationsPress}
          >
            <Text style={styles.iconText}>🔔</Text>
            {/* Notification Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Post Type Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'feed' && styles.filterTabActive]}
          onPress={() => onFilterChange?.('feed')}
        >
          <Text style={[styles.filterText, activeFilter === 'feed' && styles.filterTextActive]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'donate' && styles.filterTabActive]}
          onPress={() => onFilterChange?.('donate')}
        >
          <Text style={[styles.filterText, activeFilter === 'donate' && styles.filterTextActive]}>Donate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'request' && styles.filterTabActive]}
          onPress={() => onFilterChange?.('request')}
        >
          <Text style={[styles.filterText, activeFilter === 'request' && styles.filterTextActive]}>Request</Text>
        </TouchableOpacity>
      </View>

      {/* Social Filter Tabs */}
      <View style={styles.socialFilterContainer}>
        <TouchableOpacity
          style={[styles.socialFilterTab, activeSocialFilter === 'all' && styles.socialFilterTabActive]}
          onPress={() => onSocialFilterChange?.('all')}
        >
          <Text style={[styles.socialFilterText, activeSocialFilter === 'all' && styles.socialFilterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialFilterTab, activeSocialFilter === 'following' && styles.socialFilterTabActive]}
          onPress={() => onSocialFilterChange?.('following')}
        >
          <Text style={[styles.socialFilterText, activeSocialFilter === 'following' && styles.socialFilterTextActive]}>Following</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialFilterTab, activeSocialFilter === 'trending' && styles.socialFilterTabActive]}
          onPress={() => onSocialFilterChange?.('trending')}
        >
          <Text style={[styles.socialFilterText, activeSocialFilter === 'trending' && styles.socialFilterTextActive]}>Trending</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 28,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  iconText: {
    fontSize: 22,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  socialFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  socialFilterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  socialFilterTabActive: {
    backgroundColor: '#EFF6FF',
  },
  socialFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  socialFilterTextActive: {
    color: '#3B82F6',
  },
});
