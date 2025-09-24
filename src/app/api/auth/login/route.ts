import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl } from '@/lib/spotify-auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accountType = searchParams.get('type') || 'source'; // 'source' or 'destination'
  
  try {
    const authUrl = generateAuthUrl(accountType);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
