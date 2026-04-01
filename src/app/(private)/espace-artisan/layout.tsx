import { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function EspaceArtisanLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      {/* Skip link — visible uniquement au focus clavier */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-blue-700 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold focus:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Aller au contenu principal
      </a>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </>
  )
}
