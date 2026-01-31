/**
 * Real-Time Availability Hook - ServicesArtisans
 * Provides real-time slot availability with optimistic updates
 * Prevents double bookings with instant UI feedback
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Slot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
  teamMemberId?: string
  teamMemberName?: string
}

export interface UseRealTimeAvailabilityOptions {
  artisanId: string
  month?: string // YYYY-MM format
  enabled?: boolean
}

export interface UseRealTimeAvailabilityReturn {
  slots: Record<string, Slot[]>
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  optimisticallyReserve: (slotId: string) => void
  cancelOptimisticReservation: (slotId: string) => void
  isSlotAvailable: (slotId: string) => boolean
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useRealTimeAvailability({
  artisanId,
  month,
  enabled = true,
}: UseRealTimeAvailabilityOptions): UseRealTimeAvailabilityReturn {
  const [slots, setSlots] = useState<Record<string, Slot[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [optimisticReservations, setOptimisticReservations] = useState<Set<string>>(
    new Set()
  )

  const channelRef = useRef<RealtimeChannel | null>(null)
  const mountedRef = useRef(true)

  // Calculate month range
  const getMonthRange = useCallback(() => {
    const now = new Date()
    const currentMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const [year, monthNum] = currentMonth.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0)
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    }
  }, [month])

  // Fetch slots from API
  const fetchSlots = useCallback(async () => {
    if (!enabled || !artisanId) return

    setIsLoading(true)
    setError(null)

    try {
      const { start } = getMonthRange()
      const response = await fetch(
        `/api/bookings?artisanId=${artisanId}&month=${start}`
      )

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des disponibilités')
      }

      const data = await response.json()

      if (mountedRef.current) {
        // Transform API response to our format
        const slotsMap: Record<string, Slot[]> = {}

        Object.entries(data.slots || {}).forEach(([date, dateSlots]) => {
          slotsMap[date] = (dateSlots as any[]).map((slot) => ({
            id: slot.id,
            date,
            startTime: slot.start,
            endTime: slot.end,
            isAvailable: slot.available && !optimisticReservations.has(slot.id),
            teamMemberId: slot.team_member_id,
            teamMemberName: slot.team_member_name,
          }))
        })

        setSlots(slotsMap)
      }
    } catch (err) {
      console.error('Error fetching slots:', err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [artisanId, enabled, getMonthRange, optimisticReservations])

  // Set up real-time subscription
  useEffect(() => {
    if (!enabled || !artisanId) return

    // Subscribe to availability_slots changes
    const channel = supabase
      .channel(`availability_${artisanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability_slots',
          filter: `artisan_id=eq.${artisanId}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload)

          // Handle different events
          if (payload.eventType === 'UPDATE') {
            const updatedSlot = payload.new as any

            setSlots((prev) => {
              const date = updatedSlot.date
              if (!prev[date]) return prev

              return {
                ...prev,
                [date]: prev[date].map((slot) =>
                  slot.id === updatedSlot.id
                    ? {
                        ...slot,
                        isAvailable:
                          updatedSlot.is_available &&
                          !optimisticReservations.has(slot.id),
                      }
                    : slot
                ),
              }
            })
          } else if (payload.eventType === 'INSERT') {
            // New slot added - refresh
            fetchSlots()
          } else if (payload.eventType === 'DELETE') {
            // Slot deleted - refresh
            fetchSlots()
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [artisanId, enabled, fetchSlots, optimisticReservations])

  // Initial fetch
  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Optimistic reservation (for instant UI feedback)
  const optimisticallyReserve = useCallback((slotId: string) => {
    setOptimisticReservations((prev) => new Set(prev).add(slotId))

    // Update slots to show as unavailable
    setSlots((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((date) => {
        updated[date] = updated[date].map((slot) =>
          slot.id === slotId ? { ...slot, isAvailable: false } : slot
        )
      })
      return updated
    })
  }, [])

  // Cancel optimistic reservation (on booking failure)
  const cancelOptimisticReservation = useCallback(
    (slotId: string) => {
      setOptimisticReservations((prev) => {
        const next = new Set(prev)
        next.delete(slotId)
        return next
      })

      // Refresh to get actual state
      fetchSlots()
    },
    [fetchSlots]
  )

  // Check if slot is available
  const isSlotAvailable = useCallback(
    (slotId: string): boolean => {
      if (optimisticReservations.has(slotId)) return false

      for (const dateSlots of Object.values(slots)) {
        const slot = dateSlots.find((s) => s.id === slotId)
        if (slot) return slot.isAvailable
      }
      return false
    },
    [slots, optimisticReservations]
  )

  return {
    slots,
    isLoading,
    error,
    refresh: fetchSlots,
    optimisticallyReserve,
    cancelOptimisticReservation,
    isSlotAvailable,
  }
}

// Hook for checking single slot availability
export function useSlotAvailability(slotId: string | null) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkAvailability = useCallback(async () => {
    if (!slotId) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)

    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('is_available')
        .eq('id', slotId)
        .single()

      if (error) throw error
      setIsAvailable(data?.is_available ?? false)
    } catch (err) {
      console.error('Error checking slot:', err)
      setIsAvailable(false)
    } finally {
      setIsChecking(false)
    }
  }, [slotId])

  useEffect(() => {
    checkAvailability()
  }, [checkAvailability])

  return { isAvailable, isChecking, recheck: checkAvailability }
}
