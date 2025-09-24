import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/spotify-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const tokens = await refreshAccessToken(refresh_token);
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
