// mobile/src/constants/index.ts
import {
  TaskCategoryConfig,
  TaskPriorityConfig,
  TaskStatusConfig,
  ReminderOption
} from '../types';


// Optional: Use Expo constants or env vars for flexibility
// For now, simple boolean toggle
const IS_PRODUCTION = true;  // Set to false when testing locally

export const API_CONFIG = {
  BASE_URL: IS_PRODUCTION
    ? 'https://student-tasks-app-x3wv.onrender.com/api'
    : 'http://172.20.10.3:5000/api',  // or your current local IP when needed

  TIMEOUT: 15000,  // Slightly longer for Render cold starts
};

// Task Categories
export const TASK_CATEGORIES: Record<string, TaskCategoryConfig> = {
  study: { label: 'Study', icon: 'book-open-variant', color: '#4CAF50' },
  assignment: { label: 'Assignment', icon: 'file-document', color: '#2196F3' },
  exam: { label: 'Exam', icon: 'clipboard-text', color: '#F44336' },
  project: { label: 'Project', icon: 'folder', color: '#9C27B0' },
  meeting: { label: 'Meeting', icon: 'account-group', color: '#FF9800' },
  other: { label: 'Other', icon: 'dots-horizontal', color: '#607D8B' },
};

// Task Priorities
export const TASK_PRIORITIES: Record<string, TaskPriorityConfig> = {
  low: { label: 'Low', color: '#8BC34A', value: 1 },
  medium: { label: 'Medium', color: '#FFC107', value: 2 },
  high: { label: 'High', color: '#F44336', value: 3 },
};

// Task Statuses
export const TASK_STATUSES: Record<string, TaskStatusConfig> = {
  pending: { label: 'Pending', color: '#9E9E9E' },
  'in-progress': { label: 'In Progress', color: '#2196F3' },
  completed: { label: 'Completed', color: '#4CAF50' },
  cancelled: { label: 'Cancelled', color: '#F44336' },
};

// Reminder Options (in minutes)
export const REMINDER_OPTIONS: ReminderOption[] = [
  { label: 'At time of task', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
];

// Colors
export const COLORS = {
  primary: '#6C63FF',
  secondary: '#FF6B6B',
  accent: '#4ECDC4',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2D3436',
  textLight: '#636E72',
  border: '#DFE6E9',
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#E17055',
  white: '#FFFFFF',
  black: '#000000',
};
