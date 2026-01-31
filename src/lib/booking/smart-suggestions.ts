/**
 * Smart Booking Suggestions - ServicesArtisans
 * AI-powered slot recommendations based on user behavior
 * Increases conversion by suggesting optimal time slots
 */

export interface BookingPattern {
  preferredDayOfWeek: number[] // 0 = Sunday, 6 = Saturday
  preferredTimeRange: { start: number; end: number } // Hours
  avgLeadTime: number // Days in advance
  noShowRate: number
  lastBookingDate?: string
}

export interface SlotScore {
  slotId: string
  date: string
  time: string
  score: number
  reasons: string[]
}

export interface SuggestedSlot {
  slotId: string
  date: string
  startTime: string
  endTime: string
  score: number
  badge?: 'popular' | 'best_value' | 'recommended' | 'last_minute'
  badgeText?: string
}

// Analyze user's booking patterns from history
export function analyzeBookingPatterns(
  bookings: Array<{
    date: string
    time: string
    status: string
    createdAt: string
  }>
): BookingPattern {
  if (bookings.length === 0) {
    return {
      preferredDayOfWeek: [1, 2, 3, 4, 5], // Weekdays by default
      preferredTimeRange: { start: 9, end: 17 },
      avgLeadTime: 3,
      noShowRate: 0,
    }
  }

  // Count day preferences
  const dayCounts: Record<number, number> = {}
  const hourCounts: Record<number, number> = {}
  let totalLeadTime = 0
  let noShows = 0

  bookings.forEach((booking) => {
    const date = new Date(booking.date)
    const day = date.getDay()
    const hour = parseInt(booking.time.split(':')[0])
    const createdDate = new Date(booking.createdAt)
    const leadTime = Math.ceil(
      (date.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    dayCounts[day] = (dayCounts[day] || 0) + 1
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
    totalLeadTime += leadTime

    if (booking.status === 'no_show' || booking.status === 'cancelled_late') {
      noShows++
    }
  })

  // Get top 3 preferred days
  const preferredDayOfWeek = Object.entries(dayCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => parseInt(day))

  // Get preferred time range
  const hours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])
  const topHours = hours.slice(0, 3).map(([h]) => parseInt(h))
  const start = Math.min(...topHours)
  const end = Math.max(...topHours) + 2 // Add 2 hours buffer

  return {
    preferredDayOfWeek:
      preferredDayOfWeek.length > 0 ? preferredDayOfWeek : [1, 2, 3, 4, 5],
    preferredTimeRange: { start, end },
    avgLeadTime: Math.round(totalLeadTime / bookings.length),
    noShowRate: bookings.length > 0 ? noShows / bookings.length : 0,
    lastBookingDate: bookings[0]?.date,
  }
}

