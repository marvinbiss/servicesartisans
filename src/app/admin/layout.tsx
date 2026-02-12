import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Simple wrapper - auth is handled by (dashboard)/layout.tsx
  return <>{children}</>
}
