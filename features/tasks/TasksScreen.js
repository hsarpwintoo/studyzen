'use strict';

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/database';

const TasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const snapshot = await firebase.database().ref('/tasks').once('value');
        const tasksData = snapshot.val();
        const tasksList = tasksData ? Object.keys(tasksData).map(key => ({ id: key, ...tasksData[key] })) : [];
        setTasks(tasksList);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const renderItem = ({ item }) => ( 
    <View>
      <Text>{item.title}</Text>
      <Button title="Delete" onPress={() => handleDelete(item.id)} />
    </View>
  );

  const handleDelete = async (id) => {
    try {
      await firebase.database().ref(`/tasks/${id}`).remove();
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return <Text>Loading tasks...</Text>;
  }

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};

export default TasksScreen;
