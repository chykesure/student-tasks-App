import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants';
import {
  ApiResponse,
  AuthResponse,
  User,
  UserProfileUpdate,
  TasksResponse,
  TodayTasksResponse,
  WeekTasksResponse,
  TaskStatsResponse,
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      // Server responded with error
      const { status } = error.response;
      
      if (status === 401) {
        // Token expired or invalid - clear storage
        await AsyncStorage.multiRemove(['token', 'user']);
      }
      
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // No response received
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.',
      } as ApiResponse);
    } else {
      // Error setting up request
      return Promise.reject({
        success: false,
        message: 'An unexpected error occurred.',
      } as ApiResponse);
    }
  }
);

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password });
    return response.data;
  },
  
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return response.data;
  },
  
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },
  
  updateProfile: async (data: UserProfileUpdate): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/auth/password', { currentPassword, newPassword });
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (params: Record<string, string> = {}): Promise<ApiResponse<TasksResponse>> => {
    const response = await api.get<ApiResponse<TasksResponse>>('/tasks', { params });
    return response.data;
  },
  
  getToday: async (): Promise<ApiResponse<TodayTasksResponse>> => {
    const response = await api.get<ApiResponse<TodayTasksResponse>>('/tasks/today');
    return response.data;
  },
  
  getWeek: async (): Promise<ApiResponse<WeekTasksResponse>> => {
    const response = await api.get<ApiResponse<WeekTasksResponse>>('/tasks/week');
    return response.data;
  },
  
  getStats: async (): Promise<ApiResponse<TaskStatsResponse>> => {
    const response = await api.get<ApiResponse<TaskStatsResponse>>('/tasks/stats');
    return response.data;
  },
  
  getOne: async (id: string): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
    return response.data;
  },
  
  create: async (taskData: CreateTaskData): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.post<ApiResponse<{ task: Task }>>('/tasks', taskData);
    return response.data;
  },
  
  update: async (id: string, taskData: UpdateTaskData): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, taskData);
    return response.data;
  },
  
  updateStatus: async (id: string, status: TaskStatus): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}/status`, { status });
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/tasks/${id}`);
    return response.data;
  },
};

export default api;
