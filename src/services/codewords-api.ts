const API_KEY = import.meta.env.VITE_CODEWORDS_API_KEY || '';
const SERVICE_ID = 'anime_extractor_system_b4fc72d2';
const BASE_URL = 'https://runtime.codewords.ai/run';

export interface StatusResponse {
  success: boolean;
  total: number;
  status_counts: Record<string, number>;
  episodes: Array<{
    _id: string;
    anime_title: string;
    episode_number: number;
    source_type: string;
    status: string;
    dood_url?: string;
    dood_filecode?: string;
  }>;
  series_info: Record<string, {
    thumbnail_url: string;
    language: string;
    source: string;
  }>;
}

export async function extractSeries(request: any) {
  const response = await fetch(`${BASE_URL}/${SERVICE_ID}/extract_series`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!response.ok) throw new Error('Failed to extract');
  return response.json();
}

export async function processNextEpisode() {
  const response = await fetch(`${BASE_URL}/${SERVICE_ID}/process_next`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  if (!response.ok) throw new Error('Failed');
  return response.json();
}

export async function getEpisodeStatus(anime_title?: string, status?: string): Promise<StatusResponse> {
  const response = await fetch(`${BASE_URL}/${SERVICE_ID}/status`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ anime_title, status })
  });
  if (!response.ok) throw new Error('Failed');
  return response.json();
}

export async function updateThumbnail(anime_title: string, thumbnail_url: string) {
  const response = await fetch(`${BASE_URL}/${SERVICE_ID}/update_thumbnail`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ anime_title, thumbnail_url })
  });
  if (!response.ok) throw new Error('Failed');
  return response.json();
}

export async function getAnimeList() {
  const statusData = await getEpisodeStatus(undefined, 'completed');
  const animeMap = new Map();

  for (const episode of statusData.episodes) {
    if (!animeMap.has(episode.anime_title)) {
      const seriesInfo = statusData.series_info[episode.anime_title];
      animeMap.set(episode.anime_title, {
        id: episode.anime_title.toLowerCase().replace(/\s+/g, '-'),
        title: episode.anime_title,
        episodes: 0,
        image: seriesInfo?.thumbnail_url || 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400&h=600&fit=crop',
        rating: 8.5,
        type: 'anime',
        status: 'completed',
        genres: ['Action']
      });
    }
    animeMap.get(episode.anime_title).episodes++;
  }

  return Array.from(animeMap.values());
}

export async function getAnimeEpisodes(animeId: string) {
  const animeTitle = animeId.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const statusData = await getEpisodeStatus(animeTitle, 'completed');
  
  return statusData.episodes
    .filter(ep => ep.dood_url)
    .map(ep => ({
      id: `${animeId}-${ep.episode_number}`,
      animeId,
      number: ep.episode_number,
      title: `Episode ${ep.episode_number}`,
      doodUrl: ep.dood_url!,
      doodFilecode: ep.dood_filecode || '',
      thumbnail: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=170&fit=crop',
      duration: '24:00',
      languages: ['Japanese'],
      subtitles: ['English']
    }))
    .sort((a, b) => a.number - b.number);
} 
