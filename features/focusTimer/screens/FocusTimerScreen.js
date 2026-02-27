import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Dimensions, Modal, Vibration, Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useSettings } from '../../../context/SettingsContext';
import { listenToUserCollection, addUserDocument } from '../../../services/firestoreService';

// Show in-app alert even while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const COMPLETION_MESSAGES = [
  "Amazing work! Every minute of focus builds your future. 🌟",
  "Session done! Consistency is the key to mastery. 💪",
  "You crushed it! Rest a moment, then keep going. 🔥",
  "Fantastic focus! Your brain is getting stronger. 🧠",
  "Well done! Progress is progress, no matter how small. ✅",
];

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const W = Dimensions.get('window').width;
const RING = Math.min(W * 0.52, 190);
const PRESETS = [
  { label: 'Focus', mins: 25 },
  { label: 'Short', mins: 5 },
  { label: 'Long',  mins: 15 },
];

const FocusTimerScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { soundsEnabled } = useSettings();
  const [preset, setPreset] = useState(PRESETS[0]);
  const [customMins, setCustomMins] = useState(25);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const tick         = useRef(null);
  const completedRef = useRef(false);
  const customMinsRef  = useRef(25);
  const presetLabelRef = useRef(PRESETS[0].label);
  const justFinishedRef = useRef(false);

  const [showDoneModal, setShowDoneModal] = useState(false);
  const [doneMsg, setDoneMsg] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listenToUserCollection(
      user.uid, 'sessions',
      (items) => setSessionCount(items.filter(s => s.date === todayKey()).length),
      (err) => console.error('sessions listener error:', err.code, err.message)
    );
    return unsub;
  }, [user?.uid]);

  // Request notification permission + Android channel + audio mode
  useEffect(() => {
    Notifications.requestPermissionsAsync().catch(() => {});
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('studyzen-timer', {
        name: 'Study Timer',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 300, 100, 300],
      }).catch(() => {});
    }
    // Allow sound to play through speaker even when ringer is silent
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    }).catch(() => {});
  }, []);

  // Watch for timer completion
  useEffect(() => {
    if (!running && justFinishedRef.current) {
      justFinishedRef.current = false;
      const msg = COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
      setDoneMsg(msg);
      setShowDoneModal(true);
      // Vibrate
      Vibration.vibrate([0, 400, 100, 400, 100, 600]);
      // System notification (plays notification sound via OS)
      Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Session Complete!',
          body: `${customMinsRef.current}-min ${presetLabelRef.current} session done. ${msg}`,
          sound: 'default',
          ...(Platform.OS === 'android' ? { channelId: 'studyzen-timer' } : {}),
        },
        trigger: null,
      }).catch(() => {});
      // Play cheerful in-app completion chime via expo-av
      Audio.Sound.createAsync(
        require('../../../assets/sounds/complete.wav'),
        { shouldPlay: true, volume: 1.0 }
      ).then(({ sound }) => {
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) sound.unloadAsync();
        });
      }).catch(() => {});
    }
  }, [running]);

  // Tick sound for last 3 seconds of countdown
  useEffect(() => {
    if (!running || !soundsEnabled) return;
    if (minutes === 0 && seconds >= 1 && seconds <= 3) {
      Audio.Sound.createAsync(
        require('../../../assets/sounds/tick.wav'),
        { shouldPlay: true, volume: 0.9 }
      ).then(({ sound }) => {
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) sound.unloadAsync();
        });
      }).catch(() => {});
    }
  }, [seconds, minutes, running, soundsEnabled]);

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
                  justFinishedRef.current = true;
                  addUserDocument(user.uid, 'sessions', {
                    date: todayKey(), type: preset.label, duration: customMinsRef.current,
                  }).catch(e => console.error('save session error:', e.code, e.message));
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
    presetLabelRef.current = p.label;
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
    <SafeAreaView style={[s.safeArea, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={[s.root, { backgroundColor: theme.bg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
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
      <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Completion Modal ── */}
      <Modal
        visible={showDoneModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDoneModal(false)}
      >
        <View style={s.overlay}>
          <View style={[s.doneCard, { backgroundColor: theme.card }]}>
            <Text style={s.doneEmoji}>🎉</Text>
            <Text style={[s.doneTitle, { color: theme.text }]}>Session Complete!</Text>
            <Text style={[s.doneSub, { color: theme.textSec }]}>
              {customMinsRef.current} min · {presetLabelRef.current} session
            </Text>
            <Text style={[s.doneMsg, { color: theme.textSec }]}>{doneMsg}</Text>
            <TouchableOpacity
              style={[s.doneBtn, { backgroundColor: theme.brown }]}
              onPress={() => { setShowDoneModal(false); setRunning(false); setMinutes(customMins); setSeconds(0); completedRef.current = false; }}
              activeOpacity={0.85}
            >
              <Text style={s.doneBtnTxt}>Start Another ▶</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.doneBtnSec, { backgroundColor: theme.input }]}
              onPress={() => setShowDoneModal(false)}
              activeOpacity={0.75}
            >
              <Text style={[s.doneBtnSecTxt, { color: theme.textSec }]}>Take a Break ☕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1 },
  root: { alignItems: 'center', paddingTop: 16, paddingBottom: 20, flexGrow: 1 },
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

  // Completion modal
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  doneCard:     { width: '100%', borderRadius: 24, padding: 28, alignItems: 'center', elevation: 16 },
  doneEmoji:    { fontSize: 56, marginBottom: 12 },
  doneTitle:    { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  doneSub:      { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  doneMsg:      { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  doneBtn:      { width: '100%', paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginBottom: 10, elevation: 3 },
  doneBtnTxt:   { color: '#fff', fontWeight: '800', fontSize: 15 },
  doneBtnSec:   { width: '100%', paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  doneBtnSecTxt:{ fontSize: 14, fontWeight: '600' },
});

export default FocusTimerScreen;