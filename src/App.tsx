import React, { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import Dock from './components/Dock';
import Window from './components/Window';
import IPod from './components/IPod';
import MenuBar from './components/MenuBar';
import { YouTubePlaylistService } from './services/youtubePlaylistService';
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
  videoId?: string;
}

function App() {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [backgroundVideo, setBackgroundVideo] = useState('/brand_assets/PodcastVideo.mp4');
  const [youtubePlaylist, setYoutubePlaylist] = useState<Track[]>([]);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);
  const [activeApp, setActiveApp] = useState('Finder');
  const [showAbout, setShowAbout] = useState(false);
  
  // Your YouTube playlist URL
  const playlistUrl = 'https://www.youtube.com/playlist?list=PLxbvPE06_NH8YemvEqC9_5IXnydp9s2v7';

  // Load playlist data on component mount (only once)
  useEffect(() => {
    const loadPlaylist = async () => {
      setIsLoadingPlaylist(true);
      try {
        const playlistData = await YouTubePlaylistService.fetchPlaylistData(playlistUrl);
        setYoutubePlaylist(playlistData);
        console.log('Loaded playlist:', playlistData);
      } catch (error) {
        console.error('Failed to load playlist:', error);
        // Use fallback data - this should not happen since we're using static data
        const fallbackData = [
          { name: "DISTANT - The Undying", artist: "Century Media Records", duration: "5:08", id: "1", videoId: "_8mRmkERONI" },
          { name: "dying in designer - LimeWire", artist: "dying in designer", duration: "2:21", id: "2", videoId: "biQt4ApSz80" },
          { name: "Bloom - Withered", artist: "Pure Noise Records", duration: "3:47", id: "3", videoId: "hf2DK1Ic1qA" }
        ];
        setYoutubePlaylist(fallbackData);
      } finally {
        setIsLoadingPlaylist(false);
      }
    };

    loadPlaylist();
  }, []); // Empty dependency array - only run once on mount

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
          content: isLoadingPlaylist ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              color: '#fff' 
            }}>
              Loading playlist...
            </div>
          ) : (
            <IPod playlist={youtubePlaylist} />
          ),
          position: { x: 200, y: 80 },
          size: { width: 300, height: 450 },
          isMinimized: false,
        });
      }
    } else if (buttonNumber === 3) {
      // OSRS Noob website - open in app window
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
            <div className="website-embed">
              <iframe
                src="https://osrsnoob.vercel.app/"
                title="OSRS Noob Website"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          ),
          position: { x: 120, y: 60 },
          size: { width: 800, height: 600 },
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

  // Update active app based on windows
  useEffect(() => {
    const hasIPod = windows.some(w => w.title === 'Classic iPod');
    const hasYouTube = windows.some(w => w.title === 'Maidenless Behavior Playlist');
    
    if (hasIPod) {
      setActiveApp('Classic iPod');
    } else if (hasYouTube) {
      setActiveApp('Maidenless Behavior');
    } else if (windows.length > 0) {
      setActiveApp(windows[windows.length - 1].title);
    } else {
      setActiveApp('Finder');
    }
  }, [windows]);

  // Handle menu bar actions
  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'about':
        setShowAbout(true);
        break;
      case 'new-window':
        // Open a new placeholder window
        togglePlaceholderWindow(4);
        break;
      case 'close-window':
        if (windows.length > 0) {
          closeWindow(windows[windows.length - 1].id);
        }
        break;
      case 'minimize':
        if (windows.length > 0) {
          const lastWindow = windows[windows.length - 1];
          updateWindow(lastWindow.id, { isMinimized: true });
        }
        break;
      case 'focus-ipod':
        const ipodWindow = windows.find(w => w.title === 'Classic iPod');
        if (ipodWindow) {
          updateWindow(ipodWindow.id, { isMinimized: false });
        } else {
          togglePlaceholderWindow(2);
        }
        break;
      case 'focus-youtube':
        const youtubeWindow = windows.find(w => w.title === 'Maidenless Behavior Playlist');
        if (youtubeWindow) {
          updateWindow(youtubeWindow.id, { isMinimized: false });
        } else {
          toggleYouTubePlaylist();
        }
        break;
      case 'bring-all-front':
        // Unminimize all windows
        windows.forEach(window => {
          if (window.isMinimized) {
            updateWindow(window.id, { isMinimized: false });
          }
        });
        break;
      default:
        console.log('Menu action:', action);
    }
  };

  // About dialog component
  const AboutDialog = () => showAbout ? (
    <div 
      className="about-overlay"
      onClick={() => setShowAbout(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      <div 
        className="about-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          minWidth: '300px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎵</div>
        <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>Maidenless Behavior</h2>
        <p style={{ margin: '0 0 16px 0', color: '#666' }}>
          A dynamic podcast landing page showcasing AI technology through interactive design.
        </p>
        <p style={{ margin: '0 0 24px 0', color: '#999', fontSize: '14px' }}>
          Built with React, TypeScript, and modern web technologies.
        </p>
        <button 
          onClick={() => setShowAbout(false)}
          style={{
            background: '#007AFF',
            color: 'white',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          OK
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="app">
      <MenuBar 
        activeApp={activeApp}
        onMenuAction={handleMenuAction}
      />
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
      <Dock 
        onYouTubeClick={toggleYouTubePlaylist}
        onPlaceholderClick={togglePlaceholderWindow}
        openWindows={windows.map(w => w.title)}
      />
      <AboutDialog />
    </div>
  );
}

export default App
