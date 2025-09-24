'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import SpotifyApiService from '@/lib/spotify-api';
import { TransferData, TransferProgress } from '@/types/spotify';

export default function TransferPage() {
  const router = useRouter();
  const { sourceAccount, destinationAccount, setCurrentStep } = useAuthStore();
  const [progress, setProgress] = useState<TransferProgress[]>([]);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = useCallback((category: string, updates: Partial<TransferProgress>) => {
    setProgress(prev => prev.map(item =>
      item.category === category
        ? { ...item, ...updates }
        : item
    ));
  }, []);

  const transferCategory = useCallback(async (category: string, sourceApi: SpotifyApiService, destApi: SpotifyApiService) => {
    updateProgress(category, { status: 'in_progress' });

    try {
      switch (category) {
        case 'playlists':
          await transferPlaylists(sourceApi, destApi, category);
          break;
        case 'likedSongs':
          await transferLikedSongs(sourceApi, destApi, category);
          break;
        case 'followedArtists':
          await transferFollowedArtists(sourceApi, destApi, category);
          break;
        case 'savedAlbums':
          await transferSavedAlbums(sourceApi, destApi, category);
          break;
        default:
          break;
      }

      updateProgress(category, { status: 'completed' });
    } catch (error) {
      updateProgress(category, { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }, [updateProgress, sourceAccount.user]);

  const startTransfer = useCallback(async (selectedCategories: string[]) => {
    if (!sourceAccount.tokens || !destinationAccount.tokens) return;

    const sourceApi = new SpotifyApiService(sourceAccount.tokens.access_token);
    const destApi = new SpotifyApiService(destinationAccount.tokens.access_token);

    // Initialize progress tracking
    const initialProgress = selectedCategories.map(category => ({
      category,
      current: 0,
      total: 0,
      status: 'pending' as const
    }));
    setProgress(initialProgress);

    try {
      for (const category of selectedCategories) {
        setCurrentTask(`Transferring ${category}...`);
        await transferCategory(category, sourceApi, destApi);
      }
      
      setIsComplete(true);
      setCurrentTask('Transfer completed!');
      setCurrentStep('complete');
    } catch (error) {
      console.error('Transfer error:', error);
      setError(error instanceof Error ? error.message : 'Transfer failed');
    }
  }, [sourceAccount.tokens, destinationAccount.tokens, sourceAccount.user, destinationAccount.user, setCurrentStep, transferCategory]);

  useEffect(() => {
    if (!sourceAccount.isAuthenticated || !destinationAccount.isAuthenticated) {
      router.push('/auth');
      return;
    }

    const selectedCategories = typeof window !== 'undefined'
      ? JSON.parse(window.sessionStorage.getItem('selectedCategories') || '[]')
      : [];
    if (selectedCategories.length === 0) {
      router.push('/select');
      return;
    }

    startTransfer(selectedCategories);
  }, [sourceAccount, destinationAccount, router, startTransfer]);


  const transferPlaylists = async (sourceApi: SpotifyApiService, destApi: SpotifyApiService, category: string) => {
    const playlists = await sourceApi.getAllItems(
      (limit, offset) => sourceApi.getUserPlaylists(limit, offset)
    );

    // Filter out playlists not owned by the user
    const ownedPlaylists = playlists.filter(playlist => 
      playlist.owner.id === sourceAccount.user?.id
    );

    updateProgress(category, { total: ownedPlaylists.length });

    for (let i = 0; i < ownedPlaylists.length; i++) {
      const playlist = ownedPlaylists[i];
      
      // Get all tracks from the playlist
      const tracks = await sourceApi.getAllItems(
        (limit, offset) => sourceApi.getPlaylistTracks(playlist.id, limit, offset)
      );

      // Create new playlist
      const newPlaylist = await destApi.createPlaylist(
        destinationAccount.user!.id,
        playlist.name,
        playlist.description,
        playlist.public
      );

      // Add tracks to new playlist
      if (tracks.length > 0) {
        const trackUris = tracks.map(track => track.track.uri).filter(Boolean);
        if (trackUris.length > 0) {
          await destApi.addTracksToPlaylist(newPlaylist.id, trackUris);
        }
      }

      updateProgress(category, { current: i + 1 });
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const transferLikedSongs = async (sourceApi: SpotifyApiService, destApi: SpotifyApiService, category: string) => {
    const likedSongs = await sourceApi.getAllItems(
      (limit, offset) => sourceApi.getUserSavedTracks(limit, offset)
    );

    updateProgress(category, { total: likedSongs.length });

    // Process in chunks to respect API limits
    const trackIds = likedSongs.map(track => track.track.id).filter(Boolean);
    const chunkSize = 50;
    
    for (let i = 0; i < trackIds.length; i += chunkSize) {
      const chunk = trackIds.slice(i, i + chunkSize);
      await destApi.saveTracksForUser(chunk);
      
      updateProgress(category, { current: Math.min(i + chunkSize, trackIds.length) });
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const transferFollowedArtists = async (sourceApi: SpotifyApiService, destApi: SpotifyApiService, category: string) => {
    const artists: any[] = [];
    let after: string | undefined;

    // Get all followed artists using cursor pagination
    do {
      const response = await sourceApi.getFollowedArtists(50, after);
      artists.push(...response.artists.items);
      after = response.artists.cursors.after;
    } while (after);

    updateProgress(category, { total: artists.length });

    // Process in chunks
    const artistIds = artists.map(artist => artist.id);
    const chunkSize = 50;
    
    for (let i = 0; i < artistIds.length; i += chunkSize) {
      const chunk = artistIds.slice(i, i + chunkSize);
      await destApi.followArtists(chunk);
      
      updateProgress(category, { current: Math.min(i + chunkSize, artistIds.length) });
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const transferSavedAlbums = async (sourceApi: SpotifyApiService, destApi: SpotifyApiService, category: string) => {
    const savedAlbums = await sourceApi.getAllItems(
      (limit, offset) => sourceApi.getUserSavedAlbums(limit, offset)
    );

    updateProgress(category, { total: savedAlbums.length });

    // Process in chunks
    const albumIds = savedAlbums.map(item => item.album.id).filter(Boolean);
    const chunkSize = 50;
    
    for (let i = 0; i < albumIds.length; i += chunkSize) {
      const chunk = albumIds.slice(i, i + chunkSize);
      await destApi.saveAlbumsForUser(chunk);
      
      updateProgress(category, { current: Math.min(i + chunkSize, albumIds.length) });
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };


  const overallProgress = progress.length > 0 
    ? (progress.reduce((sum, item) => sum + item.current, 0) / progress.reduce((sum, item) => sum + item.total, 0)) * 100
    : 0;

  const completedCategories = progress.filter(item => item.status === 'completed').length;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            {isComplete ? 'Transfer Complete!' : 'Transferring Your Data'}
          </h1>
          <p className="text-lg text-gray-300">
            {isComplete 
              ? 'Your data has been successfully transferred to your new account.'
              : 'Please wait while we transfer your selected data categories.'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <h3 className="font-bold">Transfer Error</h3>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-white">Overall Progress</h2>
              <span className="text-white font-bold">
                {completedCategories}/{progress.length} categories
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-spotify-green h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-gray-400 mt-2">{currentTask}</p>
          </div>

          <div className="space-y-4">
            {progress.map((item) => (
              <div key={item.category} className="border border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {item.category.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-white">
                      {item.current}/{item.total}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'in_progress' ? 'bg-yellow-500' :
                      item.status === 'error' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.status === 'error' ? 'bg-red-500' : 'bg-spotify-green'
                    }`}
                    style={{ width: `${item.total > 0 ? (item.current / item.total) * 100 : 0}%` }}
                  ></div>
                </div>
                {item.error && (
                  <p className="text-red-400 text-sm mt-2">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          {isComplete ? (
            <div className="space-y-4">
              <button
                onClick={() => router.push('/')}
                className="bg-spotify-green hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200"
              >
                Start New Transfer
              </button>
              <p className="text-gray-400">
                Thank you for using Spotify Account Transfer!
              </p>
            </div>
          ) : (
            <p className="text-gray-400">
              Please keep this page open until the transfer is complete.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
