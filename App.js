import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import RootNavigator from './navigation/RootNavigator';

// Show ALL incoming notifications as banners (even when app is foregrounded)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register Android channels once at startup
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('studyzen-reminders', {
    name: 'Task Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 100, 250],
  }).catch(() => {});
  Notifications.setNotificationChannelAsync('studyzen-timer', {
    name: 'Study Timer',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 300, 100, 300],
  }).catch(() => {});
}

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <SettingsProvider>
            <RootNavigator />
          </SettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;