import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const err = new Error(`Sentry server test ${Date.now()}`)
  Sentry.captureException(err)
  await Sentry.flush(2000)
  return NextResponse.json(
    { ok: true, message: 'Test error sent to Sentry', timestamp: Date.now() },
    { status: 200 }
  )
}
