/**
 * Twilio SMS client — conditional on env vars.
 * If TWILIO_* vars are missing, logs a warning and returns gracefully.
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('[sms] Twilio not configured — skipping SMS')
    return { success: false, error: 'Twilio not configured' }
  }

  // Ensure message is < 160 chars
  const truncated = message.length > 160 ? message.slice(0, 157) + '...' : message

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER,
        To: to,
        Body: truncated,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('[sms] Twilio error:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (err) {
    console.error('[sms] Send failed:', err)
    return { success: false, error: String(err) }
  }
}
