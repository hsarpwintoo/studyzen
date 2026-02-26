import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { useAuth } from '../context/AuthContext';

const RootNavigator = () => {
  const { user, loading } = useAuth();

  // Wait for Firebase to resolve persisted auth — avoids Get Started flash
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5EFE6' }}>
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
