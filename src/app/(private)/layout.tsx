import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/connexion')
    }
  } catch (e: unknown) {
    // redirect() throws a special NEXT_REDIRECT error — re-throw it
    if (e && typeof e === 'object' && 'digest' in e) {
      throw e
    }
    // Supabase error (down, timeout, malformed cookie) — redirect to login
    redirect('/connexion')
  }

  return <>{children}</>
}
