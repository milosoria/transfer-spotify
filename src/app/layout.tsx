import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spotify Account Transfer',
  description: 'Transfer your music data between Spotify accounts',
  keywords: 'spotify, transfer, playlist, music, account, migration',
  authors: [{ name: 'Spotify Transfer App' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-black">
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
