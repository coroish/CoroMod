import React, { useState, useEffect } from 'react';
import { Wind } from 'lucide-react';

const Breathe = () => {
    const [isBreathing, setIsBreathing] = useState(false);
    const [phase, setPhase] = useState('inhale'); // 'inhale', 'hold', 'exhale'
    const [count, setCount] = useState(4);

    useEffect(() => {
        if (!isBreathing) return;

        const interval = setInterval(() => {
            setCount(prev => {
                if (prev <= 1) {
                    // Move to next phase
                    if (phase === 'inhale') {
                        setPhase('hold');
                        return 4;
                    } else if (phase === 'hold') {
                        setPhase('exhale');
                        return 4;
                    } else {
                        setPhase('inhale');
                        return 4;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isBreathing, phase]);

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return 'Breathe In';
            case 'hold': return 'Hold';
            case 'exhale': return 'Breathe Out';
            default: return '';
        }
    };

    const getCircleSize = () => {
        switch (phase) {
            case 'inhale': return 250;
            case 'hold': return 250;
            case 'exhale': return 150;
            default: return 150;
        }
    };

    const containerStyle = {
        padding: '60px 40px',
        maxWidth: '700px',
        margin: '0 auto',
        textAlign: 'center'
    };

    const circleContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        marginBottom: '40px'
    };

    const breatheCircleStyle = {
        width: `${getCircleSize()}px`,
        height: `${getCircleSize()}px`,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.3), rgba(244, 114, 182, 0.3))',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 0 60px ${phase === 'inhale' ? 'rgba(167, 139, 250, 0.5)' : 'rgba(244, 114, 182, 0.5)'}`
    };

    const phaseTextStyle = {
        fontSize: '2rem',
        fontWeight: 600,
        color: 'white',
        marginBottom: '12px'
    };

    const countTextStyle = {
        fontSize: '4rem',
        fontWeight: 800,
        color: 'white'
    };

    return (
        <div className="glass-panel" style={containerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
                <Wind size={32} color="var(--primary)" />
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                    Breathing Exercise
                </h2>
            </div>

            <div style={circleContainerStyle}>
                {isBreathing ? (
                    <div style={breatheCircleStyle}>
                        <p style={phaseTextStyle}>{getPhaseText()}</p>
                        <p style={countTextStyle}>{count}</p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🧘</div>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '30px' }}>
                            Take a moment to breathe and relax
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={() => {
                    setIsBreathing(!isBreathing);
                    if (!isBreathing) {
                        setPhase('inhale');
                        setCount(4);
                    }
                }}
                className="glass-button"
                style={{ fontSize: '1.1rem', padding: '16px 40px' }}
            >
                {isBreathing ? 'Stop' : 'Start Breathing Exercise'}
            </button>

            {!isBreathing && (
                <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'white' }}>How it works:</strong><br />
                        Follow the circle as it expands and contracts. Breathe in for 4 seconds, hold for 4 seconds, and breathe out for 4 seconds. Repeat for a few minutes to reduce stress and improve focus.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Breathe;
