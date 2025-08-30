import React, { useState, useEffect, useRef } from 'react';
import './MenuBar.css';

interface MenuBarProps {
  activeApp: string;
  onMenuAction: (action: string) => void;
}

interface MenuItem {
  label?: string;
  action?: string;
  separator?: boolean;
  items?: MenuItem[];
}

const MenuBar: React.FC<MenuBarProps> = ({ activeApp, onMenuAction }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const menuRef = useRef<HTMLDivElement>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const appleMenuItems: MenuItem[] = [
    { label: 'About Maidenless Behavior', action: 'about' },
    { separator: true },
    { label: 'System Preferences...', action: 'preferences' },
    { separator: true },
    { label: 'Recent Items', items: [
      { label: 'Applications', separator: true },
      { label: 'Classic iPod' },
      { label: 'YouTube Playlist' },
    ]},
    { separator: true },
    { label: 'Force Quit Applications...', action: 'force-quit' },
    { separator: true },
    { label: 'Sleep', action: 'sleep' },
    { label: 'Restart...', action: 'restart' },
    { label: 'Shut Down...', action: 'shutdown' }
  ];

  const fileMenuItems: MenuItem[] = [
    { label: 'New Window', action: 'new-window' },
    { label: 'New Folder', action: 'new-folder' },
    { separator: true },
    { label: 'Open...', action: 'open' },
    { label: 'Close Window', action: 'close-window' },
    { separator: true },
    { label: 'Get Info', action: 'get-info' }
  ];

  const editMenuItems: MenuItem[] = [
    { label: 'Undo', action: 'undo' },
    { label: 'Redo', action: 'redo' },
    { separator: true },
    { label: 'Cut', action: 'cut' },
    { label: 'Copy', action: 'copy' },
    { label: 'Paste', action: 'paste' },
    { label: 'Select All', action: 'select-all' }
  ];

  const viewMenuItems: MenuItem[] = [
    { label: 'Show Sidebar', action: 'show-sidebar' },
    { label: 'Hide Sidebar', action: 'hide-sidebar' },
    { separator: true },
    { label: 'Show Status Bar', action: 'show-status-bar' },
    { separator: true },
    { label: 'Customize Toolbar...', action: 'customize-toolbar' }
  ];

  const windowMenuItems: MenuItem[] = [
    { label: 'Minimize', action: 'minimize' },
    { label: 'Zoom', action: 'zoom' },
    { separator: true },
    { label: 'Bring All to Front', action: 'bring-all-front' },
    { separator: true },
    { label: 'Classic iPod', action: 'focus-ipod' },
    { label: 'YouTube Playlist', action: 'focus-youtube' }
  ];

  const helpMenuItems: MenuItem[] = [
    { label: 'Maidenless Behavior Help', action: 'help' },
    { separator: true },
    { label: 'Keyboard Shortcuts', action: 'shortcuts' },
    { label: 'What\'s New', action: 'whats-new' }
  ];

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (action?: string) => {
    if (action) {
      onMenuAction(action);
    }
    setActiveMenu(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.separator) {
      return <div key={index} className="menu-separator" />;
    }

    return (
      <div
        key={index}
        className="menu-item"
        onClick={() => handleMenuItemClick(item.action)}
      >
        {item.label || ''}
        {item.items && <span className="menu-arrow">▶</span>}
      </div>
    );
  };

  const renderDropdown = (items: MenuItem[]) => (
    <div className="menu-dropdown">
      {items.map(renderMenuItem)}
    </div>
  );

  return (
    <div ref={menuRef} className="menubar">
      <div className="menubar-left">
        {/* Apple Menu */}
        <div className="menu-item-container">
          <div
            className={`menu-title ${activeMenu === 'apple' ? 'active' : ''}`}
            onClick={() => handleMenuClick('apple')}
          >
            🍎
          </div>
          {activeMenu === 'apple' && renderDropdown(appleMenuItems)}
        </div>

        {/* App Name */}
        <div className="menu-item-container">
          <div
            className={`menu-title app-name ${activeMenu === 'app' ? 'active' : ''}`}
            onClick={() => handleMenuClick('app')}
          >
            {activeApp}
          </div>
        </div>

        {/* Application Menus */}
        <div className="menu-item-container">
          <div
            className={`menu-title ${activeMenu === 'file' ? 'active' : ''}`}
            onClick={() => handleMenuClick('file')}
          >
            File
          </div>
          {activeMenu === 'file' && renderDropdown(fileMenuItems)}
        </div>

        <div className="menu-item-container">
          <div
            className={`menu-title ${activeMenu === 'edit' ? 'active' : ''}`}
            onClick={() => handleMenuClick('edit')}
          >
            Edit
          </div>
          {activeMenu === 'edit' && renderDropdown(editMenuItems)}
        </div>

        <div className="menu-item-container">
          <div
            className={`menu-title ${activeMenu === 'view' ? 'active' : ''}`}
            onClick={() => handleMenuClick('view')}
          >
            View
          </div>
          {activeMenu === 'view' && renderDropdown(viewMenuItems)}
        </div>

        <div className="menu-item-container">
          <div
            className={`menu-title ${activeMenu === 'window' ? 'active' : ''}`}
            onClick={() => handleMenuClick('window')}
          >
            Window
          </div>
          {activeMenu === 'window' && renderDropdown(windowMenuItems)}
        </div>

        <div className="menu-item-container">
          <div
            className={`menu-title ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={() => handleMenuClick('help')}
          >
            Help
          </div>
          {activeMenu === 'help' && renderDropdown(helpMenuItems)}
        </div>
      </div>

      <div className="menubar-right">
        <div className="status-item wifi">📶</div>
        <div className="status-item battery">🔋 85%</div>
        <div className="status-item time">{formatTime(currentTime)}</div>
      </div>
    </div>
  );
};

export default MenuBar;