import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { logoutUser } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';

const Row = ({ icon, label, sub, right }) => (
  <View style={s.row}>
    <View style={s.rowIcon}><Text style={s.rowIconTxt}>{icon}</Text></View>
    <View style={s.rowBody}>
      <Text style={s.rowLabel}>{label}</Text>
      {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
    </View>
    <View>{right ?? <Text style={s.chevron}></Text>}</View>
  </View>
);

const SettingsScreen = () => {
  const { setUser } = useAuth();
  const handleLogout = async () => { await logoutUser(); setUser(null); };
  const [notif, setNotif] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [dark, setDark] = useState(false);

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.title}>Settings</Text>

        <View style={s.profile}>
          <View style={s.avatar}><Text style={s.avatarTxt}>SZ</Text></View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>Scholar</Text>
            <Text style={s.profileEmail}>scholar@studyzen.app</Text>
          </View>
        </View>

        <Text style={s.section}>Notifications</Text>
        <View style={s.card}>
          <Row icon="" label="Push Notifications" right={<Switch value={notif} onValueChange={setNotif} trackColor={{ false: '#D7C4AF', true: '#C0714F' }} thumbColor="#fff" />} />
          <View style={s.sep} />
          <Row icon="" label="Timer Sounds" right={<Switch value={sounds} onValueChange={setSounds} trackColor={{ false: '#D7C4AF', true: '#C0714F' }} thumbColor="#fff" />} />
        </View>

        <Text style={s.section}>Appearance</Text>
        <View style={s.card}>
          <Row icon="" label="Dark Mode" sub="Coming soon" right={<Switch value={dark} onValueChange={setDark} trackColor={{ false: '#D7C4AF', true: '#C0714F' }} thumbColor="#fff" />} />
          <View style={s.sep} />
          <Row icon="" label="Theme" sub="Warm Brown" />
        </View>

        <Text style={s.section}>Support</Text>
        <View style={s.card}>
          <Row icon="❓" label="Help & FAQ" />
          <View style={s.sep} />
          <Row icon="⭐" label="Rate StudyZen" />
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={s.logoutTxt}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={s.version}>StudyZen v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5EFE6' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#3E2723', paddingTop: 16, marginBottom: 20 },
  profile: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDF8F2', borderRadius: 18, padding: 16, marginBottom: 20, elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 999, backgroundColor: '#6B4226', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#3E2723' },
  profileEmail: { fontSize: 13, color: '#A1887F', marginTop: 2 },
  section: { fontSize: 11, fontWeight: '700', color: '#A1887F', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#FDF8F2', borderRadius: 16, overflow: 'hidden', marginBottom: 16, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EDE3D8', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowIconTxt: { fontSize: 16 },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#3E2723' },
  rowSub: { fontSize: 12, color: '#A1887F', marginTop: 1 },
  chevron: { fontSize: 20, color: '#A1887F' },
  sep: { height: 1, backgroundColor: '#E0D0C0', marginLeft: 60 },
  logoutBtn: { marginTop: 8, backgroundColor: '#FDF8F2', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#EAC4B5' },
  logoutTxt: { fontSize: 15, fontWeight: '700', color: '#C0714F' },
  version: { textAlign: 'center', fontSize: 12, color: '#D7C4AF', marginTop: 16, marginBottom: 8 },
});

export default SettingsScreen;