/**
 * App Entry Point
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import RootNavigator from './navigation/RootNavigator';

const App = () => (
  <AuthProvider>
    <RootNavigator />
  </AuthProvider>
);

export default App;