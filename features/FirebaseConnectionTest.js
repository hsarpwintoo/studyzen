import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import firebase from 'firebase';

const FirebaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Checking connection...');

  useEffect(() => {
    // Firebase configuration (replace with your own)
    const firebaseConfig = {
      apiKey: 'YOUR_API_KEY',
      authDomain: 'YOUR_AUTH_DOMAIN',
      projectId: 'YOUR_PROJECT_ID',
      storageBucket: 'YOUR_STORAGE_BUCKET',
      messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
      appId: 'YOUR_APP_ID',
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Test Firebase connection by writing then reading test data
    const testData = { message: 'Test data' };
    firebase.database().ref('testConnection').set(testData)
      .then(() => {
        return firebase.database().ref('testConnection').once('value');
      })
      .then((snapshot) => {
        if (snapshot.exists()) {
          setConnectionStatus('Firebase connection successful!');
        } else {
          setConnectionStatus('No data found.');
        }
      })
      .catch((error) => {
        setConnectionStatus(`Connection error: ${error.message}`);
      });
  }, []);

  return (
    <View>
      <Text>{connectionStatus}</Text>
    </View>
  );
};

export default FirebaseConnectionTest;