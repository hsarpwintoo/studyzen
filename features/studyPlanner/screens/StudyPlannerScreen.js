import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Alert, KeyboardAvoidingView,
  Platform, Dimensions, Modal,
} from 'react-native';

// ─── cross-platform alert (Alert.alert is a no-op on web) ────────────────────
const crossAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      // eslint-disable-next-line no-alert
      if (window.confirm(`${title}\n\n${message}`)) {
        const action = buttons.find(b => b.style === 'destructive' || b.style === 'default');
        action?.onPress?.();
      }
    } else {
      // eslint-disable-next-line no-alert
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import {
  listenToUserCollection, saveUserTask,
  addUserDocument, deleteUserDocument,
} from '../../../services/firestoreService';

const { width: SW } = Dimensions.get('window');

// ─── date helpers (LOCAL date, not UTC) ──────────────────────────────────────
const toDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const formatDate = (d) =>
  d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
const isToday = (d) => toDateKey(d) === toDateKey(new Date());

// ─── time helpers ────────────────────────────────────────────────────────────
const to24h = (hour12, minute, ampm) => {
  let h = parseInt(hour12, 10) % 12;
  if (ampm === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${String(parseInt(minute || 0, 10)).padStart(2, '0')}`;
};
const to12h = (t24) => {
  if (!t24 || t24 === '--:--') return '--:--';
  const [hStr, mStr] = t24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
};



// ─── component ───────────────────────────────────────────────────────────────
const StudyPlannerScreen = () => {
  const { user }  = useAuth();
  const { theme } = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allTasks,  setAllTasks]  = useState([]);
  const [showAdd,   setShowAdd]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [addError,  setAddError]  = useState('');

  // form fields
  const [newLabel, setNewLabel] = useState('');
  const [newTag,   setNewTag]   = useState('');
  const [newHour,  setNewHour]  = useState('8');
  const [newMin,   setNewMin]   = useState('00');
  const [newAmPm,  setNewAmPm]  = useState('AM');

  // derive per-day list — computed fresh on every render
  const dateKey = toDateKey(selectedDate);
  const tasks = allTasks
    .filter(t => t.date === dateKey)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const done = tasks.filter(t => t.done).length;

  // ── Firestore listener ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    const migrated = { current: false };

    const unsub = listenToUserCollection(
      user.uid,
      'plannerTasks',
      (rawItems) => {
        const todayKey = toDateKey(new Date());

        // One-time migration: stamp undated (legacy) docs with today
        if (!migrated.current) {
          migrated.current = true;
          rawItems.filter(t => !t.date).forEach(t =>
            saveUserTask(user.uid, 'plannerTasks', t.id, { date: todayKey })
          );
        }

        // Patch undated items in local memory immediately
        const items = rawItems.map(t => t.date ? t : { ...t, date: todayKey });
        setAllTasks(items);
      },
      (err) => console.error('plannerTasks error:', err.code, err.message)
    );
    return unsub;
  }, [user?.uid]);

  // ── actions ──────────────────────────────────────────────────────────────
  const toggle = (task) => {
    const next = !task.done;
    if (user?.uid) saveUserTask(user.uid, 'plannerTasks', task.id, { done: next });
    setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: next } : t));
  };

  const confirmDelete = (task) =>
    crossAlert('Delete Task', `Delete "${task.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          if (user?.uid) deleteUserDocument(user.uid, 'plannerTasks', task.id);
          setAllTasks(prev => prev.filter(t => t.id !== task.id));
        },
      },
    ]);

  const resetForm = () => {
    setNewLabel(''); setNewTag('');
    setNewHour('8'); setNewMin('00'); setNewAmPm('AM');
    setAddError('');
    setShowAdd(false);
  };

  const addTask = async () => {
    const label = newLabel.trim();
    if (!label) {
      setAddError('Task name is required.');
      return;
    }
    setAddError('');
    const h = parseInt(newHour, 10);
    const time = (h >= 1 && h <= 12) ? to24h(newHour, newMin, newAmPm) : '--:--';
    const newTask = { label, tag: newTag.trim() || 'Study', time, date: dateKey, done: false };

    setSaving(true);
    try {
      if (user?.uid) {
        await addUserDocument(user.uid, 'plannerTasks', newTask);
        // Firestore real-time listener will update allTasks automatically
      } else {
        // Not logged in — optimistic local update
        setAllTasks(prev => [...prev, { ...newTask, id: 'l' + Date.now() }]);
      }
      resetForm();
    } catch (e) {
      const code = e.code || '';
      if (code === 'permission-denied') {
        setAddError('Permission denied — please update your Firestore security rules to allow authenticated writes.');
      } else if (code === 'unavailable' || code === 'network-request-failed') {
        setAddError('No connection — check your internet and try again.');
      } else {
        setAddError(`Could not save task (${code || e.message || 'unknown error'}).`);
      }
      console.error('addTask error:', e.code, e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>

        {/* ── Header ── */}
        <View style={[s.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => setSelectedDate(d => addDays(d, -1))}
            style={s.arrowBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[s.arrow, { color: theme.accent }]}>‹</Text>
          </TouchableOpacity>

          <View style={s.dateCtr}>
            <Text style={[s.title, { color: theme.brown }]}>Study Planner</Text>
            <Text style={[s.dateTxt, { color: theme.textSec }]}>
              {isToday(selectedDate) ? 'Today — ' : ''}{formatDate(selectedDate)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setSelectedDate(d => addDays(d, 1))}
            style={s.arrowBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[s.arrow, { color: theme.accent }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Progress bar ── */}
        {tasks.length > 0 && (
          <View style={s.progressWrap}>
            <View style={[s.track, { backgroundColor: theme.input }]}>
              <View style={[s.fill, { width: `${(done / tasks.length) * 100}%`, backgroundColor: theme.accent }]} />
            </View>
            <Text style={[s.pct, { color: theme.textSec }]}>
              {done}/{tasks.length} complete · {Math.round((done / tasks.length) * 100)}%
            </Text>
          </View>
        )}

        {/* ── Empty state ── */}
        {tasks.length === 0 && !showAdd && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={[s.emptyTxt, { color: theme.textSec }]}>No tasks for this day</Text>
            <Text style={[s.emptySub, { color: theme.textSec }]}>Tap + to add one</Text>
          </View>
        )}

        {/* ── Task list ── */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.list}
          keyboardShouldPersistTaps="handled"
        >
          {tasks.map(t => (
            <View
              key={t.id}
              style={[
                s.row,
                {
                  backgroundColor: t.done ? theme.input : theme.card,
                  shadowColor: theme.brown,
                },
              ]}
            >
              <TouchableOpacity onPress={() => toggle(t)} style={s.rowLeft} activeOpacity={0.75}>
                <View style={[s.check, {
                  borderColor: t.done ? theme.accent : theme.border,
                  backgroundColor: t.done ? theme.accent : 'transparent',
                }]}>
                  {t.done && <Text style={s.tick}>✓</Text>}
                </View>
                <View style={s.taskInfo}>
                  <Text
                    style={[s.lbl, {
                      color: t.done ? theme.textSec : theme.text,
                      textDecorationLine: t.done ? 'line-through' : 'none',
                    }]}
                    numberOfLines={2}
                  >
                    {t.label}
                  </Text>
                  <View style={s.metaRow}>
                    <Text style={[s.timeChip, { backgroundColor: theme.input, color: theme.accent }]}>
                      🕐 {to12h(t.time)}
                    </Text>
                    <Text style={[s.tagChip, { backgroundColor: theme.input, color: theme.brown }]}>
                      {t.tag}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmDelete(t)}
                style={s.deleteBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={[s.deleteIcon, { color: theme.textSec }]}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* ── Add task panel ── */}
        {showAdd && (
          <View style={[s.addPanel, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <Text style={[s.panelTitle, { color: theme.brown }]}>New Task</Text>

            <TextInput
              style={[s.input, { backgroundColor: theme.input, color: theme.text }]}
              placeholder="Task name *"
              placeholderTextColor={theme.textSec}
              value={newLabel}
              onChangeText={setNewLabel}
              returnKeyType="next"
              autoFocus
            />

            <TextInput
              style={[s.input, { backgroundColor: theme.input, color: theme.text }]}
              placeholder="Tag  (e.g. Math, Science…)"
              placeholderTextColor={theme.textSec}
              value={newTag}
              onChangeText={setNewTag}
              returnKeyType="done"
            />

            {/* Time row */}
            <Text style={[s.fieldLabel, { color: theme.textSec }]}>Time (optional)</Text>
            <View style={s.timeRow}>
              <TextInput
                style={[s.timeBox, { backgroundColor: theme.input, color: theme.text, flex: 1 }]}
                placeholder="H"
                placeholderTextColor={theme.textSec}
                keyboardType="number-pad"
                maxLength={2}
                value={newHour}
                onChangeText={v => setNewHour(v.replace(/\D/g, ''))}
              />
              <Text style={[s.timeSep, { color: theme.text }]}>:</Text>
              <TextInput
                style={[s.timeBox, { backgroundColor: theme.input, color: theme.text, flex: 1 }]}
                placeholder="MM"
                placeholderTextColor={theme.textSec}
                keyboardType="number-pad"
                maxLength={2}
                value={newMin}
                onChangeText={v => setNewMin(v.replace(/\D/g, ''))}
              />
              <View style={s.ampmGroup}>
                <TouchableOpacity
                  style={[s.ampmBtn, { backgroundColor: newAmPm === 'AM' ? theme.accent : theme.input }]}
                  onPress={() => setNewAmPm('AM')}
                >
                  <Text style={[s.ampmTxt, { color: newAmPm === 'AM' ? '#fff' : theme.textSec }]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.ampmBtn, { backgroundColor: newAmPm === 'PM' ? theme.accent : theme.input, marginLeft: 6 }]}
                  onPress={() => setNewAmPm('PM')}
                >
                  <Text style={[s.ampmTxt, { color: newAmPm === 'PM' ? '#fff' : theme.textSec }]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Inline error */}
            {addError ? (
              <Text style={s.errorTxt}>{addError}</Text>
            ) : null}

            {/* Action buttons */}
            <View style={s.actionRow}>
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: theme.accent, opacity: saving ? 0.65 : 1 }]}
                onPress={addTask}
                activeOpacity={0.85}
                disabled={saving}
              >
                <Text style={s.actionBtnTxt}>{saving ? 'Saving…' : 'Add Task'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: theme.input, marginLeft: 10 }]}
                onPress={resetForm}
                activeOpacity={0.75}
              >
                <Text style={[s.actionBtnTxt, { color: theme.textSec }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── FAB ── */}
        {!showAdd && (
          <TouchableOpacity
            style={[s.fab, { backgroundColor: theme.accent }]}
            onPress={() => setShowAdd(true)}
            activeOpacity={0.85}
          >
            <Text style={s.fabIcon}>+</Text>
          </TouchableOpacity>
        )}

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// ─── styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1,
  },
  arrowBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  arrow:    { fontSize: 36, fontWeight: '300', lineHeight: 40 },
  dateCtr:  { flex: 1, alignItems: 'center' },
  title:    { fontSize: Math.min(SW * 0.055, 22), fontWeight: '800' },
  dateTxt:  { fontSize: Math.min(SW * 0.03, 13), marginTop: 2, textAlign: 'center' },

  // Progress
  progressWrap: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  track: { height: 7, borderRadius: 999, overflow: 'hidden', marginBottom: 6 },
  fill:  { height: '100%', borderRadius: 999 },
  pct:   { fontSize: 12 },

  // Empty
  empty:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  emptyIcon:{ fontSize: 52, marginBottom: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySub: { fontSize: 13 },

  // Task list
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 110 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, paddingVertical: 14,
    paddingLeft: 14, paddingRight: 10,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  check: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  tick: { color: '#fff', fontSize: 12, fontWeight: '800' },
  taskInfo: { flex: 1 },
  lbl:  { fontSize: Math.min(SW * 0.038, 15), fontWeight: '600', marginBottom: 6 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap' },
  timeChip: {
    fontSize: 11, fontWeight: '600',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999, marginRight: 6, marginBottom: 2,
  },
  tagChip: {
    fontSize: 11, fontWeight: '700',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999, marginBottom: 2,
  },
  deleteBtn: { paddingLeft: 10, paddingVertical: 4 },
  deleteIcon:{ fontSize: 15, fontWeight: '700' },
  errorTxt:  { color: '#C0392B', fontSize: 12, fontWeight: '600', marginBottom: 8 },

  // Add panel
  addPanel: {
    borderTopWidth: 1, paddingHorizontal: 16,
    paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 12 : 16,
  },
  panelTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  input: {
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11,
    fontSize: 14, marginBottom: 10,
  },
  timeRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timeBox:  {
    borderRadius: 10, paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16, textAlign: 'center', minWidth: 44,
  },
  timeSep:  { fontSize: 22, fontWeight: '700', marginHorizontal: 6 },
  ampmGroup:{ flexDirection: 'row', marginLeft: 12 },
  ampmBtn:  { paddingHorizontal: SW * 0.04, paddingVertical: 10, borderRadius: 10 },
  ampmTxt:  { fontSize: 13, fontWeight: '800' },
  actionRow:{ flexDirection: 'row' },
  actionBtn:{ flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  actionBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 58, height: 58, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 30 },
});

export default StudyPlannerScreen;
