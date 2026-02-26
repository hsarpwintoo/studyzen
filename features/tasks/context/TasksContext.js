import React, { createContext, useEffect, useState } from 'react';
import { pushData, updateData, removeData, subscribeToPath } from '../../../services/realtimeDbService';
import { useAuth } from '../../../context/AuthContext';

const TasksContext = createContext();

const TASKS_PATH = (uid) => `users/${uid}/tasks`;

export const TasksProvider = ({ children }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (!user) { setTasks([]); return; }
        const unsubscribe = subscribeToPath(TASKS_PATH(user.uid), (data) => {
            if (!data) { setTasks([]); return; }
            const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
            setTasks(list);
        });
        return () => unsubscribe();
    }, [user]);

    const addTask = async (task) => {
        if (!user) return;
        await pushData(TASKS_PATH(user.uid), { ...task, createdAt: Date.now() });
    };

    const updateTask = async (taskId, updatedTask) => {
        if (!user) return;
        await updateData(`${TASKS_PATH(user.uid)}/${taskId}`, updatedTask);
    };

    const deleteTask = async (taskId) => {
        if (!user) return;
        await removeData(`${TASKS_PATH(user.uid)}/${taskId}`);
    };

    return (
        <TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
            {children}
        </TasksContext.Provider>
    );
};

export const useTasks = () => {
    const context = React.useContext(TasksContext);
    if (!context) {
        throw new Error('useTasks must be used within a TasksProvider');
    }
    return context;
};
