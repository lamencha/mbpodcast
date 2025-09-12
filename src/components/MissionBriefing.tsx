import React, { useState, useEffect } from 'react';
import { authService, type GitHubUser } from '../services/authService';
import { githubApiService, type MissionData } from '../services/githubApiService';
import AuthCallback from './AuthCallback';
import './MissionBriefing.css';

interface MissionBriefingProps {
  className?: string;
}

const MissionBriefing: React.FC<MissionBriefingProps> = ({ className = '' }) => {
  const [mission, setMission] = useState<MissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMission, setEditedMission] = useState<MissionData | null>(null);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [showAuthCallback, setShowAuthCallback] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for OAuth callback in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') && urlParams.has('state')) {
      setShowAuthCallback(true);
    }
  }, []);

  // Load authentication state and mission data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check authentication state
        const authState = authService.getAuthState();
        setUser(authState.user);

        // Load mission data
        const missionData = await githubApiService.getCurrentMission();
        setMission(missionData);
        setEditedMission(missionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mission data');
      } finally {
        setLoading(false);
      }
    };

    if (!showAuthCallback) {
      loadData();
    }
  }, [showAuthCallback]);

  const handleLogin = () => {
    authService.initiateAuth();
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsEditing(false);
  };

  const handleAuthComplete = (success: boolean) => {
    setShowAuthCallback(false);
    if (success) {
      // Reload the component to reflect new auth state
      window.location.reload();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedMission({ ...mission! });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedMission({ ...mission! });
  };

  const handleSave = async () => {
    if (!editedMission) return;

    setSaving(true);
    setError(null); // Clear any previous errors
    
    try {
      const success = await githubApiService.updateMission(editedMission);
      console.log('Mission save result:', success);
      
      if (success) {
        // Update the mission state with the saved data
        const updatedMission = {
          ...editedMission,
          lastUpdated: new Date().toISOString()
        };
        setMission(updatedMission);
        setEditedMission(updatedMission);
        setIsEditing(false);
        setSuccessMessage('Mission briefing saved successfully!');
        console.log('Mission UI updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to save mission data to GitHub');
      }
    } catch (err) {
      console.error('Save mission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save mission');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof MissionData, value: any) => {
    if (!editedMission) return;
    
    setEditedMission({
      ...editedMission,
      [field]: value
    });
  };

  const handleObjectiveChange = (index: number, value: string) => {
    if (!editedMission) return;
    
    const newObjectives = [...editedMission.objectives];
    newObjectives[index] = value;
    setEditedMission({
      ...editedMission,
      objectives: newObjectives
    });
  };

  const addObjective = () => {
    if (!editedMission) return;
    
    setEditedMission({
      ...editedMission,
      objectives: [...editedMission.objectives, '']
    });
  };

  const removeObjective = (index: number) => {
    if (!editedMission) return;
    
    const newObjectives = editedMission.objectives.filter((_, i) => i !== index);
    setEditedMission({
      ...editedMission,
      objectives: newObjectives
    });
  };

  const handleTeamMemberChange = (index: number, value: string) => {
    if (!editedMission) return;
    
    const newSwatTeam = [...editedMission.swatTeam];
    newSwatTeam[index] = value;
    setEditedMission({
      ...editedMission,
      swatTeam: newSwatTeam
    });
  };

  const addTeamMember = () => {
    if (!editedMission) return;
    
    setEditedMission({
      ...editedMission,
      swatTeam: [...(editedMission.swatTeam || []), '']
    });
  };

  const removeTeamMember = (index: number) => {
    if (!editedMission) return;
    
    const newSwatTeam = (editedMission.swatTeam || []).filter((_, i) => i !== index);
    setEditedMission({
      ...editedMission,
      swatTeam: newSwatTeam
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (showAuthCallback) {
    return <AuthCallback onAuthComplete={handleAuthComplete} />;
  }

  if (loading) {
    return (
      <div className={`mission-briefing ${className}`}>
        <div className="mission-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">ACCESSING MISSION DATABASE...</div>
        </div>
      </div>
    );
  }

  if (error && !mission) {
    return (
      <div className={`mission-briefing ${className}`}>
        <div className="mission-error">
          <div className="error-icon">⚠</div>
          <div className="error-text">DATABASE ERROR: {error}</div>
          <button className="retry-button" onClick={() => window.location.reload()}>
            RETRY ACCESS
          </button>
        </div>
      </div>
    );
  }

  if (!mission) return null;

  const displayMission = isEditing ? editedMission! : mission;
  const isAdmin = authService.isAdmin();

  return (
    <div className={`mission-briefing ${className}`}>
      {/* Mission Header */}
      <div className="mission-header">
        <div className="mission-classification">
          <span className="classification-label">CLASSIFICATION:</span>
          <span className={`classification-level level-${displayMission.classification.toLowerCase().replace(' ', '-')}`}>
            {displayMission.classification}
          </span>
        </div>
        
        <div className="mission-title">
          {isEditing ? (
            <input
              type="text"
              value={editedMission?.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="edit-input title-input"
              placeholder="Mission Title"
            />
          ) : (
            <h1>{displayMission.title}</h1>
          )}
        </div>

        <div className="mission-meta">
          <div className="meta-row swat-team-row">
            <span className="meta-label">SWAT TEAM:</span>
            {isEditing ? (
              <div className="swat-team-edit">
                {(editedMission?.swatTeam || []).map((member, index) => (
                  <div key={index} className="team-member-edit">
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                      className="edit-input team-member-input"
                      placeholder="Team Member Name"
                    />
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="remove-team-member"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={addTeamMember} 
                  className="add-team-member"
                >
                  + ADD MEMBER
                </button>
              </div>
            ) : (
              <div className="swat-team-display">
                {(displayMission.swatTeam || []).map((member, index) => (
                  <span key={index} className="team-member">
                    {member}
                    {index < (displayMission.swatTeam || []).length - 1 && ', '}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="meta-row">
            <span className="meta-label">MISSION DATE:</span>
            {isEditing ? (
              <input
                type="text"
                value={editedMission?.missionDate || ''}
                onChange={(e) => handleInputChange('missionDate', e.target.value)}
                className="edit-input"
                placeholder="2049.MM.DD"
              />
            ) : (
              <span className="meta-value">{displayMission.missionDate}</span>
            )}
          </div>
          <div className="meta-row">
            <span className="meta-label">THREAT LEVEL:</span>
            {isEditing ? (
              <select
                value={editedMission?.threatLevel || 'MODERATE'}
                onChange={(e) => handleInputChange('threatLevel', e.target.value)}
                className="edit-select"
              >
                <option value="LOW">LOW</option>
                <option value="MODERATE">MODERATE</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            ) : (
              <span className={`threat-level level-${displayMission.threatLevel.toLowerCase()}`}>
                {displayMission.threatLevel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mission Description */}
      <div className="mission-section">
        <h2 className="section-title">MISSION BRIEFING</h2>
        {isEditing ? (
          <textarea
            value={editedMission?.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="edit-textarea"
            rows={8}
            placeholder="Mission description..."
          />
        ) : (
          <div className="mission-description">
            {displayMission.description.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>

      {/* Mission Objectives */}
      <div className="mission-section">
        <h2 className="section-title">PRIMARY OBJECTIVES</h2>
        <div className="objectives-list">
          {displayMission.objectives.map((objective, index) => (
            <div key={index} className="objective-item">
              <div className="objective-number">{String(index + 1).padStart(2, '0')}</div>
              {isEditing ? (
                <div className="objective-edit">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    className="edit-input objective-input"
                    placeholder="Objective description"
                  />
                  <button
                    onClick={() => removeObjective(index)}
                    className="remove-objective"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="objective-text">{objective}</div>
              )}
            </div>
          ))}
          {isEditing && (
            <button onClick={addObjective} className="add-objective">
              + ADD OBJECTIVE
            </button>
          )}
        </div>
      </div>

      {/* Admin Controls */}
      <div className="mission-footer">
        <div className="mission-timestamp">
          <span className="timestamp-label">LAST UPDATED:</span>
          <span className="timestamp-value">{formatDate(displayMission.lastUpdated)}</span>
        </div>

        <div className="admin-controls">
          {!user ? (
            <button onClick={handleLogin} className="admin-button login-button">
              ADMIN LOGIN
            </button>
          ) : (
            <div className="admin-panel">
              <div className="admin-user">
                <img src={user.avatar_url} alt={user.login} className="admin-avatar" />
                <span className="admin-name">{user.name || user.login}</span>
              </div>
              
              {isAdmin && (
                <div className="admin-actions">
                  {!isEditing ? (
                    <button onClick={handleEdit} className="admin-button edit-button">
                      EDIT MISSION
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="admin-button save-button"
                      >
                        {saving ? 'SAVING...' : 'SAVE'}
                      </button>
                      <button 
                        onClick={handleCancel}
                        className="admin-button cancel-button"
                      >
                        CANCEL
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <button onClick={handleLogout} className="admin-button logout-button">
                LOGOUT
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mission-error-toast">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {successMessage && (
        <div className="mission-success-toast">
          {successMessage}
          <button onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default MissionBriefing;