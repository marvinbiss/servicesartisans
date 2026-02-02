import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const pricingGetSchema = z.object({
  artisanId: z.string().uuid().optional().nullable(),
  serviceId: z.string().uuid().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  basePrice: z.coerce.number().positive().optional().nullable(),
})

// POST request schema
const pricingPostSchema = z.object({
  artisanId: z.string().uuid(),
  enableDynamicPricing: z.boolean().optional(),
  offPeakDiscount: z.number().min(-50).max(0).optional(),
  weekendSurcharge: z.number().min(0).max(50).optional(),
  lastMinuteSurcharge: z.number().min(0).max(50).optional(),
  holidaySurcharge: z.number().min(0).max(100).optional(),
  customRules: z.array(z.object({
    type: z.string(),
    discount: z.number(),
    description: z.string(),
  })).optional(),
})

interface PricingRule {
  type: 'off_peak' | 'last_minute' | 'holiday' | 'high_demand'
  discount?: number // Negative for discount, positive for surcharge
  description: string
}

// Define pricing rules
const PRICING_RULES = {
  // Off-peak hours: -15%
  offPeak: {
    hours: [8, 9, 16, 17], // 8-10h and 16-18h are off-peak
    discount: -15,
    description: 'Réduction heure creuse',
  },
  // Last minute (within 24h): +10%
  lastMinute: {
    hoursBeforeBooking: 24,
    discount: 10,
    description: 'Réservation dernière minute',
  },
  // Weekend: +5%
  weekend: {
    days: [0, 6], // Sunday, Saturday
    discount: 5,
    description: 'Week-end',
  },
  // French holidays (simplified)
  holidays: [
    '2024-01-01', '2024-05-01', '2024-05-08', '2024-07-14',
    '2024-08-15', '2024-11-01', '2024-11-11', '2024-12-25',
    '2025-01-01', '2025-05-01', '2025-05-08', '2025-07-14',
    '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25',
  ],
}

// Calculate dynamic price
function calculateDynamicPrice(
  basePrice: number,
  bookingDate: string,
  bookingTime: string,
  bookingCreatedAt: Date = new Date()
): { finalPrice: number; appliedRules: PricingRule[] } {
  const appliedRules: PricingRule[] = []
  let totalModifier = 0

  const date = new Date(bookingDate)
  const hour = parseInt(bookingTime.split(':')[0])

  // Check off-peak hours
  if (PRICING_RULES.offPeak.hours.includes(hour)) {
    appliedRules.push({
      type: 'off_peak',
      discount: PRICING_RULES.offPeak.discount,
      description: PRICING_RULES.offPeak.description,
    })
    totalModifier += PRICING_RULES.offPeak.discount
  }

  // Check last minute booking
  const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`)
  const hoursUntilBooking = (bookingDateTime.getTime() - bookingCreatedAt.getTime()) / (1000 * 60 * 60)
  if (hoursUntilBooking < PRICING_RULES.lastMinute.hoursBeforeBooking && hoursUntilBooking > 0) {
    appliedRules.push({
      type: 'last_minute',
      discount: PRICING_RULES.lastMinute.discount,
      description: PRICING_RULES.lastMinute.description,
    })
    totalModifier += PRICING_RULES.lastMinute.discount
  }

  // Check weekend
  if (PRICING_RULES.weekend.days.includes(date.getDay())) {
    appliedRules.push({
      type: 'high_demand',
      discount: PRICING_RULES.weekend.discount,
      description: PRICING_RULES.weekend.description,
    })
    totalModifier += PRICING_RULES.weekend.discount
  }

  // Check holidays
  if (PRICING_RULES.holidays.includes(bookingDate)) {
    appliedRules.push({
      type: 'holiday',
      discount: 20,
      description: 'Jour férié',
    })
    totalModifier += 20
  }

  // Calculate final price
  const finalPrice = Math.round(basePrice * (1 + totalModifier / 100) * 100) / 100

  return { finalPrice, appliedRules }
}

// GET /api/pricing - Get dynamic price for a booking
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      artisanId: searchParams.get('artisanId'),
      serviceId: searchParams.get('serviceId'),
      date: searchParams.get('date'),
      time: searchParams.get('time'),
      basePrice: searchParams.get('basePrice'),
    }
    const result = pricingGetSchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { artisanId, serviceId, date, time, basePrice } = result.data

    let price = basePrice ?? 50 // Default base price

    // If artisanId and serviceId provided, try to get base price from database
    if (artisanId && serviceId) {
      const supabase = await createClient()
      const { data: service } = await supabase
        .from('artisan_services')
        .select('price')
        .eq('artisan_id', artisanId)
        .eq('service_id', serviceId)
        .single()

      if (service?.price) {
        price = service.price
      }
    }

    const { finalPrice, appliedRules } = calculateDynamicPrice(price, date, time)

    return NextResponse.json({
      basePrice: price,
      finalPrice,
      appliedRules,
      savings: price > finalPrice ? Math.round((price - finalPrice) * 100) / 100 : 0,
      surcharge: finalPrice > price ? Math.round((finalPrice - price) * 100) / 100 : 0,
    })
  } catch (error) {
    logger.error('Error calculating price:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul du prix' },
      { status: 500 }
    )
  }
}

// POST /api/pricing - Update artisan's pricing rules
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = pricingPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const {
      artisanId,
      enableDynamicPricing,
      offPeakDiscount,
      weekendSurcharge,
      lastMinuteSurcharge,
      holidaySurcharge,
      customRules,
    } = result.data

    const supabase = await createClient()

    const { error } = await supabase
      .from('artisan_pricing_settings')
      .upsert({
        artisan_id: artisanId,
        enable_dynamic_pricing: enableDynamicPricing ?? true,
        off_peak_discount: offPeakDiscount ?? -15,
        weekend_surcharge: weekendSurcharge ?? 5,
        last_minute_surcharge: lastMinuteSurcharge ?? 10,
        holiday_surcharge: holidaySurcharge ?? 20,
        custom_rules: customRules ?? [],
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'artisan_id',
      })

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Paramètres de tarification mis à jour',
    })
  } catch (error) {
    logger.error('Error updating pricing settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
