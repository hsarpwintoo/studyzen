import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { listenToUserCollection, saveUserTask, addUserDocument } from '../../../services/firestoreService';

const DEFAULT_TASKS = [
  { id: 'd1', time: '08:00', label: 'Morning review', tag: 'Biology', done: false },
  { id: 'd2', time: '09:30', label: 'Practice problems', tag: 'Math', done: false },
  { id: 'd3', time: '11:00', label: 'Essay research', tag: 'English', done: false },
  { id: 'd4', time: '13:00', label: 'Lunch break', tag: 'Break', done: false },
  { id: 'd5', time: '14:00', label: 'Flashcard review', tag: 'History', done: false },
  { id: 'd6', time: '16:00', label: 'Deep focus session', tag: 'Physics', done: false },
];

const todayStr = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

const StudyPlannerScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [fromFirestore, setFromFirestore] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newTime, setNewTime] = useState('');
  const done = tasks.filter(t => t.done).length;

  useEffect(() => {
    if (!user?.uid) return;
    const seeded = { current: false };
    const unsub = listenToUserCollection(user.uid, 'plannerTasks', (items) => {
      if (items.length > 0) {
        setTasks(items.sort((a, b) => (a.time || '').localeCompare(b.time || '')));
        setFromFirestore(true);
      } else if (!seeded.current) {
        seeded.current = true;
        Promise.all(DEFAULT_TASKS.map(t =>
          addUserDocument(user.uid, 'plannerTasks', { time: t.time, label: t.label, tag: t.tag, done: t.done })
        ));
      }
    });
    return unsub;
  }, [user?.uid]);

  const toggle = (task) => {
    if (fromFirestore) {
      saveUserTask(user.uid, 'plannerTasks', task.id, { done: !task.done });
    } else {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
    }
  };

  const addTask = async () => {
    if (!newLabel.trim()) return;
    const newTask = {
      label: newLabel.trim(),
      tag: newTag.trim() || 'Study',
      time: newTime.trim() || '--:--',
      done: false,
    };
    if (fromFirestore) {
      await addUserDocument(user.uid, 'plannerTasks', newTask);
    } else {
      setTasks(prev => [...prev, { ...newTask, id: 'l' + Date.now() }]);
    }
    setNewLabel(''); setNewTag(''); setNewTime(''); setShowAdd(false);
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <View style={s.header}>
        <View>
          <Text style={[s.title, { color: theme.brown }]}>Study Planner</Text>
          <Text style={[s.sub, { color: theme.textSec }]}>{todayStr()}</Text>
        </View>
        <View style={[s.pill, { backgroundColor: theme.accent }]}>
          <Text style={s.pillTxt}>{done}/{tasks.length}</Text>
        </View>
      </View>

      {tasks.length > 0 && (
        <>
          <View style={[s.track, { backgroundColor: theme.input }]}>
            <View style={[s.fill, { width: (done / tasks.length * 100) + '%', backgroundColor: theme.accent }]} />
          </View>
          <Text style={[s.pct, { color: theme.textSec }]}>{Math.round((done / tasks.length) * 100)}% complete</Text>
        </>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {tasks.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[s.row, { backgroundColor: t.done ? theme.input : theme.card }]}
            onPress={() => toggle(t)}
            activeOpacity={0.75}
          >
            <Text style={[s.time, { color: theme.accent }]}>{t.time}</Text>
            <View style={[s.check, { borderColor: t.done ? theme.accent : theme.border, backgroundColor: t.done ? theme.accent : 'transparent' }]}>
              {t.done && <Text style={s.tick}>✓</Text>}
            </View>
            <Text style={[s.lbl, { color: t.done ? theme.textSec : theme.text, textDecorationLine: t.done ? 'line-through' : 'none' }]}>{t.label}</Text>
            <Text style={[s.tag, { color: theme.accent, backgroundColor: theme.input }]}>{t.tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showAdd && (
        <View style={[s.addPanel, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TextInput
            style={[s.input, { backgroundColor: theme.input, color: theme.text }]}
            placeholder="Task name"
            placeholderTextColor={theme.textSec}
            value={newLabel}
            onChangeText={setNewLabel}
          />
          <View style={s.inputRow}>
            <TextInput style={[s.input, s.halfInput, { backgroundColor: theme.input, color: theme.text }]} placeholder="Tag (e.g. Math)" placeholderTextColor={theme.textSec} value={newTag} onChangeText={setNewTag} />
            <TextInput style={[s.input, s.halfInput, { marginLeft: 8, backgroundColor: theme.input, color: theme.text }]} placeholder="Time (e.g. 09:00)" placeholderTextColor={theme.textSec} value={newTime} onChangeText={setNewTime} />
          </View>
          <View style={s.inputRow}>
            <TouchableOpacity style={[s.addBtn, s.halfInput, { backgroundColor: theme.accent }]} onPress={addTask} activeOpacity={0.85}>
              <Text style={s.addBtnTxt}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.cancelBtn, s.halfInput, { marginLeft: 8, backgroundColor: theme.input }]} onPress={() => { setShowAdd(false); setNewLabel(''); setNewTag(''); setNewTime(''); }} activeOpacity={0.75}>
              <Text style={[s.cancelBtnTxt, { color: theme.textSec }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!showAdd && (
        <TouchableOpacity style={[s.fab, { backgroundColor: theme.accent }]} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
          <Text style={s.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { fontSize: 13, marginTop: 2 },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  pillTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  track: { marginHorizontal: 20, height: 6, borderRadius: 999, overflow: 'hidden', marginBottom: 4 },
  fill: { height: '100%', borderRadius: 999 },
  pct: { fontSize: 12, paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 80 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  time: { fontSize: 12, fontWeight: '600', width: 44 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  tick: { color: '#fff', fontSize: 12, fontWeight: '700' },
  lbl: { flex: 1, fontSize: 14, fontWeight: '600' },
  tag: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabIcon: { fontSize: 26, color: '#fff', lineHeight: 28 },
  addPanel: { borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 16, elevation: 8, borderTopWidth: 1 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, marginBottom: 10 },
  inputRow: { flexDirection: 'row', marginBottom: 0 },
  halfInput: { flex: 1 },
  addBtn: { paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  addBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelBtn: { paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  cancelBtnTxt: { fontWeight: '600', fontSize: 14 },
});

export default StudyPlannerScreen;
