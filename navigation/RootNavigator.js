import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RouteNames } from './routeConstants'; // Correct path may vary
import Login from '../screens/Login';
import Home from '../screens/Home';
import Profile from '../screens/Profile';
// Import other screens as needed

const Stack = createStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={RouteNames.LOGIN} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={RouteNames.LOGIN} component={Login} />
        <Stack.Screen name={RouteNames.HOME} component={Home} />
        <Stack.Screen name={RouteNames.PROFILE} component={Profile} />
        {/* Add more screens to your Auth and App flows */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  // Define your styles here using StyleSheet
});

export default RootNavigator;