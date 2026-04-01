'use client'

import { useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: string
  content: string
  created_at: string
  read_at: string | null
}

/**
 * Hook to subscribe to real-time message inserts on a specific conversation.
 * When a new message arrives via Supabase Realtime, it calls `onNewMessage`
 * so the consumer can append it to local state without a full re-fetch.
 *
 * The initial fetch is NOT handled here — the consumer keeps its existing
 * fetch logic. This hook is purely additive (real-time layer on top).
 *
 * Cleanup (unsubscribe) is automatic on unmount or conversationId change.
 */
export function useRealtimeMessages(
  conversationId: string | null | undefined,
  onNewMessage: (message: RealtimeMessage) => void,
  onMessageUpdate?: (message: RealtimeMessage) => void,
) {
  // Use a ref to avoid re-subscribing when callback identity changes
  const onNewMessageRef = useRef(onNewMessage)
  onNewMessageRef.current = onNewMessage

  const onMessageUpdateRef = useRef(onMessageUpdate)
  onMessageUpdateRef.current = onMessageUpdate

  useEffect(() => {
    if (!conversationId) return

    const supabase = getSupabaseClient()
    let channel: RealtimeChannel | null = null

    channel = supabase
      .channel(`realtime-messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessageRef.current(payload.new as RealtimeMessage)
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessageUpdateRef.current?.(payload.new as RealtimeMessage)
        },
      )
      .subscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [conversationId])
}
