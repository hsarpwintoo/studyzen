import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import HomeScreen from '../features/home/screens/HomeScreen';
import FocusTimerScreen from '../features/focusTimer/screens/FocusTimerScreen';
import StudyPlannerScreen from '../features/studyPlanner/screens/StudyPlannerScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import { useTheme } from '../context/ThemeContext';

const TABS = [
  { key: 'Home',     label: 'Home',    icon: '🏠' },
  { key: 'Timer',    label: 'Focus',   icon: '⏱' },
  { key: 'Planner',  label: 'Planner', icon: '📅' },
  { key: 'Settings', label: 'Settings',icon: '⚙️' },
];

const SCREENS = {
  Home: HomeScreen, Timer: FocusTimerScreen,
  Planner: StudyPlannerScreen, Settings: SettingsScreen,
};

const AppNavigator = () => {
  const [active, setActive] = useState('Home');
  const { theme } = useTheme();
  const ActiveScreen = SCREENS[active];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.screen}>
        {active === 'Home'
          ? <HomeScreen navigateTo={setActive} />
          : <ActiveScreen />}
      </View>
      <View style={[styles.tabBar, { backgroundColor: theme.tabBg, borderTopColor: theme.tabBorder }]}>
        {TABS.map((tab) => {
          const focused = active === tab.key;
          return (
            <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => setActive(tab.key)} activeOpacity={0.75}>
              <View style={[styles.tabIndicator, focused && { backgroundColor: theme.accent }]} />
              <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.4 }]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, { color: focused ? theme.brown : theme.textSec }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 12, paddingHorizontal: 8 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  tabIndicator: { height: 3, width: 28, backgroundColor: 'transparent', borderRadius: 2, marginBottom: 4 },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: 10, fontWeight: '600' },
});

export default AppNavigator;