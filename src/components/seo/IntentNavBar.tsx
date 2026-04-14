import Link from 'next/link'
import { Search, FileText, Euro, AlertTriangle, Star } from 'lucide-react'

interface IntentNavBarProps {
  serviceSlug: string
  villeSlug: string
  currentIntent: 'services' | 'devis' | 'tarifs' | 'urgence' | 'avis'
  serviceName: string
  villeName: string
  providerCount?: number
  avgRating?: number
  reviewCount?: number
}

const TABS = [
  {
    intent: 'services' as const,
    label: 'Artisans',
    icon: Search,
    href: (s: string, v: string) => `/services/${s}/${v}`,
  },
  {
    intent: 'devis' as const,
    label: 'Devis gratuit',
    icon: FileText,
    href: (s: string, v: string) => `/devis/${s}/${v}`,
  },
  {
    intent: 'tarifs' as const,
    label: 'Tarifs',
    icon: Euro,
    href: (s: string, v: string) => `/tarifs/${s}/${v}`,
  },
  {
    intent: 'urgence' as const,
    label: 'Urgence',
    icon: AlertTriangle,
    href: (s: string, v: string) => `/urgence/${s}/${v}`,
  },
  {
    intent: 'avis' as const,
    label: 'Avis',
    icon: Star,
    href: (s: string, v: string) => `/avis/${s}/${v}`,
  },
] as const

export default function IntentNavBar({
  serviceSlug,
  villeSlug,
  currentIntent,
  serviceName,
  villeName,
  providerCount,
  avgRating,
  reviewCount,
}: IntentNavBarProps) {
  return (
    <nav
      aria-label={`Navigation ${serviceName} à ${villeName}`}
      className="sticky top-[64px] z-30 bg-white border-b border-sand-200 shadow-sm"
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-nowrap overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:justify-center gap-1 py-1.5">
          {TABS.map(({ intent, label, icon: Icon, href }) => {
            const isCurrent = intent === currentIntent
            const url = href(serviceSlug, villeSlug)

            // Badge for Artisans tab
            let badge: string | null = null
            if (intent === 'services' && providerCount && providerCount > 0) {
              badge = `(${providerCount})`
            }
            // Badge for Avis tab
            if (intent === 'avis' && avgRating && avgRating > 0) {
              badge = reviewCount
                ? `★${avgRating.toFixed(1)} (${reviewCount})`
                : `★${avgRating.toFixed(1)}`
            }

            if (isCurrent) {
              return (
                <span
                  key={intent}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white whitespace-nowrap min-w-fit cursor-default"
                  aria-current="page"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                  {badge && <span className="text-xs font-medium opacity-80">{badge}</span>}
                </span>
              )
            }

            return (
              <Link
                key={intent}
                href={url}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-charcoal-700 bg-white hover:bg-emerald-50 whitespace-nowrap min-w-fit transition-colors"
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
                {badge && <span className="text-xs font-medium text-charcoal-500">{badge}</span>}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
