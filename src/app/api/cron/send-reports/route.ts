/**
 * Cron Job: Send Scheduled Reports
 * Runs daily to generate and send scheduled reports to providers
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
    // Get all scheduled reports that need to run
    const now = new Date()
    const { data: reports, error: reportsError } = await supabaseAdmin
      .from('scheduled_reports')
      .select('*, profiles:provider_id(email, full_name)')
      .eq('is_active', true)
      .lte('next_run', now.toISOString())

    if (reportsError) throw reportsError

    let reportsGenerated = 0
    let reportsSent = 0

    for (const report of reports || []) {
      try {
        // Generate report data
        const reportData = await generateReportData(report.provider_id, report.config)

        // Create report history entry
        const { data: historyEntry, error: historyError } = await supabaseAdmin
          .from('report_history')
          .insert({
            scheduled_report_id: report.id,
            provider_id: report.provider_id,
            report_type: report.config?.type || 'performance',
            period_start: reportData.periodStart,
            period_end: reportData.periodEnd,
            status: 'generating'
          })
          .select()
          .single()

        if (historyError) throw historyError

        reportsGenerated++

        // Generate PDF/CSV content
        const content = generateReportContent(reportData, report.config?.format || 'pdf')

        // Send to recipients
        for (const recipient of report.recipients || []) {
          await sendReportEmail(
            recipient,
            report.name,
            reportData,
            content
          )
          reportsSent++
        }

        // Update report history
        await supabaseAdmin
          .from('report_history')
          .update({
            status: 'completed',
            delivered_at: new Date().toISOString()
          })
          .eq('id', historyEntry.id)

        // Calculate next run date
        const nextRun = calculateNextRun(report.frequency)

        // Update scheduled report
        await supabaseAdmin
          .from('scheduled_reports')
          .update({
            last_run: now.toISOString(),
            next_run: nextRun.toISOString()
          })
          .eq('id', report.id)

      } catch (err) {
        console.error(`Error processing report ${report.id}:`, err)

        // Mark as failed
        await supabaseAdmin
          .from('report_history')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown error'
          })
          .eq('scheduled_report_id', report.id)
          .eq('status', 'generating')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled reports processed',
      stats: {
        total: reports?.length || 0,
        generated: reportsGenerated,
        sent: reportsSent
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

async function generateReportData(
  providerId: string,
  _config: Record<string, unknown>
): Promise<{
  periodStart: string
  periodEnd: string
  summary: Record<string, number>
  bookings: Array<Record<string, unknown>>
  revenue: number
}> {
  const periodEnd = new Date()
  const periodStart = new Date()

  // Default to monthly period
  periodStart.setMonth(periodStart.getMonth() - 1)

  // Fetch bookings
  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('artisan_id', providerId)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())

  // Fetch views
  const { data: views } = await supabaseAdmin
    .from('analytics_events')
    .select('id')
    .eq('provider_id', providerId)
    .eq('event_type', 'profile_view')
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())

  // Calculate revenue
  const revenue = (bookings || [])
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.deposit_amount || 0) / 100, 0)

  return {
    periodStart: periodStart.toISOString().split('T')[0],
    periodEnd: periodEnd.toISOString().split('T')[0],
    summary: {
      bookings: bookings?.length || 0,
      views: views?.length || 0,
      revenue: revenue,
      conversionRate: views?.length ? ((bookings?.length || 0) / views.length) * 100 : 0
    },
    bookings: bookings || [],
    revenue
  }
}

function generateReportContent(
  data: Awaited<ReturnType<typeof generateReportData>>,
  format: string
): string {
  if (format === 'csv') {
    return `Période,${data.periodStart} - ${data.periodEnd}
Réservations,${data.summary.bookings}
Vues,${data.summary.views}
Revenus,${data.revenue.toFixed(2)} EUR
Taux de conversion,${data.summary.conversionRate.toFixed(1)}%`
  }

  // Return HTML for PDF
  return `
    <h1>Rapport de Performance</h1>
    <p>Période: ${data.periodStart} - ${data.periodEnd}</p>
    <table>
      <tr><td>Réservations</td><td>${data.summary.bookings}</td></tr>
      <tr><td>Vues du profil</td><td>${data.summary.views}</td></tr>
      <tr><td>Revenus</td><td>${data.revenue.toFixed(2)} EUR</td></tr>
      <tr><td>Taux de conversion</td><td>${data.summary.conversionRate.toFixed(1)}%</td></tr>
    </table>
  `
}

function calculateNextRun(frequency: string): Date {
  const next = new Date()
  next.setHours(8, 0, 0, 0)

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    default:
      next.setDate(next.getDate() + 7)
  }

  return next
}

async function sendReportEmail(
  email: string,
  reportName: string,
  data: Awaited<ReturnType<typeof generateReportData>>,
  _content: string
) {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.log('Report email would be sent to:', email)
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
        from: 'ServicesArtisans <rapports@servicesartisans.fr>',
        to: email,
        subject: `Votre rapport "${reportName}" - ${data.periodStart} au ${data.periodEnd}`,
        html: `
          <h2>Votre rapport est prêt !</h2>
          <p>Période: ${data.periodStart} - ${data.periodEnd}</p>

          <h3>Résumé</h3>
          <ul>
            <li><strong>Réservations:</strong> ${data.summary.bookings}</li>
            <li><strong>Vues du profil:</strong> ${data.summary.views}</li>
            <li><strong>Revenus:</strong> ${data.revenue.toFixed(2)} EUR</li>
            <li><strong>Taux de conversion:</strong> ${data.summary.conversionRate.toFixed(1)}%</li>
          </ul>

          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/espace-artisan/statistiques"
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Voir les détails
            </a>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Vous recevez cet email car vous avez programmé ce rapport sur ServicesArtisans.
            <br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/espace-artisan/rapports">Gérer mes rapports</a>
          </p>
        `
      })
    })
  } catch (err) {
    console.error('Error sending report email:', err)
  }
}
