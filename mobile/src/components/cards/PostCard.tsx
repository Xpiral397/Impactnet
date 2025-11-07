import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PostCardProps {
  username: string;
  date: string;
  content: string;
  likes?: number;
  comments?: number;
  avatar?: string;
  verified?: boolean;
  images?: string[];
  postId?: number;
  onCommentPress?: () => void;
}

export default function PostCard({
  username,
  date,
  content,
  likes = 0,
  comments = 0,
  avatar,
  verified = false,
  images = [],
  postId,
  onCommentPress,
}: PostCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {/* Avatar */}
          <View style={styles.avatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* User details */}
          <View style={styles.userDetails}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{username}</Text>
              {verified && (
                <MaterialIcon name="check-decagram" size={16} color="#3B82F6" />
              )}
            </View>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>

        {/* More options */}
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={styles.content}>{content}</Text>

      {/* Post Images */}
      {images && images.length > 0 && (
        <View style={styles.imagesContainer}>
          {images.length === 1 ? (
            <Image
              source={{ uri: images[0] }}
              style={styles.singleImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.multipleImages}>
              {images.slice(0, 4).map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={[
                    styles.gridImage,
                    images.length === 2 && styles.twoImages,
                    images.length === 3 && index === 0 && styles.threeImagesFirst,
                  ]}
                  resizeMode="cover"
                />
              ))}
              {images.length > 4 && (
                <View style={styles.moreImagesOverlay}>
                  <Text style={styles.moreImagesText}>+{images.length - 4}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Actions - Full Width with Flex */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsLiked(!isLiked)}
        >
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? '#EF4444' : '#6B7280'}
          />
          <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
            {likes + (isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onCommentPress}>
          <MaterialIcon
            name="message-text-outline"
            size={20}
            color="#6B7280"
          />
          <Text style={styles.actionText}>{comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon
            name="share-social-outline"
            size={20}
            color="#6B7280"
          />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  date: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  singleImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  multipleImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridImage: {
    width: '49%',
    height: 150,
    borderRadius: 8,
  },
  twoImages: {
    width: '49%',
    height: 200,
  },
  threeImagesFirst: {
    width: '100%',
    height: 200,
  },
  moreImagesOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: '49%',
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  actionTextLiked: {
    color: '#EF4444',
  },
});
