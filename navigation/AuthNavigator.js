import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GetStartedScreen from "../features/authentication/screens/GetStartedScreen";
import LoginScreen from "../features/authentication/screens/LoginScreen";

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GetStarted" component={GetStartedScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;