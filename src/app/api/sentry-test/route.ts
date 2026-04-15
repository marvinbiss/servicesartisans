// Diagnostic endpoint: throws on purpose so we can verify Sentry captures
// server-side errors end-to-end. Safe to leave in place — it only errors when
// called explicitly.
export const dynamic = 'force-dynamic'

export async function GET() {
  throw new Error(`Sentry server test ${Date.now()}`)
}
