import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView, TextInput, Alert, Modal, Platform, Linking } from 'react-native';
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
import { useSettings } from '../../../context/SettingsContext';
import { setDocument } from '../../../services/firestoreService';

const PRIVACY_POLICY_URL = 'https://www.notion.so/StudyZen-33e19d1a75a180c99152d2f34482e6e5?source=copy_link';

const SettingsScreen = () => {
  const { user, setUser } = useAuth();
  const { theme, isDark, toggleDark } = useTheme();
  const { notifEnabled, soundsEnabled, setNotifEnabled, setSoundsEnabled } = useSettings();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Scholar';
  const initials = displayName.slice(0, 2).toUpperCase();

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
  const [aboutVisible, setAboutVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

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
      // Sync updated name to Firestore users collection
      if (user?.uid) {
        await setDocument('users', user.uid, { name: newName.trim(), email: user.email });
      }
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

  const openPrivacyPolicyUrl = async () => {
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch {
      crossAlert('Could not open link', 'Please copy and open this URL manually:\n' + PRIVACY_POLICY_URL);
    }
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
            <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ false: t.border, true: t.accent }} thumbColor="#fff" />
          </View>
          <View style={[s.sep, { backgroundColor: t.sep }]} />
          <View style={s.row}>
            <View style={[s.rowIcon, { backgroundColor: t.input }]}><Text style={s.rowIconTxt}>🔊</Text></View>
            <Text style={[s.rowLabel, { color: t.text, flex: 1 }]}>Timer Sounds</Text>
            <Switch value={soundsEnabled} onValueChange={setSoundsEnabled} trackColor={{ false: t.border, true: t.accent }} thumbColor="#fff" />
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

        {/* About */}
        <Text style={[s.section, { color: t.textSec }]}>About</Text>
        <View style={[s.card, { backgroundColor: t.card }]}>
          <TouchableOpacity style={s.row} onPress={() => setAboutVisible(true)} activeOpacity={0.8}>
            <View style={[s.rowIcon, { backgroundColor: t.input }]}><Text style={s.rowIconTxt}>ℹ️</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: t.text }]}>About StudyZen</Text>
              <Text style={[s.rowSub, { color: t.textSec }]}>What this app does and how to use it</Text>
            </View>
            <Text style={[s.rowArrow, { color: t.textSec }]}>›</Text>
          </TouchableOpacity>
          <View style={[s.sep, { backgroundColor: t.sep, marginLeft: 60 }]} />
          <TouchableOpacity style={s.row} onPress={() => setPrivacyVisible(true)} activeOpacity={0.8}>
            <View style={[s.rowIcon, { backgroundColor: t.input }]}><Text style={s.rowIconTxt}>🔒</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: t.text }]}>Privacy Policy</Text>
              <Text style={[s.rowSub, { color: t.textSec }]}>How your data is collected and used</Text>
            </View>
            <Text style={[s.rowArrow, { color: t.textSec }]}>›</Text>
          </TouchableOpacity>
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

      <Modal visible={aboutVisible} animationType="slide" transparent onRequestClose={() => setAboutVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: t.card }]}>
            <Text style={[s.modalTitle, { color: t.text }]}>About StudyZen</Text>

            <Text style={[s.aboutHeading, { color: t.brown }]}>What is StudyZen?</Text>
            <Text style={[s.aboutBody, { color: t.textSec }]}>StudyZen is a calm study companion that helps you plan tasks, focus with a timer, and track your daily progress.</Text>

            <Text style={[s.aboutHeading, { color: t.brown, marginTop: 12 }]}>How it works</Text>
            <Text style={[s.aboutBody, { color: t.textSec }]}>1. Open Planner and add your study tasks for today.</Text>
            <Text style={[s.aboutBody, { color: t.textSec }]}>2. Start Focus Timer and complete your session with fewer distractions.</Text>
            <Text style={[s.aboutBody, { color: t.textSec }]}>3. Check Home and History to review progress and completed tasks.</Text>

            <View style={s.modalBtns}>
              <TouchableOpacity style={[s.modalSave, { backgroundColor: t.brown }]} onPress={() => setAboutVisible(false)} activeOpacity={0.85}>
                <Text style={s.modalSaveTxt}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={privacyVisible} animationType="slide" transparent onRequestClose={() => setPrivacyVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: t.card }]}>
            <Text style={[s.modalTitle, { color: t.text }]}>Privacy Policy</Text>

            <Text style={[s.aboutHeading, { color: t.brown }]}>1. Information We Collect</Text>
            <Text style={[s.aboutBody, { color: t.textSec }]}>StudyZen stores account details (email, display name), tasks you create, focus sessions, reminders, and app settings such as notification and sound preferences.</Text>

            <Text style={[s.aboutHeading, { color: t.brown, marginTop: 8 }]}>2. How We Use Your Data</Text>
            <Text style={[s.aboutBody, { color: t.textSec }]}>Your data is used to run core features: sign-in, task planning, focus timer tracking, progress history, and reminder notifications.</Text>

            <Text style={[s.aboutHeading, { color: t.brown, marginTop: 8 }]}>3. Storage and Security</Text>
            <Text style={[s.aboutBody, { color: t.textSec }]}>Data is stored using Firebase services configured for this app. We do not sell personal data. Access to your account data is tied to your authenticated user account.</Text>

            <Text style={[s.aboutHeading, { color: t.brown, marginTop: 8 }]}>4. Notifications</Text>
            <Text style={[s.aboutBody, { color: t.textSec }]}>If enabled, StudyZen sends local reminder notifications for tasks and timer events. You can disable notifications in app settings or device settings at any time.</Text>

            <Text style={[s.aboutHeading, { color: t.brown, marginTop: 8 }]}>5. Your Choices</Text>
            <Text style={[s.aboutBody, { color: t.textSec }]}>You can edit profile details, manage notification preferences, and delete tasks in the app. You can also sign out whenever you choose.</Text>

            <Text style={[s.aboutHeading, { color: t.brown, marginTop: 8 }]}>6. Policy Updates</Text>
            <Text style={[s.aboutBody, { color: t.textSec }]}>This policy may be updated as StudyZen evolves. Continued use of the app after updates means you accept the revised policy.</Text>

            <TouchableOpacity style={[s.policyLinkBtn, { backgroundColor: t.input }]} onPress={openPrivacyPolicyUrl} activeOpacity={0.85}>
              <Text style={[s.policyLinkLabel, { color: t.textSec }]}>Read full policy</Text>
              <Text style={[s.policyLinkUrl, { color: t.brown }]} numberOfLines={2}>{PRIVACY_POLICY_URL}</Text>
            </TouchableOpacity>

            <View style={s.modalBtns}>
              <TouchableOpacity style={[s.modalSave, { backgroundColor: t.brown }]} onPress={() => setPrivacyVisible(false)} activeOpacity={0.85}>
                <Text style={s.modalSaveTxt}>Close</Text>
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
  rowSub: { fontSize: 12, marginTop: 2 },
  rowArrow: { fontSize: 26, lineHeight: 26, marginLeft: 10 },
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
  aboutHeading: { fontSize: 14, fontWeight: '800', marginBottom: 6 },
  aboutBody: { fontSize: 13, lineHeight: 20, marginBottom: 6 },
  policyLinkBtn: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8 },
  policyLinkLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  policyLinkUrl: { fontSize: 12, fontWeight: '600' },
});

export default SettingsScreen;