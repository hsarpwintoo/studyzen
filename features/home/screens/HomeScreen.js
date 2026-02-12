import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeMessage}>Welcome to StudyZen!</Text>
      <View style={styles.card}><Text style={styles.cardText}>Study Planner</Text></View>
      <View style={styles.card}><Text style={styles.cardText}>Focus Timer</Text></View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeMessage: {
    fontSize: 24,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    marginBottom: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 18,
  },
});

export default HomeScreen;