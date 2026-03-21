// mobile/src/services/notification.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types';

// Minimum time in the future required to schedule a notification (in ms)
const MIN_FUTURE_MS = 10 * 1000; // 10 seconds

// Configure how notifications should be handled when received
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Example: suppress sound/banner for certain types
    if (notification.request.content.data?.type === 'silent') {
      return {
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }

    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

/**
 * Requests notification permissions and sets up Android channel if needed
 * @returns {Promise<boolean>} Whether permissions were granted
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
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
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
};

/**
 * Schedules a local notification for a task reminder
 * @param task The task containing dueDate, dueTime, reminderMinutes, title, _id
 * @returns The notification identifier or null if not scheduled
 */
export const scheduleTaskNotification = async (task: Task): Promise<string | null> => {
  try {
    if (!task.dueDate || task.reminderMinutes === undefined || task.reminderMinutes < 0) {
      await cancelTaskNotification(task._id);
      return null;
    }

    const dueDate = new Date(task.dueDate);

    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        dueDate.setHours(hours, minutes, 0, 0);
      }
    }

    const notificationTime = new Date(dueDate.getTime() - task.reminderMinutes * 60 * 1000);
    const now = Date.now();

    if (notificationTime.getTime() <= now + MIN_FUTURE_MS) {
      console.log(
        `Skipped scheduling "${task.title}" (id: ${task._id}) - ` +
        `time too soon or passed (${notificationTime.toISOString()})`
      );

      // Optional: Fire immediate notification if very close or just missed
      // Uncomment if you want "due now" alerts even for past/very near times
      /*
      if (notificationTime.getTime() > now - 5 * 60 * 1000) { // within last 5 minutes
        await Notifications.scheduleNotificationAsync({
          identifier: `immediate-${task._id}`,
          content: {
            title: '📢 Task Due Now!',
            body: `"${task.title}" is due right now!`,
            data: { taskId: task._id, type: 'task-due-immediate' },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null, // immediate
        });
      }
      */

      await cancelTaskNotification(task._id); // clean up any stale notification
      return null;
    }

    // Cancel any existing notification for this task first
    await cancelTaskNotification(task._id);

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: task._id, // ← critical for reliable cancellation
      content: {
        title: '📋 Task Reminder',
        body:
          `"${task.title}" is due ${task.reminderMinutes === 0 ? 'now' : `in ${formatMinutes(task.reminderMinutes)}`}`,
        data: { taskId: task._id, type: 'task-reminder' },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: notificationTime.getTime(),
        channelId: 'tasks', // Android only
      },
    });

    console.log(
      `Scheduled notification ${notificationId} for "${task.title}" ` +
      `at ${notificationTime.toISOString()}`
    );

    return notificationId;
  } catch (error) {
    console.error(`Failed to schedule notification for task ${task._id}:`, error);
    return null;
  }
};

/**
 * Cancels any scheduled notification for a specific task
 * @param taskId The unique task identifier
 */
export const cancelTaskNotification = async (taskId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(taskId);
    console.log(`Cancelled notification for task ${taskId}`);
  } catch (error) {
    // Silent fail if notification didn't exist
    if (!(error instanceof Error && error.message.includes('not found'))) {
      console.warn(`Failed to cancel notification ${taskId}:`, error);
    }
  }
};

/**
 * Cancels ALL scheduled notifications (use with caution!)
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All scheduled notifications cancelled');
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
};

/**
 * Returns all currently scheduled notifications (useful for debugging)
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
};

/**
 * Converts minutes to human-readable string (e.g. "30 minutes", "2 hours")
 */
const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remaining} minute${remaining !== 1 ? 's' : ''}`;
};

// ────────────────────────────────────────────────
// Listener setup (unchanged, but added types & cleanup)
type NotificationReceivedHandler = (notification: Notifications.Notification) => void;
type NotificationResponseHandler = (response: Notifications.NotificationResponse) => void;

export const setupNotificationListeners = (
  onNotificationReceived: NotificationReceivedHandler,
  onNotificationResponse: NotificationResponseHandler
): (() => void) => {
  const receivedSubscription = Notifications.addNotificationReceivedListener(onNotificationReceived);
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};