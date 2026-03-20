import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { 
  requestNotificationPermissions, 
  setupNotificationListeners 
} from './src/services/notifications';

const App: React.FC = () => {
  useEffect(() => {
    // Request notification permissions on app start
    requestNotificationPermissions();

    // Set up notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
      },
      (response) => {
        console.log('Notification response:', response);
        // Handle notification tap - navigate to task
        const taskId = response.notification.request.content.data?.taskId as string | undefined;
        if (taskId) {
          // Navigation would be handled by the app
          console.log('Navigate to task:', taskId);
        }
      }
    );

    return cleanup;
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
