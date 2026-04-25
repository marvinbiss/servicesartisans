/**
 * Resend email client for transactional emails.
 * Requires RESEND_API_KEY environment variable.
 */

import { logger } from '@/lib/logger'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM || 'ServicesArtisans <noreply@servicesartisans.fr>'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  headers?: Record<string, string>
}

export async function sendEmail({
  to,
  subject,
  html,
  headers,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    logger.warn('[email] RESEND_API_KEY not configured — skipping email')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        ...(headers && { headers }),
      }),
      // Audit 2026-04-25 (agent #6 BLOCKER 5) : sans timeout, un Resend latent
      // hang la lambda jusqu'au kill Vercel (10s+) → 5xx vu de Googlebot et
      // contribue à l'échec exploration GSC. 8s = couvre p99 Resend (~2-3s)
      // tout en restant bien sous le timeout Vercel.
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const error = await res.text()
      logger.error('[email] Resend error', { status: res.status, error })
      return { success: false, error }
    }

    return { success: true }
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      logger.error('[email] Resend timeout (8s)')
      return { success: false, error: 'Resend timeout' }
    }
    logger.error('[email] Send failed', { error: err })
    return { success: false, error: String(err) }
  }
}
