import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw } from 'lucide-react';

const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }
];

const Motivation = () => {
    const [currentQuote, setCurrentQuote] = useState(quotes[0]);

    useEffect(() => {
        // Set a random quote on mount
        setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    const getNewQuote = () => {
        let newQuote;
        do {
            newQuote = quotes[Math.floor(Math.random() * quotes.length)];
        } while (newQuote === currentQuote && quotes.length > 1);
        setCurrentQuote(newQuote);
    };

    const containerStyle = {
        padding: '60px 40px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
    };

    const quoteBoxStyle = {
        background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(244, 114, 182, 0.1))',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '50px 40px',
        marginBottom: '30px',
        position: 'relative',
        overflow: 'hidden'
    };

    const quoteIconStyle = {
        fontSize: '4rem',
        color: 'var(--primary)',
        opacity: 0.2,
        marginBottom: '20px'
    };

    const quoteTextStyle = {
        fontSize: '2rem',
        fontWeight: 600,
        color: 'white',
        lineHeight: 1.5,
        marginBottom: '24px',
        fontStyle: 'italic'
    };

    const authorStyle = {
        fontSize: '1.2rem',
        color: 'var(--text-muted)',
        fontWeight: 500
    };

    return (
        <div className="glass-panel" style={containerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
                <Quote size={32} color="var(--primary)" />
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                    Daily Motivation
                </h2>
            </div>

            <div style={quoteBoxStyle}>
                <div style={quoteIconStyle}>"</div>
                <p style={quoteTextStyle}>{currentQuote.text}</p>
                <p style={authorStyle}>— {currentQuote.author}</p>
            </div>

            <button
                onClick={getNewQuote}
                className="glass-button"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
                <RefreshCw size={20} />
                New Quote
            </button>
        </div>
    );
};

export default Motivation;
