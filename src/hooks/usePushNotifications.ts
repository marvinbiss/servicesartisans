'use client'

/**
 * Stub — push notifications removed in v2 cleanup.
 * Will be re-implemented with a proper server-side approach.
 */
export default function usePushNotifications(_userId?: string | null) {
  return {
    isSupported: false,
    isSubscribed: false,
    isLoading: false,
    subscribe: async () => false,
    unsubscribe: async () => {},
  }
}
