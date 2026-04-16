import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dsnServer = process.env.SENTRY_DSN
  const dsnPublic = process.env.NEXT_PUBLIC_SENTRY_DSN
  const nodeEnv = process.env.NODE_ENV
  const client = Sentry.getClient()
  const clientEnabled = client?.getOptions()?.enabled

  const err = new Error(`Sentry server test ${Date.now()}`)
  const eventId = Sentry.captureException(err)
  const flushed = await Sentry.flush(2000)

  return NextResponse.json({
    ok: true,
    diagnostic: {
      hasServerDsn: Boolean(dsnServer),
      hasPublicDsn: Boolean(dsnPublic),
      dsnServerPrefix: dsnServer ? dsnServer.slice(0, 30) + '...' : null,
      nodeEnv,
      clientInitialized: Boolean(client),
      clientEnabled,
      eventId,
      flushed,
    },
  })
}
