import React, { useState, useRef, useCallback } from 'react';
import './Window.css';

interface WindowProps {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  zIndex: number;
  onClose: () => void;
  onUpdate: (updates: { position?: { x: number; y: number }; size?: { width: number; height: number }; isMinimized?: boolean; zIndex?: number }) => void;
  onBringToFront?: () => void;
}

const Window: React.FC<WindowProps> = ({
  title,
  content,
  position,
  size,
  isMinimized,
  zIndex,
  onClose,
  onUpdate,
  onBringToFront,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Bring window to front when clicked
    if (onBringToFront) {
      onBringToFront();
      // Add focus animation
      setIsFocused(true);
      setTimeout(() => setIsFocused(false), 300);
    }
    
    if (e.target === e.currentTarget || (e.target as HTMLElement).className === 'window-title') {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      // Prevent text selection during drag
      e.preventDefault();
    }
  }, [position, onBringToFront]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && windowRef.current) {
      // Direct DOM manipulation for immediate visual feedback
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Update CSS custom properties directly for immediate response
      windowRef.current.style.setProperty('--window-x', `${newX}px`);
      windowRef.current.style.setProperty('--window-y', `${newY}px`);
      
      // Cancel any pending RAF to avoid conflicts
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Batch update to parent component using RAF to avoid excessive renders
      rafRef.current = requestAnimationFrame(() => {
        onUpdate({
          position: { x: newX, y: newY },
        });
      });
    }
  }, [isDragging, dragOffset, onUpdate]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      
      // Cancel any pending animation frame immediately
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      
      // Final position update to ensure parent state is in sync
      if (windowRef.current) {
        const currentX = parseFloat(windowRef.current.style.getPropertyValue('--window-x')) || position.x;
        const currentY = parseFloat(windowRef.current.style.getPropertyValue('--window-y')) || position.y;
        onUpdate({
          position: { x: currentX, y: currentY },
        });
      }
    }
    setIsResizing(false);
  }, [isDragging, position, onUpdate]);

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

  const handleWindowClick = () => {
    // Only bring to front if clicking on window content, not during drag
    if (!isDragging && onBringToFront) {
      onBringToFront();
      // Add focus animation
      setIsFocused(true);
      setTimeout(() => setIsFocused(false), 300);
    }
  };

  return (
    <div
      ref={windowRef}
      className={`window ${isMinimizing ? 'minimizing' : ''} ${isDragging ? 'dragging' : ''} ${isFocused ? 'focused' : ''}`}
      style={{
        '--window-x': `${position.x}px`,
        '--window-y': `${position.y}px`,
        width: size.width,
        height: size.height,
        zIndex: zIndex,
      } as React.CSSProperties}
      onClick={handleWindowClick}
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