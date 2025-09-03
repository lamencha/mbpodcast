import React, { useState, useRef, useCallback, useMemo } from 'react';
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
  const throttleRef = useRef<number>(0);
  const minimizeTimeoutRef = useRef<number | null>(null);
  const focusTimeoutRef = useRef<number | null>(null);

  // Unified pointer event handler for both mouse and touch
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Bring window to front when clicked/touched
    if (onBringToFront) {
      onBringToFront();
      // Add focus animation
      setIsFocused(true);
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = setTimeout(() => setIsFocused(false), 300);
    }
    
    if (e.target === e.currentTarget || (e.target as HTMLElement).className === 'window-title') {
      setIsDragging(true);
      
      // Get coordinates from mouse or touch event
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      setDragOffset({
        x: clientX - position.x,
        y: clientY - position.y,
      });
      // Prevent text selection and scrolling during drag
      e.preventDefault();
    }
  }, [position, onBringToFront]);

  // Legacy mouse handler for compatibility
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handlePointerDown(e);
  }, [handlePointerDown]);

  // Touch handler
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handlePointerDown(e);
  }, [handlePointerDown]);

  // Optimized move handler with throttling for better performance
  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (isDragging && windowRef.current) {
      // Throttle move events for touch devices (every 2nd event)
      if ('touches' in e) {
        throttleRef.current++;
        if (throttleRef.current % 2 !== 0) return;
      }
      
      // Get coordinates from mouse or touch event
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      // Direct DOM manipulation for immediate visual feedback
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;
      
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

  // Legacy mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    handlePointerMove(e);
  }, [handlePointerMove]);

  // Touch move handler
  const handleTouchMove = useCallback((e: TouchEvent) => {
    handlePointerMove(e);
  }, [handlePointerMove]);

  // Unified end handler for mouse and touch
  const handlePointerEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      
      // Reset throttle counter for next drag operation
      throttleRef.current = 0;
      
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

  // Legacy mouse up handler
  const handleMouseUp = useCallback(() => {
    handlePointerEnd();
  }, [handlePointerEnd]);

  // Touch end handler
  const handleTouchEnd = useCallback(() => {
    handlePointerEnd();
  }, [handlePointerEnd]);

  // Memoized event listener options for better performance
  const touchOptions = useMemo(() => ({ passive: false }), []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      // Add both mouse and touch event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, touchOptions);
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, touchOptions]);

  // Cleanup animation frame and timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (minimizeTimeoutRef.current) {
        clearTimeout(minimizeTimeoutRef.current);
      }
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  const handleMinimize = useCallback(() => {
    setIsMinimizing(true);
    if (minimizeTimeoutRef.current) clearTimeout(minimizeTimeoutRef.current);
    minimizeTimeoutRef.current = setTimeout(() => {
      onUpdate({ isMinimized: true });
      setIsMinimizing(false);
    }, 300);
  }, [onUpdate]);

  // Mobile debugging
  const isMobile = window.innerWidth <= 768;
  console.log(`=== WINDOW ${title} RENDER CHECK (Mobile: ${isMobile}) ===`);
  console.log(`isMinimized: ${isMinimized}, isMinimizing: ${isMinimizing}`);
  console.log(`position: ${JSON.stringify(position)}`);
  console.log(`size: ${JSON.stringify(size)}`);
  console.log(`zIndex: ${zIndex}`);

  if (isMinimized && !isMinimizing) {
    console.log(`>>> Window ${title} is minimized, not rendering`);
    return null;
  }

  const handleWindowClick = () => {
    console.log(`Window ${title} clicked (isDragging: ${isDragging})`);
    // Only bring to front if clicking on window content, not during drag
    if (!isDragging && onBringToFront) {
      onBringToFront();
      // Add focus animation
      setIsFocused(true);
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = setTimeout(() => setIsFocused(false), 300);
    }
  };

  console.log(`>>> Rendering window ${title} with zIndex: ${zIndex}, isMinimized: ${isMinimized}, mobile: ${isMobile}`);
  
  const windowStyle = {
    '--window-x': `${position.x}px`,
    '--window-y': `${position.y}px`,
    width: size.width,
    height: size.height,
    zIndex: zIndex,
  } as React.CSSProperties;
  
  console.log(`Window ${title} CSS style:`, windowStyle);
  
  return (
    <div
      ref={windowRef}
      className={`window ${isMinimizing ? 'minimizing' : ''} ${isDragging ? 'dragging' : ''} ${isFocused ? 'focused' : ''}`}
      style={windowStyle}
      onClick={handleWindowClick}
    >
      <div 
        className="window-header" 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
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