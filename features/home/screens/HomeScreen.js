import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { logoutUser } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { listenToUserCollection, saveUserTask, addUserDocument } from '../../../services/firestoreService';

const DEFAULT_TASKS = [
  { id: 'd1', label: 'Read Chapter 5', tag: 'Biology', done: false },
  { id: 'd2', label: 'Practice Calculus', tag: 'Math', done: false },
  { id: 'd3', label: 'Essay Outline', tag: 'English', done: false },
  { id: 'd4', label: 'Flashcard Review', tag: 'History', done: false },
];

const todayStr = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

const HomeScreen = () => {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [fromFirestore, setFromFirestore] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Scholar';
  const initials = displayName.slice(0, 2).toUpperCase();
  const done = tasks.filter(t => t.done).length;

  const handleLogout = async () => { await logoutUser(); setUser(null); };

  useEffect(() => {
    if (!user?.uid) return;
    const seeded = { current: false };
    const unsub = listenToUserCollection(user.uid, 'homeTasks', (items) => {
      if (items.length > 0) {
        setTasks(items);
        setFromFirestore(true);
      } else if (!seeded.current) {
        seeded.current = true;
        Promise.all(DEFAULT_TASKS.map(t =>
          addUserDocument(user.uid, 'homeTasks', { label: t.label, tag: t.tag, done: t.done })
        ));
      }
    });
    return unsub;
  }, [user?.uid]);

  const toggleTask = (task) => {
    if (fromFirestore) {
      saveUserTask(user.uid, 'homeTasks', task.id, { done: !task.done });
    } else {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
    }
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <View style={s.header}>
          <View>
            <Text style={[s.greeting, { color: theme.text }]}>Hello, {displayName}!</Text>
            <Text style={[s.date, { color: theme.textSec }]}>{todayStr()}</Text>
          </View>
          <TouchableOpacity style={[s.avatar, { backgroundColor: theme.brown }]} onPress={handleLogout}>
            <Text style={s.avatarTxt}>{initials}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.statsRow}>
          <View style={[s.stat, { backgroundColor: theme.accent }]}>
            <Text style={[s.statVal, { color: '#fff' }]}>3.5h</Text>
            <Text style={[s.statLbl, { color: 'rgba(255,255,255,0.8)' }]}>Focus</Text>
          </View>
          <View style={[s.stat, { backgroundColor: theme.card }]}>
            <Text style={[s.statVal, { color: theme.brown }]}>{done}</Text>
            <Text style={[s.statLbl, { color: theme.textSec }]}>Done</Text>
          </View>
          <View style={[s.stat, { backgroundColor: theme.card }]}>
            <Text style={[s.statVal, { color: theme.brown }]}>7</Text>
            <Text style={[s.statLbl, { color: theme.textSec }]}>Streak</Text>
          </View>
        </View>

        {tasks.length > 0 && (
          <View style={[s.card, { backgroundColor: theme.card }]}>
            <View style={s.row}>
              <Text style={[s.cardTitle, { color: theme.textSec }]}>Today's Goal</Text>
              <Text style={[s.pct, { color: theme.accent }]}>{Math.round((done / tasks.length) * 100)}%</Text>
            </View>
            <Text style={[s.goalName, { color: theme.text }]}>Complete all study tasks</Text>
            <View style={[s.track, { backgroundColor: theme.input }]}>
              <View style={[s.fill, { width: (done / tasks.length * 100) + '%', backgroundColor: theme.accent }]} />
            </View>
          </View>
        )}

        <Text style={[s.section, { color: theme.text }]}>Today's Tasks</Text>
        {tasks.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[s.taskRow, { backgroundColor: theme.card }]}
            onPress={() => toggleTask(t)}
            activeOpacity={0.75}
          >
            <View style={[s.check, { borderColor: theme.border }, t.done && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
              {t.done && <Text style={s.tick}>✓</Text>}
            </View>
            <Text style={[s.taskLbl, { color: theme.text }, t.done && { textDecorationLine: 'line-through', color: theme.textSec }]}>{t.label}</Text>
            <Text style={[s.tag, { color: theme.textSec, backgroundColor: theme.input }]}>{t.tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: '800' },
  date: { fontSize: 13, marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', elevation: 2 },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 12, marginTop: 2 },
  card: { borderRadius: 18, padding: 18, marginBottom: 20, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 13, fontWeight: '600' },
  pct: { fontSize: 13, fontWeight: '700' },
  goalName: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  track: { height: 8, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tick: { color: '#fff', fontSize: 12, fontWeight: '700' },
  taskLbl: { flex: 1, fontSize: 15 },
  tag: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
});

export default HomeScreen;
