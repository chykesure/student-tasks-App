// mobile/src/services/notification.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tasks', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
    });
  }
  
  return true;
};

// Schedule a notification for a task
export const scheduleTaskNotification = async (task: Task): Promise<string | null> => {
  try {
    await cancelTaskNotification(task._id);

    if (!task.dueDate || task.reminderMinutes === undefined) return null;

    const dueDate = new Date(task.dueDate);

    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':').map(Number);
      dueDate.setHours(hours, minutes, 0, 0);
    }

    const notificationTime = new Date(dueDate.getTime() - task.reminderMinutes * 60 * 1000);

    if (notificationTime.getTime() <= Date.now() + 5000) {
      console.log('Notification time too soon or passed');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 Task Reminder',
        body: `"${task.title}" is due ${task.reminderMinutes === 0 ? 'now' : `in ${formatMinutes(task.reminderMinutes)}`}`,
        data: { taskId: task._id, type: 'task-reminder' },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: notificationTime.getTime(),
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        channelId: 'tasks',
      },
    });

    console.log(`Scheduled: ${notificationId} for ${task.title} at ${notificationTime.toISOString()}`);
    return notificationId;
  } catch (error) {
    console.error('Scheduling failed:', error);
    return null;
  }
};

// Cancel a task notification
export const cancelTaskNotification = async (taskId: string): Promise<void> => {
  try {
    // Get all scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    // Find and cancel notifications for this task
    for (const notification of scheduled) {
      if (notification.content.data?.taskId === taskId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log(`Cancelled notification for task ${taskId}`);
      }
    }
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

// Cancel all notifications
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Get all scheduled notifications
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

// Format minutes to human-readable string
const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

// Notification listener types
type NotificationReceivedHandler = (notification: Notifications.Notification) => void;
type NotificationResponseHandler = (response: Notifications.NotificationResponse) => void;

// Set up notification listeners
export const setupNotificationListeners = (
  onNotificationReceived: NotificationReceivedHandler,
  onNotificationResponse: NotificationResponseHandler
): (() => void) => {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    onNotificationReceived
  );
  
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    onNotificationResponse
  );
  
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};
