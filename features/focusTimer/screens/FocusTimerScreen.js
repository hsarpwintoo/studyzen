import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { listenToUserCollection, addUserDocument } from '../../../services/firestoreService';

const todayKey = () => new Date().toISOString().slice(0, 10);
const W = Dimensions.get('window').width;
const RING = W * 0.62;
const PRESETS = [
  { label: 'Focus', mins: 25 },
  { label: 'Short', mins: 5 },
  { label: 'Long',  mins: 15 },
];

const FocusTimerScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [preset, setPreset] = useState(PRESETS[0]);
  const [customMins, setCustomMins] = useState(25);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const tick = useRef(null);
  const completedRef = useRef(false);
  const customMinsRef = useRef(25);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listenToUserCollection(user.uid, 'sessions', (items) => {
      setSessionCount(items.filter(s => s.date === todayKey()).length);
    });
    return unsub;
  }, [user?.uid]);

  useEffect(() => {
    if (running) {
      completedRef.current = false;
      tick.current = setInterval(() => {
        setSeconds(s => {
          if (s === 0) {
            setMinutes(m => {
              if (m === 0) {
                clearInterval(tick.current);
                setRunning(false);
                if (!completedRef.current && user?.uid) {
                  completedRef.current = true;
                  addUserDocument(user.uid, 'sessions', {
                    date: todayKey(), type: preset.label, duration: customMinsRef.current,
                  });
                }
                return 0;
              }
              return m - 1;
            });
            return 59;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(tick.current);
    }
    return () => clearInterval(tick.current);
  }, [running]);

  const selectPreset = (p) => {
    setRunning(false); setPreset(p);
    setCustomMins(p.mins); customMinsRef.current = p.mins;
    setMinutes(p.mins); setSeconds(0);
  };

  const adjustMins = (delta) => {
    if (running) return;
    const next = Math.min(90, Math.max(1, customMins + delta));
    setCustomMins(next); customMinsRef.current = next;
    setMinutes(next); setSeconds(0);
  };

  const reset = () => { setRunning(false); setMinutes(customMins); setSeconds(0); };
  const pad = n => String(n).padStart(2, '0');

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <Text style={[s.title, { color: theme.text }]}>Focus Timer</Text>

      <View style={s.pills}>
        {PRESETS.map(p => (
          <TouchableOpacity
            key={p.label}
            style={[s.pill, { backgroundColor: theme.input }, preset.label === p.label && { backgroundColor: theme.brown }]}
            onPress={() => selectPreset(p)} activeOpacity={0.8}
          >
            <Text style={[s.pillTxt, { color: theme.textSec }, preset.label === p.label && { color: '#fff' }]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[s.ring, { borderColor: theme.accent, backgroundColor: theme.card }]}>
        <Text style={[s.time, { color: theme.text }]}>{pad(minutes)}:{pad(seconds)}</Text>
        <Text style={[s.timeSub, { color: theme.textSec }]}>{running ? 'Stay focused...' : 'Ready'}</Text>
      </View>

      {!running && (
        <View style={s.adjRow}>
          <TouchableOpacity style={[s.adjBtn, { backgroundColor: theme.input }]} onPress={() => adjustMins(-5)} activeOpacity={0.75}>
            <Text style={[s.adjTxt, { color: theme.brown }]}>−5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.adjBtn, { backgroundColor: theme.input }]} onPress={() => adjustMins(-1)} activeOpacity={0.75}>
            <Text style={[s.adjTxt, { color: theme.brown }]}>−1</Text>
          </TouchableOpacity>
          <View style={[s.adjDisplay, { backgroundColor: theme.card }]}>
            <Text style={[s.adjMins, { color: theme.accent }]}>
              {customMins}<Text style={[s.adjUnit, { color: theme.textSec }]}> min</Text>
            </Text>
          </View>
          <TouchableOpacity style={[s.adjBtn, { backgroundColor: theme.input }]} onPress={() => adjustMins(1)} activeOpacity={0.75}>
            <Text style={[s.adjTxt, { color: theme.brown }]}>+1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.adjBtn, { backgroundColor: theme.input }]} onPress={() => adjustMins(5)} activeOpacity={0.75}>
            <Text style={[s.adjTxt, { color: theme.brown }]}>+5</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={s.controls}>
        <TouchableOpacity style={[s.resetBtn, { backgroundColor: theme.input }]} onPress={reset} activeOpacity={0.8}>
          <Text style={[s.resetTxt, { color: theme.brown }]}>↺ Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.startBtn, { backgroundColor: theme.brown }]} onPress={() => setRunning(r => !r)} activeOpacity={0.85}>
          <Text style={s.startTxt}>{running ? '⏸ Pause' : '▶ Start'}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.sessions}>
        <Text style={[s.sessionsTxt, { color: theme.textSec }]}>Sessions today: {sessionCount}</Text>
        <View style={s.dots}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[s.dot, { backgroundColor: theme.input }, i < sessionCount && { backgroundColor: theme.accent }]} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  pills: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  pill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999 },
  pillTxt: { fontSize: 13, fontWeight: '600' },
  ring: { width: RING, height: RING, borderRadius: RING / 2, borderWidth: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 20, elevation: 6 },
  time: { fontSize: Math.round(RING * 0.18), fontWeight: '800', letterSpacing: 2 },
  timeSub: { fontSize: 13, marginTop: 4 },
  adjRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  adjBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  adjTxt: { fontSize: 14, fontWeight: '700' },
  adjDisplay: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 72, alignItems: 'center' },
  adjMins: { fontSize: 18, fontWeight: '800' },
  adjUnit: { fontSize: 12, fontWeight: '400' },
  controls: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  resetBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  resetTxt: { fontSize: 15, fontWeight: '600' },
  startBtn: { paddingHorizontal: 36, paddingVertical: 14, borderRadius: 14, elevation: 4 },
  startTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  sessions: { alignItems: 'center', gap: 8 },
  sessionsTxt: { fontSize: 13 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});

export default FocusTimerScreen;