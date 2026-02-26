import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions, Platform,
} from 'react-native';
import { logoutUser } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import {
  listenToUserCollection, saveUserTask,
} from '../../../services/firestoreService';

const { width: SW } = Dimensions.get('window');

const toDateKey = (d) => {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
};

const greetingFor = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const todayStr = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

const HomeScreen = ({ navigateTo }) => {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Scholar';
  const initials = displayName.slice(0, 2).toUpperCase();
  const todayKey = toDateKey(new Date());

  const [plannerTasks, setPlannerTasks] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);

  // ── Pull today's planner tasks ────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    const migrated = { current: false };
    const unsub = listenToUserCollection(
      user.uid, 'plannerTasks',
      (rawItems) => {
        if (!migrated.current) {
          migrated.current = true;
          rawItems.filter(t => !t.date).forEach(t =>
            saveUserTask(user.uid, 'plannerTasks', t.id, { date: todayKey })
          );
        }
        const items = rawItems.map(t => t.date ? t : { ...t, date: todayKey });
        const todayItems = items.filter(t => t.date === todayKey);
        setPlannerTasks(todayItems);
      },
      (err) => console.error('home plannerTasks err:', err.code, err.message)
    );
    return unsub;
  }, [user?.uid]);

  // ── Pull today's focus sessions ───────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listenToUserCollection(
      user.uid, 'sessions',
      (items) => setFocusSessions(items.filter(s => s.date === todayKey)),
      (err) => console.error('home sessions err:', err.code, err.message)
    );
    return unsub;
  }, [user?.uid]);

  const handleLogout = async () => { await logoutUser(); setUser(null); };

  const toggleTask = (task) => {
    saveUserTask(user.uid, 'plannerTasks', task.id, { done: !task.done });
    setPlannerTasks(prev =>
      prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t)
    );
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const done  = plannerTasks.filter(t => t.done).length;
  const total = plannerTasks.length;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const focusMins = focusSessions.reduce((acc, s) => acc + (s.duration || 25), 0);
  const focusLabel = focusMins >= 60
    ? `${Math.floor(focusMins / 60)}h ${focusMins % 60 > 0 ? focusMins % 60 + 'm' : ''}`
    : focusMins > 0 ? `${focusMins}m` : '0m';
  const focusTask = plannerTasks.find(t => !t.done);
  const upcoming  = plannerTasks.filter(t => !t.done).slice(0, 3);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: '#F9F7F2' }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.greeting}>{greetingFor()},</Text>
            <Text style={s.name}>{displayName} 👋</Text>
            <Text style={s.date}>{todayStr()}</Text>
          </View>
          <TouchableOpacity style={s.avatar} onPress={() => navigateTo?.('Settings')} activeOpacity={0.8}>
            <Text style={s.avatarTxt}>{initials}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats Row ── */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: '#A68D7B' }]}>
            <Text style={[s.statVal, { color: '#fff' }]}>{focusLabel}</Text>
            <Text style={[s.statLbl, { color: 'rgba(255,255,255,0.82)' }]}>Focus today</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8E2D9' }]}>
            <Text style={[s.statVal, { color: '#2D2D2D' }]}>{done}/{total}</Text>
            <Text style={[s.statLbl, { color: '#706C61' }]}>Tasks done</Text>
          </View>
        </View>

        {/* ── Hero Focus Card ── */}
        <View style={s.heroCard}>
          <Text style={s.heroLabel}>TODAY'S FOCUS</Text>
          <Text style={s.heroSubject} numberOfLines={2}>
            {focusTask ? focusTask.label : 'All done for today! 🎉'}
          </Text>
          {focusTask ? (
            <View style={s.heroMeta}>
              <View style={s.tagPill}>
                <Text style={s.tagPillTxt}>{focusTask.tag || 'Study'}</Text>
              </View>
              {focusTask.time ? <Text style={s.heroTime}>⏱ {focusTask.time}</Text> : null}
            </View>
          ) : null}
          <TouchableOpacity style={s.startBtn} onPress={() => navigateTo?.('Timer')} activeOpacity={0.85}>
            <Text style={s.startBtnTxt}>Start Session</Text>
          </TouchableOpacity>
        </View>

        {/* ── Progress Card ── */}
        <View style={s.progressCard}>
          <View style={s.progressHeader}>
            <Text style={s.progressTitle}>Today's Progress</Text>
            <Text style={s.progressPct}>{progressPct}%</Text>
          </View>
          <View style={s.track}>
            <View style={[s.fill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={s.progressSub}>{done} of {total} tasks completed</Text>
        </View>

        {/* ── Upcoming ── */}
        <Text style={s.sectionTitle}>Upcoming</Text>
        {upcoming.length === 0 ? (
          <View style={s.emptyUpcoming}>
            <Text style={s.emptyUpcomingTxt}>No upcoming tasks. All clear! ✅</Text>
          </View>
        ) : (
          upcoming.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[s.upcomingItem, t.done && { opacity: 0.45 }]}
              onPress={() => toggleTask(t)}
              activeOpacity={0.75}
            >
              <View style={[s.upcomingCheck, t.done && { backgroundColor: '#A68D7B', borderColor: '#A68D7B' }]}>
                {t.done ? <Text style={s.upcomingTick}>✓</Text> : null}
              </View>
              <View style={s.upcomingInfo}>
                <Text
                  style={[s.upcomingLbl, t.done && { textDecorationLine: 'line-through', color: '#706C61' }]}
                  numberOfLines={1}
                >
                  {t.label}
                </Text>
                <Text style={s.upcomingTag}>{t.tag}</Text>
              </View>
              <View style={s.upcomingTimePill}>
                <Text style={s.upcomingTimeTxt}>{t.time || '—'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const CARD_RADIUS = 20;
const SHADOW = Platform.select({
  ios: { shadowColor: '#C4A882', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 10 },
  default: { elevation: 3 },
});

const s = StyleSheet.create({
  root:  { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },

  // Header
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  headerLeft: { flex: 1, paddingRight: 12 },
  greeting:   { fontSize: 14, color: '#706C61', fontWeight: '500', marginBottom: 2 },
  name:       { fontSize: Math.min(SW * 0.07, 26), fontWeight: '800', color: '#2D2D2D', marginBottom: 3 },
  date:       { fontSize: 12, color: '#706C61' },
  avatar:     { width: 46, height: 46, borderRadius: 999, backgroundColor: '#A68D7B', alignItems: 'center', justifyContent: 'center', ...SHADOW },
  avatarTxt:  { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Stats
  statsRow:     { flexDirection: 'row', columnGap: 10, marginBottom: 20 },
  statCard:     { flex: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', ...SHADOW },
  statVal:      { fontSize: 20, fontWeight: '800' },
  statValEmoji: { fontSize: 16 },
  statLbl:      { fontSize: 10, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  heroCard:    { backgroundColor: '#fff', borderRadius: CARD_RADIUS, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: '#EBE5DC', ...SHADOW },
  heroLabel:   { fontSize: 10, fontWeight: '800', color: '#A68D7B', letterSpacing: 1.5, marginBottom: 8 },
  heroSubject: { fontSize: Math.min(SW * 0.065, 24), fontWeight: '800', color: '#2D2D2D', marginBottom: 12, lineHeight: 30 },
  heroMeta:    { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  tagPill:     { backgroundColor: '#F1EFE9', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginRight: 10 },
  tagPillTxt:  { fontSize: 12, fontWeight: '700', color: '#706C61' },
  heroTime:    { fontSize: 12, color: '#706C61', fontWeight: '600' },
  startBtn:    { backgroundColor: '#A68D7B', borderRadius: 999, paddingVertical: 13, alignItems: 'center' },
  startBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },

  // Progress
  progressCard:   { backgroundColor: '#fff', borderRadius: CARD_RADIUS, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#EBE5DC', ...SHADOW },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle:  { fontSize: 14, fontWeight: '700', color: '#2D2D2D' },
  progressPct:    { fontSize: 14, fontWeight: '800', color: '#A68D7B' },
  track:          { height: 8, borderRadius: 999, backgroundColor: '#F1EFE9', overflow: 'hidden', marginBottom: 8 },
  fill:           { height: '100%', borderRadius: 999, backgroundColor: '#A68D7B' },
  progressSub:    { fontSize: 12, color: '#706C61' },

  // Upcoming
  sectionTitle:     { fontSize: 16, fontWeight: '800', color: '#2D2D2D', marginBottom: 12 },
  emptyUpcoming:    { paddingVertical: 20, alignItems: 'center' },
  emptyUpcomingTxt: { fontSize: 14, color: '#706C61' },
  upcomingItem:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EBE5DC', ...SHADOW },
  upcomingCheck:    { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: '#D5CAC0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  upcomingTick:     { color: '#fff', fontSize: 12, fontWeight: '800' },
  upcomingInfo:     { flex: 1 },
  upcomingLbl:      { fontSize: 14, fontWeight: '600', color: '#2D2D2D', marginBottom: 3 },
  upcomingTag:      { fontSize: 11, color: '#706C61', fontWeight: '600' },
  upcomingTimePill: { backgroundColor: '#F1EFE9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 },
  upcomingTimeTxt:  { fontSize: 11, fontWeight: '700', color: '#A68D7B' },
});

export default HomeScreen;
