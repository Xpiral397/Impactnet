export const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  OTP_SEND: '/auth/otp/send/',
  OTP_VERIFY: '/auth/otp/verify/',
  LOGOUT: '/auth/logout/',

  // User
  PROFILE: '/auth/user/',
  UPDATE_PROFILE: '/auth/user/update/',

  // Posts
  POSTS: '/posts/',
  POST_DETAIL: (id: number) => `/posts/${id}/`,
  POST_LIKE: (id: number) => `/posts/${id}/like/`,
  POST_COMMENTS: (id: number) => `/posts/${id}/comments/`,

  // Payments
  PAYMENTS: '/payments/',
  PAYMENT_INIT: '/payments/initialize/',

  // Face Verification
  FACE_VERIFY: '/ai/face-verify/',
  LIVENESS_CHECK: '/ai/liveness-check/',
};
