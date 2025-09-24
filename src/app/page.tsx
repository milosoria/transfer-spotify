export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">
          Spotify Account Transfer
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl">
          Transfer your playlists, liked songs, followed artists, and more from your old Spotify account to a new one.
        </p>
        <a 
          href="/auth" 
          className="bg-spotify-green hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 inline-block"
        >
          Start Transfer
        </a>
      </div>
    </main>
  )
}
