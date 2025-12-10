import React, { useState } from 'react';
import { Clock, Coffee, Bell, Monitor } from 'lucide-react';

const Settings = () => {
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [notifications, setNotifications] = useState(true);

    const containerStyle = {
        padding: '40px',
        maxWidth: '700px',
        margin: '0 auto'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: 'white'
    };

    const settingItemStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '12px',
        transition: 'all 0.3s ease'
    };

    const iconWrapperStyle = {
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        color: 'var(--text-muted)',
        display: 'flex'
    };

    const toggleStyle = (isOn) => ({
        width: '48px',
        height: '24px',
        borderRadius: '12px',
        background: isOn ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
        position: 'relative',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.3s ease'
    });

    const toggleKnobStyle = (isOn) => ({
        position: 'absolute',
        top: '4px',
        left: isOn ? '26px' : '4px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: 'white',
        transition: 'all 0.3s ease'
    });

    return (
        <div className="glass-panel" style={containerStyle}>
            <h2 style={titleStyle}>Settings</h2>

            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    Timer Preferences
                </h3>

                <div
                    style={settingItemStyle}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={iconWrapperStyle}>
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 500, color: 'white', marginBottom: '4px' }}>Focus Duration</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Minutes per session</p>
                        </div>
                    </div>
                    <select
                        value={focusDuration}
                        onChange={(e) => setFocusDuration(Number(e.target.value))}
                    >
                        <option value={15}>15 min</option>
                        <option value={25}>25 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                    </select>
                </div>

                <div
                    style={settingItemStyle}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={iconWrapperStyle}>
                            <Coffee size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 500, color: 'white', marginBottom: '4px' }}>Break Duration</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Minutes per break</p>
                        </div>
                    </div>
                    <select
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(Number(e.target.value))}
                    >
                        <option value={5}>5 min</option>
                        <option value={10}>10 min</option>
                        <option value={15}>15 min</option>
                    </select>
                </div>
            </div>

            <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    App Preferences
                </h3>

                <div
                    style={settingItemStyle}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={iconWrapperStyle}>
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 500, color: 'white', marginBottom: '4px' }}>Notifications</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Play sound when timer ends</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setNotifications(!notifications)}
                        style={toggleStyle(notifications)}
                    >
                        <div style={toggleKnobStyle(notifications)} />
                    </button>
                </div>

                <div
                    style={settingItemStyle}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={iconWrapperStyle}>
                            <Monitor size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 500, color: 'white', marginBottom: '4px' }}>Dark Mode</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Always on for ZenFlow</p>
                        </div>
                    </div>
                    <button
                        disabled
                        style={{ ...toggleStyle(true), opacity: 0.5, cursor: 'not-allowed' }}
                    >
                        <div style={toggleKnobStyle(true)} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
