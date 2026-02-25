import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/database'; // Import the database module if using real-time database

const TestTasksScreen = () => {
    const [status, setStatus] = useState('Disconnected');

    useEffect(() => {
        // Check Firebase connection status
        const database = firebase.database();
        database.ref('.info/connected').on('value', (snapshot) => {
            setStatus(snapshot.val() ? 'Connected' : 'Disconnected');
        });
    }, []);

    const testWriteData = () => {
        const database = firebase.database();
        const testData = { timestamp: new Date().toISOString() }; // example data
        database.ref('test-data/').set(testData)
            .then(() => {
                console.log('Data written successfully!');
            })
            .catch((error) => {
                console.error('Error writing data:', error);
            });
    };

    return (
        <View style={styles.container}>
            <Text>Connection Status: {status}</Text>
            <Button title="Test Write Data" onPress={testWriteData} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default TestTasksScreen;