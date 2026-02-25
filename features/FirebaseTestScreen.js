import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/database';

const FirebaseTestScreen = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: 'YOUR_API_KEY',
      authDomain: 'YOUR_AUTH_DOMAIN',
      databaseURL: 'YOUR_DATABASE_URL',
      projectId: 'YOUR_PROJECT_ID',
      storageBucket: 'YOUR_STORAGE_BUCKET',
      messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
      appId: 'YOUR_APP_ID',
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Test database write
    const reference = firebase.database().ref('test/data');
    reference.set({ test: 'Hello Firebase!' })
      .then(() => {
        console.log('Data written to the database.');
        // Test database read
        return reference.once('value');
      })
      .then((snapshot) => {
        const retrievedData = snapshot.val();
        console.log('Data retrieved from the database:', retrievedData);
        setData(retrievedData);
      })
      .catch((err) => {
        console.error('Error writing/reading data:', err);
        setError(err);
      });
  }, []);

  return (
    <View>
      <Text>Firebase Test Screen</Text>
      {error && <Text>Error: {error.message}</Text>}
      {data && <Text>Data: {JSON.stringify(data)}</Text>}
      <Button title="Reload" onPress={() => setData(null)} />
    </View>
  );
};

export default FirebaseTestScreen;
