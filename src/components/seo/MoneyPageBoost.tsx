import Link from 'next/link'
import { getTopMoneyPages, type MoneyPage } from '@/lib/seo/top-pages'

interface MoneyPageBoostProps {
  currentService?: string
  currentVille?: string
}

/**
 * Deterministic hash for consistent link selection across builds.
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/**
 * Selects 3 money pages using a diversified strategy:
 * 1. Same service, different city (silo reinforcement)
 * 2. Same city, different service (geographic hub)
 * 3. Different service + different city (cross-silo bridge)
 */
function selectMoneyPages(
  currentService?: string,
  currentVille?: string,
): MoneyPage[] {
  const all = getTopMoneyPages()
  const seed = hashCode(`${currentService || ''}::${currentVille || ''}`)
  const selected: MoneyPage[] = []
  const usedKeys = new Set<string>()

  if (currentService && currentVille) {
    usedKeys.add(`${currentService}::${currentVille}`)
  }

  function pick(candidates: MoneyPage[]): MoneyPage | null {
    if (candidates.length === 0) return null
    const idx = seed % candidates.length
    const mp = candidates[idx]
    const key = `${mp.serviceSlug}::${mp.villeSlug}`
    if (usedKeys.has(key)) {
      // Try next candidate
      for (let i = 1; i < candidates.length; i++) {
        const alt = candidates[(idx + i) % candidates.length]
        const altKey = `${alt.serviceSlug}::${alt.villeSlug}`
        if (!usedKeys.has(altKey)) {
          usedKeys.add(altKey)
          return alt
        }
      }
      return null
    }
    usedKeys.add(key)
    return mp
  }

  // Slot 1: same service, different city
  if (currentService) {
    const sameService = all.filter(
      p => p.serviceSlug === currentService && p.villeSlug !== currentVille
    )
    const mp = pick(sameService)
    if (mp) selected.push(mp)
  }

  // Slot 2: same city, different service
  if (currentVille) {
    const sameCity = all.filter(
      p => p.villeSlug === currentVille && p.serviceSlug !== currentService
    )
    const mp = pick(sameCity)
    if (mp) selected.push(mp)
  }

  // Slot 3: different service AND different city
  const crossSilo = all.filter(
    p => p.serviceSlug !== currentService && p.villeSlug !== currentVille
  )
  const mp = pick(crossSilo)
  if (mp) selected.push(mp)

  // Fallback: fill remaining slots with stride
  if (selected.length < 3) {
    const stride = 7
    let pos = seed % all.length
    while (selected.length < 3) {
      const candidate = all[pos % all.length]
      const key = `${candidate.serviceSlug}::${candidate.villeSlug}`
      if (!usedKeys.has(key)) {
        usedKeys.add(key)
        selected.push(candidate)
      }
      pos += stride
      if (pos > all.length * 2) break // safety
    }
  }

  return selected
}

/**
 * Renders 3 links to money pages. Placed after DeepPageLinks on service×city pages.
 * Server component — no client JS.
 */
export default function MoneyPageBoost({
  currentService,
  currentVille,
}: MoneyPageBoostProps) {
  const pages = selectMoneyPages(currentService, currentVille)
  if (pages.length === 0) return null

  return (
    <nav aria-label="Services les plus demandés" className="border-t border-slate-100 mt-6 pt-4">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
        Les plus demandés
      </p>
      <div className="flex flex-wrap gap-2">
        {pages.map((mp) => (
          <Link
            key={`${mp.serviceSlug}-${mp.villeSlug}`}
            href={`/services/${mp.serviceSlug}/${mp.villeSlug}`}
            className="px-3 py-1.5 text-sm text-stone-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 rounded-full transition-colors"
            prefetch={false}
          >
            {mp.serviceName} à {mp.villeName}
          </Link>
        ))}
      </div>
    </nav>
  )
}
