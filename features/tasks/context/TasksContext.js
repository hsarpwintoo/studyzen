import React, { createContext, useEffect, useState } from 'react';
import { realtimeDbService } from '../../services/realtimeDbService';

const TasksContext = createContext();

export const TasksProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const unsubscribe = realtimeDbService.subscribeToTasks(setTasks);
        return () => unsubscribe();
    }, []);

    const addTask = async (task) => {
        await realtimeDbService.addTask(task);
    };

    const updateTask = async (taskId, updatedTask) => {
        await realtimeDbService.updateTask(taskId, updatedTask);
    };

    const deleteTask = async (taskId) => {
        await realtimeDbService.deleteTask(taskId);
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
