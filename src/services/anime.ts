import { getAnimeList, getAnimeEpisodes } from './codewords-api';

// Types for VideoPlayer compatibility
export interface StreamSource {
  quality: string;
  url: string;
  type: 'hls' | 'mp4';
}

export interface Subtitle {
  language: string;
  url: string;
}

export interface AudioTrack {
  language: string;
  url: string;
}

// Main fetch functions
export async function fetchTrendingAnime() {
  try {
    return await getAnimeList();
  } catch (error) {
    console.error('Failed:', error);
    return [];
  }
}

export async function fetchPopularAnime() {
  return fetchTrendingAnime();
}

export async function fetchRecentlyUpdated() {
  return fetchTrendingAnime();
}

export async function fetchAnimeById(id: string) {
  try {
    const list = await getAnimeList();
    return list.find(a => a.id === id);
  } catch (error) {
    return null;
  }
}

export async function fetchEpisodesByAnimeId(animeId: string) {
  try {
    return await getAnimeEpisodes(animeId);
  } catch (error) {
    return [];
  }
}

export async function fetchEpisodeById(animeId: string, episodeNumber: number) {
  try {
    const episodes = await getAnimeEpisodes(animeId);
    return episodes.find(ep => ep.number === episodeNumber);
  } catch (error) {
    return null;
  }
}

export async function searchAnime(query: string) {
  try {
    const allAnime = await getAnimeList();
    return allAnime.filter(anime => 
      anime.title.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    return [];
  }
}

// VideoPlayer compatibility functions
export async function getStreamUrl(animeId: string, episodeNumber: number): Promise<StreamSource[]> {
  try {
    const episode = await fetchEpisodeById(animeId, episodeNumber);
    
    if (!episode || !episode.doodUrl) {
      return [];
    }

    // Return DoodStream URL as HLS source
    return [
      {
        quality: 'Auto',
        url: episode.doodUrl,
        type: 'hls'
      }
    ];
  } catch (error) {
    console.error('Failed to get stream URL:', error);
    return [];
  }
}

export async function getDownloadUrl(animeId: string, episodeNumber: number): Promise<string> {
  try {
    const episode = await fetchEpisodeById(animeId, episodeNumber);
    return episode?.doodUrl || '';
  } catch (error) {
    console.error('Failed to get download URL:', error);
    return '';
  }
}

// Placeholder functions for VideoPlayer (can be enhanced later)
export async function getSubtitles(animeId: string, episodeNumber: number): Promise<Subtitle[]> {
  // Return empty for now - can be enhanced later
  return [];
}

export async function getAudioTracks(animeId: string, episodeNumber: number): Promise<AudioTrack[]> {
  // Return empty for now - can be enhanced later
  return [];
}
