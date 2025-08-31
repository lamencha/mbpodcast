import React, { type ReactNode } from 'react';
import './Desktop.css';

interface DesktopProps {
  children: ReactNode;
}

const Desktop: React.FC<DesktopProps> = ({ children }) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="desktop"
      onContextMenu={handleContextMenu}
    >
      {children}
    </div>
  );
};

export default Desktop;