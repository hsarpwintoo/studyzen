import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import StudyPlannerScreen from './StudyPlannerScreen';
import FocusTimerScreen from './FocusTimerScreen';
import ProgressScreen from './ProgressScreen';
import SettingsScreen from './SettingsScreen';
import RouteNames from './RouteNames';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name={RouteNames.HOME} component={HomeScreen} />
      <Tab.Screen name={RouteNames.STUDY_PLANNER} component={StudyPlannerScreen} />
      <Tab.Screen name={RouteNames.FOCUS_TIMER} component={FocusTimerScreen} />
      <Tab.Screen name={RouteNames.PROGRESS} component={ProgressScreen} />
      <Tab.Screen name={RouteNames.SETTINGS} component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
