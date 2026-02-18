import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

const INIT = [
  { id: 1, time: '08:00', label: 'Morning review', tag: 'Biology', done: true },
  { id: 2, time: '09:30', label: 'Practice problems', tag: 'Math', done: true },
  { id: 3, time: '11:00', label: 'Essay research', tag: 'English', done: false },
  { id: 4, time: '13:00', label: 'Lunch break', tag: 'Break', done: false },
  { id: 5, time: '14:00', label: 'Flashcard review', tag: 'History', done: false },
  { id: 6, time: '16:00', label: 'Deep focus session', tag: 'Physics', done: false },
];

const StudyPlannerScreen = () => {
  const [tasks, setTasks] = useState(INIT);
  const done = tasks.filter(t => t.done).length;
  const toggle = id => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Study Planner</Text>
          <Text style={s.sub}>Tuesday, 18 Feb 2026</Text>
        </View>
        <View style={s.pill}><Text style={s.pillTxt}>{done}/{tasks.length}</Text></View>
      </View>

      <View style={s.track}>
        <View style={[s.fill, { width: (done / tasks.length * 100) + '%' }]} />
      </View>
      <Text style={s.pct}>{Math.round((done / tasks.length) * 100)}% complete</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {tasks.map(t => (
          <TouchableOpacity key={t.id} style={[s.row, t.done && s.rowDone]} onPress={() => toggle(t.id)} activeOpacity={0.75}>
            <Text style={s.time}>{t.time}</Text>
            <View style={[s.check, t.done && s.checkDone]}>
              {t.done && <Text style={s.tick}>✓</Text>}
            </View>
            <Text style={[s.lbl, t.done && s.lblDone]}>{t.label}</Text>
            <Text style={s.tag}>{t.tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={s.fab} activeOpacity={0.85}>
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5EFE6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#3E2723' },
  sub: { fontSize: 13, color: '#A1887F', marginTop: 2 },
  pill: { backgroundColor: '#6B4226', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  pillTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  track: { marginHorizontal: 20, height: 6, backgroundColor: '#EDE3D8', borderRadius: 999, overflow: 'hidden', marginBottom: 4 },
  fill: { height: '100%', backgroundColor: '#C0714F', borderRadius: 999 },
  pct: { fontSize: 12, color: '#A1887F', paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 80 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDF8F2', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  rowDone: { opacity: 0.6 },
  time: { fontSize: 12, fontWeight: '600', color: '#A1887F', width: 44 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: '#E0D0C0', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkDone: { backgroundColor: '#C0714F', borderColor: '#C0714F' },
  tick: { color: '#fff', fontSize: 12, fontWeight: '700' },
  lbl: { flex: 1, fontSize: 14, fontWeight: '600', color: '#3E2723' },
  lblDone: { textDecorationLine: 'line-through', color: '#A1887F' },
  tag: { fontSize: 11, fontWeight: '600', color: '#A1887F', backgroundColor: '#EDE3D8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, backgroundColor: '#6B4226', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabIcon: { fontSize: 26, color: '#fff', lineHeight: 28 },
});

export default StudyPlannerScreen;
