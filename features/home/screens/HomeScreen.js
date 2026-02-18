import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { logoutUser } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';

const TASKS = [
  { id: 1, label: 'Read Chapter 5', tag: 'Biology', done: true },
  { id: 2, label: 'Practice Calculus', tag: 'Math', done: true },
  { id: 3, label: 'Essay Outline', tag: 'English', done: false },
  { id: 4, label: 'Flashcard Review', tag: 'History', done: false },
];

const HomeScreen = () => {
  const { setUser } = useAuth();
  const handleLogout = async () => { await logoutUser(); setUser(null); };
  const [tasks, setTasks] = useState(TASKS);
  const done = tasks.filter(t => t.done).length;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hello, Scholar!</Text>
            <Text style={s.date}>Tuesday, 18 Feb 2026</Text>
          </View>
          <TouchableOpacity style={s.avatar} onPress={handleLogout}>
            <Text style={s.avatarTxt}>SZ</Text>
          </TouchableOpacity>
        </View>

        <View style={s.statsRow}>
          <View style={[s.stat, s.statAccent]}>
            <Text style={s.statValW}>3.5h</Text>
            <Text style={s.statLblW}>Focus</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statVal}>{done}</Text>
            <Text style={s.statLbl}>Done</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statVal}>7</Text>
            <Text style={s.statLbl}>Streak</Text>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.cardTitle}>Today Goal</Text>
            <Text style={s.pct}>{Math.round((done / tasks.length) * 100)}%</Text>
          </View>
          <Text style={s.goalName}>Finish Biology Unit 3</Text>
          <View style={s.track}>
            <View style={[s.fill, { width: (done / tasks.length * 100) + '%' }]} />
          </View>
        </View>

        <Text style={s.section}>Today Tasks</Text>
        {tasks.map(t => (
          <TouchableOpacity
            key={t.id}
            style={s.taskRow}
            onPress={() => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}
            activeOpacity={0.75}
          >
            <View style={[s.check, t.done && s.checkDone]}>
              {t.done && <Text style={s.tick}>✓</Text>}
            </View>
            <Text style={[s.taskLbl, t.done && s.taskDone]}>{t.label}</Text>
            <Text style={s.tag}>{t.tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5EFE6' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: '800', color: '#3E2723' },
  date: { fontSize: 13, color: '#A1887F', marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 999, backgroundColor: '#6B4226', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: '#FDF8F2', borderRadius: 16, padding: 14, alignItems: 'center', elevation: 2 },
  statAccent: { backgroundColor: '#C0714F' },
  statVal: { fontSize: 22, fontWeight: '800', color: '#6B4226' },
  statValW: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLbl: { fontSize: 12, color: '#A1887F', marginTop: 2 },
  statLblW: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  card: { backgroundColor: '#FDF8F2', borderRadius: 18, padding: 18, marginBottom: 20, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#A1887F' },
  pct: { fontSize: 13, fontWeight: '700', color: '#C0714F' },
  goalName: { fontSize: 17, fontWeight: '700', color: '#3E2723', marginBottom: 12 },
  track: { height: 8, backgroundColor: '#EDE3D8', borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#C0714F', borderRadius: 999 },
  section: { fontSize: 16, fontWeight: '700', color: '#3E2723', marginBottom: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDF8F2', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: '#E0D0C0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkDone: { backgroundColor: '#C0714F', borderColor: '#C0714F' },
  tick: { color: '#fff', fontSize: 12, fontWeight: '700' },
  taskLbl: { flex: 1, fontSize: 15, color: '#3E2723' },
  taskDone: { textDecorationLine: 'line-through', color: '#A1887F' },
  tag: { fontSize: 11, fontWeight: '600', color: '#A1887F', backgroundColor: '#EDE3D8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
});

export default HomeScreen;
