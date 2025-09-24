// Spotify OAuth utilities
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/callback';

// Required scopes for all transfer operations
const SPOTIFY_SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative', 
  'playlist-modify-private',
  'playlist-modify-public',
  'user-library-read',
  'user-library-modify',
  'user-follow-read',
  'user-follow-modify',
  'user-read-private',
  'user-read-email'
].join(' ');

export function generateAuthUrl(state: string = 'default'): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: state,
    show_dialog: 'true' // Force account selection
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<any> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI
    })
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<any> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }

  return response.json();
}
