import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { loginUser, registerUser, signInWithGoogle } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';

// Required so Android/iOS can return to the app after Google consent
WebBrowser.maybeCompleteAuthSession();

// ─── HOW TO ENABLE GOOGLE SIGN-IN ────────────────────────────────────────────
// 1. Firebase Console → Authentication → Sign-in method → Google → Enable
// 2. Copy your Web Client ID from:
//    Firebase Console → Authentication → Sign-in providers → Google
//    → Web SDK configuration → Web client ID
// 3. Paste it below (replace the placeholder string)
// 4. Google Cloud Console → APIs & Services → Credentials → the
//    "Web client (auto created by Google Service)" → Authorized redirect URIs
//    → add:  https://auth.expo.io/@YOUR_EXPO_USERNAME/studyzen
// 5. Firebase Console → Authentication → Settings → Authorized domains
//    → add:  auth.expo.io
// ─────────────────────────────────────────────────────────────────────────────
const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

const LoginScreen = ({ navigation, route }) => {
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(route?.params?.mode === 'register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Google OAuth request ──────────────────────────────────────────────────
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    shouldAutoExchangeCode: true,
  });

  // Update sign-in / register mode when navigation param changes
  useEffect(() => {
    if (route?.params?.mode) {
      setIsRegistering(route.params.mode === 'register');
      setError('');
    }
  }, [route?.params?.mode]);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      const accessToken = response.authentication?.accessToken;
      if (idToken || accessToken) {
        setLoading(true);
        signInWithGoogle(idToken, accessToken)
          .then(user => setUser(user))
          .catch(err => setError(err.message || 'Google sign-in failed.'))
          .finally(() => setLoading(false));
      } else {
        setError('Google sign-in returned no token. Check your Web Client ID setup.');
      }
    } else if (response?.type === 'error') {
      setError('Google sign-in was cancelled or failed. Please try again.');
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    if (GOOGLE_WEB_CLIENT_ID.startsWith('YOUR_GOOGLE')) {
      setError('Google Sign-In not configured yet.\nSee the setup instructions in LoginScreen.js.');
      return;
    }
    setError('');
    promptAsync();
  };

  const handleSubmit = async () => {
    setError('');
    if (isRegistering && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (isRegistering) {
        const newUser = await registerUser(email.trim(), password, name.trim());
        setUser(newUser);
      } else {
        const loggedInUser = await loginUser(email.trim(), password);
        setUser(loggedInUser);
      }
    } catch (err) {
      const msg = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-not-found': 'No account found with this email. Try registering.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
        'auth/email-already-in-use': 'This email is already registered. Try signing in.',
        'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase Console.',
        'auth/network-request-failed': 'Network error. Check your internet connection.',
        'auth/too-many-requests': 'Too many failed attempts. Try again later.',
      }[err.code] || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.logo}><Text style={styles.logoIcon}>✦</Text></View>
            <Text style={styles.appName}>StudyZen</Text>
            <Text style={styles.sub}>{isRegistering ? 'Create an account' : 'Welcome back'}</Text>
          </View>

          <View style={styles.card}>
            {isRegistering && (
              <>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor="#A1887F"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </>
            )}

            <Text style={[styles.label, isRegistering && { marginTop: 16 }]}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#A1887F"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={styles.pwInput}
                placeholder="••••••••"
                placeholderTextColor="#A1887F"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(p => !p)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorTxt}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.65 }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{isRegistering ? 'Create Account' : 'Sign In'}</Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerTxt}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In button */}
            <TouchableOpacity
              style={[styles.googleBtn, (loading || !request) && { opacity: 0.55 }]}
              onPress={handleGoogleSignIn}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleTxt}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.toggle} onPress={() => { setIsRegistering(p => !p); setError(''); }}>
            <Text style={styles.toggleText}>
              {isRegistering ? 'Have an account? ' : "No account? "}
              <Text style={styles.toggleBold}>{isRegistering ? 'Sign In' : 'Register'}</Text>
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5EFE6' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#6B4226', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoIcon: { fontSize: 24, color: '#FDF8F2' },
  appName: { fontSize: 26, fontWeight: '800', color: '#6B4226', marginBottom: 6 },
  sub: { fontSize: 15, color: '#A1887F' },
  card: { backgroundColor: '#FDF8F2', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#C4A882', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#6D4C41', marginBottom: 6 },
  input: { backgroundColor: '#EDE3D8', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#3E2723', borderWidth: 1, borderColor: '#E0D0C0' },
  // Password row with eye toggle
  pwRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDE3D8', borderRadius: 12, borderWidth: 1, borderColor: '#E0D0C0' },
  pwInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#3E2723' },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13, justifyContent: 'center', alignItems: 'center' },
  eyeIcon: { fontSize: 18 },
  btn: { backgroundColor: '#6B4226', paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E0D0C0' },
  dividerTxt: { marginHorizontal: 12, fontSize: 13, color: '#A1887F', fontWeight: '500' },
  // Google button
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 13, borderWidth: 1.5, borderColor: '#E0D0C0' },
  googleIcon: { fontSize: 18, fontWeight: '800', color: '#EA4335', marginRight: 10, letterSpacing: -0.5 },
  googleTxt: { fontSize: 15, fontWeight: '600', color: '#3E2723' },
  toggle: { alignItems: 'center', paddingVertical: 8 },
  toggleText: { fontSize: 14, color: '#A1887F' },
  toggleBold: { color: '#C0714F', fontWeight: '600' },
  errorTxt: { color: '#C0392B', fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 2, textAlign: 'center' },
});

