import React, { useState, useEffect } from 'react';

const TaskContext = React.createContext({
    taskName: '',
    taskID: '',
    saveTask: (taskName, taskID) => {},
});

export const TaskContextProvider = (props) => {
    const [taskName, setTaskName] = useState('');
    const [taskID, setTaskID] = useState('');

    useEffect(() => {
        // Check if task details are stored in localStorage
        const savedTaskName = localStorage.getItem('taskName');
        const savedTaskID = localStorage.getItem('taskID');
        
        if (savedTaskName && savedTaskID) {
            setTaskName(savedTaskName);
            setTaskID(savedTaskID);
        }
    }, []);

    const saveTask = (name, id) => {
        setTaskName(name);
        setTaskID(id);
        localStorage.setItem('taskName', name);
        localStorage.setItem('taskID', id);
    };

    const contextValue = {
        taskName: taskName,
        taskID: taskID,
        saveTask: saveTask,
    };

    return (
        <TaskContext.Provider value={contextValue}>
            {props.children}
        </TaskContext.Provider>
    );
};

export default TaskContext;
