import React from 'react';
import { TasksProvider } from './context/TasksContext';  // Adjust the import path as necessary
import TasksScreen from './screens/TasksScreen';  // Adjust the import path as necessary

const App = () => {
  return (
    <TasksProvider>
      <TasksScreen />
    </TasksProvider>
  );
};

export default App;