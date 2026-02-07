/**
 * Stub — smart suggestions removed in v2 cleanup.
 */

export interface SuggestedSlot {
  date: string
  time: string
  startTime: string
  endTime: string
  score: number
  reason: string
  slotId: string
  badge: string
  badgeText: string
  [key: string]: unknown
}

export function getRecommendedSlots(
  _slots: unknown[],
  _preferences?: unknown,
  _options?: unknown,
): SuggestedSlot[] {
  return []
}
