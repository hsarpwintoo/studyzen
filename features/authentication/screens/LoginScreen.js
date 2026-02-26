import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { loginUser, registerUser } from '../../../services/authService';
import { useAuth } from '../../../context/AuthContext';

const LoginScreen = ({ navigation, route }) => {
  const { setUser } = useAuth();
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
        const newUser = await registerUser(email.trim(), password);
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
            <Text style={styles.label}>Email</Text>
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
