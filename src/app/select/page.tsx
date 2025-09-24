'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import SpotifyApiService from '@/lib/spotify-api';
import { TransferData } from '@/types/spotify';

interface DataCategory {
  id: keyof TransferData;
  name: string;
  description: string;
  selected: boolean;
  count: number;
  loading: boolean;
}

export default function SelectPage() {
  const router = useRouter();
  const { sourceAccount, setCurrentStep } = useAuthStore();
  const [categories, setCategories] = useState<DataCategory[]>([
    { id: 'playlists', name: 'Playlists', description: 'All your created playlists', selected: true, count: 0, loading: true },
    { id: 'likedSongs', name: 'Liked Songs', description: 'Your saved tracks', selected: true, count: 0, loading: true },
    { id: 'followedArtists', name: 'Followed Artists', description: 'Artists you follow', selected: true, count: 0, loading: true },
    { id: 'savedAlbums', name: 'Saved Albums', description: 'Albums in your library', selected: true, count: 0, loading: true },
    { id: 'followedUsers', name: 'Followed Users', description: 'Other Spotify users you follow', selected: false, count: 0, loading: true }
  ]);
  
  const [loading, setLoading] = useState(false);

  const fetchDataCounts = useCallback(async () => {
    if (!sourceAccount.tokens) return;

    const apiService = new SpotifyApiService(sourceAccount.tokens.access_token);
    
    try {
      // Fetch counts for each category
      const [playlists, likedSongs, followedArtists, savedAlbums] = await Promise.all([
        apiService.getUserPlaylists(1).catch(() => ({ items: [], total: 0 })),
        apiService.getUserSavedTracks(1).catch(() => ({ items: [], total: 0 })),
        apiService.getFollowedArtists(1).catch(() => ({ artists: { items: [], total: 0 } })),
        apiService.getUserSavedAlbums(1).catch(() => ({ items: [], total: 0 }))
      ]);

      setCategories(prev => prev.map(category => {
        let count = 0;
        switch (category.id) {
          case 'playlists':
            count = playlists.total;
            break;
          case 'likedSongs':
            count = likedSongs.total;
            break;
          case 'followedArtists':
            count = followedArtists.artists.total;
            break;
          case 'savedAlbums':
            count = savedAlbums.total;
            break;
          case 'followedUsers':
            count = 0; // This might not be available in API
            break;
        }
        return { ...category, count, loading: false };
      }));
    } catch (error) {
      console.error('Error fetching data counts:', error);
      setCategories(prev => prev.map(category => ({ ...category, loading: false })));
    }
  }, [sourceAccount.tokens]);

  useEffect(() => {
    if (!sourceAccount.isAuthenticated) {
      router.push('/auth');
      return;
    }

    fetchDataCounts();
  }, [sourceAccount, router, fetchDataCounts]);

  const toggleCategory = (categoryId: keyof TransferData) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? { ...category, selected: !category.selected }
        : category
    ));
  };

  const selectAll = () => {
    setCategories(prev => prev.map(category => ({ ...category, selected: true })));
  };

  const deselectAll = () => {
    setCategories(prev => prev.map(category => ({ ...category, selected: false })));
  };

  const handleStartTransfer = () => {
    const selectedCategories = categories.filter(cat => cat.selected).map(cat => cat.id);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    }
    setCurrentStep('transfer');
    router.push('/transfer');
  };

  const selectedCount = categories.filter(cat => cat.selected).length;
  const totalItems = categories.reduce((sum, cat) => cat.selected ? sum + cat.count : sum, 0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Select Data to Transfer
          </h1>
          <p className="text-lg text-gray-300">
            Choose which data categories you want to transfer from your old account to your new one.
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Data Categories</h2>
            <div className="space-x-4">
              <button
                onClick={selectAll}
                className="text-spotify-green hover:text-green-400 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  category.selected
                    ? 'border-spotify-green bg-green-900/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={category.selected}
                      onChange={() => {}}
                      className="w-5 h-5 text-spotify-green bg-gray-700 border-gray-600 rounded focus:ring-spotify-green"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                      <p className="text-gray-400">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {category.loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {category.count.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="bg-spotify-green/10 border border-spotify-green p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">Transfer Summary</h3>
            <p className="text-gray-300">
              {selectedCount} categories selected • {totalItems.toLocaleString()} total items to transfer
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => router.push('/auth')}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            ← Back to Authentication
          </button>
          
          <button
            onClick={handleStartTransfer}
            disabled={selectedCount === 0 || loading}
            className={`font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 ${
              selectedCount > 0 && !loading
                ? 'bg-spotify-green hover:bg-green-600 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Start Transfer ({selectedCount} categories)
          </button>
        </div>
      </div>
    </main>
  );
}
