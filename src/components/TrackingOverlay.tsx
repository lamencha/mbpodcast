import React, { useState, useEffect } from 'react';
import './TrackingOverlay.css';

interface ScanData {
  id: string;
  x: number;
  y: number;
  type: 'contact' | 'anomaly' | 'system';
  intensity: number;
  timestamp: number;
}

const TrackingOverlay: React.FC = () => {
  const [scanActive, setScanActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [dataPoints, setDataPoints] = useState<ScanData[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    connection: Math.random() * 100,
    signals: Math.floor(Math.random() * 12),
    tracking: Math.random() * 100
  });

  // Periodic scanning cycle
  useEffect(() => {
    const scanCycle = setInterval(() => {
      setScanActive(true);
      setScanProgress(0);
      
      // Generate new data points during scan
      const newPoints: ScanData[] = [];
      for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
        newPoints.push({
          id: `scan-${Date.now()}-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          type: ['contact', 'anomaly', 'system'][Math.floor(Math.random() * 3)] as any,
          intensity: Math.random(),
          timestamp: Date.now()
        });
      }
      setDataPoints(newPoints);
      
      // Scan animation
      const progressTimer = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            setScanActive(false);
            return 0;
          }
          return prev + 2;
        });
      }, 50);
      
    }, 15000 + Math.random() * 10000); // Random interval 15-25 seconds

    // Update system status periodically
    const statusTimer = setInterval(() => {
      setSystemStatus({
        connection: Math.max(75, Math.min(100, systemStatus.connection + (Math.random() - 0.5) * 10)),
        signals: Math.max(8, Math.min(15, systemStatus.signals + Math.floor((Math.random() - 0.5) * 3))),
        tracking: Math.max(80, Math.min(100, systemStatus.tracking + (Math.random() - 0.5) * 15))
      });
    }, 3000);

    // Fade out old data points
    const cleanupTimer = setInterval(() => {
      setDataPoints(prev => prev.filter(point => Date.now() - point.timestamp < 8000));
    }, 1000);

    return () => {
      clearInterval(scanCycle);
      clearInterval(statusTimer);
      clearInterval(cleanupTimer);
    };
  }, [systemStatus.connection, systemStatus.signals, systemStatus.tracking]);

  return (
    <div className="tracking-overlay">
      {/* Scanning line */}
      {scanActive && (
        <div 
          className="scan-line" 
          style={{ top: `${scanProgress}%` }}
        />
      )}
      
      {/* Data points */}
      {dataPoints.map((point) => (
        <div
          key={point.id}
          className={`data-point data-point-${point.type}`}
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            opacity: Math.max(0.1, 1 - (Date.now() - point.timestamp) / 8000)
          }}
        >
          <div className="data-point-ring" />
          <div className="data-point-center" />
          <div className="data-point-id">{point.type.charAt(0).toUpperCase()}{Math.floor(point.intensity * 100)}</div>
        </div>
      ))}
      
      {/* System status readouts */}
      <div className="system-status">
        <div className="status-readout">
          <span className="status-label">CONN</span>
          <span className="status-value">{systemStatus.connection.toFixed(1)}%</span>
        </div>
        <div className="status-readout">
          <span className="status-label">SIG</span>
          <span className="status-value">{systemStatus.signals.toString().padStart(2, '0')}</span>
        </div>
        <div className="status-readout">
          <span className="status-label">TRK</span>
          <span className="status-value">{systemStatus.tracking.toFixed(1)}%</span>
        </div>
      </div>
      
      {/* Tracking reticle */}
      <div className="tracking-reticle">
        <div className="reticle-crosshair" />
        <div className="reticle-rings" />
      </div>
    </div>
  );
};

export default TrackingOverlay;