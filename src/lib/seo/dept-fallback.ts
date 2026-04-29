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
 * Coût DB & DoS — les call-sites n'invoquent ce helper QUE quand
 * `providerCount === 0` (path froid). En amont, le middleware rejette les
 * slugs invalides via `evaluateGonePath` (HTTP 410 sans cold render). En
 * aval, `getProvidersByServiceAndDepartment` passe par `getCachedData`
 * (TTL 1h). L'amplification reste donc bornée.
 */
import { getProvidersByServiceAndDepartment } from '@/lib/supabase'

export async function hasDeptProviderFallback(
  serviceSlug: string,
  departmentName: string | null | undefined
): Promise<boolean> {
  if (!departmentName) return false
  try {
    const fallback = await getProvidersByServiceAndDepartment(serviceSlug, departmentName, {
      limit: 1,
    })
    return fallback.length > 0
  } catch {
    return false
  }
}
