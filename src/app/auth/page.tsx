'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, sessionStorageHelper } from '@/lib/auth-store';
import SpotifyApiService from '@/lib/spotify-api';
import AuthButton from '@/components/AuthButton';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    sourceAccount, 
    destinationAccount, 
    setSourceAccount, 
    setDestinationAccount, 
    setCurrentStep 
  } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthCallback = useCallback(async (tokensJson: string, accountType: string) => {
    setLoading(true);
    setError(null);

    try {
      const tokens = JSON.parse(tokensJson);
      
      // Enhanced token debugging
      console.log(`${accountType} account token details:`, {
        scope: tokens.scope,
        hasUserReadPrivate: tokens.scope?.includes('user-read-private'),
        tokenType: tokens.token_type,
        expiresIn: tokens.expires_in,
        hasAccessToken: !!tokens.access_token,
        tokenLength: tokens.access_token?.length,
        hasRefreshToken: !!tokens.refresh_token
      });

      // Compare tokens if both accounts are being processed
      const existingSourceTokens = sessionStorageHelper.getTokens('source');
      const existingDestTokens = sessionStorageHelper.getTokens('destination');

      console.log('Token comparison:', {
        sourceExists: !!existingSourceTokens,
        destExists: !!existingDestTokens,
        currentAccountType: accountType,
        tokensAreDifferent: existingSourceTokens?.access_token !== tokens.access_token
      });

      // Add delay for destination account to avoid conflicts
      if (accountType === 'destination') {
        console.log('Adding delay for destination account...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Store tokens in session storage
      sessionStorageHelper.setTokens(accountType as 'source' | 'destination', tokens);
      
      // Test the token directly before using the service
      console.log(`Testing ${accountType} token directly...`);
      const directResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`Direct API test for ${accountType}:`, {
        status: directResponse.status,
        statusText: directResponse.statusText,
        ok: directResponse.ok
      });

      if (!directResponse.ok) {
        const errorData = await directResponse.text();
        console.error(`Direct API error for ${accountType}:`, errorData);
        throw new Error(`API returned ${directResponse.status}: ${errorData}`);
      }

      // Get user profile using the service
      const apiService = new SpotifyApiService(tokens.access_token);
      const user = await apiService.getUserProfile();
      
      console.log(`User profile received for ${accountType}:`, { 
        id: user.id, 
        display_name: user.display_name,
        product: user.product 
      });

      // Update store
      if (accountType === 'source') {
        setSourceAccount(tokens, user);
      } else {
        setDestinationAccount(tokens, user);
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, '/auth');
    } catch (error) {
      console.error(`Error handling auth callback for ${accountType}:`, error);
      
      // Enhanced error logging
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error(`API Error Details:`, {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
          accountType: accountType
        });
      }
      
      setError(`Failed to complete authentication for ${accountType} account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [setSourceAccount, setDestinationAccount]);

  // Restore authentication state from session storage on mount
  useEffect(() => {
    const restoreAuthState = async () => {
      const sourceTokens = sessionStorageHelper.getTokens('source');
      const destTokens = sessionStorageHelper.getTokens('destination');

      if (sourceTokens && !sourceAccount.isAuthenticated) {
        try {
          const apiService = new SpotifyApiService(sourceTokens.access_token);
          const user = await apiService.getUserProfile();
          setSourceAccount(sourceTokens, user);
          console.log('Restored source account from session storage');
        } catch (error) {
          console.error('Failed to restore source account:', error);
          sessionStorageHelper.clearTokens('source');
        }
      }

      if (destTokens && !destinationAccount.isAuthenticated) {
        try {
          const apiService = new SpotifyApiService(destTokens.access_token);
          const user = await apiService.getUserProfile();
          setDestinationAccount(destTokens, user);
          console.log('Restored destination account from session storage');
        } catch (error) {
          console.error('Failed to restore destination account:', error);
          sessionStorageHelper.clearTokens('destination');
        }
      }
    };

    restoreAuthState();
  }, [sourceAccount.isAuthenticated, destinationAccount.isAuthenticated, setSourceAccount, setDestinationAccount]);

  useEffect(() => {
    // Handle OAuth callback with tokens
    const tokensParam = searchParams.get('tokens');
    const accountType = searchParams.get('account_type');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
      return;
    }

    if (tokensParam && accountType) {
      handleAuthCallback(tokensParam, accountType);
    }
  }, [searchParams, handleAuthCallback]);

  const handleContinue = () => {
    setCurrentStep('select');
    router.push('/select');
  };

  const canContinue = sourceAccount.isAuthenticated && destinationAccount.isAuthenticated;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          Connect Your Accounts
        </h1>
        <p className="text-lg text-gray-300 mb-12">
          Connect both your old and new Spotify accounts to begin the transfer process.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-white mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            Connecting account...
          </div>
        )}

        <div className="space-y-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Step 1: Connect Your Old Account
            </h2>
            <p className="text-gray-300 mb-4">
              This is the account you want to transfer data FROM.
            </p>
            <AuthButton accountType="source" className="w-full" />
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Step 2: Connect Your New Account
            </h2>
            <p className="text-gray-300 mb-4">
              This is the account you want to transfer data TO.
            </p>
            <AuthButton accountType="destination" className="w-full" />
          </div>
        </div>

        {canContinue && (
          <div className="mt-12">
            <button
              onClick={handleContinue}
              className="bg-spotify-green hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200"
            >
              Continue to Data Selection
            </button>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>
      <AuthPageContent />
    </Suspense>
  );
}
