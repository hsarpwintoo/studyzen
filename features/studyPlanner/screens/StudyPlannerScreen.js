// StudyPlannerScreen.js
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import TaskCard from './TaskCard'; // Assuming TaskCard is in the same directory

const mockTasks = [
    { id: '1', title: 'Study React Native', completed: false },
    { id: '2', title: 'Complete homework', completed: false },
    { id: '3', title: 'Read a book', completed: true },
    { id: '4', title: 'Prepare for exams', completed: false },
    { id: '5', title: 'Grocery shopping', completed: true },
];

const StudyPlannerScreen = () => {
    const [selectedTab, setSelectedTab] = useState('Upcoming');

    const filteredTasks = selectedTab === 'Upcoming'
        ? mockTasks.filter(task => !task.completed)
        : mockTasks.filter(task => task.completed);

    const renderItem = ({ item }) => <TaskCard task={item} />;

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setSelectedTab('Upcoming')} style={styles.tab}>
                    <Text style={selectedTab === 'Upcoming' ? styles.activeTab : styles.inactiveTab}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab('Completed')} style={styles.tab}>
                    <Text style={selectedTab === 'Completed' ? styles.activeTab : styles.inactiveTab}>Completed</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredTasks}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    tab: {
        padding: 10,
    },
    activeTab: {
        fontWeight: 'bold',
        color: 'blue',
    },
    inactiveTab: {
        color: 'grey',
    },
});

export default StudyPlannerScreen;