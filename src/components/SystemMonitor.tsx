import React, { useState, useEffect } from 'react';
import './SystemMonitor.css';

interface ProcessData {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  status: 'active' | 'idle' | 'sleeping' | 'critical';
  pid: number;
  runtime: number;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  temperature: number;
  uptime: number;
}

const SystemMonitor: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessData[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkIn: 0,
    networkOut: 0,
    temperature: 0,
    uptime: 0
  });

  // Initialize mock process data
  useEffect(() => {
    const initializeProcesses = () => {
      const processNames = [
        'kernel_task', 'launchd', 'UserEventAgent', 'loginwindow',
        'Dock', 'Finder', 'WindowServer', 'SystemUIServer',
        'cfprefsd', 'CoreServicesUIAgent', 'NotificationCenter',
        'Spotlight', 'mds', 'coreaudiod', 'bluetoothd'
      ];

      const initialProcesses: ProcessData[] = processNames.map((name, index) => ({
        id: `proc_${index}`,
        name,
        cpu: Math.random() * 15,
        memory: Math.random() * 200 + 10,
        status: ['active', 'idle', 'sleeping'][Math.floor(Math.random() * 3)] as any,
        pid: 100 + Math.floor(Math.random() * 9000),
        runtime: Math.floor(Math.random() * 86400) // seconds
      }));

      setProcesses(initialProcesses);
    };

    initializeProcesses();

    // Initialize system metrics
    setSystemMetrics({
      cpuUsage: 15 + Math.random() * 25,
      memoryUsage: 45 + Math.random() * 30,
      diskUsage: 60 + Math.random() * 20,
      networkIn: Math.random() * 1000,
      networkOut: Math.random() * 800,
      temperature: 45 + Math.random() * 15,
      uptime: Math.floor(Math.random() * 604800) // seconds in a week
    });
  }, []);

  // Update process data periodically
  useEffect(() => {
    const updateTimer = setInterval(() => {
      setProcesses(prev => prev.map(process => ({
        ...process,
        cpu: Math.max(0, process.cpu + (Math.random() - 0.5) * 2),
        memory: Math.max(5, process.memory + (Math.random() - 0.5) * 10),
        status: Math.random() > 0.95 ? 
          (['active', 'idle', 'sleeping'][Math.floor(Math.random() * 3)] as any) : 
          process.status,
        runtime: process.runtime + 5
      })));

      setSystemMetrics(prev => ({
        cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(20, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 3)),
        diskUsage: Math.max(40, Math.min(85, prev.diskUsage + (Math.random() - 0.5) * 1)),
        networkIn: Math.max(0, prev.networkIn + (Math.random() - 0.5) * 200),
        networkOut: Math.max(0, prev.networkOut + (Math.random() - 0.5) * 150),
        temperature: Math.max(35, Math.min(70, prev.temperature + (Math.random() - 0.5) * 2)),
        uptime: prev.uptime + 5
      }));
    }, 5000);

    return () => clearInterval(updateTimer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="system-monitor">
      {/* System Metrics Header */}
      <div className="monitor-header">
        <div className="header-title">SYSTEM MONITOR</div>
        <div className="header-status">
          <div className="status-indicator active"></div>
          <span>ONLINE</span>
        </div>
      </div>

      {/* System Overview */}
      <div className="system-overview">
        <div className="metric-row">
          <div className="metric-label">CPU</div>
          <div className="metric-bar">
            <div 
              className="metric-fill cpu" 
              style={{ width: `${systemMetrics.cpuUsage}%` }}
            />
            <span className="metric-value">{(systemMetrics.cpuUsage || 0).toFixed(1)}%</span>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">RAM</div>
          <div className="metric-bar">
            <div 
              className="metric-fill memory" 
              style={{ width: `${systemMetrics.memoryUsage}%` }}
            />
            <span className="metric-value">{(systemMetrics.memoryUsage || 0).toFixed(1)}%</span>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-label">DISK</div>
          <div className="metric-bar">
            <div 
              className="metric-fill disk" 
              style={{ width: `${systemMetrics.diskUsage}%` }}
            />
            <span className="metric-value">{(systemMetrics.diskUsage || 0).toFixed(1)}%</span>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric-item">
            <div className="metric-title">NET IN</div>
            <div className="metric-data">{Math.floor(systemMetrics.networkIn)} KB/s</div>
          </div>
          <div className="metric-item">
            <div className="metric-title">NET OUT</div>
            <div className="metric-data">{Math.floor(systemMetrics.networkOut)} KB/s</div>
          </div>
          <div className="metric-item">
            <div className="metric-title">TEMP</div>
            <div className="metric-data">{Math.floor(systemMetrics.temperature)}°C</div>
          </div>
          <div className="metric-item">
            <div className="metric-title">UPTIME</div>
            <div className="metric-data">{formatUptime(systemMetrics.uptime)}</div>
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="process-section">
        <div className="section-header">
          <div className="section-title">ACTIVE PROCESSES</div>
          <div className="process-count">{processes.length}</div>
        </div>

        <div className="process-list">
          <div className="process-headers">
            <div className="header-name">PROCESS</div>
            <div className="header-cpu">CPU%</div>
            <div className="header-mem">MEM</div>
            <div className="header-status">STATUS</div>
          </div>

          {processes.slice(0, 12).map((process) => (
            <div 
              key={process.id} 
              className={`process-item status-${process.status}`}
            >
              <div className="process-name">
                <div className="process-status-dot"></div>
                {process.name}
                <div className="process-pid">PID:{process.pid}</div>
              </div>
              <div className="process-cpu">{(process.cpu || 0).toFixed(1)}%</div>
              <div className="process-memory">{Math.floor(process.memory || 0)}MB</div>
              <div className="process-status">{process.status.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monitor scan lines overlay */}
      <div className="monitor-scanlines"></div>
    </div>
  );
};

export default SystemMonitor;