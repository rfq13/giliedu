import axios from 'axios';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8080' // Android emulator localhost
  : 'https://api.gili.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // TODO: Get token from secure storage
    const token = null; // Replace with actual token retrieval
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      console.log('Unauthorized - redirect to login');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string, age: number, level: string) => {
    const response = await api.post('/auth/register', { name, email, password, age, level });
    return response.data;
  },
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },
};

// Story API
export const storyAPI = {
  createStory: async (data: {
    prompt_id?: string;
    prompt_title?: string;
    input_type: 'audio' | 'text';
    content?: string;
    audio_url?: string;
  }) => {
    const response = await api.post('/stories', data);
    return response.data;
  },
  getStories: async (page: number = 1, pageSize: number = 20) => {
    const response = await api.get('/stories', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },
  getStory: async (storyId: string) => {
    const response = await api.get(`/stories/${storyId}`);
    return response.data;
  },
  getTimeline: async () => {
    const response = await api.get('/stories/timeline');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  updateProfile: async (data: { name?: string; age?: number; level?: string }) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

// Skill API
export const skillAPI = {
  getSkills: async () => {
    const response = await api.get('/skills');
    return response.data;
  },
  getSkillProgress: async () => {
    const response = await api.get('/skills/progress');
    return response.data;
  },
};

export default api;
