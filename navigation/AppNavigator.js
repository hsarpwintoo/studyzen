/**
 * App Navigator
 * Handles main app flow (after authentication)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES, STACKS } from './routeConstants';
import HomeScreen from '../features/home/screens/HomeScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;