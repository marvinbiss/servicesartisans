'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface RealTimeStats {
  profileViews: number
  messagesUnread: number
  bookingsToday: number
  quotesPending: number
  revenue: number
  rating: number
  reviewCount: number
}

interface UseRealTimeStatsOptions {
  providerId: string
  refreshInterval?: number
  enableRealtime?: boolean
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useRealTimeStats({
  providerId,
  refreshInterval = 30000,
  enableRealtime = true,
}: UseRealTimeStatsOptions) {
  const [stats, setStats] = useState<RealTimeStats>({
    profileViews: 0,
    messagesUnread: 0,
    bookingsToday: 0,
    quotesPending: 0,
    revenue: 0,
    rating: 0,
    reviewCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      // Fetch all stats in parallel
      const [
        viewsResult,
        messagesResult,
        bookingsResult,
        quotesResult,
        revenueResult,
        providerResult,
      ] = await Promise.all([
        // Profile views today
        supabase
          .from('analytics_events')
          .select('id', { count: 'exact', head: true })
          .eq('provider_id', providerId)
          .eq('event_type', 'profile_view')
          .gte('created_at', today.toISOString()),

        // Unread messages
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', providerId)
          .is('read_at', null),

        // Bookings today
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('artisan_id', providerId)
          .gte('created_at', today.toISOString()),

        // Pending quotes
        supabase
          .from('quotes')
          .select('id', { count: 'exact', head: true })
          .eq('provider_id', providerId)
          .eq('status', 'pending'),

        // Revenue this month
        supabase
          .from('bookings')
          .select('deposit_amount')
          .eq('artisan_id', providerId)
          .in('status', ['completed', 'confirmed'])
          .gte('created_at', thisMonth.toISOString()),

        // Provider rating
        supabase
          .from('providers')
          .select('rating_average, review_count')
          .eq('id', providerId)
          .single(),
      ])

      const revenue = (revenueResult.data || []).reduce(
        (sum, b) => sum + (b.deposit_amount || 0) / 100,
        0
      )

      setStats({
        profileViews: viewsResult.count || 0,
        messagesUnread: messagesResult.count || 0,
        bookingsToday: bookingsResult.count || 0,
        quotesPending: quotesResult.count || 0,
        revenue,
        rating: providerResult.data?.rating_average || 0,
        reviewCount: providerResult.data?.review_count || 0,
      })

      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'))
    } finally {
      setIsLoading(false)
    }
  }, [providerId])

  // Initial fetch and polling
  useEffect(() => {
    fetchStats()

    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchStats, refreshInterval])

  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealtime) return

    // Subscribe to new bookings
    const bookingsChannel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `artisan_id=eq.${providerId}`,
        },
        () => {
          setStats((prev) => ({
            ...prev,
            bookingsToday: prev.bookingsToday + 1,
          }))
        }
      )
      .subscribe()

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${providerId}`,
        },
        () => {
          setStats((prev) => ({
            ...prev,
            messagesUnread: prev.messagesUnread + 1,
          }))
        }
      )
      .subscribe()

    // Subscribe to new quotes
    const quotesChannel = supabase
      .channel('quotes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quotes',
          filter: `provider_id=eq.${providerId}`,
        },
        () => {
          setStats((prev) => ({
            ...prev,
            quotesPending: prev.quotesPending + 1,
          }))
        }
      )
      .subscribe()

    // Subscribe to profile views (via realtime_activity)
    const activityChannel = supabase
      .channel('activity-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_activity',
          filter: `provider_id=eq.${providerId}`,
        },
        (payload) => {
          const activity = payload.new as { activity_type: string }
          if (activity.activity_type === 'profile_view') {
            setStats((prev) => ({
              ...prev,
              profileViews: prev.profileViews + 1,
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(quotesChannel)
      supabase.removeChannel(activityChannel)
    }
  }, [providerId, enableRealtime])

  return {
    stats,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchStats,
  }
}

export default useRealTimeStats
