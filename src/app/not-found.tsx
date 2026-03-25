import type { Metadata } from 'next'
import NotFoundClient from '@/components/NotFoundClient'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return <NotFoundClient />
}
