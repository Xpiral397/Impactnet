import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        await AsyncStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  // Login with password
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login/', { username, password });
    if (response.data.access && response.data.refresh) {
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  // Register
  register: async (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }) => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  // Send OTP
  sendOTP: async (email: string) => {
    const response = await api.post('/auth/otp/send/', { email, purpose: 'login' });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email: string, otp_code: string) => {
    const response = await api.post('/auth/otp/verify/', { email, otp_code });
    if (response.data.access && response.data.refresh) {
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
};

export const postsAPI = {
  // Get feed
  getFeed: async (page: number = 1, postType?: string) => {
    let url = `/posts/?page=${page}`;
    if (postType) {
      url += `&post_type=${postType}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Create post
  createPost: async (data: { content: string; images?: string[] }) => {
    const response = await api.post('/posts/', data);
    return response.data;
  },

  // Like post
  likePost: async (postId: number) => {
    const response = await api.post(`/posts/${postId}/like/`);
    return response.data;
  },

  // Comment on post
  commentOnPost: async (postId: number, content: string, parent?: number | null) => {
    const payload: any = { content };
    if (parent) {
      payload.parent_comment = parent;
    }
    console.log('Sending comment payload:', payload);
    const response = await api.post(`/posts/${postId}/comments/`, payload);
    return response.data;
  },

  // Get post comments
  getComments: async (postId: number) => {
    const response = await api.get(`/posts/${postId}/comments/`);
    return response.data;
  },
};

export const aiAPI = {
  // Rewrite text with AI
  rewriteText: async (text: string, context: string = 'comment') => {
    const response = await api.post('/ai/rewrite/', { text, context });
    return response.data;
  },
};

export const faceVerificationAPI = {
  // Start verification
  startVerification: async (referenceImage: string) => {
    const response = await api.post('/ai/face-verify/start/', {
      reference_image: referenceImage,
    });
    return response.data;
  },

  // Complete verification
  completeVerification: async (
    verificationId: number,
    verificationImage: string,
    livenessActions: Array<{ action: string; image: string }>
  ) => {
    const response = await api.post('/ai/face-verify/complete/', {
      verification_id: verificationId,
      verification_image: verificationImage,
      liveness_actions: livenessActions,
    });
    return response.data;
  },

  // Check liveness action
  checkLivenessAction: async (action: string, image: string) => {
    const response = await api.post('/ai/liveness-check/', { action, image });
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  // Get all conversations for current user
  getConversations: async () => {
    const response = await api.get('/chat/conversations/');
    return response.data;
  },

  // Get or create conversation with a specific user
  getOrCreateConversation: async (userId: number) => {
    const response = await api.post('/chat/conversations/get_or_create/', {
      user_id: userId,
    });
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId: string) => {
    const response = await api.get(`/chat/messages/?conversation_id=${conversationId}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (
    conversationId: string,
    content: string,
    messageType: string = 'text'
  ) => {
    const response = await api.post('/chat/messages/', {
      conversation: conversationId,
      content,
      message_type: messageType,
    });
    return response.data;
  },

  // Mark messages as read
  markMessagesRead: async (messageIds: number[]) => {
    const response = await api.post('/chat/messages/mark_read/', {
      message_ids: messageIds,
    });
    return response.data;
  },

  // Get AI response
  getAIResponse: async (message: string) => {
    const response = await api.post('/chat/ai-responses/generate_response/', {
      message,
    });
    return response.data;
  },

  // Get privacy settings for a specific user
  getPrivacySettings: async (targetUserId: number, ownerId: number) => {
    const response = await api.get(
      `/chat/privacy-settings/for_user/?target_user_id=${targetUserId}&owner_id=${ownerId}`
    );
    return response.data;
  },

  // Update privacy settings for a specific user
  updatePrivacySettings: async (
    targetUserId: number,
    ownerId: number,
    settings: {
      can_view_status?: boolean;
      can_view_profile?: boolean;
      can_call?: boolean;
      can_video_call?: boolean;
      can_send_donate_request?: boolean;
      can_tag?: boolean;
      mute_notifications?: boolean;
      blocked_until?: string | null;
    }
  ) => {
    const response = await api.post('/chat/privacy-settings/update_for_user/', {
      target_user_id: targetUserId,
      owner_id: ownerId,
      ...settings,
    });
    return response.data;
  },
};

export default api;
