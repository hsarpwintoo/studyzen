import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '../features/home/screens/HomeScreen';
import FocusTimerScreen from '../features/focusTimer/screens/FocusTimerScreen';
import StudyPlannerScreen from '../features/studyPlanner/screens/StudyPlannerScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import HistoryScreen from '../features/history/screens/HistoryScreen';
import { useTheme } from '../context/ThemeContext';

const TABS = [
  { key: 'Home',     label: 'Home',    icon: '🏠' },
  { key: 'Timer',    label: 'Focus',   icon: '⏱' },
  { key: 'Planner',  label: 'Planner', icon: '📅' },
  { key: 'History',  label: 'History', icon: '🗂' },
  { key: 'Settings', label: 'Settings',icon: '⚙️' },
];

const SCREENS = {
  Home: HomeScreen, Timer: FocusTimerScreen,
  Planner: StudyPlannerScreen, History: HistoryScreen, Settings: SettingsScreen,
};

const PAGE_TITLES = {
  Home: 'StudyZen | Dashboard',
  Timer: 'StudyZen | Focus Timer',
  Planner: 'StudyZen | Study Planner',
  History: 'StudyZen | Task History',
  Settings: 'StudyZen | Settings',
};

const AppNavigator = () => {
  const [active, setActive] = useState('Home');
  const { theme } = useTheme();

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const onBackPress = () => {
      if (active !== 'Home') {
        setActive('Home');
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [active]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = PAGE_TITLES[active] || 'StudyZen';
    }
  }, [active]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.screen}>
        {TABS.map((tab) => {
          const Screen = SCREENS[tab.key];
          const visible = active === tab.key;
          return (
            <View
              key={tab.key}
              style={[styles.screenLayer, visible ? styles.screenVisible : styles.screenHidden]}
              pointerEvents={visible ? 'auto' : 'none'}
            >
              {tab.key === 'Home'
                ? <HomeScreen navigateTo={setActive} />
                : <Screen navigateTo={setActive} />}
            </View>
          );
        })}
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
  screenLayer: { ...StyleSheet.absoluteFillObject },
  screenVisible: { opacity: 1 },
  screenHidden: { opacity: 0 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 12, paddingHorizontal: 8 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  tabIndicator: { height: 3, width: 28, backgroundColor: 'transparent', borderRadius: 2, marginBottom: 4 },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: 10, fontWeight: '600' },
});

export default AppNavigator;