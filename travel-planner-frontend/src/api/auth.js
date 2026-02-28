import apiClient from './client';

export const authAPI = {
  // Test endpoint
  test: () => apiClient.get('/auth/test'),

   // Register new user
  register: (userData) => apiClient.post('/auth/register', userData),

  // Login user
  login: (credentials) => apiClient.post('/auth/login', credentials),

  // Get user profile
  getProfile: () => apiClient.get('/auth/profile'),

  // Forgot password
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
};

export default authAPI;