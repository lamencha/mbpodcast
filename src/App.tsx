import React, { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import Sidebar from './components/Sidebar';
import Window from './components/Window';
import IPod from './components/IPod';
import SpotifyAPI from './services/spotifyApi';
import './App.css';

interface WindowData {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
}

interface Track {
  name: string;
  artist: string;
  duration: string;
  id: string;
}

function App() {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [backgroundVideo, setBackgroundVideo] = useState('/brand_assets/PodcastVideo4k.mp4');
  const [spotifyPlaylist, setSpotifyPlaylist] = useState<Track[]>([]);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);

  const spotifyApi = new SpotifyAPI();
  const playlistUrl = 'https://open.spotify.com/playlist/0Xcz3hthquSf6HBXOYaGYg?si=Tm5cEcZ0SCSsFF-kUFDQaQ&pi=DL1meuZxR8-J8&nd=1&dlsi=0ea8f883c7b64594';

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setIsLoadingPlaylist(true);
        const playlistId = SpotifyAPI.extractPlaylistId(playlistUrl);
        if (playlistId) {
          const tracks = await spotifyApi.getPlaylist(playlistId);
          setSpotifyPlaylist(tracks);
        } else {
          // Fallback if playlist ID extraction fails
          setSpotifyPlaylist([
            { name: "Anti-Hero", artist: "Taylor Swift", duration: "3:20", id: "1" },
            { name: "As It Was", artist: "Harry Styles", duration: "2:47", id: "2" },
            { name: "Heat Waves", artist: "Glass Animals", duration: "3:58", id: "3" },
            { name: "Stay", artist: "The Kid LAROI, Justin Bieber", duration: "2:21", id: "4" },
            { name: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58", id: "5" }
          ]);
        }
      } catch (error) {
        console.error('Failed to load Spotify playlist:', error);
        // Use fallback playlist on error
        setSpotifyPlaylist([
          { name: "Anti-Hero", artist: "Taylor Swift", duration: "3:20", id: "1" },
          { name: "As It Was", artist: "Harry Styles", duration: "2:47", id: "2" },
          { name: "Heat Waves", artist: "Glass Animals", duration: "3:58", id: "3" },
          { name: "Stay", artist: "The Kid LAROI, Justin Bieber", duration: "2:21", id: "4" },
          { name: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58", id: "5" }
        ]);
      } finally {
        setIsLoadingPlaylist(false);
      }
    };

    loadPlaylist();
  }, []);

  const openWindow = (window: Omit<WindowData, 'id'>) => {
    const newWindow: WindowData = {
      ...window,
      id: `window-${Date.now()}-${Math.random()}`,
    };
    setWindows(prev => [...prev, newWindow]);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const updateWindow = (id: string, updates: Partial<WindowData>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const toggleYouTubePlaylist = () => {
    const existingWindow = windows.find(w => w.title === 'Maidenless Behavior Playlist');
    
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        updateWindow(existingWindow.id, { isMinimized: false });
      } else {
        updateWindow(existingWindow.id, { isMinimized: true });
      }
    } else {
      openWindow({
        title: 'Maidenless Behavior Playlist',
        content: (
          <div className="youtube-embed">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/videoseries?list=PLxbvPE06_NH_5guGNKNW4Y_t5HQn348oi"
              title="Maidenless Behavior Playlist"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ),
        position: { x: 100, y: 100 },
        size: { width: 640, height: 400 },
        isMinimized: false,
      });
    }
  };

  const togglePlaceholderWindow = (buttonNumber: number) => {
    if (buttonNumber === 2) {
      // iPod for button 2
      const windowTitle = "Classic iPod";
      const existingWindow = windows.find(w => w.title === windowTitle);
      
      if (existingWindow) {
        if (existingWindow.isMinimized) {
          updateWindow(existingWindow.id, { isMinimized: false });
        } else {
          updateWindow(existingWindow.id, { isMinimized: true });
        }
      } else {
        openWindow({
          title: windowTitle,
          content: <IPod playlist={spotifyPlaylist} />,
          position: { x: 200, y: 80 },
          size: { width: 300, height: 450 },
          isMinimized: false,
        });
      }
    } else if (buttonNumber === 3) {
      // OSRS Noob themed window
      const windowTitle = "OSRS Noob";
      const existingWindow = windows.find(w => w.title === windowTitle);
      
      if (existingWindow) {
        if (existingWindow.isMinimized) {
          updateWindow(existingWindow.id, { isMinimized: false });
        } else {
          updateWindow(existingWindow.id, { isMinimized: true });
        }
      } else {
        openWindow({
          title: windowTitle,
          content: (
            <div className="osrs-window">
              <div className="osrs-header">
                <h2>🏰 Old School RuneScape Tools</h2>
                <p>Your ultimate OSRS companion</p>
              </div>
              <div className="osrs-content">
                <div className="osrs-features">
                  <div className="feature-card">
                    <span className="feature-icon">📊</span>
                    <h3>XP Calculators</h3>
                    <p>Track your skill progression</p>
                  </div>
                  <div className="feature-card">
                    <span className="feature-icon">💰</span>
                    <h3>GP Trackers</h3>
                    <p>Monitor your wealth</p>
                  </div>
                  <div className="feature-card">
                    <span className="feature-icon">🗺️</span>
                    <h3>Quest Guides</h3>
                    <p>Complete every quest</p>
                  </div>
                  <div className="feature-card">
                    <span className="feature-icon">⚔️</span>
                    <h3>Combat Tools</h3>
                    <p>Optimize your battles</p>
                  </div>
                </div>
                <button 
                  className="osrs-launch-btn"
                  onClick={() => window.open('https://osrsnoob.vercel.app/', '_blank', 'noopener,noreferrer')}
                >
                  🚀 Launch OSRS Noob Tools
                </button>
              </div>
            </div>
          ),
          position: { x: 150, y: 50 },
          size: { width: 500, height: 400 },
          isMinimized: false,
        });
      }
    } else {
      // Other placeholder windows
      const windowTitle = `App ${buttonNumber}`;
      const existingWindow = windows.find(w => w.title === windowTitle);
      
      if (existingWindow) {
        if (existingWindow.isMinimized) {
          updateWindow(existingWindow.id, { isMinimized: false });
        } else {
          updateWindow(existingWindow.id, { isMinimized: true });
        }
      } else {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
        openWindow({
          title: windowTitle,
          content: (
            <div 
              className="placeholder-content"
              style={{ 
                backgroundColor: colors[buttonNumber - 2],
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              Add button {buttonNumber} functionality later
            </div>
          ),
          position: { x: 150 + buttonNumber * 50, y: 150 + buttonNumber * 30 },
          size: { width: 400, height: 300 },
          isMinimized: false,
        });
      }
    }
  };

  return (
    <div className="app">
      <Desktop backgroundVideo={backgroundVideo} onBackgroundChange={setBackgroundVideo}>
        {windows.map(window => (
          <Window
            key={window.id}
            {...window}
            onClose={() => closeWindow(window.id)}
            onUpdate={(updates) => updateWindow(window.id, updates)}
          />
        ))}
      </Desktop>
      <Sidebar 
        onYouTubeClick={toggleYouTubePlaylist}
        onPlaceholderClick={togglePlaceholderWindow}
      />
    </div>
  );
}

export default App
