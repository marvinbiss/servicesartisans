'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { getSupabaseClient } from '@/lib/supabase/client'
import { identify, reset } from '@/lib/analytics/posthog'

export default function AuthTracker() {
  useEffect(() => {
    const supabase = getSupabaseClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const { id, email } = session.user
        const userType = session.user.user_metadata?.user_type as string | undefined

        Sentry.setUser({ id, email: email ?? undefined })
        Sentry.setTag('user_type', userType || 'unknown')
        identify(id, { email, user_type: userType })
      } else {
        Sentry.setUser(null)
        Sentry.setTag('user_type', 'anonymous')
        reset()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
