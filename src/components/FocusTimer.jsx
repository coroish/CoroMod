import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import './FocusTimer.css';

const FocusTimer = () => {
    const [mode, setMode] = useState('focus'); // 'focus' | 'break'
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    // Reset timer when mode changes
    useEffect(() => {
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
        setIsActive(false);
    }, [mode]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((timeLeft) => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play notification sound here in the future
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="glass-panel focus-timer-container">
            <div className="glow-effect" style={{ background: mode === 'focus' ? 'var(--primary)' : 'var(--secondary)' }}></div>

            <div className="timer-content">
                {/* Mode Switcher */}
                <div className="mode-switcher">
                    <button
                        className={`mode-btn ${mode === 'focus' ? 'active' : ''}`}
                        onClick={() => setMode('focus')}
                    >
                        <Brain size={16} /> Focus
                    </button>
                    <button
                        className={`mode-btn ${mode === 'break' ? 'active' : ''}`}
                        onClick={() => setMode('break')}
                    >
                        <Coffee size={16} /> Break
                    </button>
                </div>

                <div className="timer-display">
                    {formatTime(timeLeft)}
                </div>

                <div className="timer-controls">
                    <button
                        onClick={toggleTimer}
                        className="glass-button main-action-btn"
                    >
                        {isActive ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                        {isActive ? 'Pause' : 'Start'}
                    </button>

                    <button
                        onClick={resetTimer}
                        className="icon-btn reset-btn"
                        title="Reset Timer"
                    >
                        <RotateCcw size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FocusTimer;
