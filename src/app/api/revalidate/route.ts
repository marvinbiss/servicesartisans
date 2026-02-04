import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json()

    // Vérification de sécurité (optionnel)
    if (secret && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    // Revalider le chemin
    revalidatePath(path, 'page')

    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now(),
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Error revalidating', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

// GET pour revalider plusieurs pages courantes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const secret = searchParams.get('secret')

    // Vérification de sécurité (optionnel)
    if (secret && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    // Revalider les pages principales
    const paths = [
      '/services/plombier/paris',
      '/services',
      '/',
    ]

    for (const path of paths) {
      revalidatePath(path, 'page')
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      now: Date.now(),
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Error revalidating', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
