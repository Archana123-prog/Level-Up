import axios from 'axios';

const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const apiUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE = apiUrl ? `${apiUrl}/api` : '/api';

console.log('🔗 API Base URL:', API_BASE);

if (!rawApiUrl && process.env.NODE_ENV === 'production') {
  console.error('❌ Missing REACT_APP_API_URL in production build. Set this environment variable in Vercel project settings.');
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('levelup_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('❌ Request error:', error.message);
  return Promise.reject(error);
});

// Enhanced response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'Network error. Please try again.';

    if (!error.response) {
      // Network error or request timeout
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Make sure the server is running on ' + apiUrl;
      } else {
        errorMessage = error.message || 'Unable to connect to the server. Please try again.';
      }
      console.error('❌ Network Error:', errorMessage, error);
    } else if (error.response?.status === 401) {
      localStorage.removeItem('levelup_token');
      window.location.href = '/login';
      errorMessage = 'Session expired. Please log in again.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.error || 'Invalid request. Please check your input.';
    } else if (error.response?.status === 409) {
      errorMessage = error.response.data?.error || 'This email or username already exists.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
      console.error('❌ Server Error:', error.response.data);
    } else {
      errorMessage = error.response?.data?.error || errorMessage;
    }

    return Promise.reject({ ...error, message: errorMessage });
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  loginWithGoogle: (data) => api.post('/auth/google', data),
  me: () => api.get('/auth/me'),
};

// Habits
export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  complete: (id) => api.post(`/habits/${id}/complete`),
  uncomplete: (id) => api.post(`/habits/${id}/uncomplete`),
  stats: () => api.get('/habits/stats'),
  suggestions: () => api.get('/habits/ai-suggestions'),
};

// Leaderboard
export const leaderboardAPI = {
  global: (page = 1) => api.get(`/leaderboard/global?page=${page}`),
  weekly: () => api.get('/leaderboard/weekly'),
};

// Challenges
export const challengesAPI = {
  daily: () => api.get('/challenges/daily'),
  claim: (id) => api.post(`/challenges/${id}/claim`),
};

// Rewards
export const rewardsAPI = {
  store: () => api.get('/rewards/store'),
  purchase: (itemId) => api.post('/rewards/purchase', { itemId }),
};

// Users
export const usersAPI = {
  profile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Health check - useful for debugging connection issues
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ Server health:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    throw error;
  }
};

export default api;
