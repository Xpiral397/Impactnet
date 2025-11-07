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
  getFeed: async (page: number = 1) => {
    const response = await api.get(`/posts/?page=${page}`);
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
  commentOnPost: async (postId: number, content: string) => {
    const response = await api.post(`/posts/${postId}/comments/`, { content });
    return response.data;
  },

  // Get post comments
  getComments: async (postId: number) => {
    const response = await api.get(`/posts/${postId}/comments/`);
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

export default api;
