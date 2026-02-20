/**
 * App Entry Point
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RootNavigator from './navigation/RootNavigator';

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  </ThemeProvider>
);

export default App;