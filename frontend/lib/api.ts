// API Service for ImpactNet

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper to set token in both localStorage and cookies
const setAuthTokens = (access: string, refresh: string) => {
  if (typeof window !== 'undefined') {
    // Store in localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Store in cookies for middleware
    document.cookie = `access_token=${access}; path=/; max-age=${60 * 60}`; // 1 hour
    document.cookie = `refresh_token=${refresh}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  }
};

// Helper to clear tokens from both localStorage and cookies
const clearAuthTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Clear cookies
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'refresh_token=; path=/; max-age=0';
  }
};

// Helper to get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Generic fetch wrapper with error handling
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.detail || 'API request failed');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== AUTH API ====================

export const authAPI = {
  // Register new user
  register: async (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => {
    const response = await apiFetch('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens
    if (response.access && response.refresh) {
      setAuthTokens(response.access, response.refresh);
    }

    return response;
  },

  // Login
  login: async (username: string, password: string) => {
    const response = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    // Check if 2FA is required
    if (response.requires_2fa) {
      return response;
    }

    // Store tokens
    if (response.access && response.refresh) {
      setAuthTokens(response.access, response.refresh);
    }

    return response;
  },

  // Logout
  logout: async () => {
    try {
      await apiFetch('/auth/logout/', { method: 'POST' });
    } finally {
      clearAuthTokens();
    }
  },

  // Get current user profile
  getProfile: async () => apiFetch('/auth/profile/'),

  // Update profile
  updateProfile: async (data: any) =>
    apiFetch('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await apiFetch('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.access && refreshToken) {
      setAuthTokens(response.access, refreshToken);
    }
    return response;
  },

  // 2FA Setup
  setup2FA: async () => apiFetch('/auth/2fa/setup/', { method: 'POST' }),

  // Enable 2FA
  enable2FA: async (code: string) =>
    apiFetch('/auth/2fa/enable/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  // Disable 2FA
  disable2FA: async () => apiFetch('/auth/2fa/disable/', { method: 'POST' }),

  // Get activity logs
  getActivityLogs: async () => apiFetch('/auth/activity/'),

  // Get notifications
  getNotifications: async () => apiFetch('/auth/notifications/'),

  // Mark notification as read
  markNotificationRead: async (id: number) =>
    apiFetch(`/auth/notifications/${id}/read/`, { method: 'POST' }),

  // Send OTP
  sendOTP: async (email: string, purpose: 'login' | 'signup' | 'password_reset' = 'login') =>
    apiFetch('/auth/otp/send/', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    }),

  // Verify OTP and login
  verifyOTP: async (email: string, otp_code: string) => {
    const response = await apiFetch('/auth/otp/verify/', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code }),
    });

    // Store tokens
    if (response.access && response.refresh) {
      setAuthTokens(response.access, response.refresh);
    }

    return response;
  },

  // Request password reset
  requestPasswordReset: async (email: string) =>
    apiFetch('/auth/password/reset/request/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Confirm password reset with OTP
  confirmPasswordReset: async (email: string, otp_code: string, new_password: string) =>
    apiFetch('/auth/password/reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code, new_password }),
    }),
};

// ==================== POSTS API ====================

export const postsAPI = {
  // List posts with pagination and filters
  list: async (params?: {
    page?: number;
    category?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return apiFetch(`/posts/${query ? `?${query}` : ''}`);
  },

  // Get single post
  get: async (id: number) => apiFetch(`/posts/${id}/`),

  // Create post
  create: async (data: {
    content: string;
    post_type?: string;
    images?: string[];
    video_url?: string;
    is_public?: boolean;
    goal_data?: any;
  }) =>
    apiFetch('/posts/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update post
  update: async (id: number, data: any) =>
    apiFetch(`/posts/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete post
  delete: async (id: number) =>
    apiFetch(`/posts/${id}/`, {
      method: 'DELETE',
    }),

  // Like/unlike post
  like: async (id: number) =>
    apiFetch(`/posts/${id}/like/`, {
      method: 'POST',
    }),

  // Get comments
  getComments: async (id: number) => apiFetch(`/posts/${id}/comments/`),

  // Add comment
  addComment: async (id: number, content: string, parent_comment?: number) =>
    apiFetch(`/posts/${id}/comments/`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_comment }),
    }),

  // Share post
  share: async (id: number, message?: string) =>
    apiFetch(`/posts/${id}/share/`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

// ==================== COMMENTS API ====================

export const commentsAPI = {
  // Like comment
  like: async (id: number) =>
    apiFetch(`/comments/${id}/like/`, {
      method: 'POST',
    }),

  // Delete comment
  delete: async (id: number) =>
    apiFetch(`/comments/${id}/`, {
      method: 'DELETE',
    }),
};

// ==================== GOALS API ====================

export const goalsAPI = {
  // List all goals
  list: async () => apiFetch('/goals/'),

  // Get single goal
  get: async (id: number) => apiFetch(`/goals/${id}/`),

  // Get goal contributions
  getContributions: async (id: number) => apiFetch(`/goals/${id}/contributions/`),

  // Make a contribution
  contribute: async (goalId: number, amount: number, message?: string) =>
    apiFetch(`/goals/${goalId}/contribute/`, {
      method: 'POST',
      body: JSON.stringify({ amount, message }),
    }),

  // Create goal
  create: async (data: {
    post: number;
    goal_type: 'money' | 'job' | 'travel' | 'other';
    target_amount?: number;
    target_description?: string;
    deadline?: string;
  }) =>
    apiFetch('/goals/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ==================== EXPORT ====================

export default {
  auth: authAPI,
  posts: postsAPI,
  comments: commentsAPI,
  goals: goalsAPI,
};
