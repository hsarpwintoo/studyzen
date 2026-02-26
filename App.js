import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RootNavigator from './navigation/RootNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;