import React, { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import Dock from './components/Dock';
import Window from './components/Window';
import IPod from './components/IPod';
import MenuBar from './components/MenuBar';
import ParticleField from './components/ParticleField';
import FluidEffect from './components/FluidEffect';
import TrackingOverlay from './components/TrackingOverlay';
import SystemMonitor from './components/SystemMonitor';
import EnvironmentalMonitor from './components/EnvironmentalMonitor';
import ReplicantDatabase from './components/ReplicantDatabase';
import { YouTubePlaylistService } from './services/youtubePlaylistService';
import './App.css';

interface WindowData {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  zIndex: number;
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
  const [youtubePlaylist, setYoutubePlaylist] = useState<Track[]>([]);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);
  const [activeApp, setActiveApp] = useState('Finder');
  const [showAbout, setShowAbout] = useState(false);
  const [highestZIndex, setHighestZIndex] = useState(1000);
  
  // Your YouTube playlist URL
  const playlistUrl = 'https://www.youtube.com/playlist?list=PLxbvPE06_NH8YemvEqC9_5IXnydp9s2v7';

  // Generate varied window positions
  const generateWindowPosition = (index: number) => {
    // Generate positions closer to top with variation
    const maxX = 600;
    const maxY = 180;  // Much closer to top
    const minX = 80;
    const minY = 50;   // Start closer to top, below menu bar
    
    // Create varied positions near the top
    const x = Math.floor(Math.random() * (maxX - minX)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY)) + minY;
    
    console.log(`Generating window position ${index}:`, { x, y });
    return { x, y };
  };

  // Bring window to front
  const bringWindowToFront = (windowId: string) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    updateWindow(windowId, { zIndex: newZIndex });
  };

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

  const openWindow = (window: Omit<WindowData, 'id' | 'zIndex' | 'position'> & { position?: { x: number; y: number } }) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    
    // Use provided position or generate a varied one
    const position = window.position || generateWindowPosition(windows.length);
    
    const newWindow: WindowData = {
      ...window,
      position,
      id: `window-${Date.now()}-${Math.random()}`,
      zIndex: newZIndex,
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
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ),
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
          size: { width: 260, height: 380 },
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
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ),
          size: { width: 400, height: 300 },
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
          size: { width: 400, height: 300 },
          isMinimized: false,
        });
      }
    }
  };

  // Update active app based on focused window (highest z-index)
  useEffect(() => {
    if (windows.length > 0) {
      // Find the window with the highest z-index (most recently focused)
      const focusedWindow = windows.reduce((highest, current) => 
        current.zIndex > highest.zIndex ? current : highest
      );
      setActiveApp(focusedWindow.title);
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

  // Replicant Database component
  const ReplicantDatabaseDialog = () => showAbout ? (
    <ReplicantDatabase onClose={() => setShowAbout(false)} />
  ) : null;

  return (
    <div className="app">
      {/* Animated particle field background */}
      <ParticleField className="desktop-background" />
      
      {/* Fluid shader effect overlay */}
      <FluidEffect />
      
      {/* Blade Runner 2049 inspired tracking overlay */}
      <TrackingOverlay />
      
      {/* System process monitor */}
      <SystemMonitor />
      
      {/* Environmental data monitor */}
      <EnvironmentalMonitor />
      
      <MenuBar 
        activeApp={activeApp}
        onMenuAction={handleMenuAction}
      />
      <Desktop>
        {windows.map(window => (
          <Window
            key={window.id}
            {...window}
            onClose={() => closeWindow(window.id)}
            onUpdate={(updates) => updateWindow(window.id, updates)}
            onBringToFront={() => bringWindowToFront(window.id)}
          />
        ))}
      </Desktop>
      <Dock 
        onYouTubeClick={toggleYouTubePlaylist}
        onPlaceholderClick={togglePlaceholderWindow}
        openWindows={windows.map(w => w.title)}
      />
      <ReplicantDatabaseDialog />
    </div>
  );
}

export default App
