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
  const rafRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).className === 'window-title') {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      // Prevent text selection during drag
      e.preventDefault();
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        onUpdate({
          position: {
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          },
        });
      });
    }
  }, [isDragging, dragOffset, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
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

  // Cleanup animation frame on unmount
  React.useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

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
      className={`window ${isMinimizing ? 'minimizing' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        '--window-x': `${position.x}px`,
        '--window-y': `${position.y}px`,
        width: size.width,
        height: size.height,
      } as React.CSSProperties}
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