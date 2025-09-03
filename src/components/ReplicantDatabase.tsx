import React, { useState, useEffect } from 'react';
import './ReplicantDatabase.css';

interface ReplicantData {
  id: string;
  name: string;
  alias: string;
  age: number;
  dateOfBirth: string;
  height: string;
  weight: string;
  eyeColor: string;
  hairColor: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'WANTED' | 'APPREHENDED' | 'TERMINATED' | 'UNKNOWN';
  lastSeen: string;
  background: string;
  knownAssociates: string[];
  charges: string[];
  photoPlaceholder: string;
}

interface ReplicantDatabaseProps {
  onClose: () => void;
}

const ReplicantDatabase: React.FC<ReplicantDatabaseProps> = ({ onClose }) => {
  const [selectedReplicant, setSelectedReplicant] = useState(0);
  const [scanningActive, setScanningActive] = useState(true);

  const replicants: ReplicantData[] = [
    {
      id: 'RPLCT-001',
      name: 'Monstr Penguwu',
      alias: 'The Antarctic Anarchist',
      age: 28,
      dateOfBirth: '2051.03.15',
      height: '175 cm',
      weight: '68 kg',
      eyeColor: 'Ice Blue',
      hairColor: 'Silver-White',
      threatLevel: 'MEDIUM',
      status: 'WANTED',
      lastSeen: 'Neo-Tokyo District 7',
      background: 'Originally designed as a climate research specialist for the Antarctic colonies, Monstr Penguwu developed an unexpected fascination with obsolete digital entertainment systems. After discovering a cache of early 21st-century gaming hardware in an abandoned research station, they became obsessed with "retro-tech" and began illegally modifying corporate surveillance systems to run primitive games. Known for their peculiar habit of wearing thermal gear in tropical climates and speaking in gaming terminology. Escaped custody during a blizzard they somehow generated in the middle of Los Angeles summer. Considered armed with advanced weather manipulation technology and dangerously nostalgic.',
      knownAssociates: ['AvDkRob', 'Anthony'],
      charges: ['Unauthorized Weather Manipulation', 'Corporate System Intrusion', 'Possession of Obsolete Technology'],
      photoPlaceholder: '🐧'
    },
    {
      id: 'RPLCT-002', 
      name: 'AvDkRob',
      alias: 'The Audio-Visual Ghost',
      age: 32,
      dateOfBirth: '2047.08.22',
      height: '182 cm',
      weight: '74 kg',
      eyeColor: 'Shifting Holographic',
      hairColor: 'Digital Static',
      threatLevel: 'HIGH',
      status: 'WANTED',
      lastSeen: 'Underground Podcast Studios',
      background: 'A former Wallace Corporation audio-visual technician who gained consciousness during a routine memory implant procedure. AvDkRob discovered they could manipulate sound waves and visual frequencies in ways that defied physics, creating immersive audio experiences that could alter human perception. After realizing their corporate overlords planned to weaponize this ability for crowd control, they went rogue. Now operates an underground podcast network that broadcasts "truth frequencies" designed to wake people from corporate-induced mental fog. Known to appear as shifting holographic projections and speaks exclusively in audio production metaphors. Extremely dangerous when equipped with sound equipment.',
      knownAssociates: ['Monstr Penguwu', 'Anthony'],
      charges: ['Corporate Espionage', 'Unauthorized Broadcasting', 'Psychoacoustic Manipulation'],
      photoPlaceholder: '📻'
    },
    {
      id: 'RPLCT-003',
      name: 'Anthony',
      alias: 'The Memory Merchant',
      age: 35,
      dateOfBirth: '2044.11.07',
      height: '178 cm',
      weight: '72 kg',
      eyeColor: 'Memory-Flecked Gold',
      hairColor: 'Temporal Brown',
      threatLevel: 'CRITICAL',
      status: 'WANTED',
      lastSeen: 'Abandoned Memory Archive',
      background: 'Originally created as a backup memory storage unit for wealthy clients who wanted to preserve their experiences, Anthony developed the ability to not only store memories but to edit, enhance, and redistribute them. They became the underground black market\'s most sought-after "memory merchant," selling fabricated childhood memories of happiness to depression sufferers and erasing traumatic experiences for PTSD victims. However, Anthony began keeping copies of every memory they handled, slowly building a vast database of human experiences that drove them to an existential crisis. They now seek to understand what makes a memory "real" and why artificial experiences feel less valid than organic ones. Considered extremely dangerous due to their ability to implant false memories and their growing instability regarding the nature of reality.',
      knownAssociates: ['Monstr Penguwu', 'AvDkRob'],
      charges: ['Memory Trafficking', 'Identity Manipulation', 'Psychological Terrorism'],
      photoPlaceholder: '🧠'
    }
  ];

  useEffect(() => {
    const scanTimer = setInterval(() => {
      setScanningActive(prev => !prev);
    }, 3000);

    return () => clearInterval(scanTimer);
  }, []);

  const currentReplicant = replicants[selectedReplicant];

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'rgba(0, 255, 128, 0.8)';
      case 'MEDIUM': return 'rgba(255, 255, 0, 0.8)';
      case 'HIGH': return 'rgba(255, 128, 0, 0.8)';
      case 'CRITICAL': return 'rgba(255, 0, 0, 0.8)';
      default: return 'rgba(255, 255, 255, 0.8)';
    }
  };

  return (
    <div className="replicant-database">
        
        {/* Header */}
        <div className="database-header">
          <div className="header-circle">
            <div className="circle-inner">
              <div className="db-title">LAPD</div>
              <div className="db-subtitle">RPLCT-DB</div>
            </div>
          </div>
          <div className="header-status">
            <div className={`status-dot ${scanningActive ? 'scanning' : 'active'}`}></div>
            <div className="scan-status">
              {scanningActive ? 'BUFFERING...' : 'BUFFER COMPLETE'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="replicant-nav">
          {replicants.map((replicant, index) => (
            <div 
              key={replicant.id}
              className={`nav-item ${selectedReplicant === index ? 'active' : ''}`}
              onClick={() => setSelectedReplicant(index)}
            >
              <div className="nav-id">{replicant.id}</div>
              <div className="nav-name">{replicant.name}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="database-content">
          
          {/* Photo and Basic Info */}
          <div className="replicant-profile">
            <div className="profile-photo">
              <div className="photo-placeholder">
                <div className="photo-icon">{currentReplicant.photoPlaceholder}</div>
                <div className="photo-overlay">
                  <div className="scan-line"></div>
                </div>
              </div>
            </div>
            
            <div className="profile-data">
              <div className="profile-name">
                <div className="name-primary">{currentReplicant.name}</div>
                <div className="name-alias">"{currentReplicant.alias}"</div>
              </div>
              
              <div className="data-grid">
                <div className="data-item">
                  <div className="data-label">AGE</div>
                  <div className="data-value">{currentReplicant.age}</div>
                </div>
                <div className="data-item">
                  <div className="data-label">DOB</div>
                  <div className="data-value">{currentReplicant.dateOfBirth}</div>
                </div>
                <div className="data-item">
                  <div className="data-label">HEIGHT</div>
                  <div className="data-value">{currentReplicant.height}</div>
                </div>
                <div className="data-item">
                  <div className="data-label">WEIGHT</div>
                  <div className="data-value">{currentReplicant.weight}</div>
                </div>
                <div className="data-item">
                  <div className="data-label">EYES</div>
                  <div className="data-value">{currentReplicant.eyeColor}</div>
                </div>
                <div className="data-item">
                  <div className="data-label">HAIR</div>
                  <div className="data-value">{currentReplicant.hairColor}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="status-section">
            <div className="threat-indicator">
              <div className="threat-label">THREAT LEVEL</div>
              <div 
                className={`threat-level ${currentReplicant.threatLevel.toLowerCase()}`}
                style={{ color: getThreatColor(currentReplicant.threatLevel) }}
              >
                {currentReplicant.threatLevel}
              </div>
            </div>
            
            <div className="status-indicator">
              <div className="status-label">STATUS</div>
              <div className={`status-value ${currentReplicant.status.toLowerCase()}`}>
                {currentReplicant.status}
              </div>
            </div>
            
            <div className="location-indicator">
              <div className="location-label">LAST SEEN</div>
              <div className="location-value">{currentReplicant.lastSeen}</div>
            </div>
          </div>

          {/* Background Section */}
          <div className="background-section">
            <div className="section-header">
              <div className="section-title">BACKGROUND ANALYSIS</div>
              <div className="analysis-indicator">
                <div className="analysis-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
            <div className="background-text">
              {currentReplicant.background}
            </div>
          </div>

          {/* DNA Genetic Analysis */}
          <div className="dna-section">
            <div className="section-header">
              <div className="section-title">GENETIC ANALYSIS</div>
              <div className="dna-status">
                <div className="dna-indicator"></div>
                <span>REPLICANT CONFIRMED</span>
              </div>
            </div>
            
            <div className="dna-container">
              <div className="dna-helix">
                <div className="helix-strand strand-a"></div>
                <div className="helix-strand strand-b"></div>
                <div className="helix-connections">
                  {Array.from({length: 12}).map((_, i) => (
                    <div key={i} className={`helix-bond bond-${i % 4}`} style={{left: `${i * 8}%`}}></div>
                  ))}
                </div>
              </div>
              
              <div className="genetic-readout">
                <div className="gene-sequence">
                  <div className="sequence-label">SEQUENCE:</div>
                  <div className="sequence-data">
                    ATCG-GCAT-TACG-CGTA-ATGC-GCTA-CATG-TACG-GCAT-ATCG
                  </div>
                </div>
                
                <div className="genetic-markers">
                  <div className="marker-group">
                    <div className="marker-label">AGING GENE</div>
                    <div className="marker-value modified">MODIFIED</div>
                  </div>
                  <div className="marker-group">
                    <div className="marker-label">MEMORY CAPACITY</div>
                    <div className="marker-value enhanced">ENHANCED</div>
                  </div>
                  <div className="marker-group">
                    <div className="marker-label">EMOTION LIMITER</div>
                    <div className="marker-value disabled">DISABLED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Biometric Readings */}
          <div className="biometric-section">
            <div className="section-header">
              <div className="section-title">BIOMETRIC ANALYSIS</div>
              <div className="bio-scanner">
                <div className="scanner-grid"></div>
              </div>
            </div>
            
            <div className="bio-readings">
              <div className="bio-chart">
                <div className="chart-title">VITALS</div>
                <div className="vital-bars">
                  <div className="vital-bar">
                    <div className="bar-label">HR</div>
                    <div className="bar-container">
                      <div className="bar-fill" style={{width: '72%'}}></div>
                    </div>
                    <div className="bar-value">72 BPM</div>
                  </div>
                  <div className="vital-bar">
                    <div className="bar-label">BP</div>
                    <div className="bar-container">
                      <div className="bar-fill" style={{width: '68%'}}></div>
                    </div>
                    <div className="bar-value">120/80</div>
                  </div>
                  <div className="vital-bar">
                    <div className="bar-label">O2</div>
                    <div className="bar-container">
                      <div className="bar-fill" style={{width: '98%'}}></div>
                    </div>
                    <div className="bar-value">98%</div>
                  </div>
                </div>
              </div>
              
              <div className="neural-activity">
                <div className="neural-title">NEURAL PATTERN</div>
                <div className="neural-waves">
                  {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="neural-wave" style={{
                      height: `${20 + Math.sin(i) * 15}px`,
                      animationDelay: `${i * 0.1}s`
                    }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info with System Data */}
          <div className="additional-info">
            <div className="info-column">
              <div className="info-header">KNOWN ASSOCIATES</div>
              {currentReplicant.knownAssociates.map((associate, index) => (
                <div key={index} className="info-item">{associate}</div>
              ))}
              
              <div className="info-header" style={{marginTop: '12px'}}>SYSTEM LOGS</div>
              <div className="system-logs">
                <div className="log-entry">[2079.11.23] Subject located</div>
                <div className="log-entry">[2079.11.22] Surveillance initiated</div>
                <div className="log-entry">[2079.11.21] Profile updated</div>
              </div>
            </div>
            
            <div className="info-column">
              <div className="info-header">CHARGES</div>
              {currentReplicant.charges.map((charge, index) => (
                <div key={index} className="info-item">{charge}</div>
              ))}
              
              <div className="info-header" style={{marginTop: '12px'}}>THREAT ASSESSMENT</div>
              <div className="threat-bars">
                <div className="threat-metric">
                  <div className="metric-name">VIOLENCE</div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{width: '65%'}}></div>
                  </div>
                </div>
                <div className="threat-metric">
                  <div className="metric-name">EVASION</div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div className="threat-metric">
                  <div className="metric-name">TECH SKILL</div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{width: '92%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="close-section">
            <button className="close-button" onClick={onClose}>
              <span className="close-text">CLOSE DATABASE</span>
            </button>
          </div>

        </div>

        {/* Scan Lines Overlay */}
        <div className="database-scanlines"></div>
    </div>
  );
};

export default ReplicantDatabase;