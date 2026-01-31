'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: error?.message ?? null,
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      })
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { error }
      }

      setState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      })

      return { data }
    },
    [supabase.auth]
  )

  const signUp = useCallback(
    async (email: string, password: string, metadata?: Record<string, unknown>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { error }
      }

      setState((prev) => ({ ...prev, loading: false }))
      return { data }
    },
    [supabase.auth]
  )

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))

    const { error } = await supabase.auth.signOut()

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      return { error }
    }

    setState({
      user: null,
      session: null,
      loading: false,
      error: null,
    })

    router.push('/')
    return { error: null }
  }, [supabase.auth, router])

  const resetPassword = useCallback(
    async (email: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { error }
      }

      setState((prev) => ({ ...prev, loading: false }))
      return { error: null }
    },
    [supabase.auth]
  )

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }, [supabase.auth])

  const signInWithFacebook = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }, [supabase.auth])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithFacebook,
  }
}
