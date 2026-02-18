import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import HomeScreen from '../features/home/screens/HomeScreen';
import FocusTimerScreen from '../features/focusTimer/screens/FocusTimerScreen';
import StudyPlannerScreen from '../features/studyPlanner/screens/StudyPlannerScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';

const TABS = [
  { key: 'Home',     label: 'Home',     icon: '🏠' },
  { key: 'Timer',    label: 'Focus',    icon: '⏱' },
  { key: 'Planner',  label: 'Planner',  icon: '📅' },
  { key: 'Settings', label: 'Settings', icon: '⚙️' },
];

const SCREENS = {
  Home:     HomeScreen,
  Timer:    FocusTimerScreen,
  Planner:  StudyPlannerScreen,
  Settings: SettingsScreen,
};

const AppNavigator = () => {
  const [active, setActive] = useState('Home');
  const ActiveScreen = SCREENS[active];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.screen}>
        <ActiveScreen />
      </View>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const focused = active === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActive(tab.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.tabIndicator, focused && styles.tabIndicatorActive]} />
              <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5EFE6',
  },
  screen: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FDF8F2',
    borderTopWidth: 1,
    borderTopColor: '#E0D0C0',
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIndicator: {
    height: 3,
    width: 28,
    backgroundColor: 'transparent',
    borderRadius: 2,
    marginBottom: 4,
  },
  tabIndicatorActive: {
    backgroundColor: '#C0714F',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.4,
    marginBottom: 2,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A1887F',
  },
  tabLabelActive: {
    color: '#6B4226',
  },
});

export default AppNavigator;