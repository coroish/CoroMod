import React, { useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

const Notes = () => {
    const [notes, setNotes] = useState([
        { id: 1, title: 'Project Ideas', content: 'Build a productivity app with focus timer and ambient sounds...', date: '2025-12-01' },
        { id: 2, title: 'Meeting Notes', content: 'Discussed new features for Q1. Focus on user experience improvements...', date: '2025-11-30' }
    ]);
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [isAdding, setIsAdding] = useState(false);

    const addNote = () => {
        if (!newNote.title.trim() || !newNote.content.trim()) return;

        setNotes([
            {
                id: Date.now(),
                title: newNote.title,
                content: newNote.content,
                date: new Date().toISOString().split('T')[0]
            },
            ...notes
        ]);
        setNewNote({ title: '', content: '' });
        setIsAdding(false);
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    const containerStyle = {
        padding: '40px',
        maxWidth: '900px',
        margin: '0 auto'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    };

    const noteCardStyle = {
        padding: '24px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        marginBottom: '16px',
        transition: 'all 0.3s ease',
        position: 'relative'
    };

    const addFormStyle = {
        padding: '24px',
        background: 'rgba(167, 139, 250, 0.1)',
        border: '1px solid rgba(167, 139, 250, 0.3)',
        borderRadius: '16px',
        marginBottom: '24px'
    };

    return (
        <div className="glass-panel" style={containerStyle}>
            <div style={titleStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BookOpen size={32} color="var(--primary)" />
                    <h2 style={{ margin: 0 }}>Quick Notes</h2>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="glass-button"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Plus size={20} />
                        New Note
                    </button>
                )}
            </div>

            {isAdding && (
                <div style={addFormStyle}>
                    <input
                        type="text"
                        placeholder="Note Title..."
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        style={{ marginBottom: '12px', fontSize: '1.1rem', fontWeight: 600 }}
                    />
                    <textarea
                        placeholder="Write your thoughts here..."
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        rows={6}
                        style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '14px',
                            color: 'white',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            marginBottom: '12px'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={addNote} className="glass-button">
                            Save Note
                        </button>
                        <button
                            onClick={() => {
                                setIsAdding(false);
                                setNewNote({ title: '', content: '' });
                            }}
                            className="icon-btn"
                            style={{ padding: '12px 24px' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div>
                {notes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📝</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            No notes yet. Click "New Note" to get started!
                        </p>
                    </div>
                ) : (
                    notes.map(note => (
                        <div
                            key={note.id}
                            style={noteCardStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'white', marginBottom: '6px' }}>
                                        {note.title}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(note.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        color: '#f87171',
                                        display: 'flex',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontSize: '1rem' }}>
                                {note.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notes;
