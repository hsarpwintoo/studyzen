import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';

const W = Dimensions.get('window').width;

const GetStartedScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.top}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>✦</Text>
      </View>
      <Text style={styles.appName}>StudyZen</Text>
      <Text style={styles.tagline}>Master your focus,{"\n"}simplify your studies.</Text>
    </View>

    <View style={styles.bottom}>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login', { mode: 'register' })} activeOpacity={0.85}>
        <Text style={styles.btnText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login', { mode: 'login' })} activeOpacity={0.7}>
        <Text style={styles.signinText}>Already have an account? <Text style={styles.signinBold}>Sign In</Text></Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5EFE6', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 48, paddingHorizontal: 28 },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#6B4226', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  logoText: { fontSize: 32, color: '#FDF8F2' },
  appName: { fontSize: 38, fontWeight: '800', color: '#6B4226', letterSpacing: 1, marginBottom: 12 },
  tagline: { fontSize: 17, color: '#6D4C41', textAlign: 'center', lineHeight: 26 },
  bottom: { width: '100%', alignItems: 'center', gap: 16 },
  btn: { width: '100%', backgroundColor: '#6B4226', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  btnText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
  signinText: { fontSize: 14, color: '#A1887F' },
  signinBold: { color: '#C0714F', fontWeight: '600' },
});

export default GetStartedScreen;
