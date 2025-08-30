import React, { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import Sidebar from './components/Sidebar';
import Window from './components/Window';
import IPod from './components/IPod';
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
      // OSRS Noob website - open in new tab due to CSP restrictions
      window.open('https://osrsnoob.vercel.app/', '_blank', 'noopener,noreferrer');
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
