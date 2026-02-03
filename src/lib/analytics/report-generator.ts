/**
 * Report Generator Service
 * Generate PDF/CSV/Excel reports for artisan dashboards
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export interface ReportConfig {
  name: string
  description?: string
  dateRange: {
    start: Date
    end: Date
  }
  sections: ReportSection[]
  format: 'pdf' | 'csv' | 'xlsx'
}

export interface ReportSection {
  type: 'summary' | 'chart' | 'table' | 'text'
  title: string
  metric?: string
  content?: string
}

export interface ReportData {
  summary: {
    totalRevenue: number
    totalBookings: number
    avgRating: number
    totalViews: number
    responseRate: number
    conversionRate: number
  }
  bookings: {
    date: string
    count: number
    revenue: number
    status: string
  }[]
  views: {
    date: string
    count: number
    source: string
  }[]
  reviews: {
    date: string
    rating: number
    comment: string
    clientName: string
  }[]
}

/**
 * Fetch report data for a provider
 */
export async function fetchReportData(
  providerId: string,
  dateRange: { start: Date; end: Date }
): Promise<ReportData> {
  const supabase = await createClient()

  const [bookingsResult, viewsResult, reviewsResult, providerResult] = await Promise.all([
    // Bookings
    supabase
      .from('bookings')
      .select('created_at, deposit_amount, status')
      .eq('artisan_id', providerId)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .order('created_at', { ascending: true }),

    // Views
    supabase
      .from('analytics_events')
      .select('created_at, metadata')
      .eq('provider_id', providerId)
      .eq('event_type', 'profile_view')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString()),

    // Reviews
    supabase
      .from('reviews')
      .select('created_at, rating, comment, client_id')
      .eq('provider_id', providerId)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .order('created_at', { ascending: false }),

    // Provider stats
    supabase
      .from('providers')
      .select('rating_average, response_rate')
      .eq('id', providerId)
      .single(),
  ])

  const bookings = bookingsResult.data || []
  const views = viewsResult.data || []
  const reviews = reviewsResult.data || []

  // Calculate summary
  const totalRevenue = bookings
    .filter((b) => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.deposit_amount || 0) / 100, 0)

  const totalBookings = bookings.length
  const totalViews = views.length
  const conversionRate = totalViews > 0 ? (totalBookings / totalViews) * 100 : 0

  // Aggregate bookings by date
  const bookingsByDate = new Map<string, { count: number; revenue: number }>()
  bookings.forEach((b) => {
    const date = b.created_at.split('T')[0]
    const existing = bookingsByDate.get(date) || { count: 0, revenue: 0 }
    bookingsByDate.set(date, {
      count: existing.count + 1,
      revenue: existing.revenue + (b.deposit_amount || 0) / 100,
    })
  })

  // Aggregate views by date
  const viewsByDate = new Map<string, { count: number; sources: string[] }>()
  views.forEach((v) => {
    const date = v.created_at.split('T')[0]
    const source = (v.metadata as any)?.source || 'direct'
    const existing = viewsByDate.get(date) || { count: 0, sources: [] }
    viewsByDate.set(date, {
      count: existing.count + 1,
      sources: [...existing.sources, source],
    })
  })

  return {
    summary: {
      totalRevenue,
      totalBookings,
      avgRating: providerResult.data?.rating_average || 0,
      totalViews,
      responseRate: providerResult.data?.response_rate || 0,
      conversionRate,
    },
    bookings: Array.from(bookingsByDate.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      revenue: data.revenue,
      status: 'aggregated',
    })),
    views: Array.from(viewsByDate.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      source: Array.from(new Set(data.sources)).join(', '),
    })),
    reviews: reviews.map((r) => ({
      date: r.created_at.split('T')[0],
      rating: r.rating,
      comment: r.comment || '',
      clientName: 'Client',
    })),
  }
}

/**
 * Generate CSV content
 */
