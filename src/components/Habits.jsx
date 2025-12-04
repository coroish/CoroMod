import React, { useState } from 'react';
import { Zap, Check, X } from 'lucide-react';

const Habits = () => {
    const [habits, setHabits] = useState([
        { id: 1, name: 'Morning Meditation', streak: 7, completedToday: true, icon: '🧘' },
        { id: 2, name: 'Drink 8 Glasses of Water', streak: 5, completedToday: false, icon: '💧' },
        { id: 3, name: 'Exercise 30 Minutes', streak: 3, completedToday: false, icon: '💪' },
        { id: 4, name: 'Read for 20 Minutes', streak: 12, completedToday: true, icon: '📚' },
        { id: 5, name: 'No Social Media After 9PM', streak: 4, completedToday: false, icon: '📵' }
    ]);

    const toggleHabit = (id) => {
        setHabits(habits.map(h => {
            if (h.id === id) {
                const newCompleted = !h.completedToday;
                return {
                    ...h,
                    completedToday: newCompleted,
                    streak: newCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
                };
            }
            return h;
        }));
    };

    const containerStyle = {
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const habitCardStyle = (completed) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        background: completed ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${completed ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: '16px',
        marginBottom: '12px',
        transition: 'all 0.3s ease'
    });

    const streakBadgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'white'
    };

    const checkButtonStyle = (completed) => ({
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        border: 'none',
        background: completed ? 'linear-gradient(135deg, #34d399, #10b981)' : 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: completed ? '0 4px 15px rgba(52, 211, 153, 0.4)' : 'none'
    });

    return (
        <div className="glass-panel" style={containerStyle}>
            <h2 style={titleStyle}>
                <Zap size={32} color="var(--primary)" />
                Habit Tracker
            </h2>

            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Track your daily habits and build streaks
                    </p>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                            {habits.filter(h => h.completedToday).length}/{habits.length}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completed Today</div>
                    </div>
                </div>
            </div>

            <div>
                {habits.map(habit => (
                    <div
                        key={habit.id}
                        style={habitCardStyle(habit.completedToday)}
                        onMouseEnter={(e) => {
                            if (!habit.completedToday) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!habit.completedToday) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                            <div style={{ fontSize: '2rem' }}>{habit.icon}</div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white', marginBottom: '6px' }}>
                                    {habit.name}
                                </h3>
                                <div style={streakBadgeStyle}>
                                    🔥 {habit.streak} day streak
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleHabit(habit.id)}
                            style={checkButtonStyle(habit.completedToday)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            {habit.completedToday ? <Check size={24} strokeWidth={3} /> : <X size={24} />}
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '16px', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'white' }}>💡 Tip:</strong> Building habits takes consistency. Try to maintain your streaks by completing your habits every day!
                </p>
            </div>
        </div>
    );
};

export default Habits;
