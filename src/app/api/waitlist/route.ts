import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/notifications/email'
import { logger } from '@/lib/logger'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// POST /api/waitlist - Add to waitlist for a specific artisan/date
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      artisanId,
      clientName,
      clientEmail,
      clientPhone,
      preferredDate,
      preferredTimeSlot, // 'morning' | 'afternoon' | 'any'
      serviceName,
    } = body

    if (!artisanId || !clientName || !clientEmail || !preferredDate) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('artisan_id', artisanId)
      .eq('client_email', clientEmail)
      .eq('preferred_date', preferredDate)
      .eq('status', 'waiting')
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Vous êtes déjà inscrit sur la liste d\'attente pour cette date' },
        { status: 400 }
      )
    }

    // Add to waitlist
    const { data: entry, error } = await supabase
      .from('waitlist')
      .insert({
        artisan_id: artisanId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        preferred_date: preferredDate,
        preferred_time_slot: preferredTimeSlot || 'any',
        service_name: serviceName,
        status: 'waiting',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Inscription à la liste d\'attente confirmée',
      waitlistId: entry.id,
    })
  } catch (error) {
    logger.error('Error adding to waitlist:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}

// GET /api/waitlist - Get waitlist entries (for artisan)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const artisanId = searchParams.get('artisanId')

    if (!artisanId) {
      return NextResponse.json(
        { error: 'artisanId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .eq('artisan_id', artisanId)
      .eq('status', 'waiting')
      .gte('preferred_date', new Date().toISOString().split('T')[0])
      .order('preferred_date', { ascending: true })

    if (error) throw error

    return NextResponse.json({ waitlist: data })
  } catch (error) {
    logger.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement' },
      { status: 500 }
    )
  }
}

// DELETE /api/waitlist - Remove from waitlist or notify when slot available
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const waitlistId = searchParams.get('id')
    const action = searchParams.get('action') // 'remove' or 'notify'

    if (!waitlistId) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (action === 'notify') {
      // Get waitlist entry
      const { data: entry } = await supabase
        .from('waitlist')
        .select('*')
        .eq('id', waitlistId)
        .single()

      if (entry) {
        // Get artisan info
        const { data: artisan } = await supabase
          .from('profiles')
          .select('full_name, company_name')
          .eq('id', entry.artisan_id)
          .single()

        // Send notification email
        await sendEmail({
          to: entry.client_email,
          subject: `Un créneau est disponible - ${artisan?.company_name || artisan?.full_name}`,
          html: `
            <h2>Un créneau vient de se libérer !</h2>
            <p>Bonjour ${entry.client_name},</p>
            <p>Bonne nouvelle ! Un créneau correspondant à vos préférences est maintenant disponible.</p>
            <p><strong>Date souhaitée:</strong> ${new Date(entry.preferred_date).toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}</p>
            <p><a href="${SITE_URL}/services">Réservez maintenant</a></p>
          `,
          text: `Un créneau est disponible pour ${entry.preferred_date}. Réservez maintenant sur ${SITE_URL}`,
        })

        // Update status
        await supabase
          .from('waitlist')
          .update({ status: 'notified', notified_at: new Date().toISOString() })
          .eq('id', waitlistId)
      }
    } else {
      // Remove from waitlist
      await supabase
        .from('waitlist')
        .update({ status: 'removed' })
        .eq('id', waitlistId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error processing waitlist:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement' },
      { status: 500 }
    )
  }
}
