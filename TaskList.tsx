import React, { useState, useEffect, useCallback } from 'react';

interface Task {
    id: number;
    name: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in progress' | 'completed';
    deadline: Date;
}

const initialTasks: Task[] = [
    {
        id: 1,
        name: 'Task 1',
        priority: 'high',
        status: 'pending',
        deadline: new Date('2023-10-10'),
    },
];

const TaskManager: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('low');
    const [newTaskDeadline, setNewTaskDeadline] = useState('');

    useEffect(() => {
        // Placeholder for future enhancements
    }, []);

    const addNewTask = useCallback(() => {
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        const newTask: Task = {
            id: newId,
            name: newTaskName,
            priority: newTaskPriority,
            status: 'pending',
            deadline: new Date(newTaskDeadline),
        };
        setTasks((prevTasks) => [...prevTasks, newTask]);
        setNewTaskName('');
        setNewTaskPriority('low');
        setNewTaskDeadline('');
    }, [newTaskName, newTaskPriority, newTaskDeadline, tasks]);

    const updateTaskStatus = useCallback((id: number, status: Task['status']) => {
        setTasks((prevTasks) =>
            prevTasks.map(task =>
            task.id === id ? { ...task, status } : task)
        );
    }, []);

    const renderTasks = useCallback(() => {
        return tasks.map(task => (
            <div key={task.id}>
                <p>{task.name}</p>
                <p>Priority: {task.priority}</p>
                <p>Status: {task.status}</p>
                <p>Deadline: {task.deadline.toDateString()}</p>
                <button onClick={() => updateTaskStatus(task.id, 'in progress')}>Start</button>
                <button onClick={() => updateTaskStatus(task.id, 'completed')}>Complete</button>
            </div>
        ));
    }, [tasks, updateTaskStatus]);

    return (
        <div>
            <h1>Task Manager</h1>
            <div>
                <input 
                    type="text" 
                    value={newTaskName} 
                    onChange={(e) => setNewTaskName(e.target.value)} 
                    placeholder="Task Name" 
                />
                <select 
                    value={newTaskPriority} 
                    onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <input 
                    type="date" 
                    value={newTaskDeadline} 
                    onChange={(e) => setNewTaskDeadline(e.target.value)} 
                />
                <button onClick={addNewTask}>Add Task</button>
            </div>
            <div>{renderTasks()}</div>
        </div>
    );
};

export default TaskManager;