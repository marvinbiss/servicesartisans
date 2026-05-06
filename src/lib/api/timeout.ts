/**
 * SLA-99.9 : helper de timeout pour requêtes amont (Supabase, fetch tiers).
 *
 * Pourquoi : les clients Supabase JS n'exposent pas de signal AbortController
 * compatible avec les builders `from().select()` (ils sont thenable mais pas
 * cancellable). On wrap donc le thenable dans un `Promise.race` qui rejette
 * si l'amont dépasse le budget. Le client Supabase continue d'exécuter dans
 * les coulisses, mais le handler reprend la main et peut renvoyer un
 * fallback (200 vide) avant l'expiration du budget Vercel function.
 *
 * Contrat :
 *   - resolve si la promesse amont termine dans `ms`
 *   - reject avec `Error('upstream_timeout:<label>')` sinon
 *   - le label permet de filtrer côté Sentry / Vercel logs
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`upstream_timeout:${label}`)), ms)
  })
  try {
    return (await Promise.race([promise, timeout])) as T
  } finally {
    if (timer) clearTimeout(timer)
  }
}
