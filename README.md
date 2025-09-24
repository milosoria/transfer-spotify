# Spotify Account Transfer

A web application that enables users to transfer data from an old Spotify account to a new one without manual copying.

## Features

- **Dual Account Authentication**: Secure OAuth 2.0 login for both source and destination Spotify accounts
- **Data Category Selection**: Choose which data to transfer:
  - Playlists (with tracks)
  - Liked Songs
  - Followed Artists
  - Saved Albums
  - Followed Users
- **Real-time Progress Tracking**: Monitor transfer progress with detailed status updates
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Spotify Developer account
- Spotify application credentials

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd transfer-spotify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Spotify app credentials:
```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

4. Configure your Spotify app:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Add redirect URIs: `http://localhost:3000/callback` and `https://localhost:3000/callback`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Connect Accounts**: Authenticate both your old (source) and new (destination) Spotify accounts
2. **Select Data**: Choose which categories of data you want to transfer
3. **Transfer**: Monitor real-time progress as your data is transferred
4. **Complete**: Review the transfer results and enjoy your consolidated music library

## API Endpoints

- `/api/auth/login` - Initiate OAuth flow
- `/api/auth/callback` - Handle OAuth callback
- `/api/auth/refresh` - Refresh access tokens

## Technical Stack

- **Frontend**: Next.js 15 with React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Integration**: Spotify Web API
- **Authentication**: OAuth 2.0
- **TypeScript**: Full type safety

## Rate Limiting

The app implements proper rate limiting to respect Spotify's API limits:
- Automatic retry with exponential backoff
- Batch processing for large datasets
- Progress tracking for long-running transfers

## Security

- No permanent storage of user credentials
- Secure token handling with session storage
- HTTPS enforcement in production
- Proper OAuth scope management

## Development

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── lib/                 # Utility functions and services
├── types/               # TypeScript type definitions
└── ...
```

### Key Components

- `SpotifyApiService`: Handles all Spotify API interactions
- `AuthStore`: Manages authentication state
- `ErrorBoundary`: Catches and handles React errors
- `TransferPage`: Orchestrates the transfer process

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Make sure to comply with Spotify's Terms of Service and API guidelines.

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your Spotify app configuration
3. Ensure your redirect URIs are correctly set
4. Check that all required scopes are granted

## Limitations

- Transfer speed is limited by Spotify API rate limits
- Some data may not be transferable due to licensing restrictions
- Regional content availability may affect transfers
- Collaborative playlist permissions are not transferred

## Roadmap

Future enhancements may include:
- Incremental/delta transfers
- Transfer history and logs
- Advanced filtering options
- Bulk account management
- Podcast subscription transfers
