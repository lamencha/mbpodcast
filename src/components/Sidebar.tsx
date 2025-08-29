import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  onYouTubeClick: () => void;
  onPlaceholderClick: (buttonNumber: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onYouTubeClick, onPlaceholderClick }) => {
  const buttons = [
    {
      id: 1,
      icon: '📺',
      label: 'YouTube',
      onClick: onYouTubeClick,
      isActive: true,
    },
    {
      id: 2,
      icon: '🎵',
      label: 'iPod',
      onClick: () => onPlaceholderClick(2),
      isActive: false,
    },
    {
      id: 3,
      icon: '⚔️',
      label: 'OSRS',
      onClick: () => onPlaceholderClick(3),
      isActive: false,
    },
    {
      id: 4,
      icon: '⚡',
      label: 'Labs',
      onClick: () => onPlaceholderClick(4),
      isActive: false,
    },
    {
      id: 5,
      icon: '🚀',
      label: 'Future',
      onClick: () => onPlaceholderClick(5),
      isActive: false,
    },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-text">MB</span>
          <span className="logo-dot">●</span>
        </div>
      </div>
      <div className="sidebar-buttons">
        {buttons.map((button) => (
          <button
            key={button.id}
            className={`sidebar-button ${button.isActive ? 'active' : ''}`}
            onClick={button.onClick}
            title={button.label}
          >
            <span className="button-icon">{button.icon}</span>
            <span className="button-label">{button.label}</span>
            <div className="button-glow" />
          </button>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span>Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;