export function generateCSV(data: ReportData, config: ReportConfig): string {
  const lines: string[] = []

  // Header
  lines.push(`"Rapport: ${config.name}"`)
  lines.push(`"Période: ${config.dateRange.start.toLocaleDateString('fr-FR')} - ${config.dateRange.end.toLocaleDateString('fr-FR')}"`)
  lines.push('')

  // Summary section
  lines.push('"=== RÉSUMÉ ==="')
  lines.push('"Métrique","Valeur"')
  lines.push(`"Revenus totaux","${data.summary.totalRevenue.toFixed(2)} EUR"`)
  lines.push(`"Réservations","${data.summary.totalBookings}"`)
  lines.push(`"Note moyenne","${data.summary.avgRating.toFixed(1)}/5"`)
  lines.push(`"Vues profil","${data.summary.totalViews}"`)
  lines.push(`"Taux de réponse","${data.summary.responseRate.toFixed(0)}%"`)
  lines.push(`"Taux de conversion","${data.summary.conversionRate.toFixed(1)}%"`)
  lines.push('')

  // Bookings section
  if (data.bookings.length > 0) {
    lines.push('"=== RÉSERVATIONS ==="')
    lines.push('"Date","Nombre","Revenus"')
    data.bookings.forEach((b) => {
      lines.push(`"${b.date}","${b.count}","${b.revenue.toFixed(2)} EUR"`)
    })
    lines.push('')
  }

  // Views section
  if (data.views.length > 0) {
    lines.push('"=== VUES PROFIL ==="')
    lines.push('"Date","Nombre","Sources"')
    data.views.forEach((v) => {
      lines.push(`"${v.date}","${v.count}","${v.source}"`)
    })
    lines.push('')
  }

  // Reviews section
  if (data.reviews.length > 0) {
    lines.push('"=== AVIS ==="')
    lines.push('"Date","Note","Commentaire"')
    data.reviews.forEach((r) => {
      const comment = r.comment.replace(/"/g, '""')
      lines.push(`"${r.date}","${r.rating}/5","${comment}"`)
    })
  }

  return lines.join('\n')
}

/**
 * Generate HTML content for PDF
 */
export function generateHTML(data: ReportData, config: ReportConfig): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${config.name}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    h1 {
      color: #1e40af;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 10px;
    }
    h2 {
      color: #374151;
      margin-top: 30px;
    }
    .period {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .summary-card {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
    }
    .summary-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .rating {
      color: #f59e0b;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>${config.name}</h1>
  <p class="period">
    Période: ${config.dateRange.start.toLocaleDateString('fr-FR')} - ${config.dateRange.end.toLocaleDateString('fr-FR')}
  </p>

  <h2>Résumé</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${formatCurrency(data.summary.totalRevenue)}</div>
      <div class="summary-label">Revenus</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.totalBookings}</div>
      <div class="summary-label">Réservations</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.avgRating.toFixed(1)}/5</div>
      <div class="summary-label">Note moyenne</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.totalViews}</div>
      <div class="summary-label">Vues profil</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.responseRate.toFixed(0)}%</div>
      <div class="summary-label">Taux de réponse</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.conversionRate.toFixed(1)}%</div>
      <div class="summary-label">Taux de conversion</div>
    </div>
  </div>

  ${data.bookings.length > 0 ? `
  <h2>Réservations</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Nombre</th>
        <th>Revenus</th>
      </tr>
    </thead>
    <tbody>
      ${data.bookings.map(b => `
        <tr>
          <td>${b.date}</td>
          <td>${b.count}</td>
          <td>${formatCurrency(b.revenue)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${data.reviews.length > 0 ? `
  <h2>Derniers avis</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Note</th>
        <th>Commentaire</th>
      </tr>
    </thead>
    <tbody>
      ${data.reviews.slice(0, 10).map(r => `
        <tr>
          <td>${r.date}</td>
          <td class="rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
          <td>${r.comment || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
    <br>
    ServicesArtisans - Tableau de bord artisan
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate report
 */
export async function generateReport(
  providerId: string,
  config: ReportConfig
): Promise<{ content: string; mimeType: string; filename: string }> {
  try {
    const data = await fetchReportData(providerId, config.dateRange)

    const dateStr = config.dateRange.start.toISOString().split('T')[0]
    const baseFilename = `rapport_${config.name.toLowerCase().replace(/\s+/g, '_')}_${dateStr}`

    switch (config.format) {
      case 'csv':
        return {
          content: generateCSV(data, config),
          mimeType: 'text/csv;charset=utf-8',
          filename: `${baseFilename}.csv`,
        }

      case 'pdf':
        // Return HTML for PDF generation (would be converted by a PDF library)
        return {
          content: generateHTML(data, config),
          mimeType: 'text/html;charset=utf-8',
          filename: `${baseFilename}.html`, // Would be .pdf with proper PDF generation
        }

      case 'xlsx':
        // Return CSV format for now (would use xlsx library for proper Excel)
        return {
          content: generateCSV(data, config),
          mimeType: 'text/csv;charset=utf-8',
          filename: `${baseFilename}.csv`,
        }

      default:
        throw new Error(`Unsupported format: ${config.format}`)
    }
  } catch (error) {
    logger.error('Error generating report', error)
    throw error
  }
}

/**
 * Schedule a recurring report
 */
export async function scheduleReport(
  providerId: string,
  config: ReportConfig & {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
): Promise<string> {
  try {
    const supabase = await createClient()

    const nextRun = new Date()
    switch (config.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1)
        nextRun.setHours(8, 0, 0, 0)
        break
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + (8 - nextRun.getDay()) % 7)
        nextRun.setHours(8, 0, 0, 0)
        break
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1)
        nextRun.setDate(1)
        nextRun.setHours(8, 0, 0, 0)
        break
    }

    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert({
        provider_id: providerId,
        name: config.name,
        config: {
          description: config.description,
          sections: config.sections,
          format: config.format,
        },
        frequency: config.frequency,
        next_run: nextRun.toISOString(),
        recipients: config.recipients,
      })
      .select('id')
      .single()

    if (error) throw error

    return data.id
  } catch (error) {
    logger.error('Error scheduling report', error)
    throw error
  }
}

export default {
  fetchReportData,
  generateReport,
  scheduleReport,
}
