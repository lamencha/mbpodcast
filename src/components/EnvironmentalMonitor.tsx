import React, { useState, useEffect } from 'react';
import './EnvironmentalMonitor.css';

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  pressure: number;
  airQuality: number;
  co2: number;
  radiation: number;
  windSpeed: number;
  windDirection: number;
}

interface SensorReading {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const EnvironmentalMonitor: React.FC = () => {
  const [envData, setEnvData] = useState<EnvironmentalData>({
    temperature: 22.4,
    humidity: 45.2,
    pressure: 1013.25,
    airQuality: 85,
    co2: 420,
    radiation: 0.12,
    windSpeed: 3.2,
    windDirection: 245
  });

  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize sensor readings
  useEffect(() => {
    const initializeSensors = () => {
      const sensors: SensorReading[] = [
        {
          id: 'temp_01',
          name: 'AMBIENT TEMP',
          value: envData.temperature,
          unit: '°C',
          status: 'normal',
          trend: 'stable'
        },
        {
          id: 'humid_01',
          name: 'HUMIDITY',
          value: envData.humidity,
          unit: '%RH',
          status: 'normal',
          trend: 'down'
        },
        {
          id: 'press_01',
          name: 'PRESSURE',
          value: envData.pressure,
          unit: 'hPa',
          status: 'normal',
          trend: 'up'
        },
        {
          id: 'aqi_01',
          name: 'AIR QUALITY',
          value: envData.airQuality,
          unit: 'AQI',
          status: 'normal',
          trend: 'stable'
        },
        {
          id: 'co2_01',
          name: 'CO₂ LEVEL',
          value: envData.co2,
          unit: 'ppm',
          status: 'normal',
          trend: 'up'
        },
        {
          id: 'rad_01',
          name: 'RADIATION',
          value: envData.radiation,
          unit: 'μSv/h',
          status: 'normal',
          trend: 'stable'
        }
      ];
      setSensorReadings(sensors);
    };

    initializeSensors();
  }, [envData]);

  // Update environmental data periodically
  useEffect(() => {
    const updateTimer = setInterval(() => {
      setEnvData(prev => ({
        temperature: Math.max(15, Math.min(35, prev.temperature + (Math.random() - 0.5) * 0.8)),
        humidity: Math.max(20, Math.min(80, prev.humidity + (Math.random() - 0.5) * 2)),
        pressure: Math.max(980, Math.min(1040, prev.pressure + (Math.random() - 0.5) * 1.5)),
        airQuality: Math.max(50, Math.min(100, prev.airQuality + (Math.random() - 0.5) * 3)),
        co2: Math.max(350, Math.min(600, prev.co2 + (Math.random() - 0.5) * 8)),
        radiation: Math.max(0.05, Math.min(0.25, prev.radiation + (Math.random() - 0.5) * 0.02)),
        windSpeed: Math.max(0, Math.min(15, prev.windSpeed + (Math.random() - 0.5) * 0.6)),
        windDirection: (prev.windDirection + (Math.random() - 0.5) * 10 + 360) % 360
      }));

      setSensorReadings(prev => prev.map(sensor => ({
        ...sensor,
        value: sensor.id === 'temp_01' ? envData.temperature :
               sensor.id === 'humid_01' ? envData.humidity :
               sensor.id === 'press_01' ? envData.pressure :
               sensor.id === 'aqi_01' ? envData.airQuality :
               sensor.id === 'co2_01' ? envData.co2 :
               sensor.id === 'rad_01' ? envData.radiation : sensor.value,
        status: Math.random() > 0.95 ? 
          (['normal', 'warning', 'critical'][Math.floor(Math.random() * 3)] as any) : 
          sensor.status,
        trend: Math.random() > 0.85 ? 
          (['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any) : 
          sensor.trend
      })));

      setLastUpdate(new Date());
    }, 4000);

    return () => clearInterval(updateTimer);
  }, [envData]);

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="environmental-monitor">
      {/* Header with circular design */}
      <div className="env-header">
        <div className="header-circle">
          <div className="circle-inner">
            <div className="env-title">ENV</div>
            <div className="env-subtitle">MONITOR</div>
          </div>
        </div>
        <div className="header-status">
          <div className="status-dot active"></div>
          <div className="last-update">{formatTime(lastUpdate)}</div>
        </div>
      </div>

      {/* Main environmental readings in hexagonal layout */}
      <div className="env-readings">
        <div className="reading-primary">
          <div className="reading-hex">
            <div className="hex-value">{(envData.temperature || 0).toFixed(1)}</div>
            <div className="hex-unit">°C</div>
            <div className="hex-label">TEMP</div>
          </div>
        </div>

        <div className="reading-secondary">
          <div className="reading-item">
            <div className="item-icon">◈</div>
            <div className="item-data">
              <div className="item-value">{(envData.humidity || 0).toFixed(0)}%</div>
              <div className="item-label">HUM</div>
            </div>
          </div>

          <div className="reading-item">
            <div className="item-icon">▲</div>
            <div className="item-data">
              <div className="item-value">{(envData.pressure || 0).toFixed(0)}</div>
              <div className="item-label">hPa</div>
            </div>
          </div>

          <div className="reading-item">
            <div className="item-icon">●</div>
            <div className="item-data">
              <div className="item-value">{envData.airQuality}</div>
              <div className="item-label">AQI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed sensor grid */}
      <div className="sensor-grid">
        {sensorReadings.slice(0, 4).map((sensor) => (
          <div 
            key={sensor.id} 
            className={`sensor-card status-${sensor.status}`}
          >
            <div className="sensor-header">
              <div className="sensor-name">{sensor.name}</div>
              <div className={`trend-indicator trend-${sensor.trend}`}>
                {sensor.trend === 'up' ? '↗' : sensor.trend === 'down' ? '↘' : '→'}
              </div>
            </div>
            <div className="sensor-value">
              {sensor.id === 'temp_01' || sensor.id === 'humid_01' || sensor.id === 'press_01' ? 
                (sensor.value || 0).toFixed(1) : 
                sensor.id === 'rad_01' ? 
                (sensor.value || 0).toFixed(2) : 
                Math.round(sensor.value || 0)
              }
              <span className="sensor-unit">{sensor.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Wind compass */}
      <div className="wind-compass">
        <div className="compass-outer">
          <div className="compass-inner">
            <div 
              className="wind-arrow" 
              style={{ transform: `rotate(${envData.windDirection}deg)` }}
            />
            <div className="compass-center">
              <div className="wind-speed">{(envData.windSpeed || 0).toFixed(1)}</div>
              <div className="wind-unit">m/s</div>
            </div>
          </div>
        </div>
        <div className="compass-direction">{getWindDirection(envData.windDirection)}</div>
      </div>

      {/* Monitor scan pattern overlay */}
      <div className="env-scanlines"></div>
    </div>
  );
};

export default EnvironmentalMonitor;