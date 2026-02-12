/**
 * Login Screen
 * Entry point for user authentication
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const handleLoginPress = () => {
    // TODO: Implement actual authentication logic
    // For now, navigate to Home screen to demonstrate navigation
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StudyZen</Text>
      <Text style={styles.subtitle}>Master Your Time, Maximize Your Focus</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLoginPress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginScreen;