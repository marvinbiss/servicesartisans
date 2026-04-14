import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json({ error: 'Fonctionnalité non disponible' }, { status: 501 })
}
