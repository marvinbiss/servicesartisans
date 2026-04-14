import Link from 'next/link'
import { getMoneyPagesByTier, type MoneyPage } from '@/lib/seo/top-pages'

// ---------------------------------------------------------------------------
// DynamicFooterLinks — rotating money page links in the footer
// ---------------------------------------------------------------------------
// Selects 15 money pages from tier 1+2, rotated daily so every page
// shows a different subset over time. Pure static data, no DB queries.
// ---------------------------------------------------------------------------

/** Simple deterministic hash for a string → number */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

const DISPLAY_COUNT = 15

export default function DynamicFooterLinks() {
  // Rotate daily: use date string as seed
  const today = new Date()
  const seed = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const offset = hashCode(seed)

  const tier12Pages = getMoneyPagesByTier(2) // 100 pages (tier 1 + tier 2)
  const total = tier12Pages.length

  // Pick DISPLAY_COUNT pages starting at a rotated offset
  const selected: MoneyPage[] = []
  for (let i = 0; i < DISPLAY_COUNT && i < total; i++) {
    selected.push(tier12Pages[(offset + i * 7) % total]) // stride of 7 for spread
  }

  // Deduplicate (stride can theoretically wrap, though unlikely with 100 items)
  const seen = new Set<string>()
  const unique = selected.filter((p) => {
    const key = `${p.serviceSlug}::${p.villeSlug}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  if (unique.length === 0) return null

  return (
    <div className="border-b border-charcoal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h4 className="text-white font-heading font-semibold mb-4 text-xs uppercase tracking-[0.15em]">
          Artisans populaires
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-1.5">
          {unique.map((page) => (
            <Link
              key={`${page.serviceSlug}-${page.villeSlug}`}
              href={`/services/${page.serviceSlug}/${page.villeSlug}`}
              className="text-xs text-sand-500 hover:text-primary-400 transition-colors duration-200 py-0.5 truncate"
            >
              {page.serviceName} {page.villeName}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
