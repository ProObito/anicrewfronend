// src/services/anime.ts
import { getAnimeList, getAnimeEpisodes } from './codewords-api';

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
