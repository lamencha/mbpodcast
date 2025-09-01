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
  const [scanActive, setScanActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [dataPoints, setDataPoints] = useState<ScanData[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    connection: Math.random() * 100,
    signals: Math.floor(Math.random() * 12),
    tracking: Math.random() * 100
  });
  
  // Network topology state
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);

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

  // Network topology generation - Solar system inspired
  useEffect(() => {
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
  }, []);

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
      
      {/* Network Topology - Solar System Style */}
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

      {/* Tracking reticle */}
      <div className="tracking-reticle">
        <div className="reticle-crosshair" />
        <div className="reticle-rings" />
      </div>
    </div>
  );
};

export default TrackingOverlay;