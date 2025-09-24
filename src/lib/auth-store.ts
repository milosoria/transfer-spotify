import { create } from 'zustand';
import { AuthTokens, SpotifyUser } from '@/types/spotify';

interface AccountData {
  tokens: AuthTokens | null;
  user: SpotifyUser | null;
  isAuthenticated: boolean;
}

interface AuthState {
  sourceAccount: AccountData;
  destinationAccount: AccountData;
  currentStep: 'landing' | 'connect-source' | 'connect-destination' | 'verify' | 'select' | 'transfer' | 'complete';
  
  // Actions
  setSourceAccount: (tokens: AuthTokens, user: SpotifyUser) => void;
  setDestinationAccount: (tokens: AuthTokens, user: SpotifyUser) => void;
  clearSourceAccount: () => void;
  clearDestinationAccount: () => void;
  setCurrentStep: (step: AuthState['currentStep']) => void;
  reset: () => void;
}

const initialAccountData: AccountData = {
  tokens: null,
  user: null,
  isAuthenticated: false
};

export const useAuthStore = create<AuthState>((set) => ({
  sourceAccount: initialAccountData,
  destinationAccount: initialAccountData,
  currentStep: 'landing',

  setSourceAccount: (tokens, user) => set((state) => ({
    sourceAccount: {
      tokens,
      user,
      isAuthenticated: true
    }
  })),

  setDestinationAccount: (tokens, user) => set((state) => ({
    destinationAccount: {
      tokens,
      user,
      isAuthenticated: true
    }
  })),

  clearSourceAccount: () => set((state) => ({
    sourceAccount: initialAccountData
  })),

  clearDestinationAccount: () => set((state) => ({
    destinationAccount: initialAccountData
  })),

  setCurrentStep: (step) => set({ currentStep: step }),

  reset: () => set({
    sourceAccount: initialAccountData,
    destinationAccount: initialAccountData,
    currentStep: 'landing'
  })
}));

// Session storage helpers
export const sessionStorageHelper = {
  setTokens: (accountType: 'source' | 'destination', tokens: AuthTokens) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(`${accountType}_tokens`, JSON.stringify(tokens));
    }
  },

  getTokens: (accountType: 'source' | 'destination'): AuthTokens | null => {
    if (typeof window !== 'undefined') {
      const tokens = window.sessionStorage.getItem(`${accountType}_tokens`);
      return tokens ? JSON.parse(tokens) : null;
    }
    return null;
  },

  clearTokens: (accountType: 'source' | 'destination') => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(`${accountType}_tokens`);
    }
  },

  clearAllTokens: () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('source_tokens');
      window.sessionStorage.removeItem('destination_tokens');
    }
  }
};
