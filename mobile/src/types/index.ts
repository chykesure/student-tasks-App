// ============================================
// USER TYPES
// ============================================

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserProfileUpdate {
  name?: string;
  avatar?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// TASK TYPES
// ============================================

export type TaskCategory = 'study' | 'assignment' | 'exam' | 'project' | 'meeting' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | '';

export interface Task {
  _id: string;
  user: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  dueTime: string;
  reminderMinutes: number;
  isRecurring: boolean;
  recurringPattern: RecurringPattern;
  tags: string[];
  completedAt: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  dueDate: Date | string;
  dueTime?: string;
  reminderMinutes?: number;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  tags?: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatus;
}

// ============================================
// TASK CATEGORY/PRIORITY/STATUS CONFIG
// ============================================

export interface TaskCategoryConfig {
  label: string;
  icon: string;
  color: string;
}

export interface TaskPriorityConfig {
  label: string;
  color: string;
  value: number;
}

export interface TaskStatusConfig {
  label: string;
  color: string;
}

export interface ReminderOption {
  label: string;
  value: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  msg: string;
  param: string;
  location: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface TasksResponse {
  tasks: Task[];
  count: number;
}

export interface TodayTasksResponse {
  tasks: Task[];
  count: number;
}

export interface WeekTasksResponse {
  weekStart: string;
  weekEnd: string;
  tasksByDay: Record<string, DayTasks>;
}

export interface DayTasks {
  date: string;
  tasks: Task[];
}

export interface TaskStatsResponse {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

// ============================================
// AUTH CONTEXT TYPES
// ============================================

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: UserProfileUpdate) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
}

// ============================================
// NAVIGATION TYPES
// ============================================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  AddTask: undefined;
  TaskDetail: { task: Task };
  EditTask: { task: Task };
  AllTasks: undefined;
  WeeklySchedule: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  TasksTab: undefined;
  Schedule: undefined;
};

// Combine all for root navigation
export type RootStackParamList = AuthStackParamList & MainStackParamList;

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: object;
  textStyle?: object;
}

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: object;
  inputStyle?: object;
  required?: boolean;
}

export interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
}

export interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}
