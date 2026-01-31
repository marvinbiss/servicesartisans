/**
 * Availability Slots API - ServicesArtisans
 * Get availability slots for search results (Doctolib-style)
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

interface TimeSlot {
  time: string
  available: boolean
}

interface DayAvailability {
  date: string
  dayName: string
  dayNumber: number
  month: string
  slots: TimeSlot[]
}

// Generate demo availability
function generateDemoAvailability(artisanId: string, startDate: Date, days: number): DayAvailability[] {
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  const monthNames = ['janv.', 'fevr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'aout', 'sept.', 'oct.', 'nov.', 'dec.']

  // Use artisan ID to create consistent "random" availability
  const seed = artisanId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const availability: DayAvailability[] = []

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)

    const dateStr = currentDate.toISOString().split('T')[0]
    const dayOfWeek = currentDate.getDay()

    const slots: TimeSlot[] = []

    // No slots on Sunday
    if (dayOfWeek !== 0) {
      const allTimes = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']

      // Use seed + day to determine which slots are available
      const dayHash = (seed + i) % 10

      // Some artisans have more availability than others
      if (dayHash < 3) {
        // Few slots
        const selectedTimes = allTimes.filter((_, idx) => (idx + seed) % 5 === 0)
        selectedTimes.slice(0, 2).forEach(time => {
          slots.push({ time, available: true })
        })
      } else if (dayHash < 7) {
        // Medium availability
        const selectedTimes = allTimes.filter((_, idx) => (idx + seed + i) % 3 === 0)
        selectedTimes.slice(0, 4).forEach(time => {
          slots.push({ time, available: true })
        })
      } else {
        // Good availability
        const selectedTimes = allTimes.filter((_, idx) => (idx + seed) % 2 === 0)
        selectedTimes.slice(0, 6).forEach(time => {
          slots.push({ time, available: true })
        })
      }

      // Sort slots
      slots.sort((a, b) => a.time.localeCompare(b.time))
    }

    availability.push({
      date: dateStr,
      dayName: dayNames[dayOfWeek],
      dayNumber: currentDate.getDate(),
      month: monthNames[currentDate.getMonth()],
      slots,
    })
  }

  return availability
}

// GET /api/availability/slots?artisanIds=id1,id2,id3&days=5
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const artisanIdsParam = searchParams.get('artisanIds')
    const days = parseInt(searchParams.get('days') || '5')
    const startDateParam = searchParams.get('startDate')

    if (!artisanIdsParam) {
      return NextResponse.json(
        { error: 'artisanIds is required' },
        { status: 400 }
      )
    }

    const artisanIds = artisanIdsParam.split(',')
    const startDate = startDateParam ? new Date(startDateParam) : new Date()

    // Generate demo availability for each artisan
    const availabilityMap: Record<string, DayAvailability[]> = {}

    for (const artisanId of artisanIds) {
      availabilityMap[artisanId] = generateDemoAvailability(artisanId, startDate, days)
    }

    return NextResponse.json({
      availability: availabilityMap,
      startDate: startDate.toISOString().split('T')[0],
      days,
    })
  } catch (error) {
    logger.error('Availability slots error:', error)
    return NextResponse.json(
      { error: 'Failed to get availability slots' },
      { status: 500 }
    )
  }
}