export default LoginScreen;


const LoginScreen = ({ navigation, route }) => {
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(route?.params?.mode === 'register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update mode if navigation params change (e.g. pressing back and re-navigating)
  useEffect(() => {
    if (route?.params?.mode) {
      setIsRegistering(route.params.mode === 'register');
      setError('');
    }
  }, [route?.params?.mode]);

  const handleSubmit = async () => {
    setError('');
    if (isRegistering && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (isRegistering) {
        const newUser = await registerUser(email.trim(), password, name.trim());
        setUser(newUser); // immediately switch to home screen
      } else {
        const loggedInUser = await loginUser(email.trim(), password);
        setUser(loggedInUser); // immediately switch to home screen
      }
    } catch (err) {
      // Map Firebase error codes to friendly messages
      const msg = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-not-found': 'No account found with this email. Try registering.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
        'auth/email-already-in-use': 'This email is already registered. Try signing in.',
        'auth/operation-not-allowed': 'Email/Password sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.',
        'auth/network-request-failed': 'Network error. Check your internet connection.',
        'auth/too-many-requests': 'Too many failed attempts. Try again later.',
      }[err.code] || err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.logo}><Text style={styles.logoIcon}>✦</Text></View>
            <Text style={styles.appName}>StudyZen</Text>
            <Text style={styles.sub}>{isRegistering ? 'Create an account' : 'Welcome back'}</Text>
          </View>

          <View style={styles.card}>
            {isRegistering && (
              <>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor="#A1887F"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </>
            )}

            <Text style={[styles.label, isRegistering && { marginTop: 16 }]}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#A1887F"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A1887F"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.errorTxt}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.65 }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{isRegistering ? 'Create Account' : 'Sign In'}</Text>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.toggle} onPress={() => setIsRegistering(p => !p)}>
            <Text style={styles.toggleText}>
              {isRegistering ? 'Have an account? ' : "No account? "}
              <Text style={styles.toggleBold}>{isRegistering ? 'Sign In' : 'Register'}</Text>
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5EFE6' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#6B4226', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoIcon: { fontSize: 24, color: '#FDF8F2' },
  appName: { fontSize: 26, fontWeight: '800', color: '#6B4226', marginBottom: 6 },
  sub: { fontSize: 15, color: '#A1887F' },
  card: { backgroundColor: '#FDF8F2', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#C4A882', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#6D4C41', marginBottom: 6 },
  input: { backgroundColor: '#EDE3D8', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#3E2723', borderWidth: 1, borderColor: '#E0D0C0' },
  btn: { backgroundColor: '#6B4226', paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  toggle: { alignItems: 'center', paddingVertical: 8 },
  toggleText: { fontSize: 14, color: '#A1887F' },
  toggleBold: { color: '#C0714F', fontWeight: '600' },
  errorTxt: { color: '#C0392B', fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 2, textAlign: 'center' },
});

export default LoginScreen;
