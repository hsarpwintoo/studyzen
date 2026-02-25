import React from 'react';
import { View, Text } from 'react-native';
import firebaseConfig from '../config/firebase';  // Updated import

const FirebaseTestScreen = () => {
    // Initialize Firebase with the existing config
    firebase.initializeApp(firebaseConfig);

    return (
        <View>
            <Text>Firebase Test Screen</Text>
        </View>
    );
};

export default FirebaseTestScreen;