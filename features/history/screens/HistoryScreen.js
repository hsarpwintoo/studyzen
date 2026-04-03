import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { listenToUserCollection } from '../../../services/firestoreService';

const toDate = (v) => {
  if (!v) return null;
  if (typeof v?.toDate === 'function') return v.toDate();
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (v?.seconds) return new Date(v.seconds * 1000);
  return null;
};

const dateFromKey = (key) => {
  if (!key || typeof key !== 'string') return null;
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const fmtDate = (d) =>
  d
    ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown';

const fmtDateTime = (d) =>
  d
    ? d.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
    : null;

const HistoryScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listenToUserCollection(
      user.uid,
      'plannerTasks',
      (items) => setAllTasks(items),
      (err) => console.error('history plannerTasks err:', err.code, err.message)
    );
    return unsub;
  }, [user?.uid]);

  const doneTasks = useMemo(
    () => allTasks
      .filter((t) => t.done)
      .map((t) => {
        const completedDate = toDate(t.completedAt) || dateFromKey(t.date) || toDate(t.updatedAt) || toDate(t.createdAt);
        return {
          ...t,
          completedDate,
          plannedDate: dateFromKey(t.date),
        };
      })
      .sort((a, b) => (b.completedDate?.getTime?.() || 0) - (a.completedDate?.getTime?.() || 0)),
    [allTasks]
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <Text style={[s.title, { color: theme.brown }]}>Task History</Text>
        <Text style={[s.sub, { color: theme.textSec }]}>Completed: {doneTasks.length}</Text>
      </View>

      {doneTasks.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>🗂</Text>
          <Text style={[s.emptyTitle, { color: theme.text }]}>No completed tasks yet</Text>
          <Text style={[s.emptySub, { color: theme.textSec }]}>Finish tasks in Planner and they will appear here with date.</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {doneTasks.map((t) => (
            <View key={t.id} style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.brown }]}>
              <Text style={[s.label, { color: theme.text }]} numberOfLines={2}>{t.label}</Text>
              <View style={s.metaRow}>
                <Text style={[s.chip, { backgroundColor: theme.input, color: theme.brown }]}>{t.tag || 'Study'}</Text>
                <Text style={[s.chip, { backgroundColor: theme.input, color: theme.accent }]}>Time {t.time && t.time !== '--:--' ? t.time : '--:--'}</Text>
              </View>
              <Text style={[s.metaTxt, { color: theme.textSec }]}>Completed: {fmtDateTime(t.completedDate) || 'Unknown'}</Text>
              <Text style={[s.metaTxt, { color: theme.textSec }]}>Planned day: {fmtDate(t.plannedDate)}</Text>
            </View>
          ))}
          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: '800' },
  sub: { marginTop: 3, fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  label: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  metaTxt: { fontSize: 12, marginBottom: 2 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySub: { textAlign: 'center', fontSize: 13 },
});

export default HistoryScreen;