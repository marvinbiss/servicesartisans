/**
 * Cron Job: Send Search Alerts
 * Runs daily to check saved searches and notify users of new results
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify cron secret
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) return false
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: Request) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all active search alerts that need checking
    const { data: alerts, error: alertsError } = await supabaseAdmin
      .from('saved_search_alerts')
      .select('*, profiles:user_id(email, full_name)')
      .eq('is_active', true)
      .in('frequency', ['instant', 'daily'])

    if (alertsError) throw alertsError

    let alertsProcessed = 0
    let notificationsSent = 0

    for (const alert of alerts || []) {
      try {
        // Build search query based on saved filters
        const filters = alert.filters || {}
        let query = supabaseAdmin
          .from('providers')
          .select('id, name, created_at')
          .eq('is_active', true)
          .gt('created_at', alert.last_checked)

        // Apply filters
        if (filters.service) {
          query = query.ilike('specialty', `%${filters.service}%`)
        }
        if (filters.minRating) {
          query = query.gte('rating_average', filters.minRating)
        }
        if (filters.city) {
          query = query.ilike('address_city', `%${filters.city}%`)
        }

        const { data: newProviders, error: searchError } = await query

        if (searchError) {
          console.error(`Error searching for alert ${alert.id}:`, searchError)
          continue
        }

        const newResultsCount = newProviders?.length || 0

        // Update alert with new results count
        await supabaseAdmin
          .from('saved_search_alerts')
          .update({
            last_checked: new Date().toISOString(),
            new_results_count: newResultsCount
          })
          .eq('id', alert.id)

        alertsProcessed++

        // Send notification if there are new results
        if (newResultsCount > 0 && alert.profiles?.email) {
          // Queue email notification
          await sendAlertEmail(
            alert.profiles.email,
            alert.profiles.full_name || 'Client',
            alert.name,
            newResultsCount,
            newProviders || []
          )
          notificationsSent++

          // Update last notified
          await supabaseAdmin
            .from('saved_search_alerts')
            .update({
              last_notified: new Date().toISOString(),
              total_alerts_sent: (alert.total_alerts_sent || 0) + 1
            })
            .eq('id', alert.id)
        }
      } catch (err) {
        console.error(`Error processing alert ${alert.id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Search alerts processed',
      stats: {
        total: alerts?.length || 0,
        processed: alertsProcessed,
        notifications_sent: notificationsSent
      }
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendAlertEmail(
  email: string,
  name: string,
  alertName: string,
  count: number,
  providers: Array<{ id: string; name: string }>
) {
  // Use Resend or another email service
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.log('Email would be sent to:', email)
    console.log('Subject: Nouveaux artisans pour votre recherche')
    return
  }


  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'ServicesArtisans <notifications@servicesartisans.fr>',
        to: email,
        subject: `${count} nouveaux artisans correspondent à votre recherche "${alertName}"`,
        html: `
          <h2>Bonjour ${name},</h2>
          <p>Nous avons trouvé <strong>${count} nouveaux artisans</strong> qui correspondent à votre recherche sauvegardée "${alertName}".</p>

          <h3>Nouveaux artisans :</h3>
          <ul>
            ${providers.slice(0, 5).map(p => `<li>${p.name}</li>`).join('')}
          </ul>
          ${count > 5 ? `<p>Et ${count - 5} autres...</p>` : ''}

          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/recherche?alert=${alertName}"
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Voir les résultats
            </a>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Vous recevez cet email car vous avez créé une alerte de recherche sur ServicesArtisans.
            <br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/espace-client/alertes">Gérer mes alertes</a>
          </p>
        `
      })
    })
  } catch (err) {
    console.error('Error sending email:', err)
  }
}
