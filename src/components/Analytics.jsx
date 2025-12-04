import React, { useState } from 'react';
import { BarChart3, TrendingUp, Clock, CheckSquare } from 'lucide-react';

const Analytics = () => {
    // Sample data - in a real app this would come from actual usage
    const weekData = [
        { day: 'Mon', sessions: 6, tasks: 8 },
        { day: 'Tue', sessions: 8, tasks: 12 },
        { day: 'Wed', sessions: 5, tasks: 6 },
        { day: 'Thu', sessions: 9, tasks: 10 },
        { day: 'Fri', sessions: 7, tasks: 9 },
        { day: 'Sat', sessions: 4, tasks: 5 },
        { day: 'Sun', sessions: 3, tasks: 4 }
    ];

    const stats = {
        totalFocusTime: 1250, // minutes
        totalTasks: 54,
        currentStreak: 7,
        longestStreak: 12
    };

    const maxSessions = Math.max(...weekData.map(d => d.sessions));
    const maxTasks = Math.max(...weekData.map(d => d.tasks));

    const containerStyle = {
        padding: '40px',
        maxWidth: '1000px',
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

    const statCardStyle = {
        padding: '24px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        textAlign: 'center',
        transition: 'all 0.3s ease'
    };

    const chartContainerStyle = {
        padding: '30px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        marginBottom: '24px'
    };

    const barStyle = (height, color) => ({
        height: `${height}px`,
        background: `linear-gradient(to top, ${color}, ${color}dd)`,
        borderRadius: '6px 6px 0 0',
        transition: 'all 0.3s ease',
        minHeight: '4px'
    });

    return (
        <div className="glass-panel" style={containerStyle}>
            <h2 style={titleStyle}>
                <BarChart3 size={32} color="var(--primary)" />
                Analytics Dashboard
            </h2>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                <div
                    style={statCardStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <Clock size={32} color="var(--primary)" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '6px' }}>
                        {Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Focus Time</div>
                </div>

                <div
                    style={statCardStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <CheckSquare size={32} color="#34d399" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '6px' }}>
                        {stats.totalTasks}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tasks Completed</div>
                </div>

                <div
                    style={statCardStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <TrendingUp size={32} color="#f59e0b" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '6px' }}>
                        {stats.currentStreak} 🔥
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Current Streak</div>
                </div>

                <div
                    style={statCardStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏆</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '6px' }}>
                        {stats.longestStreak}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Longest Streak</div>
                </div>
            </div>

            {/* Weekly Focus Sessions Chart */}
            <div style={chartContainerStyle}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '24px' }}>
                    Weekly Focus Sessions
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', gap: '12px' }}>
                    {weekData.map((data, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
                                {data.sessions}
                            </div>
                            <div
                                style={barStyle((data.sessions / maxSessions) * 160, 'var(--primary)')}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scaleY(1.05)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(167, 139, 250, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scaleY(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {data.day}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Tasks Chart */}
            <div style={chartContainerStyle}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '24px' }}>
                    Weekly Tasks Completed
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', gap: '12px' }}>
                    {weekData.map((data, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
                                {data.tasks}
                            </div>
                            <div
                                style={barStyle((data.tasks / maxTasks) * 160, '#34d399')}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scaleY(1.05)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(52, 211, 153, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scaleY(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {data.day}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
