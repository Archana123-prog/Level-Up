import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('levelup_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('levelup_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
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

export default api;
