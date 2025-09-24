# Spotify Account Transfer

> **Personal Project Disclaimer**: This tool was created for personal use to solve my own need to transfer data between Spotify accounts.

A web application that enables users to transfer data from an old Spotify account to a new one without manual copying. Built as a personal solution for migrating music libraries when switching between Spotify accounts.

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
git clone https://github.com/milosoria/transfer-spotify.git
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
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXTAUTH_URL=http://localhost:3000
```

4. Configure your Spotify app:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Add redirect URIs: `http://localhost:3000/api/auth/callback`
   - **Important**: In Development Mode, you must add the email addresses of accounts you want to test with in the User Management section

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
transfer-spotify/
├── .env.local              # Environment variables (not in repo)
├── .eslintrc.json         # ESLint configuration
├── .gitignore             # Git ignore rules
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── MVP_TASK_PLAN.md       # Detailed development task breakdown
├── PRD.md                 # Product Requirements Document
├── README.md              # This file
│
├── src/
│   ├── app/                        # Next.js App Router (Pages & API)
│   │   ├── globals.css            # Global styles and Tailwind imports
│   │   ├── layout.tsx             # Root layout component
│   │   ├── page.tsx               # Landing/home page
│   │   │
│   │   ├── api/                   # API Routes
│   │   │   └── auth/              # Authentication endpoints
│   │   │       ├── login/
│   │   │       │   └── route.ts   # Initiate OAuth flow
│   │   │       ├── callback/
│   │   │       │   └── route.ts   # Handle OAuth callback
│   │   │       └── refresh/
│   │   │           └── route.ts   # Refresh access tokens
│   │   │
│   │   ├── auth/
│   │   │   └── page.tsx           # Dual account authentication page
│   │   ├── callback/
│   │   │   └── page.tsx           # OAuth callback handler (legacy)
│   │   ├── select/
│   │   │   └── page.tsx           # Data category selection page
│   │   └── transfer/
│   │       └── page.tsx           # Transfer progress and execution page
│   │
│   ├── components/                 # Reusable React Components
│   │   ├── AuthButton.tsx         # OAuth authentication button
│   │   ├── ErrorBoundary.tsx      # React error boundary wrapper
│   │   └── LoadingSpinner.tsx     # Loading state component
│   │
│   ├── lib/                       # Utility Functions & Services
│   │   ├── auth-store.ts          # Zustand store for authentication state
│   │   ├── spotify-api.ts         # Spotify Web API service class
│   │   └── spotify-auth.ts        # OAuth utilities and token management
│   │
│   └── types/                     # TypeScript Type Definitions
│       └── spotify.ts             # Spotify API response types
│
└── .next/                         # Next.js build output (auto-generated)
    ├── cache/                     # Build cache
    ├── server/                    # Server-side code
    └── static/                    # Static assets
```

### Key Components & Architecture

#### Core Services (`src/lib/`)

**`spotify-api.ts` - SpotifyApiService Class**
- Centralized Spotify Web API client with axios
- Implements rate limiting and retry logic for 429 responses
- Handles all data fetching: playlists, tracks, artists, albums, users
- Batch processing for large datasets (respects API limits)
- Pagination helpers for endpoints with large result sets

**`spotify-auth.ts` - OAuth Utilities**
- Generates authorization URLs with required scopes
- Exchanges authorization codes for access tokens
- Handles token refresh logic
- Manages OAuth flow state parameters

**`auth-store.ts` - Authentication State Management**
- Zustand store for dual account authentication
- Session storage integration for token persistence
- Manages source and destination account states
- Handles authentication flow steps and navigation

#### Pages & Routes (`src/app/`)

**Authentication Flow**
- `page.tsx` - Landing page with app introduction
- `auth/page.tsx` - Dual account connection interface
- `select/page.tsx` - Data category selection with previews
- `transfer/page.tsx` - Real-time transfer progress monitoring

**API Routes (`src/app/api/auth/`)**
- `login/route.ts` - Initiates OAuth flow with proper scopes
- `callback/route.ts` - Processes OAuth callback and token exchange
- `refresh/route.ts` - Handles automatic token refresh

#### Components (`src/components/`)

**`AuthButton.tsx`**
- Reusable OAuth authentication component
- Supports both source and destination account types
- Handles authentication state and loading indicators

**`ErrorBoundary.tsx`**
- React error boundary for graceful error handling
- Catches JavaScript errors in component tree
- Provides fallback UI and error reporting

**`LoadingSpinner.tsx`**
- Consistent loading state component
- Used throughout the app for async operations

#### Type Definitions (`src/types/`)

**`spotify.ts`**
- Complete TypeScript interfaces for Spotify API responses
- Authentication token types
- Transfer progress and state types
- Ensures type safety across the entire application

## Important Notes

⚠️ **This is a personal tool** created for my own use case. While the code is public for educational purposes:

- **Use at your own risk**: This tool directly modifies your Spotify account data
- **Test thoroughly**: Always test with accounts you're comfortable experimenting with
- **Respect rate limits**: The tool implements rate limiting, but be mindful of API usage
- **Spotify ToS**: Ensure your usage complies with Spotify's Terms of Service and API guidelines
- **Development Mode**: Your Spotify app must be in Development Mode or have users added to the allowlist

## Contributing

While this was built as a personal tool, contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with your own Spotify accounts
5. Submit a pull request

## License

This project is open-sourced for educational purposes. The author is not responsible for any issues arising from its use. Make sure to comply with Spotify's Terms of Service and API guidelines.

## Troubleshooting

**Common Issues:**

1. **403 Forbidden errors**: 
   - Ensure your Spotify app has the user email addresses added in User Management (Development Mode)
   - Verify all required scopes are granted during authentication

2. **Authentication failures**:
   - Check your redirect URIs match exactly: `http://localhost:3000/api/auth/callback`
   - Verify your `.env.local` file has the correct credentials

3. **Transfer issues**:
   - Check the browser console for detailed error messages
   - Ensure both accounts have proper permissions for the data being transferred

## Support

This is a personal project with limited support. If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Spotify app configuration matches the setup instructions
3. Review the troubleshooting section above
4. Open an issue on GitHub with detailed logs (remove any sensitive information)

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
