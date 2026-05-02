// Next.js instrumentation hook — boot-time setup pour chaque runtime.
//
// 1. Sentry config (server / edge)
// 2. Validation Zod des env vars (Node runtime uniquement, build skip via
//    NEXT_BUILD_SKIP_DB=1) — bloque le boot si une var REQUIRED manque,
//    pour échouer côté Vercel deploy plutôt que côté requête utilisateur.
//
// Voir: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Validation env stricte au démarrage du serveur Node — fail-fast.
    // L'évaluation a lieu dès l'import de '@/lib/env' (export const env = ...).
    await import('@/lib/env')
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export { captureRequestError as onRequestError } from '@sentry/nextjs'
