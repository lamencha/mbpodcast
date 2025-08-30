interface Track {
  name: string;
  artist: string;
  duration: string;
  id: string;
  videoId: string;
}

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelName: string;
  duration: string;
}

export class YouTubePlaylistService {
  // Extract playlist ID from YouTube URL
  static extractPlaylistId(url: string): string {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  }

  // Get playlist data - currently using static data due to CORS restrictions
  // To update: replace the fallback playlist with new songs
  static async fetchPlaylistData(playlistUrl: string): Promise<Track[]> {
    console.log('YouTubePlaylistService: Getting playlist data for:', playlistUrl);
    
    // Due to CORS restrictions, YouTube doesn't allow direct fetching
    // For now, we use the manually curated playlist from your ytplay.md data
    // To add new songs: update the getFallbackPlaylist() method below
    
    console.log('YouTubePlaylistService: Using curated playlist data');
    return this.getFallbackPlaylist();
  }

  // Parse HTML to extract video information
  private static parsePlaylistHTML(html: string): YouTubeVideo[] {
    const videos: YouTubeVideo[] = [];
    
    try {
      // Look for playlistVideoRenderer objects in the HTML
      const rendererRegex = /"playlistVideoRenderer":\s*\{[^}]*"videoId":\s*"([^"]+)"[^}]*\}/g;
      const titleRegex = /"title":\s*\{\s*"runs":\s*\[\{\s*"text":\s*"([^"]+)"/g;
      const channelRegex = /"shortBylineText":\s*\{\s*"runs":\s*\[\{\s*"text":\s*"([^"]+)"/g;
      const durationRegex = /"accessibility":\s*\{\s*"accessibilityData":\s*\{\s*"label":\s*"[^"]*?\s+(\d+)\s+minutes?,\s+(\d+)\s+seconds?"/g;

      let videoMatch;
      const videoIds: string[] = [];
      
      // Extract video IDs
      while ((videoMatch = rendererRegex.exec(html)) !== null) {
        videoIds.push(videoMatch[1]);
      }

      // Extract titles
      const titles: string[] = [];
      let titleMatch;
      while ((titleMatch = titleRegex.exec(html)) !== null) {
        titles.push(titleMatch[1]);
      }

      // Extract channel names
      const channels: string[] = [];
      let channelMatch;
      while ((channelMatch = channelRegex.exec(html)) !== null) {
        channels.push(channelMatch[1]);
      }

      // Extract durations
      const durations: string[] = [];
      let durationMatch;
      while ((durationMatch = durationRegex.exec(html)) !== null) {
        const minutes = parseInt(durationMatch[1]);
        const seconds = parseInt(durationMatch[2]);
        durations.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }

      // Combine all data
      const minLength = Math.min(videoIds.length, titles.length, channels.length);
      for (let i = 0; i < minLength; i++) {
        videos.push({
          videoId: videoIds[i],
          title: titles[i],
          channelName: channels[i],
          duration: durations[i] || '0:00'
        });
      }

    } catch (error) {
      console.error('Error parsing playlist HTML:', error);
    }

    return videos;
  }

  // Clean up video titles (remove unnecessary parts)
  private static cleanTitle(title: string): string {
    return title
      .replace(/\(OFFICIAL VIDEO\)/gi, '')
      .replace(/\(Official Video\)/gi, '')
      .replace(/\(Official Music Video\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Complete YouTube playlist - 17 songs from your playlist
  // All songs extracted from ytplay.md playlist data
  private static getFallbackPlaylist(): Track[] {
    return [
      { name: "DISTANT - The Undying", artist: "Century Media Records", duration: "5:08", id: "1", videoId: "_8mRmkERONI" },
      { name: "dying in designer - LimeWire", artist: "dying in designer", duration: "2:21", id: "2", videoId: "biQt4ApSz80" },
      { name: "Bloom - Withered", artist: "Pure Noise Records", duration: "3:47", id: "3", videoId: "hf2DK1Ic1qA" },
      { name: "ABSOLUTELYCRANKINMYMF'INHOG (feat. Brody)", artist: "Bilmuri", duration: "3:10", id: "4", videoId: "xyQ7RcKyxZM" },
      { name: "Silent Planet - Nervosa", artist: "Solid State Records", duration: "3:49", id: "5", videoId: "QJCzMqwuJW0" },
      { name: "Treacherous Doctor", artist: "Wallows", duration: "2:44", id: "6", videoId: "UCYx5yhbWU0" },
      { name: "Americana", artist: "Khary", duration: "2:37", id: "7", videoId: "p3cf6G2E1l0" },
      { name: "More To Life", artist: "Khary", duration: "3:13", id: "8", videoId: "-mrOOY4wCdE" },
      { name: "She Must Burn - Helena", artist: "She Must Burn", duration: "3:31", id: "9", videoId: "gqd_0RqgpU8" },
      { name: "Say My Peace", artist: "Khary", duration: "3:16", id: "10", videoId: "zoNbkT6hxOo" },
      { name: "Hail The Sun - War Crimes", artist: "Equal Vision Records", duration: "4:49", id: "11", videoId: "RnuBSFV_DWg" },
      { name: "It Follows", artist: "Waterparks", duration: "3:19", id: "12", videoId: "lNQ31jddKVs" },
      { name: "Survive", artist: "Rise Against", duration: "3:41", id: "13", videoId: "YEPrWE04gX8" },
      { name: "Sellouts", artist: "Breathe Carolina", duration: "4:49", id: "14", videoId: "IuAxIR5ajKc" },
      { name: "Ladrones - Instinto Animal", artist: "Ladrones", duration: "4:22", id: "15", videoId: "E2_e_oZp-LI" },
      { name: "SURVIVAL HORROR", artist: "Jakey", duration: "3:07", id: "16", videoId: "7e9QwB-_x5g" },
      { name: "Come out to La", artist: "Don Broco", duration: "3:30", id: "17", videoId: "E77ZstgiWCc" }
    ];
  }
  
  // Helper method to easily add new songs
  static addSong(title: string, artist: string, duration: string, videoId: string): void {
    console.log(`To add "${title}" by ${artist}:`);
    console.log(`1. Edit src/services/youtubePlaylistService.ts`);
    console.log(`2. Add this line to getFallbackPlaylist():`);
    console.log(`{ name: "${title}", artist: "${artist}", duration: "${duration}", id: "${Date.now()}", videoId: "${videoId}" },`);
  }
}