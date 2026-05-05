import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { timingSafeStringEqual } from '@/lib/auth/timing-safe-equal'
import { readJsonBodyWithCap } from '@/lib/auth/read-body-with-cap'

// Force dynamic rendering — GET handler reads request.headers (cron-secret / IP / origin).
export const dynamic = 'force-dynamic'

// Schema pour revalidation single path (rétrocompatible)
const revalidateSingleSchema = z.object({
  path: z.string().min(1, 'Path requis'),
  secret: z.string().min(1, 'Secret requis'),
})

// Schema pour revalidation batch
const revalidateBatchSchema = z.object({
  paths: z.array(z.string().min(1)).min(1).max(50, 'Maximum 50 paths par batch'),
})

const MAX_BATCH_SIZE = 50

// 64 KB = largement suffisant pour un batch de 50 paths × ~200 octets/path
// (cap théorique ≈ 10 KB). On rejette tout body au-dessus AVANT de le parser
// pour éviter qu'un attaquant non authentifié puisse DoS la lambda en
// envoyant un payload massif (le secret n'est vérifié qu'après parse en
// mode single, sinon Bearer header avant parse en mode batch — mais on doit
// quand même parser pour discriminer). Defense in depth.
const MAX_BODY_BYTES = 64 * 1024

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { success: false, error: { message: 'Erreur de configuration serveur' } },
        { status: 500 }
      )
    }

    // Vérifier l'auth via Bearer token OU champ secret dans le body
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    // Body cap stream-based : le check `Content-Length` du header est
    // bypassable via Transfer-Encoding: chunked. On lit le stream octet
    // par octet et on coupe au premier dépassement.
    const bodyResult = await readJsonBodyWithCap(request, MAX_BODY_BYTES)
    if (!bodyResult.ok) {
      const { status, message } =
        bodyResult.reason === 'too-large'
          ? { status: 413, message: 'Body trop volumineux' }
          : bodyResult.reason === 'timeout'
            ? { status: 408, message: 'Timeout de lecture du body' }
            : { status: 400, message: 'Données invalides' }
      return NextResponse.json({ success: false, error: { message } }, { status })
    }
    const body: unknown = bodyResult.data

    // Mode batch : { paths: [...] } avec Bearer auth
    const batchResult = revalidateBatchSchema.safeParse(body)
    if (batchResult.success) {
      // Auth via Bearer token obligatoire pour le batch
      if (!timingSafeStringEqual(bearerToken, process.env.REVALIDATE_SECRET)) {
        return NextResponse.json(
          { success: false, error: { message: 'Secret invalide' } },
          { status: 401 }
        )
      }

      const { paths } = batchResult.data
      const revalidated: string[] = []
      const errors: string[] = []

      for (const path of paths.slice(0, MAX_BATCH_SIZE)) {
        try {
          revalidatePath(path, 'page')
          revalidated.push(path)
        } catch {
          errors.push(path)
        }
      }

      // Notifier IndexNow pour tous les paths revalidés (fire-and-forget)
      if (revalidated.length > 0) {
        import('@/lib/seo/indexnow')
          .then(({ submitToIndexNow }) => submitToIndexNow(revalidated))
          .catch((err) =>
            logger.warn('[revalidate] IndexNow submit failed', {
              count: revalidated.length,
              error: err,
            })
          )
      }

      return NextResponse.json({
        revalidated: true,
        paths: revalidated,
        errors: errors.length > 0 ? errors : undefined,
        now: Date.now(),
      })
    }

    // Mode single (rétrocompatible) : { path, secret }
    const singleResult = revalidateSingleSchema.safeParse(body)
    if (!singleResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              'Données invalides — envoyez { path, secret } ou { paths: [...] } avec Bearer auth',
          },
        },
        { status: 400 }
      )
    }

    const { path, secret } = singleResult.data

    if (!timingSafeStringEqual(secret, process.env.REVALIDATE_SECRET)) {
      return NextResponse.json(
        { success: false, error: { message: 'Secret invalide' } },
        { status: 401 }
      )
    }

    // Revalider le chemin
    revalidatePath(path, 'page')

    // Notifier IndexNow (fire-and-forget)
    import('@/lib/seo/indexnow')
      .then(({ submitToIndexNow }) => submitToIndexNow([path]))
      .catch((err) => logger.warn('[revalidate] IndexNow submit failed', { path, error: err }))

    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now(),
    })
  } catch (err) {
    logger.error('[revalidate] handler error', { error: err })
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Erreur lors de la revalidation' },
      },
      { status: 500 }
    )
  }
}

// GET pour revalider plusieurs pages courantes
export async function GET(request: NextRequest) {
  try {
    if (!process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { success: false, error: { message: 'Erreur de configuration serveur' } },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!timingSafeStringEqual(bearerToken, process.env.REVALIDATE_SECRET)) {
      return NextResponse.json(
        { success: false, error: { message: 'Secret invalide' } },
        { status: 401 }
      )
    }

    // Revalider les pages principales
    const paths = ['/services/plombier/paris', '/services', '/']

    for (const path of paths) {
      revalidatePath(path, 'page')
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      now: Date.now(),
    })
  } catch (err) {
    logger.error('[revalidate] handler error', { error: err })
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Erreur lors de la revalidation' },
      },
      { status: 500 }
    )
  }
}
