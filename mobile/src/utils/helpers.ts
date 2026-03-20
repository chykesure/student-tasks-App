// Format date to readable string
export const formatDate = (
  date: string | Date, 
  format: 'short' | 'medium' | 'long' | 'time' | 'datetime' = 'medium'
): string => {
  if (!date) return '';
  
  const d = new Date(date);
  
  const formats: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    },
  };
  
  return d.toLocaleDateString('en-US', formats[format] || formats.medium);
};

// Format time string (HH:MM) to readable format
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Get relative time string (e.g., "2 hours ago", "in 3 days")
export const getRelativeTime = (date: string | Date): string => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  
  if (diffSecs < 0) {
    // Past
    if (diffMins >= -1) return 'just now';
    if (diffMins > -60) return `${Math.abs(diffMins)} minutes ago`;
    if (diffHours > -24) return `${Math.abs(diffHours)} hours ago`;
    if (diffDays > -7) return `${Math.abs(diffDays)} days ago`;
    return formatDate(d);
  } else {
    // Future
    if (diffMins <= 1) return 'now';
    if (diffMins < 60) return `in ${diffMins} minutes`;
    if (diffHours < 24) return `in ${diffHours} hours`;
    if (diffDays < 7) return `in ${diffDays} days`;
    return formatDate(d);
  }
};

// Check if date is today
export const isToday = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

// Check if date is tomorrow
export const isTomorrow = (date: string | Date): boolean => {
  const d = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.toDateString() === tomorrow.toDateString();
};

// Check if date is this week
export const isThisWeek = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  return d >= startOfWeek && d < endOfWeek;
};

// Check if date is overdue
export const isOverdue = (date: string | Date, status: string): boolean => {
  if (status === 'completed' || status === 'cancelled') return false;
  return new Date(date) < new Date();
};

// Get day name
export const getDayName = (date: string | Date, format: 'long' | 'short' = 'long'): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: format });
};

// Get month name
export const getMonthName = (date: string | Date, format: 'long' | 'short' = 'long'): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: format });
};

// Format date for input field (YYYY-MM-DD)
export const formatDateForInput = (date: Date): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Parse date from input field
export const parseDateFromInput = (dateString: string): Date => {
  return new Date(dateString);
};

// Get dates for current week
export const getWeekDates = (): Date[] => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

// Truncate text
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T, 
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Format minutes to hours and minutes
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
};
