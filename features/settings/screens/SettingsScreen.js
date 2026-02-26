import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView, TextInput, Alert, Modal, Platform } from 'react-native';
import { logoutUser, updateUserName, updateUserPassword } from '../../../services/authService';

// Cross-platform alert helper (Alert.alert is a no-op on web)
const crossAlert = (title, msg) => {
  if (Platform.OS === 'web') {
    window.alert(msg ? `${title}\n\n${msg}` : title);
  } else {
    Alert.alert(title, msg);
  }
};
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { setDocument } from '../../../services/firestoreService';

const SettingsScreen = () => {
  const { user, setUser } = useAuth();
  const { theme, isDark, toggleDark } = useTheme();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Scholar';
  const initials = displayName.slice(0, 2).toUpperCase();

  const [notif, setNotif] = useState(true);
  const [sounds, setSounds] = useState(true);

  // Profile edit
  const [editVisible, setEditVisible] = useState(false);
  const [newName, setNewName] = useState(displayName);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Star rating
  const [rating, setRating] = useState(0);
  const [ratingDone, setRatingDone] = useState(false);

  // Logout confirmation
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleLogout = () => setLogoutVisible(true);
  const confirmLogout = async () => { setLogoutVisible(false); await logoutUser(); setUser(null); };

  const handleSaveProfile = async () => {
    if (!newName.trim()) { setSaveError('Name cannot be empty.'); return; }
    if (newPassword && newPassword.length < 6) { setSaveError('Password must be at least 6 characters.'); return; }
    setSaveError('');
    setSaving(true);
    try {
      await updateUserName(newName.trim());
      if (newPassword) await updateUserPassword(newPassword);
      setUser({ ...user, displayName: newName.trim() });
      setEditVisible(false);
      setNewPassword('');
      crossAlert('Saved', 'Your profile has been updated.');
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRate = async (stars) => {
    setRating(stars);
    setRatingDone(true);
    if (user?.uid) {
      await setDocument('ratings', user.uid, { rating: stars, email: user.email });
    }
    // Inline message shown via ratingDone state; crossAlert for extra feedback
    crossAlert('Thank you!', `You rated StudyZen ${stars} star${stars > 1 ? 's' : ''}! ⭐`);
  };

  const t = theme;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={[s.title, { color: t.text }]}>Settings</Text>

        {/* Profile card */}
        <View style={[s.profile, { backgroundColor: t.card }]}>
          <View style={[s.avatar, { backgroundColor: t.brown }]}>
            <Text style={s.avatarTxt}>{initials}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={[s.profileName, { color: t.text }]}>{displayName}</Text>
            <Text style={[s.profileEmail, { color: t.textSec }]}>{user?.email || ''}</Text>
          </View>
          <TouchableOpacity style={[s.editBtn, { backgroundColor: t.input }]} onPress={() => { setNewName(displayName); setSaveError(''); setEditVisible(true); }} activeOpacity={0.8}>
            <Text style={[s.editBtnTxt, { color: t.brown }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={[s.section, { color: t.textSec }]}>Notifications</Text>
        <View style={[s.card, { backgroundColor: t.card }]}>
          <View style={s.row}>
            <View style={[s.rowIcon, { backgroundColor: t.input }]}><Text style={s.rowIconTxt}>🔔</Text></View>
            <Text style={[s.rowLabel, { color: t.text, flex: 1 }]}>Push Notifications</Text>
            <Switch value={notif} onValueChange={setNotif} trackColor={{ false: t.border, true: t.accent }} thumbColor="#fff" />
          </View>
          <View style={[s.sep, { backgroundColor: t.sep }]} />
          <View style={s.row}>
            <View style={[s.rowIcon, { backgroundColor: t.input }]}><Text style={s.rowIconTxt}>🔊</Text></View>
            <Text style={[s.rowLabel, { color: t.text, flex: 1 }]}>Timer Sounds</Text>
            <Switch value={sounds} onValueChange={setSounds} trackColor={{ false: t.border, true: t.accent }} thumbColor="#fff" />
          </View>
        </View>

        {/* Appearance */}
        <Text style={[s.section, { color: t.textSec }]}>Appearance</Text>
        <View style={[s.card, { backgroundColor: t.card }]}>
          <View style={s.row}>
            <View style={[s.rowIcon, { backgroundColor: t.input }]}><Text style={s.rowIconTxt}>🌙</Text></View>
            <Text style={[s.rowLabel, { color: t.text, flex: 1 }]}>Dark Mode</Text>
            <Switch value={isDark} onValueChange={toggleDark} trackColor={{ false: t.border, true: t.accent }} thumbColor="#fff" />
          </View>
        </View>

        {/* Rate StudyZen */}
        <Text style={[s.section, { color: t.textSec }]}>Rate StudyZen</Text>
        <View style={[s.card, { backgroundColor: t.card, paddingVertical: 16 }]}>
          <Text style={[s.ratePrompt, { color: t.textSec }]}>
            {ratingDone ? `You rated ${rating} star${rating > 1 ? 's' : ''} — thank you! 🙏` : 'Enjoying StudyZen? Tap a star to rate!'}
          </Text>
          <View style={s.stars}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => handleRate(i)} activeOpacity={0.75}>
                <Text style={[s.star, { color: i <= rating ? '#F4A726' : t.border }]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={[s.logoutBtn, { backgroundColor: t.card, borderColor: '#EAC4B5' }]} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={[s.logoutTxt, { color: t.accent }]}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={[s.version, { color: t.textSec }]}>StudyZen v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      {/* Logout Confirmation Modal */}
      <Modal visible={logoutVisible} animationType="fade" transparent onRequestClose={() => setLogoutVisible(false)}>
        <View style={s.logoutOverlay}>
          <View style={[s.logoutModal, { backgroundColor: t.card }]}>
            <Text style={[s.logoutModalTitle, { color: t.text }]}>Log Out</Text>
            <Text style={[s.logoutModalMsg, { color: t.textSec }]}>Are you sure you want to log out?</Text>
            <View style={s.modalBtns}>
              <TouchableOpacity style={[s.modalCancel, { backgroundColor: t.input }]} onPress={() => setLogoutVisible(false)} activeOpacity={0.75}>
                <Text style={[s.modalCancelTxt, { color: t.brown }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalSave, { backgroundColor: '#C0392B' }]} onPress={confirmLogout} activeOpacity={0.85}>
                <Text style={s.modalSaveTxt}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: t.card }]}>
            <Text style={[s.modalTitle, { color: t.text }]}>Edit Profile</Text>

            <Text style={[s.inputLabel, { color: t.textSec }]}>Display Name</Text>
            <TextInput
              style={[s.input, { backgroundColor: t.input, color: t.text, borderColor: t.border }]}
              value={newName}
              onChangeText={setNewName}
              placeholderTextColor={t.textSec}
              placeholder="Your name"
            />

            {saveError ? <Text style={s.saveErrTxt}>{saveError}</Text> : null}
            <Text style={[s.inputLabel, { color: t.textSec }]}>New Password</Text>
            <TextInput
              style={[s.input, { backgroundColor: t.input, color: t.text, borderColor: t.border }]}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Leave blank to keep current"
              placeholderTextColor={t.textSec}
            />

            <View style={s.modalBtns}>
              <TouchableOpacity style={[s.modalCancel, { backgroundColor: t.input }]} onPress={() => { setEditVisible(false); setNewPassword(''); }} activeOpacity={0.75}>
                <Text style={[s.modalCancelTxt, { color: t.brown }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalSave, { backgroundColor: t.brown }]} onPress={handleSaveProfile} disabled={saving} activeOpacity={0.85}>
                <Text style={s.modalSaveTxt}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', paddingTop: 16, marginBottom: 20 },
  profile: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16, marginBottom: 20, elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700' },
  profileEmail: { fontSize: 13, marginTop: 2 },
  editBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  editBtnTxt: { fontSize: 13, fontWeight: '700' },
  section: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowIconTxt: { fontSize: 16 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  sep: { height: 1, marginLeft: 60 },
  ratePrompt: { fontSize: 13, textAlign: 'center', marginBottom: 12 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  star: { fontSize: 36 },
  logoutBtn: { marginTop: 8, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5 },
  logoutTxt: { fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 16, marginBottom: 8 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, elevation: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, borderWidth: 1, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalCancelTxt: { fontSize: 15, fontWeight: '600' },
  modalSave: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalSaveTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  logoutOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  logoutModal: { width: '80%', borderRadius: 20, padding: 24, elevation: 16 },
  logoutModalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  logoutModalMsg: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  saveErrTxt: { color: '#C0392B', fontSize: 13, marginBottom: 10, fontWeight: '600' },
});

export default SettingsScreen;