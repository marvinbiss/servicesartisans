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

// ---------------------------------------------------------------------------
// Anchor text templates — 4 variants per slot type for natural variation
// ---------------------------------------------------------------------------

const ANCHOR_SAME_SERVICE: string[] = [
  '{service} à {ville}',
  'Trouver un {service} à {ville}',
  '{service} de confiance à {ville}',
  'Les {service}s à {ville}',
]

const ANCHOR_SAME_CITY: string[] = [
  '{service} à {ville}',
  'Prix {service} à {ville}',
  "Besoin d'un {service} à {ville}",
  '{service} disponible à {ville}',
]

const ANCHOR_CROSS_SILO: string[] = [
  '{service} à {ville}',
  'Artisan {service} à {ville}',
  'Comparer les {service}s à {ville}',
  '{service}s près de {ville}',
]

function renderAnchor(
  templates: string[],
  seed: number,
  serviceName: string,
  villeName: string
): string {
  const idx = seed % templates.length
  return templates[idx]
    .replace(/\{service\}/g, serviceName.toLowerCase())
    .replace(/\{ville\}/g, villeName)
}

// ---------------------------------------------------------------------------
// Section label variants — avoids repeating "Les plus demandés" everywhere
// ---------------------------------------------------------------------------

const SECTION_LABELS = [
  'Les plus demandés',
  'Recherches populaires',
  'Artisans les plus consultés',
  'À ne pas manquer',
]

/**
 * Selects 3 money pages using a diversified strategy:
 * 1. Same service, different city (silo reinforcement)
 * 2. Same city, different service (geographic hub)
 * 3. Different service + different city (cross-silo bridge)
 *
 * Each slot uses a different anchor text template set to avoid uniform patterns.
 */
function selectMoneyPages(
  currentService?: string,
  currentVille?: string
): { page: MoneyPage; anchor: string }[] {
  const all = getTopMoneyPages()
  const seed = hashCode(`${currentService || ''}::${currentVille || ''}`)
  const selected: { page: MoneyPage; anchor: string }[] = []
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
      (p) => p.serviceSlug === currentService && p.villeSlug !== currentVille
    )
    const mp = pick(sameService)
    if (mp) {
      const anchorSeed = hashCode(`anchor-slot1-${mp.serviceSlug}-${mp.villeSlug}`)
      selected.push({
        page: mp,
        anchor: renderAnchor(ANCHOR_SAME_SERVICE, anchorSeed, mp.serviceName, mp.villeName),
      })
    }
  }

  // Slot 2: same city, different service
  if (currentVille) {
    const sameCity = all.filter(
      (p) => p.villeSlug === currentVille && p.serviceSlug !== currentService
    )
    const mp = pick(sameCity)
    if (mp) {
      const anchorSeed = hashCode(`anchor-slot2-${mp.serviceSlug}-${mp.villeSlug}`)
      selected.push({
        page: mp,
        anchor: renderAnchor(ANCHOR_SAME_CITY, anchorSeed, mp.serviceName, mp.villeName),
      })
    }
  }

  // Slot 3: different service AND different city
  const crossSilo = all.filter(
    (p) => p.serviceSlug !== currentService && p.villeSlug !== currentVille
  )
  const mp = pick(crossSilo)
  if (mp) {
    const anchorSeed = hashCode(`anchor-slot3-${mp.serviceSlug}-${mp.villeSlug}`)
    selected.push({
      page: mp,
      anchor: renderAnchor(ANCHOR_CROSS_SILO, anchorSeed, mp.serviceName, mp.villeName),
    })
  }

  // Fallback: fill remaining slots with stride
  if (selected.length < 3) {
    const stride = 7
    let pos = seed % all.length
    while (selected.length < 3) {
      const candidate = all[pos % all.length]
      const key = `${candidate.serviceSlug}::${candidate.villeSlug}`
      if (!usedKeys.has(key)) {
        usedKeys.add(key)
        const anchorSeed = hashCode(
          `anchor-fallback-${candidate.serviceSlug}-${candidate.villeSlug}`
        )
        selected.push({
          page: candidate,
          anchor: renderAnchor(
            ANCHOR_CROSS_SILO,
            anchorSeed,
            candidate.serviceName,
            candidate.villeName
          ),
        })
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
 *
 * Anti-pattern measures:
 * - Different anchor text templates per slot type (same-service / same-city / cross-silo)
 * - Section label rotates per page
 * - Deterministic but page-unique selection via hash
 */
export default function MoneyPageBoost({ currentService, currentVille }: MoneyPageBoostProps) {
  const entries = selectMoneyPages(currentService, currentVille)
  if (entries.length === 0) return null

  const labelSeed = hashCode(`label-${currentService || ''}-${currentVille || ''}`)
  const sectionLabel = SECTION_LABELS[labelSeed % SECTION_LABELS.length]

  return (
    <nav aria-label={sectionLabel} className="border-t border-charcoal-100 mt-6 pt-4">
      <p className="text-xs font-semibold text-sand-500 uppercase tracking-wider mb-2">
        {sectionLabel}
      </p>
      <div className="flex flex-wrap gap-2">
        {entries.map(({ page, anchor }) => (
          <Link
            key={`${page.serviceSlug}-${page.villeSlug}`}
            href={`/services/${page.serviceSlug}/${page.villeSlug}`}
            className="px-3 py-1.5 text-sm text-sand-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 rounded-full transition-colors"
            prefetch={false}
          >
            {anchor}
          </Link>
        ))}
      </div>
    </nav>
  )
}
