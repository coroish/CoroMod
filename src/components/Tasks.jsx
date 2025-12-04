import React, { useState } from 'react';
import { Plus, Trash2, Check, Circle } from 'lucide-react';

const Tasks = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Design ZenFlow UI', completed: true },
        { id: 2, text: 'Implement Focus Timer', completed: true },
        { id: 3, text: 'Add Soundscapes', completed: false },
    ]);
    const [newTask, setNewTask] = useState('');

    const addTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
        setNewTask('');
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const styles = {
        container: {
            padding: '40px',
            maxWidth: '600px',
            margin: '0 auto'
        },
        header: {
            marginBottom: '30px'
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: 'white'
        },
        form: {
            marginBottom: '30px',
            position: 'relative'
        },
        input: {
            paddingRight: '60px'
        },
        addButton: {
            position: 'absolute',
            right: '8px',
            top: '8px',
            width: '48px',
            height: '48px',
            padding: '12px'
        },
        taskList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        task: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            transition: 'all 0.3s ease'
        },
        taskCompleted: {
            opacity: 0.6
        },
        taskText: {
            flex: 1,
            fontSize: '1.1rem',
            color: 'white'
        },
        taskTextCompleted: {
            textDecoration: 'line-through',
            color: 'var(--text-muted)'
        },
        checkButton: {
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
        },
        checkButtonCompleted: {
            color: '#4ade80'
        },
        deleteButton: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
        }
    };

    return (
        <div className="glass-panel" style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Your Tasks</h2>
            </div>

            <form onSubmit={addTask} style={styles.form}>
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    style={styles.input}
                />
                <button type="submit" className="glass-button" style={styles.addButton}>
                    <Plus size={24} />
                </button>
            </form>

            <div style={styles.taskList}>
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="task-item"
                        style={{
                            ...styles.task,
                            ...(task.completed ? styles.taskCompleted : {})
                        }}
                    >
                        <button
                            onClick={() => toggleTask(task.id)}
                            style={{
                                ...styles.checkButton,
                                ...(task.completed ? styles.checkButtonCompleted : {})
                            }}
                        >
                            {task.completed ? <Check size={24} /> : <Circle size={24} />}
                        </button>

                        <span style={{
                            ...styles.taskText,
                            ...(task.completed ? styles.taskTextCompleted : {})
                        }}>
                            {task.text}
                        </span>

                        <button
                            onClick={() => deleteTask(task.id)}
                            style={styles.deleteButton}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tasks;