// Score available slots based on multiple factors
export function scoreSlots(
  availableSlots: Array<{
    id: string
    date: string
    startTime: string
    endTime: string
    bookingCount?: number // How many times this slot type has been booked
  }>,
  userPattern?: BookingPattern,
  artisanStats?: {
    popularSlots: string[] // Most booked time slots
    highDemandDays: number[] // Days with highest demand
  }
): SuggestedSlot[] {
  const now = new Date()
  const scoredSlots: SuggestedSlot[] = []

  availableSlots.forEach((slot) => {
    let score = 50 // Base score
    let badge: SuggestedSlot['badge'] | undefined
    let badgeText: string | undefined
    const reasons: string[] = []

    const slotDate = new Date(slot.date)
    const dayOfWeek = slotDate.getDay()
    const hour = parseInt(slot.startTime.split(':')[0])
    const daysUntilSlot = Math.ceil(
      (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Factor 1: User preference match
    if (userPattern) {
      if (userPattern.preferredDayOfWeek.includes(dayOfWeek)) {
        score += 15
        reasons.push('Jour préféré')
      }

      if (
        hour >= userPattern.preferredTimeRange.start &&
        hour <= userPattern.preferredTimeRange.end
      ) {
        score += 15
        reasons.push('Horaire préféré')
      }

      // Close to user's typical lead time
      if (
        daysUntilSlot >= userPattern.avgLeadTime - 1 &&
        daysUntilSlot <= userPattern.avgLeadTime + 2
      ) {
        score += 10
      }
    }

    // Factor 2: Popularity (social proof)
    if (artisanStats?.popularSlots.includes(slot.startTime)) {
      score += 10
      reasons.push('Créneau populaire')
      if (!badge) {
        badge = 'popular'
        badgeText = 'Populaire'
      }
    }

    if (artisanStats?.highDemandDays.includes(dayOfWeek)) {
      score += 5
    }

    // Factor 3: Time-based scoring
    // Morning slots (9-12) get slight boost
    if (hour >= 9 && hour <= 12) {
      score += 5
    }

    // Last minute availability (within 48h) - discount incentive
    if (daysUntilSlot <= 2 && daysUntilSlot > 0) {
      score += 8
      if (!badge) {
        badge = 'last_minute'
        badgeText = 'Dernière minute'
      }
    }

    // Not too far in advance (sweet spot: 3-7 days)
    if (daysUntilSlot >= 3 && daysUntilSlot <= 7) {
      score += 5
      if (!badge) {
        badge = 'recommended'
        badgeText = 'Recommandé'
      }
    }

    // Factor 4: Booking history count for this slot
    if (slot.bookingCount && slot.bookingCount > 5) {
      score += Math.min(slot.bookingCount * 0.5, 10)
    }

    // Factor 5: Weekend penalty (unless user prefers weekends)
    if (
      (dayOfWeek === 0 || dayOfWeek === 6) &&
      !userPattern?.preferredDayOfWeek.includes(dayOfWeek)
    ) {
      score -= 5
    }

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score))

    scoredSlots.push({
      slotId: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      score,
      badge,
      badgeText,
    })
  })

  // Sort by score (highest first)
  return scoredSlots.sort((a, b) => b.score - a.score)
}

// Get top N recommended slots
export function getRecommendedSlots(
  availableSlots: Array<{
    id: string
    date: string
    startTime: string
    endTime: string
    bookingCount?: number
  }>,
  userPattern?: BookingPattern,
  artisanStats?: {
    popularSlots: string[]
    highDemandDays: number[]
  },
  limit: number = 3
): SuggestedSlot[] {
  const scored = scoreSlots(availableSlots, userPattern, artisanStats)
  return scored.slice(0, limit)
}

// Generate smart time suggestions for waitlist
export function suggestAlternativeTimes(
  requestedDate: string,
  requestedTime: string,
  availableSlots: Array<{ date: string; startTime: string; endTime: string }>
): Array<{ date: string; time: string; reason: string }> {
  const requested = new Date(`${requestedDate}T${requestedTime}`)
  const requestedHour = requested.getHours()
  const suggestions: Array<{ date: string; time: string; reason: string; diff: number }> =
    []

  availableSlots.forEach((slot) => {
    const slotDate = new Date(`${slot.date}T${slot.startTime}`)
    const slotHour = slotDate.getHours()
    const dayDiff = Math.abs(
      (slotDate.getTime() - requested.getTime()) / (1000 * 60 * 60 * 24)
    )
    const hourDiff = Math.abs(slotHour - requestedHour)

    let reason = ''

    // Same day, different time
    if (slot.date === requestedDate && hourDiff <= 3) {
      reason = 'Même jour, horaire proche'
    }
    // Next day, same time
    else if (dayDiff === 1 && hourDiff <= 1) {
      reason = 'Lendemain, même horaire'
    }
    // Same day of week, next week
    else if (dayDiff === 7 && hourDiff <= 1) {
      reason = 'Semaine suivante, même créneau'
    }
    // Similar time, within 3 days
    else if (dayDiff <= 3 && hourDiff <= 2) {
      reason = 'Dates et horaires proches'
    }

    if (reason) {
      suggestions.push({
        date: slot.date,
        time: slot.startTime,
        reason,
        diff: dayDiff * 24 + hourDiff,
      })
    }
  })

  // Sort by proximity and return top 3
  return suggestions
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 3)
    .map(({ date, time, reason }) => ({ date, time, reason }))
}
