import React, { useState, useRef, useCallback } from 'react';
import './Window.css';

interface WindowProps {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  onClose: () => void;
  onUpdate: (updates: { position?: { x: number; y: number }; size?: { width: number; height: number }; isMinimized?: boolean }) => void;
}

const Window: React.FC<WindowProps> = ({
  title,
  content,
  position,
  size,
  isMinimized,
  onClose,
  onUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimizing, setIsMinimizing] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).className === 'window-title') {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      onUpdate({
        position: {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        },
      });
    }
  }, [isDragging, dragOffset, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleMinimize = () => {
    setIsMinimizing(true);
    setTimeout(() => {
      onUpdate({ isMinimized: true });
      setIsMinimizing(false);
    }, 300);
  };

  if (isMinimized && !isMinimizing) return null;

  return (
    <div
      ref={windowRef}
      className={`window ${isMinimizing ? 'minimizing' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      <div className="window-header" onMouseDown={handleMouseDown}>
        <div className="window-controls">
          <button className="window-control close" onClick={onClose} />
          <button className="window-control minimize" onClick={handleMinimize} />
          <button className="window-control maximize" />
        </div>
        <div className="window-title">{title}</div>
      </div>
      <div className="window-content">
        {content}
      </div>
    </div>
  );
};

export default Window;