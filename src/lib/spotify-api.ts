import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { SpotifyUser, SpotifyPlaylist, SpotifyTrack, SpotifyArtist, SpotifyAlbum } from '@/types/spotify';

class SpotifyApiService {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for rate limiting
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          console.log(`Rate limited. Retrying after ${retryAfter} seconds`);
          await new Promise(resolve => setTimeout(resolve, (retryAfter || 1) * 1000));
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  // User Profile
  async getUserProfile(): Promise<SpotifyUser> {
    const response = await this.client.get('/me');
    return response.data;
  }

  // Playlists
  async getUserPlaylists(limit: number = 50, offset: number = 0): Promise<{ items: SpotifyPlaylist[], total: number }> {
    const response = await this.client.get(`/me/playlists?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async getPlaylistTracks(playlistId: string, limit: number = 100, offset: number = 0): Promise<{ items: SpotifyTrack[], total: number }> {
    const response = await this.client.get(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async createPlaylist(userId: string, name: string, description: string = '', isPublic: boolean = false): Promise<SpotifyPlaylist> {
    const response = await this.client.post(`/users/${userId}/playlists`, {
      name,
      description,
      public: isPublic
    });
    return response.data;
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
    // Spotify API allows max 100 tracks per request
    const chunks = this.chunkArray(trackUris, 100);
    
    for (const chunk of chunks) {
      await this.client.post(`/playlists/${playlistId}/tracks`, {
        uris: chunk
      });
    }
  }

  // Liked Songs (Saved Tracks)
  async getUserSavedTracks(limit: number = 50, offset: number = 0): Promise<{ items: SpotifyTrack[], total: number }> {
    const response = await this.client.get(`/me/tracks?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async saveTracksForUser(trackIds: string[]): Promise<void> {
    // Spotify API allows max 50 tracks per request
    const chunks = this.chunkArray(trackIds, 50);
    
    for (const chunk of chunks) {
      await this.client.put('/me/tracks', {
        ids: chunk
      });
    }
  }

  // Followed Artists
  async getFollowedArtists(limit: number = 50, after?: string): Promise<{ artists: { items: SpotifyArtist[], total: number, cursors: { after?: string } } }> {
    let url = `/me/following?type=artist&limit=${limit}`;
    if (after) url += `&after=${after}`;
    
    const response = await this.client.get(url);
    return response.data;
  }

  async followArtists(artistIds: string[]): Promise<void> {
    // Spotify API allows max 50 artists per request
    const chunks = this.chunkArray(artistIds, 50);
    
    for (const chunk of chunks) {
      await this.client.put('/me/following?type=artist', {
        ids: chunk
      });
    }
  }

  // Saved Albums
  async getUserSavedAlbums(limit: number = 50, offset: number = 0): Promise<{ items: Array<{ album: SpotifyAlbum }>, total: number }> {
    const response = await this.client.get(`/me/albums?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async saveAlbumsForUser(albumIds: string[]): Promise<void> {
    // Spotify API allows max 50 albums per request
    const chunks = this.chunkArray(albumIds, 50);
    
    for (const chunk of chunks) {
      await this.client.put('/me/albums', {
        ids: chunk
      });
    }
  }

  // Followed Users
  async getFollowedUsers(limit: number = 50, offset: number = 0): Promise<{ items: SpotifyUser[], total: number }> {
    // Note: This endpoint might have limitations in the Spotify API
    const response = await this.client.get(`/me/following?type=user&limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async followUsers(userIds: string[]): Promise<void> {
    // Follow users one by one as batch following might not be supported
    for (const userId of userIds) {
      await this.client.put(`/me/following?type=user&ids=${userId}`);
    }
  }

  // Utility function to chunk arrays
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Pagination helper for large datasets
  async getAllItems<T>(
    fetchFunction: (limit: number, offset: number) => Promise<{ items: T[], total: number }>,
    limit: number = 50
  ): Promise<T[]> {
    const allItems: T[] = [];
    let offset = 0;
    let total = 0;

    do {
      const response = await fetchFunction(limit, offset);
      allItems.push(...response.items);
      total = response.total;
      offset += limit;
    } while (allItems.length < total);

    return allItems;
  }
}

export default SpotifyApiService;
