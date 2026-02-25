// TasksContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { realtimeDbService } from '../services/realtimeDbService';
import { authService } from '../services/authService';

const TasksContext = createContext();

export const useTasks = () => useContext(TasksContext);

export const TasksProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            const user = authService.currentUser;
            if (user) {
                const tasksRef = realtimeDbService.ref(`tasks/${user.uid}`);
                tasksRef.on('value', (snapshot) => {
                    const data = snapshot.val();
                    const tasksArray = data ? Object.entries(data).map(([id, task]) => ({ id, ...task })) : [];
                    setTasks(tasksArray);
                    setLoading(false);
                });
            }
        };

        fetchTasks();

        return () => {
            const user = authService.currentUser;
            if (user) {
                const tasksRef = realtimeDbService.ref(`tasks/${user.uid}`);
                tasksRef.off(); // Unsubscribe on unmount
            }
        };
    }, []);

    const addTask = async (task) => {
        const user = authService.currentUser;
        if (user) {
            const tasksRef = realtimeDbService.ref(`tasks/${user.uid}`);
            await tasksRef.push(task);
        }
    };

    const removeTask = async (taskId) => {
        const user = authService.currentUser;
        if (user) {
            const taskRef = realtimeDbService.ref(`tasks/${user.uid}`).child(taskId);
            await taskRef.remove();
        }
    };

    return (
        <TasksContext.Provider value={{ tasks, loading, addTask, removeTask }}>
            {children}
        </TasksContext.Provider>
    );
};
