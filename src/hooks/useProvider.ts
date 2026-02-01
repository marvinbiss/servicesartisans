'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Provider {
  id: string
  user_id: string
  business_name: string
  siret: string
  description: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  service_area_km: number
  services: string[]
  hourly_rate: number | null
  is_verified: boolean
  is_premium: boolean
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface ProviderStats {
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  totalRevenue: number
  averageRating: number
  reviewCount: number
  responseRate: number
  responseTime: number
}

interface UseProviderReturn {
  provider: Provider | null
  stats: ProviderStats | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  updateProvider: (data: Partial<Provider>) => Promise<void>
}

export function useProvider(): UseProviderReturn {
  const [provider, setProvider] = useState<Provider | null>(null)
  const [stats, setStats] = useState<ProviderStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchProvider = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProvider(null)
        setStats(null)
        return
      }

      // Fetch provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (providerError) {
        if (providerError.code === 'PGRST116') {
          // No provider found
          setProvider(null)
          setStats(null)
          return
        }
        throw providerError
      }

      setProvider(providerData)

      // Fetch provider stats
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('id, status, total_price')
        .eq('provider_id', providerData.id)

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('provider_id', providerData.id)

      if (bookingsData) {
        const completed = bookingsData.filter(b => b.status === 'completed')
        const pending = bookingsData.filter(b => b.status === 'pending')
        const totalRevenue = completed.reduce((sum, b) => sum + (b.total_price || 0), 0)

        const ratings = reviewsData?.map(r => r.rating) || []
        const avgRating = ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0

        setStats({
          totalBookings: bookingsData.length,
          completedBookings: completed.length,
          pendingBookings: pending.length,
          totalRevenue,
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: ratings.length,
          responseRate: 95, // Mock - would calculate from messages
          responseTime: 2, // Mock - hours
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch provider'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const updateProvider = useCallback(async (data: Partial<Provider>) => {
    if (!provider) throw new Error('No provider to update')

    try {
      const { error: updateError } = await supabase
        .from('providers')
        .update(data)
        .eq('id', provider.id)

      if (updateError) throw updateError

      setProvider(prev => prev ? { ...prev, ...data } : null)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update provider')
    }
  }, [provider, supabase])

  useEffect(() => {
    fetchProvider()
  }, [fetchProvider])

  return {
    provider,
    stats,
    isLoading,
    error,
    refetch: fetchProvider,
    updateProvider,
  }
}

export default useProvider
