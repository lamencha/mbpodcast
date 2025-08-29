import React, { ReactNode, useEffect, useRef, useState } from 'react';
import './Desktop.css';

interface DesktopProps {
  children: ReactNode;
  backgroundVideo: string;
  onBackgroundChange: (video: string) => void;
}

const Desktop: React.FC<DesktopProps> = ({ children, backgroundVideo, onBackgroundChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleDesktopClick = () => {
    if (videoRef.current && !videoLoaded) {
      videoRef.current.play().catch(e => {
        console.log('Manual video play failed:', e);
      });
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleCanPlay = () => {
        console.log('Video can play:', backgroundVideo);
        setVideoLoaded(true);
        video.play().catch(e => {
          console.log('Video autoplay blocked:', e);
        });
      };

      const handleError = (e: Event) => {
        console.error('Video error:', e, backgroundVideo);
        setVideoError(true);
        setVideoLoaded(false);
      };

      const handleLoadStart = () => {
        console.log('Video load started:', backgroundVideo);
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      video.addEventListener('loadstart', handleLoadStart);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadstart', handleLoadStart);
      };
    }
  }, [backgroundVideo]);

  return (
    <div 
      className="desktop"
      onContextMenu={handleContextMenu}
      onClick={handleDesktopClick}
    >
      <video
        ref={videoRef}
        className={`desktop-video ${videoLoaded ? 'loaded' : ''}`}
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="desktop-overlay" />
      {children}
    </div>
  );
};

export default Desktop;