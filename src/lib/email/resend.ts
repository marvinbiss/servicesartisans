/**
 * Resend email client for transactional emails.
 * Requires RESEND_API_KEY environment variable.
 */

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
    console.warn('[email] RESEND_API_KEY not configured — skipping email')
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
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('[email] Resend error:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (err) {
    console.error('[email] Send failed:', err)
    return { success: false, error: String(err) }
  }
}
