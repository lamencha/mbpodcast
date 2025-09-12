import { authService } from './authService';

interface MissionData {
  title: string;
  classification: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
  briefingOfficer: string;
  missionDate: string;
  description: string;
  objectives: string[];
  threatLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  lastUpdated: string;
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  content: string;
  encoding: string;
}

class GitHubApiService {
  private readonly REPO_OWNER: string;
  private readonly REPO_NAME: string;
  private readonly MISSION_FILE_PATH = 'current-mission.json';

  constructor() {
    this.REPO_OWNER = import.meta.env.VITE_ADMIN_GITHUB_USERNAME || '';
    this.REPO_NAME = import.meta.env.VITE_GITHUB_REPO_NAME || 'mbpodcast-missions';
  }

  /**
   * Fetch current mission data from our API endpoint
   */
  async getCurrentMission(): Promise<MissionData | null> {
    try {
      const response = await fetch('/api/mission/current');

      if (!response.ok) {
        console.warn(`Mission API error: ${response.status}, using default mission`);
        return this.getDefaultMission();
      }

      const missionData = await response.json() as MissionData;
      return missionData;
    } catch (error) {
      console.error('Error fetching mission:', error);
      return this.getDefaultMission();
    }
  }

  /**
   * Update mission data in GitHub repository
   */
  async updateMission(missionData: MissionData): Promise<boolean> {
    if (!authService.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Ensure repository exists first
      const repoExists = await this.ensureRepository();
      if (!repoExists) {
        throw new Error('Failed to create or access repository');
      }

      // Get current file SHA (required for updates)
      const currentFile = await this.getFileInfo(this.MISSION_FILE_PATH);
      
      // Prepare content
      const updatedData = {
        ...missionData,
        lastUpdated: new Date().toISOString()
      };
      
      // Unicode-safe base64 encoding
      const jsonString = JSON.stringify(updatedData, null, 2);
      const content = btoa(unescape(encodeURIComponent(jsonString)));
      
      // Update file
      const response = await fetch(
        `https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${this.MISSION_FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            ...authService.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Update mission briefing: ${missionData.title}`,
            content: content,
            sha: currentFile?.sha, // Include SHA if file exists
          })
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        console.error('GitHub API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error
        });
        throw new Error(`GitHub API error: ${error.message || response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating mission:', error);
      return false;
    }
  }

  /**
   * Create the missions repository if it doesn't exist
   */
  async ensureRepository(): Promise<boolean> {
    if (!authService.isAdmin()) {
      return false;
    }

    try {
      // Check if repo exists
      const repoResponse = await fetch(
        `https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}`,
        {
          headers: authService.getAuthHeaders()
        }
      );

      if (repoResponse.ok) {
        return true; // Repository already exists
      }

      if (repoResponse.status === 404) {
        // Create repository
        const createResponse = await fetch(
          'https://api.github.com/user/repos',
          {
            method: 'POST',
            headers: {
              ...authService.getAuthHeaders(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: this.REPO_NAME,
              description: 'Mission briefings for Maidenless Behavior Podcast',
              private: true,
              auto_init: true
            })
          }
        );

        if (!createResponse.ok) {
          const error = await createResponse.json();
          throw new Error(`Failed to create repository: ${error.message}`);
        }

        // Wait a moment for repo initialization
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create initial mission file
        const initialMission = this.getDefaultMission();
        return await this.updateMission(initialMission);
      }

      return false;
    } catch (error) {
      console.error('Error ensuring repository:', error);
      return false;
    }
  }

  /**
   * Get file information including SHA
   */
  private async getFileInfo(filePath: string): Promise<GitHubFile | null> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${filePath}`,
        {
          headers: authService.getAuthHeaders()
        }
      );

      if (response.status === 404) {
        return null; // File doesn't exist
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json() as GitHubFile;
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Get default mission data
   */
  private getDefaultMission(): MissionData {
    return {
      title: "Operation: Nexus Infiltration",
      classification: "CONFIDENTIAL",
      briefingOfficer: "Lt. Joshi",
      missionDate: "2049.03.15",
      description: `Intelligence has identified anomalous behavior patterns within the replicant population of Los Angeles. 
      
Recent incidents suggest coordinated activity that may indicate the presence of older Nexus models operating beyond their termination dates. Your mission is to investigate these anomalies and determine the scope of potential security threats.

Key indicators include unauthorized memory implants, emotional responses exceeding baseline parameters, and suspected underground networks facilitating replicant integration into human society.

Approach with extreme caution. These subjects may possess enhanced capabilities and unpredictable behavioral patterns.`,
      objectives: [
        "Locate and identify suspected rogue replicants",
        "Gather intelligence on underground networks", 
        "Document evidence of illegal memory implantation",
        "Assess threat level to public security",
        "Report findings to Command immediately"
      ],
      threatLevel: "MODERATE",
      lastUpdated: new Date().toISOString()
    };
  }
}

export const githubApiService = new GitHubApiService();
export type { MissionData };