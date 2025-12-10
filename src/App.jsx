import React, { useState } from 'react';
import { Timer, CheckCircle, Music, Settings, Target, Headphones, Quote, Wind, Zap, BookOpen, BarChart3 } from 'lucide-react';
import FocusTimer from './components/FocusTimer';
import Tasks from './components/Tasks';
import Sounds from './components/Sounds';
import SettingsPage from './components/Settings';
import DailyGoals from './components/DailyGoals';
import MusicPlayer from './components/MusicPlayer';
import Motivation from './components/Motivation';
import Breathe from './components/Breathe';
import Habits from './components/Habits';
import Notes from './components/Notes';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('timer');

  const renderContent = () => {
    switch (activeTab) {
      case 'timer':
        return <FocusTimer />;
      case 'tasks':
        return <Tasks />;
      case 'sounds':
        return <Sounds />;
      case 'goals':
        return <DailyGoals />;
      case 'music':
        return <MusicPlayer />;
      case 'motivation':
        return <Motivation />;
      case 'breathe':
        return <Breathe />;
      case 'habits':
        return <Habits />;
      case 'notes':
        return <Notes />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <FocusTimer />;
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <header className="header-section">
          <h1 className="app-title">ZenFlow</h1>
          <p className="greeting">Focus on what matters.</p>
        </header>

        <div className="view-container">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Dock Navigation */}
      <nav className="bottom-dock">
        <div
          className={`dock-item ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
          title="Focus Timer"
        >
          <Timer size={22} />
        </div>
        <div
          className={`dock-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
          title="Tasks"
        >
          <CheckCircle size={22} />
        </div>
        <div
          className={`dock-item ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
          title="Habits"
        >
          <Zap size={22} />
        </div>
        <div
          className={`dock-item ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
          title="Notes"
        >
          <BookOpen size={22} />
        </div>
        <div
          className={`dock-item ${activeTab === 'sounds' ? 'active' : ''}`}
          onClick={() => setActiveTab('sounds')}
          title="Sounds"
        >
          <Music size={22} />
        </div>
        <div
          className={`dock-item ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
          title="Daily Goals"
        >
          <Target size={22} />
        </div>
        <div
          className={`dock-item ${activeTab === 'music' ? 'active' : ''}`}
          onClick={() => setActiveTab('music')}
          title="Music Player"
        >
          <Headphones size={22} />
        </div>
        <div
          className={`dock-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
          title="Analytics"
        >
          <BarChart3 size={22} />
        </div>
        <div
          className={`dock-item ${activeTab === 'motivation' ? 'active' : ''}`}
          onClick={() => setActiveTab('motivation')}
          title="Motivation"
        >
          <Quote size={22} />
        </div>
        <div
          className={`dock-item ${activeTab === 'breathe' ? 'active' : ''}`}
          onClick={() => setActiveTab('breathe')}
          title="Breathe"
        >
          <Wind size={22} />
        </div>
        <div
          className={`dock-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          title="Settings"
        >
          <Settings size={22} />
        </div>
      </nav>
    </div>
  );
}

export default App;
