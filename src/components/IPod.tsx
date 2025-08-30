import React, { useState, useEffect, useRef } from 'react';
import './IPod.css';

interface Track {
  name: string;
  artist: string;
  duration: string;
  id: string;
  videoId?: string;
}

interface IPodProps {
  playlist: Track[];
}

const IPod: React.FC<IPodProps> = ({ playlist }) => {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'music' | 'playlist' | 'nowplaying'>('menu');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [batteryLevel] = useState(85);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const lastClickTimeRef = useRef<number>(0);
  const clickTimeoutRef = useRef<number | null>(null);

  const menuItems = [
    { name: 'Music' },
    { name: 'Videos' },
    { name: 'Photos' },
    { name: 'Games' },
    { name: 'Clock' },
    { name: 'Settings' }
  ];

  const musicMenu = [
    { name: 'Playlists' },
    { name: 'Artists' },
    { name: 'Albums' },
    { name: 'Songs' },
    { name: 'Genres' }
  ];

  const handleCenterClick = () => {
    if (currentScreen === 'menu') {
      if (selectedIndex === 0) { // Music
        setCurrentScreen('music');
        setSelectedIndex(0);
      }
    } else if (currentScreen === 'music') {
      if (selectedIndex === 0) { // Playlists
        setCurrentScreen('playlist');
        setSelectedIndex(0);
      }
    } else if (currentScreen === 'playlist') {
      if (playlist[selectedIndex]) {
        setCurrentTrack(playlist[selectedIndex]);
        setCurrentScreen('nowplaying');
        setIsPlaying(true); // Auto-play when song is selected
      }
    } else if (currentScreen === 'nowplaying') {
      setIsPlaying(!isPlaying);
    }
  };

  const handleMenuClick = () => {
    if (currentScreen === 'nowplaying') {
      setCurrentScreen('playlist');
    } else if (currentScreen === 'playlist') {
      setCurrentScreen('music');
    } else if (currentScreen === 'music') {
      setCurrentScreen('menu');
    }
    setSelectedIndex(0);
  };

  const handleWheelScroll = (direction: 'up' | 'down') => {
    if (currentScreen === 'menu') {
      if (direction === 'up') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else {
        setSelectedIndex(prev => Math.min(menuItems.length - 1, prev + 1));
      }
    } else if (currentScreen === 'music') {
      if (direction === 'up') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else {
        setSelectedIndex(prev => Math.min(musicMenu.length - 1, prev + 1));
      }
    } else if (currentScreen === 'playlist') {
      if (direction === 'up') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else {
        setSelectedIndex(prev => Math.min(playlist.length - 1, prev + 1));
      }
    }
  };

  const handlePrevious = () => {
    const currentTime = Date.now();
    const timeDifference = currentTime - lastClickTimeRef.current;
    
    // Double-click detection (within 300ms)
    if (timeDifference < 300) {
      // Double-click detected - go back to previous screen regardless of position
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current!);
        clickTimeoutRef.current = null;
      }
      
      if (currentScreen === 'nowplaying') {
        setCurrentScreen('playlist');
        setSelectedIndex(0);
      } else if (currentScreen === 'playlist') {
        setCurrentScreen('music');
        setSelectedIndex(0);
      } else if (currentScreen === 'music') {
        setCurrentScreen('menu');
        setSelectedIndex(0);
      }
      
      lastClickTimeRef.current = 0; // Reset to prevent triple-click issues
      return;
    }
    
    // Single-click behavior - immediate response
    lastClickTimeRef.current = currentTime;
    
    if (selectedIndex > 0) {
      // Not at top - scroll up (move selection up)
      handleWheelScroll('up');
    } else {
      // At top (selectedIndex === 0) - go back to previous screen
      if (currentScreen === 'nowplaying') {
        setCurrentScreen('playlist');
        setSelectedIndex(0);
      } else if (currentScreen === 'playlist') {
        setCurrentScreen('music');
        setSelectedIndex(0);
      } else if (currentScreen === 'music') {
        setCurrentScreen('menu');
        setSelectedIndex(0);
      }
      // If already at main menu and at top, do nothing
    }
  };

  const handleNext = () => {
    handleWheelScroll('down');
  };

  useEffect(() => {
    if (menuItemsRef.current) {
      const container = menuItemsRef.current;
      const selectedItem = container.children[selectedIndex] as HTMLElement;
      
      if (selectedItem) {
        const containerHeight = container.clientHeight;
        const itemHeight = selectedItem.offsetHeight;
        const itemTop = selectedItem.offsetTop;
        const scrollTop = container.scrollTop;
        
        // Calculate visible area
        const visibleTop = scrollTop;
        const visibleBottom = scrollTop + containerHeight;
        const itemBottom = itemTop + itemHeight;
        
        if (selectedIndex === 0) {
          // First item - always scroll to top to ensure it's fully visible
          container.scrollTop = 0;
        } else if (itemTop < visibleTop) {
          // Item is above visible area - scroll up to show it at the top
          container.scrollTop = itemTop;
        } else if (itemBottom > visibleBottom) {
          // Item is below visible area - scroll down to show it at the bottom
          container.scrollTop = itemBottom - containerHeight;
        }
      }
    }
  }, [selectedIndex, currentScreen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current!);
      }
    };
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return (
          <div className="ipod-menu">
            <div className="menu-items" ref={currentScreen === 'menu' ? menuItemsRef : null}>
              {menuItems.map((item, index) => (
                <div 
                  key={item.name}
                  className={`menu-item ${index === selectedIndex ? 'selected' : ''}`}
                >
                  <span className="menu-text">{item.name}</span>
                  <span className="menu-arrow">▶</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'music':
        return (
          <div className="ipod-menu">
            <div className="menu-items" ref={currentScreen === 'music' ? menuItemsRef : null}>
              {musicMenu.map((item, index) => (
                <div 
                  key={item.name}
                  className={`menu-item ${index === selectedIndex ? 'selected' : ''}`}
                >
                  <span className="menu-text">{item.name}</span>
                  <span className="menu-arrow">▶</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'playlist':
        return (
          <div className="ipod-menu">
            <div className="menu-items playlist-items" ref={currentScreen === 'playlist' ? menuItemsRef : null}>
              {playlist.map((track, index) => (
                <div 
                  key={track.id}
                  className={`menu-item track-item ${index === selectedIndex ? 'selected' : ''}`}
                >
                  <div className="track-info">
                    <div className="track-name">{track.name}</div>
                    <div className="track-artist">{track.artist}</div>
                  </div>
                  <span className="track-duration">{track.duration}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'nowplaying':
        return (
          <div className="now-playing">
            {currentTrack?.videoId ? (
              <div className="ipod-video-player">
                <iframe
                  width="100%"
                  height="120"
                  src={`https://www.youtube.com/embed/${currentTrack.videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1&mute=0`}
                  title={currentTrack.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: '4px' }}
                />
              </div>
            ) : (
              <div className="track-artwork">♫</div>
            )}
            <div className="track-details">
              <div className="current-track-name">{currentTrack?.name}</div>
              <div className="current-track-artist">{currentTrack?.artist}</div>
            </div>
            <div className="playback-controls">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '35%' }}></div>
              </div>
              <div className="time-info">
                <span>0:00</span>
                <span>{currentTrack?.duration}</span>
              </div>
            </div>
            <div className="play-status">
              {isPlaying ? '⏸️ Playing' : '▶️ Ready'}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ipod-container">
      <div className="ipod-body">
        <div className="ipod-screen">
          <div className="screen-header">
            <div className="time">12:34</div>
            <div className="screen-title">
              {currentScreen === 'menu' && 'iPod'}
              {currentScreen === 'music' && 'Music'}
              {currentScreen === 'playlist' && 'Maidenless Behavior'}
              {currentScreen === 'nowplaying' && 'Now Playing'}
            </div>
            <div className="battery">
              <div className="battery-level" style={{ width: `${batteryLevel}%` }}></div>
            </div>
          </div>
          <div className="screen-content">
            {renderScreen()}
          </div>
        </div>
        
        <div className="ipod-controls">
          <div className="click-wheel" onWheel={(e) => {
            e.preventDefault();
            handleWheelScroll(e.deltaY > 0 ? 'down' : 'up');
          }}>
            <button className="control-button menu-btn" onClick={handleMenuClick}>
              MENU
            </button>
            <button className="control-button prev-btn" onClick={handlePrevious}>⏮</button>
            <button className="control-button next-btn" onClick={handleNext}>⏭</button>
            <button className="control-button play-btn">⏯</button>
            
            <button className="center-button" onClick={handleCenterClick}>
              <div className="center-circle"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPod;