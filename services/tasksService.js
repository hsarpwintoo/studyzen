// services/tasksService.js

import firebase from 'firebase/app';
import 'firebase/firestore';

const db = firebase.firestore();

// Function to add a task
export const addTask = async (task) => {
    try {
        const docRef = await db.collection('tasks').add(task);
        console.log('Task added with ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding task: ', error);
    }
};

// Function to delete a task
export const deleteTask = async (taskId) => {
    try {
        await db.collection('tasks').doc(taskId).delete();
        console.log('Task deleted with ID: ', taskId);
    } catch (error) {
        console.error('Error deleting task: ', error);
    }
};

// Function to update a task
export const updateTask = async (taskId, updatedTask) => {
    try {
        await db.collection('tasks').doc(taskId).update(updatedTask);
        console.log('Task updated with ID: ', taskId);
    } catch (error) {
        console.error('Error updating task: ', error);
    }
};

// Function to subscribe to tasks
export const subscribeToTasks = (callback) => {
    return db.collection('tasks').onSnapshot((snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(tasks);
    });
};
