// Spotify API types
export interface SpotifyUser {
  id: string;
  display_name: string;
  email?: string;
  images: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
  followers: {
    total: number;
  };
  country?: string;
  product?: string; // 'free' | 'premium'
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  public: boolean;
  collaborative: boolean;
  tracks: {
    total: number;
    items?: SpotifyTrack[];
  };
  images: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
  owner: {
    id: string;
    display_name: string;
  };
}

export interface SpotifyTrack {
  track: {
    id: string;
    name: string;
    uri: string;
    artists: Array<{
      id: string;
      name: string;
    }>;
    album: {
      id: string;
      name: string;
      images: Array<{
        url: string;
        height?: number;
        width?: number;
      }>;
    };
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
  followers: {
    total: number;
  };
  genres: string[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  images: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
  release_date: string;
  total_tracks: number;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface TransferData {
  playlists: SpotifyPlaylist[];
  likedSongs: SpotifyTrack[];
  followedArtists: SpotifyArtist[];
  savedAlbums: SpotifyAlbum[];
  followedUsers: SpotifyUser[];
}

export interface TransferProgress {
  category: string;
  current: number;
  total: number;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  error?: string;
}
