import React, { useState } from 'react';
import { Target } from 'lucide-react';

const DailyGoals = () => {
    const [focusSessions, setFocusSessions] = useState(3);
    const [tasksCompleted, setTasksCompleted] = useState(2);
    const dailyGoal = 8;
    const taskGoal = 5;

    const focusProgress = Math.min((focusSessions / dailyGoal) * 100, 100);
    const taskProgress = Math.min((tasksCompleted / taskGoal) * 100, 100);

    const containerStyle = {
        padding: '40px',
        maxWidth: '700px',
        margin: '0 auto'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '40px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const goalItemStyle = {
        marginBottom: '30px'
    };

    const goalHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
    };

    const progressBarStyle = {
        height: '12px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        overflow: 'hidden'
    };

    const progressFillStyle = (progress, color) => ({
        height: '100%',
        width: `${progress}%`,
        background: color,
        borderRadius: '6px',
        transition: 'width 0.5s ease'
    });

    return (
        <div className="glass-panel" style={containerStyle}>
            <h2 style={titleStyle}>
                <Target size={32} color="var(--primary)" />
                Daily Goals
            </h2>

            <div style={goalItemStyle}>
                <div style={goalHeaderStyle}>
                    <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
                            Focus Sessions
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Complete {dailyGoal} sessions today
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
                            {focusSessions}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>
                            /{dailyGoal}
                        </span>
                    </div>
                </div>
                <div style={progressBarStyle}>
                    <div style={progressFillStyle(focusProgress, 'linear-gradient(90deg, var(--primary), var(--secondary))')} />
                </div>
            </div>

            <div style={goalItemStyle}>
                <div style={goalHeaderStyle}>
                    <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
                            Tasks Completed
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Complete {taskGoal} tasks today
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
                            {tasksCompleted}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>
                            /{taskGoal}
                        </span>
                    </div>
                </div>
                <div style={progressBarStyle}>
                    <div style={progressFillStyle(taskProgress, 'linear-gradient(90deg, #4ade80, #34d399)')} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                    onClick={() => setFocusSessions(prev => Math.min(prev + 1, dailyGoal))}
                    className="glass-button"
                    style={{ flex: 1 }}
                >
                    + Focus Session
                </button>
                <button
                    onClick={() => setTasksCompleted(prev => Math.min(prev + 1, taskGoal))}
                    className="glass-button"
                    style={{ flex: 1 }}
                >
                    + Task
                </button>
            </div>
        </div>
    );
};

export default DailyGoals;
