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

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  type: 'server' | 'client' | 'gateway' | 'satellite' | 'relay';
  status: 'active' | 'idle' | 'transmitting';
  connections: string[];
  dataRate: number;
  responseTime: number;
  label: string;
}

const TrackingOverlay: React.FC = () => {
  // iOS performance optimization - disable heavy features on mobile
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  const [, setScanActive] = useState(false);
  const [dataPoints, setDataPoints] = useState<ScanData[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    connection: Math.random() * 100,
    signals: Math.floor(Math.random() * 12),
    tracking: Math.random() * 100,
    bandwidth: Math.random() * 1000,
    latency: Math.random() * 50 + 10,
    threats: Math.floor(Math.random() * 3),
    encryption: Math.random() * 100 + 200
  });
  
  // Network topology state - disabled on iOS for performance
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);

  // Optimized scanning cycle - reduced frequency and combined state updates
  useEffect(() => {
    const scanCycle = setInterval(() => {
      // Generate new data points during scan
      const newPoints: ScanData[] = [];
      const pointCount = isIOS ? 1 : Math.floor(Math.random() * 3) + 1; // Single point on iOS
      
      for (let i = 0; i < pointCount; i++) {
        newPoints.push({
          id: `scan-${Date.now()}-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          type: ['contact', 'anomaly', 'system'][Math.floor(Math.random() * 3)] as any,
          intensity: Math.random(),
          timestamp: Date.now()
        });
      }
      
      // Combined state updates to minimize re-renders
      setScanActive(true);
      setDataPoints(newPoints);
      
      // Simple scan duration without progress animation
      setTimeout(() => {
        setScanActive(false);
      }, 2000); // 2 second scan duration
      
    }, isIOS ? 25000 + Math.random() * 15000 : 15000 + Math.random() * 10000); // Slower on iOS

    // Update system status less frequently
    const statusTimer = setInterval(() => {
      setSystemStatus(prev => ({
        connection: Math.max(75, Math.min(100, prev.connection + (Math.random() - 0.5) * 5)), // Reduced variation
        signals: Math.max(8, Math.min(15, prev.signals + Math.floor((Math.random() - 0.5) * 2))),
        tracking: Math.max(80, Math.min(100, prev.tracking + (Math.random() - 0.5) * 8)),
        bandwidth: Math.max(200, Math.min(1200, prev.bandwidth + (Math.random() - 0.5) * 50)),
        latency: Math.max(5, Math.min(80, prev.latency + (Math.random() - 0.5) * 4)),
        threats: Math.max(0, Math.min(5, prev.threats + Math.floor((Math.random() - 0.5) * 1))),
        encryption: Math.max(128, Math.min(512, prev.encryption + (Math.random() - 0.5) * 10))
      }));
    }, isIOS ? 8000 : 5000); // Even slower status updates on iOS

    // Fade out old data points less frequently
    const cleanupTimer = setInterval(() => {
      setDataPoints(prev => prev.filter(point => Date.now() - point.timestamp < 12000)); // Keep longer
    }, isIOS ? 5000 : 2000); // Much slower cleanup on iOS

    return () => {
      clearInterval(scanCycle);
      clearInterval(statusTimer);
      clearInterval(cleanupTimer);
    };
  }, []); // Removed problematic dependency array

  // Network topology generation - disabled on iOS for performance
  useEffect(() => {
    if (isIOS) return; // Skip network topology on iOS
    
    // Initialize network topology on mount
    const initializeNetwork = () => {
      const nodes: NetworkNode[] = [
        // Central server cluster (distributed across screen)
        {
          id: 'central-server',
          x: 45,
          y: 40,
          type: 'server',
          status: 'active',
          connections: ['gateway-01', 'gateway-02', 'gateway-03', 'satellite-alpha'],
          dataRate: 850 + Math.random() * 300,
          responseTime: 12 + Math.random() * 8,
          label: 'SRV-01'
        },
        {
          id: 'backup-server',
          x: 85,
          y: 75,
          type: 'server',
          status: 'active',
          connections: ['gateway-03', 'satellite-beta'],
          dataRate: 720 + Math.random() * 200,
          responseTime: 15 + Math.random() * 10,
          label: 'SRV-02'
        },
        
        // Gateway nodes spread across the desktop
        {
          id: 'gateway-01',
          x: 20,
          y: 25,
          type: 'gateway',
          status: 'transmitting',
          connections: ['client-alpha', 'client-beta'],
          dataRate: 420 + Math.random() * 180,
          responseTime: 28 + Math.random() * 12,
          label: 'GW-01'
        },
        {
          id: 'gateway-02',
          x: 70,
          y: 30,
          type: 'gateway',
          status: 'active',
          connections: ['client-gamma', 'client-delta'],
          dataRate: 380 + Math.random() * 220,
          responseTime: 32 + Math.random() * 15,
          label: 'GW-02'
        },
        {
          id: 'gateway-03',
          x: 25,
          y: 85,
          type: 'gateway',
          status: 'idle',
          connections: ['client-epsilon', 'relay-01'],
          dataRate: 310 + Math.random() * 150,
          responseTime: 38 + Math.random() * 18,
          label: 'GW-03'
        },
        
        // Client nodes distributed across corners and edges
        {
          id: 'client-alpha',
          x: 8,
          y: 15,
          type: 'client',
          status: 'idle',
          connections: [],
          dataRate: 120 + Math.random() * 80,
          responseTime: 45 + Math.random() * 25,
          label: 'C-01'
        },
        {
          id: 'client-beta',
          x: 15,
          y: 40,
          type: 'client',
          status: 'active',
          connections: [],
          dataRate: 95 + Math.random() * 65,
          responseTime: 52 + Math.random() * 30,
          label: 'C-02'
        },
        {
          id: 'client-gamma',
          x: 85,
          y: 20,
          type: 'client',
          status: 'transmitting',
          connections: [],
          dataRate: 140 + Math.random() * 90,
          responseTime: 38 + Math.random() * 20,
          label: 'C-03'
        },
        {
          id: 'client-delta',
          x: 92,
          y: 45,
          type: 'client',
          status: 'active',
          connections: [],
          dataRate: 88 + Math.random() * 70,
          responseTime: 48 + Math.random() * 25,
          label: 'C-04'
        },
        {
          id: 'client-epsilon',
          x: 12,
          y: 75,
          type: 'client',
          status: 'idle',
          connections: [],
          dataRate: 75 + Math.random() * 55,
          responseTime: 55 + Math.random() * 35,
          label: 'C-05'
        },
        
        // Satellites on outer edges
        {
          id: 'satellite-alpha',
          x: 65,
          y: 8,
          type: 'satellite',
          status: 'active',
          connections: ['relay-01'],
          dataRate: 680 + Math.random() * 120,
          responseTime: 85 + Math.random() * 35,
          label: 'SAT-α'
        },
        {
          id: 'satellite-beta',
          x: 92,
          y: 85,
          type: 'satellite',
          status: 'active',
          connections: ['relay-02'],
          dataRate: 590 + Math.random() * 110,
          responseTime: 95 + Math.random() * 40,
          label: 'SAT-β'
        },
        
        // Relay nodes for network redundancy
        {
          id: 'relay-01',
          x: 55,
          y: 70,
          type: 'relay',
          status: 'idle',
          connections: ['relay-02'],
          dataRate: 240 + Math.random() * 60,
          responseTime: 65 + Math.random() * 25,
          label: 'RLY-01'
        },
        {
          id: 'relay-02',
          x: 75,
          y: 92,
          type: 'relay',
          status: 'active',
          connections: [],
          dataRate: 180 + Math.random() * 80,
          responseTime: 72 + Math.random() * 30,
          label: 'RLY-02'
        }
      ];
      setNetworkNodes(nodes);
    };

    initializeNetwork();

    // Update network data periodically
    const networkTimer = setInterval(() => {
      setNetworkNodes(prev => prev.map(node => ({
        ...node,
        status: ['active', 'idle', 'transmitting'][Math.floor(Math.random() * 3)] as any,
        dataRate: node.dataRate * (0.9 + Math.random() * 0.2), // ±10% variation
        responseTime: node.responseTime * (0.8 + Math.random() * 0.4) // ±20% variation
      })));
    }, 4000);

    return () => clearInterval(networkTimer);
  }, [isIOS]);

  return (
    <div className="tracking-overlay">
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
      
      {/* Enhanced system status readouts */}
      <div className="system-status">
        <div className="status-header">
          <div className="status-indicator-ring">
            <div className="ring-pulse"></div>
            <div className="ring-inner">SYS</div>
          </div>
          <div className="status-title">NETWORK STATUS</div>
        </div>
        
        <div className="status-grid">
          <div className="status-cell primary">
            <div className="cell-label">CONN</div>
            <div className="cell-value">{(systemStatus.connection || 0).toFixed(1)}</div>
            <div className="cell-unit">%</div>
          </div>
          
          <div className="status-cell primary">
            <div className="cell-label">TRK</div>
            <div className="cell-value">{(systemStatus.tracking || 0).toFixed(1)}</div>
            <div className="cell-unit">%</div>
          </div>
          
          <div className="status-cell">
            <div className="cell-label">SIG</div>
            <div className="cell-value">{systemStatus.signals.toString().padStart(2, '0')}</div>
            <div className="cell-unit">DB</div>
          </div>
          
          <div className="status-cell">
            <div className="cell-label">BW</div>
            <div className="cell-value">{Math.floor(systemStatus.bandwidth || 0)}</div>
            <div className="cell-unit">MB</div>
          </div>
          
          <div className="status-cell">
            <div className="cell-label">LAT</div>
            <div className="cell-value">{Math.floor(systemStatus.latency || 0)}</div>
            <div className="cell-unit">MS</div>
          </div>
          
          <div className="status-cell warning">
            <div className="cell-label">THR</div>
            <div className="cell-value">{systemStatus.threats || 0}</div>
            <div className="cell-unit">ACT</div>
          </div>
        </div>
        
        <div className="encryption-bar">
          <div className="enc-label">ENC</div>
          <div className="enc-progress">
            <div 
              className="enc-fill" 
              style={{ width: `${(systemStatus.encryption / 512) * 100}%` }}
            ></div>
            <div className="enc-value">{Math.floor(systemStatus.encryption || 0)}</div>
          </div>
        </div>
      </div>
      
      {/* Network Topology - disabled on iOS for performance */}
      {!isIOS && (
        <div className="network-topology">
          {/* Render connection lines first (behind nodes) */}
          {networkNodes.map((node) =>
            node.connections.map((targetId) => {
              const target = networkNodes.find(n => n.id === targetId);
              if (!target) return null;
              
              const dx = target.x - node.x;
              const dy = target.y - node.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * 180 / Math.PI;
              
              return (
                <div
                  key={`${node.id}-${targetId}`}
                  className={`network-connection status-${node.status}`}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    width: `${length}%`,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '0 50%'
                  }}
                />
              );
            })
          )}
          
          {/* Render nodes on top */}
          {networkNodes.map((node) => (
            <div
              key={node.id}
              className={`network-node node-${node.type} status-${node.status}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`
              }}
            >
              {/* Node core */}
              <div className="node-core" />
              
              {/* Node label */}
              <div className="node-label">{node.label}</div>
              
              {/* Real-time data overlay */}
              <div className="node-data">
                <div className="data-rate">{Math.floor(node.dataRate)}</div>
                <div className="response-time">{Math.floor(node.responseTime)}ms</div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default TrackingOverlay;