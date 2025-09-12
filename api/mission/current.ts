import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const REPO_OWNER = process.env.VITE_ADMIN_GITHUB_USERNAME;
    const REPO_NAME = process.env.VITE_GITHUB_REPO_NAME || 'mbpodcast-missions';
    const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN; // Use Personal Access Token
    
    if (!REPO_OWNER || !GITHUB_TOKEN) {
      console.error('Missing GitHub configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Fetch mission data from private GitHub repository
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/current-mission.json`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    if (response.status === 404) {
      // Repository or file doesn't exist, return default mission
      const defaultMission = {
        title: "Operation: Nexus Infiltration",
        classification: "CONFIDENTIAL",
        swatTeam: ["Lt. Joshi", "Officer Chen"],
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
      
      return res.status(200).json(defaultMission);
    }

    if (!response.ok) {
      console.error('GitHub API error:', response.status, response.statusText);
      return res.status(response.status).json({ error: 'Failed to fetch mission data' });
    }

    const fileData = await response.json();
    // Unicode-safe base64 decoding
    const content = decodeURIComponent(escape(atob(fileData.content)));
    const missionData = JSON.parse(content);

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    return res.status(200).json(missionData);
  } catch (error) {
    console.error('Mission fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}