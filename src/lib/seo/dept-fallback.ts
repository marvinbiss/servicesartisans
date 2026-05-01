/**
 * Helper de désynchro `generateMetadata` ↔ render — utilisé par les
 * templates pSEO qui cascadent ville → département au render
 * (`/services/[s]/[v]`, `/avis/[s]/[v]`, etc.).
 *
 * Sans ce check, la metadata se base sur le compte ville-only, alors que
 * le render affiche un listing dept fallback : Googlebot voit
 * `<meta robots="noindex">` sur une page contenant un listing actif. Le
 * helper aligne la décision noindex sur ce qu'affiche réellement la page.
 *
 * Fail-safe : retourne `false` sur erreur DB (la metadata existante
 * (count_ville, hasUniqueData) reste seule à décider).
 *
 * Seuil 2026-05-01 (P0 GSC audit) : passe de ≥1 à **≥3 providers** pour
 * justifier l'indexation. Avec 1-2 providers fallback dept, la page est
 * trop maigre pour ranker (zéro CTR observé sur ces cas selon GSC 90j).
 * Google dépense alors du budget crawl sur des pages qui ne convertiront
 * jamais. À ≥3, on a un mini-listing crédible (carte + comparaison + bloc
 * dept) qui justifie sa place dans l'index.
 *
 * Coût DB & DoS — les call-sites n'invoquent ce helper QUE quand
 * `providerCount === 0` (path froid). En amont, le middleware rejette les
 * slugs invalides via `evaluateGonePath` (HTTP 410 sans cold render). En
 * aval, `getProvidersByServiceAndDepartment` passe par `getCachedData`
 * (TTL 1h). L'amplification reste donc bornée.
 */
import { getProvidersByServiceAndDepartment } from '@/lib/supabase'

const DEPT_FALLBACK_INDEX_THRESHOLD = 3

export async function hasDeptProviderFallback(
  serviceSlug: string,
  departmentName: string | null | undefined
): Promise<boolean> {
  if (!departmentName) return false
  try {
    const fallback = await getProvidersByServiceAndDepartment(serviceSlug, departmentName, {
      limit: DEPT_FALLBACK_INDEX_THRESHOLD,
    })
    return fallback.length >= DEPT_FALLBACK_INDEX_THRESHOLD
  } catch {
    return false
  }
}
