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
      color: 'var(--nebula-rose)',
      glowColor: 'var(--nebula-rose)',
      action: onYouTubeClick,
      windowTitle: 'Maidenless Behavior Playlist'
    },
    {
      id: 2,
      label: 'Music',
      icon: 'library_music',
      color: 'var(--nebula-teal)',
      glowColor: 'var(--nebula-teal)',
      action: () => onPlaceholderClick(2),
      windowTitle: 'Classic iPod'
    },
    {
      id: 3,
      label: 'Game',
      icon: 'sports_esports',
      color: 'var(--nebula-rose)',
      glowColor: 'var(--nebula-rose)',
      action: () => onPlaceholderClick(3),
      windowTitle: 'OSRS Noob'
    },
    {
      id: 4,
      label: 'Create',
      icon: 'palette',
      color: 'var(--nebula-teal)',
      glowColor: 'var(--nebula-teal)',
      action: () => onPlaceholderClick(4),
      windowTitle: 'App 4'
    },
    {
      id: 5,
      label: 'System',
      icon: 'settings',
      color: 'var(--nebula-rose)',
      glowColor: 'var(--nebula-rose)',
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
        <div className="dock-background" />
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
              <span className="dock-item-icon material-icons">
                {item.icon}
              </span>
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