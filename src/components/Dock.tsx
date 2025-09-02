import React, { useState } from 'react';
import './Dock.css';

interface DockProps {
  onYouTubeClick: () => void;
  onPlaceholderClick: (buttonNumber: number) => void;
  openWindows: string[]; // Array of open window titles
}

interface DockItem {
  id: number;
  label: string;
  icon: string;
  color: string;
  glowColor: string;
  action: () => void;
  windowTitle: string; // To match with open windows
}

const Dock: React.FC<DockProps> = ({ onYouTubeClick, onPlaceholderClick, openWindows }) => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const dockItems: DockItem[] = [
    {
      id: 1,
      label: 'Playlist',
      icon: 'playlist_play',
      color: 'rgba(255, 255, 255, 0.8)',
      glowColor: 'rgba(255, 255, 255, 0.8)',
      action: onYouTubeClick,
      windowTitle: 'Maidenless Behavior Playlist'
    },
    {
      id: 2,
      label: 'Music',
      icon: 'library_music',
      color: 'rgba(255, 255, 255, 0.8)',
      glowColor: 'rgba(255, 255, 255, 0.8)',
      action: () => onPlaceholderClick(2),
      windowTitle: 'Classic iPod'
    },
    {
      id: 3,
      label: 'Game',
      icon: 'sports_esports',
      color: 'rgba(255, 255, 255, 0.9)',
      glowColor: 'rgba(255, 255, 255, 0.9)',
      action: () => onPlaceholderClick(3),
      windowTitle: 'OSRS Noob'
    },
    {
      id: 4,
      label: 'Create',
      icon: 'palette',
      color: 'rgba(255, 255, 255, 0.8)',
      glowColor: 'rgba(255, 255, 255, 0.8)',
      action: () => onPlaceholderClick(4),
      windowTitle: 'App 4'
    },
    {
      id: 5,
      label: 'System',
      icon: 'settings',
      color: 'rgba(255, 255, 255, 0.8)',
      glowColor: 'rgba(255, 255, 255, 0.8)',
      action: () => onPlaceholderClick(5),
      windowTitle: 'App 5'
    }
  ];

  const handleItemClick = (item: DockItem) => {
    item.action();
    
    // Add click animation
    const element = document.getElementById(`dock-item-${item.id}`);
    if (element) {
      element.classList.add('dock-item-clicked');
      setTimeout(() => {
        element.classList.remove('dock-item-clicked');
      }, 120);
    }
  };

  const handleItemHover = (itemId: number | null) => {
    setHoveredItem(itemId);
  };

  return (
    <div className="dock-container">
      <div className="dock">
        <div className="dock-background">
          {/* Clean Monitoring UI Layout */}
          <div className="monitor-layout">
            
            {/* Central Monitoring Hub */}
            <div className="monitor-hub">
              <div className="hub-ring"></div>
            </div>
            
            {/* Left Monitoring Panel */}
            <div className="monitor-panel panel-left">
              <div className="panel-header"></div>
              <div className="panel-indicator"></div>
            </div>
            
            {/* Right Monitoring Panel */}
            <div className="monitor-panel panel-right">
              <div className="panel-header"></div>
              <div className="panel-indicator"></div>
            </div>
            
            {/* Status Nodes */}
            <div className="status-node node-1"></div>
            <div className="status-node node-2"></div>
            <div className="status-node node-3"></div>
            
            {/* Connection Lines */}
            <div className="connection-line line-main"></div>
            <div className="connection-line line-aux"></div>
            
            {/* Geometric Accents */}
            <div className="geo-accent hexagon-accent"></div>
            <div className="geo-accent diamond-accent"></div>
            
          </div>
        </div>
        <div className="dock-content">
          {dockItems.map((item, index) => {
            const isActive = openWindows.includes(item.windowTitle);
            
            return (
            <div
              key={item.id}
              id={`dock-item-${item.id}`}
              className={`dock-item ${hoveredItem === item.id ? 'hovered' : ''} ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => handleItemHover(item.id)}
              onMouseLeave={() => handleItemHover(null)}
              style={{
                '--item-color': item.color,
                '--item-glow': item.glowColor,
                '--item-delay': `${index * 0.1}s`
              } as React.CSSProperties}
            >
              <div className="dock-item-background" />
              <div className="dock-item-icon">
                {item.id === 1 && (
                  // Playlist - BR2049 style geometric bars
                  <div className="br2049-icon playlist-icon">
                    <div className="playlist-bars">
                      <div className="bar bar-1"></div>
                      <div className="bar bar-2"></div>
                      <div className="bar bar-3"></div>
                      <div className="bar bar-4"></div>
                    </div>
                  </div>
                )}
                {item.id === 2 && (
                  // Music - Hexagonal wave pattern
                  <div className="br2049-icon music-icon">
                    <div className="music-hexagon">
                      <div className="hex-wave hex-wave-1"></div>
                      <div className="hex-wave hex-wave-2"></div>
                      <div className="hex-wave hex-wave-3"></div>
                    </div>
                  </div>
                )}
                {item.id === 3 && (
                  // Game - Angular target reticle
                  <div className="br2049-icon game-icon">
                    <div className="game-reticle">
                      <div className="reticle-ring"></div>
                      <div className="reticle-cross reticle-v"></div>
                      <div className="reticle-corners">
                        <div className="corner corner-tl"></div>
                        <div className="corner corner-tr"></div>
                        <div className="corner corner-bl"></div>
                        <div className="corner corner-br"></div>
                      </div>
                    </div>
                  </div>
                )}
                {item.id === 4 && (
                  // Create - Geometric crystal/diamond
                  <div className="br2049-icon create-icon">
                    <div className="create-diamond">
                      <div className="diamond-facet facet-1"></div>
                      <div className="diamond-facet facet-2"></div>
                      <div className="diamond-facet facet-3"></div>
                      <div className="diamond-core"></div>
                    </div>
                  </div>
                )}
                {item.id === 5 && (
                  // System - Hexagonal grid pattern
                  <div className="br2049-icon system-icon">
                    <div className="system-grid">
                      <div className="grid-hex hex-center"></div>
                      <div className="grid-hex hex-top"></div>
                      <div className="grid-hex hex-bottom"></div>
                      <div className="grid-lines">
                        <div className="grid-line line-1"></div>
                        <div className="grid-line line-2"></div>
                        <div className="grid-line line-3"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="dock-item-label">
                {item.label}
              </span>
              <div className="dock-item-glow" />
            </div>
            );
          })}
        </div>
        
        {/* Dock separator lines */}
        <div className="dock-separator dock-separator-left" />
        <div className="dock-separator dock-separator-right" />
      </div>
    </div>
  );
};

export default Dock;