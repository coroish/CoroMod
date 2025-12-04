import React, { useState } from 'react';
import { Music, Play, Pause, SkipForward, ExternalLink } from 'lucide-react';

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    const playlists = [
        { name: "Deep Focus", platform: "Spotify", url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ", color: "#1DB954" },
        { name: "Peaceful Piano", platform: "Spotify", url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO", color: "#1DB954" },
        { name: "Lofi Girl", platform: "YouTube", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", color: "#FF0000" },
        { name: "Ambient Study", platform: "YouTube", url: "https://www.youtube.com/watch?v=5qap5aO4i9A", color: "#FF0000" }
    ];

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

    const playerCardStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '30px'
    };

    const playlistLinkStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s ease'
    };

    return (
        <div className="glass-panel" style={containerStyle}>
            <h2 style={titleStyle}>
                <Music size={32} color="var(--primary)" />
                Music Player
            </h2>

            {/* Now Playing */}
            <div style={playerCardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem'
                    }}>
                        ♫
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white', marginBottom: '4px' }}>
                            Lo-Fi Beats to Study To
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>Chillhop Music</p>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
                    <button className="icon-btn">
                        <SkipForward size={20} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="glass-button"
                        style={{ padding: '16px', borderRadius: '50%' }}
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                    </button>
                    <button className="icon-btn">
                        <SkipForward size={20} />
                    </button>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>2:34</span>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '45%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>5:12</span>
                </div>
            </div>

            {/* Playlists */}
            <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                    Quick Access
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                    {playlists.map((playlist, idx) => (
                        <a
                            key={idx}
                            href={playlist.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={playlistLinkStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    padding: '8px',
                                    borderRadius: '8px',
                                    background: `${playlist.color}20`,
                                    color: playlist.color,
                                    display: 'flex'
                                }}>
                                    <Music size={18} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 500, color: 'white', marginBottom: '2px' }}>{playlist.name}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{playlist.platform}</p>
                                </div>
                            </div>
                            <ExternalLink size={16} color="var(--text-muted)" />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;
