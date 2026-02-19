import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { listenToUserCollection, addUserDocument } from '../../../services/firestoreService';

const todayKey = () => new Date().toISOString().slice(0, 10);

const W = Dimensions.get('window').width;
const RING = W * 0.62;
const PRESETS = [
  { label: 'Focus', mins: 25 },
  { label: 'Short', mins: 5 },
  { label: 'Long', mins: 15 },
];

const FocusTimerScreen = () => {
  const { user } = useAuth();
  const [preset, setPreset] = useState(PRESETS[0]);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const tick = useRef(null);
  const completedRef = useRef(false);

  // Load today's session count from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listenToUserCollection(user.uid, 'sessions', (items) => {
      const today = todayKey();
      setSessionCount(items.filter(s => s.date === today).length);
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
                // Log completed session to Firestore
                if (!completedRef.current && user?.uid) {
                  completedRef.current = true;
                  addUserDocument(user.uid, 'sessions', {
                    date: todayKey(),
                    type: preset.label,
                    duration: preset.mins,
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

  const selectPreset = (p) => { setRunning(false); setPreset(p); setMinutes(p.mins); setSeconds(0); };
  const reset = () => { setRunning(false); setMinutes(preset.mins); setSeconds(0); };
  const pad = n => String(n).padStart(2, '0');

  return (
    <SafeAreaView style={s.root}>
      <Text style={s.title}>Focus Timer</Text>
      <View style={s.pills}>
        {PRESETS.map(p => (
          <TouchableOpacity key={p.label} style={[s.pill, preset.label === p.label && s.pillOn]} onPress={() => selectPreset(p)} activeOpacity={0.8}>
            <Text style={[s.pillTxt, preset.label === p.label && s.pillTxtOn]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.ring}>
        <Text style={s.time}>{pad(minutes)}:{pad(seconds)}</Text>
        <Text style={s.timeSub}>{running ? 'Stay focused...' : 'Ready'}</Text>
      </View>
      <View style={s.controls}>
        <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.8}>
          <Text style={s.resetTxt}> Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.startBtn} onPress={() => setRunning(r => !r)} activeOpacity={0.85}>
          <Text style={s.startTxt}>{running ? '⏸ Pause' : '▶ Start'}</Text>
        </TouchableOpacity>
      </View>
      <View style={s.sessions}>
        <Text style={s.sessionsTxt}>Sessions today: {sessionCount}</Text>
        <View style={s.dots}>
          {[0,1,2,3].map(i => <View key={i} style={[s.dot, i < sessionCount && s.dotOn]} />)}
        </View>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5EFE6', alignItems: 'center', paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#3E2723', marginBottom: 20 },
  pills: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  pill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, backgroundColor: '#EDE3D8' },
  pillOn: { backgroundColor: '#6B4226' },
  pillTxt: { fontSize: 13, fontWeight: '600', color: '#A1887F' },
  pillTxtOn: { color: '#fff' },
  ring: { width: RING, height: RING, borderRadius: RING / 2, borderWidth: 10, borderColor: '#C0714F', alignItems: 'center', justifyContent: 'center', marginBottom: 32, backgroundColor: '#FDF8F2', elevation: 6 },
  time: { fontSize: Math.round(RING * 0.18), fontWeight: '800', color: '#3E2723', letterSpacing: 2 },
  timeSub: { fontSize: 13, color: '#A1887F', marginTop: 4 },
  controls: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  resetBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, backgroundColor: '#EDE3D8' },
  resetTxt: { fontSize: 15, fontWeight: '600', color: '#6B4226' },
  startBtn: { paddingHorizontal: 36, paddingVertical: 14, borderRadius: 14, backgroundColor: '#6B4226', elevation: 4 },
  startTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  sessions: { alignItems: 'center', gap: 8 },
  sessionsTxt: { fontSize: 13, color: '#A1887F' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EDE3D8' },
  dotOn: { backgroundColor: '#C0714F' },
});

export default FocusTimerScreen;