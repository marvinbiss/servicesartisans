import Link from 'next/link'
import { Euro, Star, Search, AlertTriangle, FileText } from 'lucide-react'
import { getAnchorText, type Intent } from '@/lib/seo/anchor-variants'

interface CrossIntentLinksProps {
  service: string
  serviceName: string
  ville?: string
  villeName?: string
  currentIntent?: 'tarifs' | 'avis' | 'services' | 'urgence' | 'devis'
}

const intents = [
  { key: 'tarifs' as Intent, label: 'Tarifs', icon: Euro, href: (s: string, v?: string) => v ? `/tarifs/${s}/${v}` : `/tarifs/${s}` },
  { key: 'avis' as Intent, label: 'Avis', icon: Star, href: (s: string, v?: string) => v ? `/avis/${s}/${v}` : `/avis/${s}` },
  { key: 'services' as Intent, label: 'Artisans', icon: Search, href: (s: string, v?: string) => v ? `/services/${s}/${v}` : `/services/${s}` },
  { key: 'urgence' as Intent, label: 'Urgence', icon: AlertTriangle, href: (s: string, v?: string) => v ? `/urgence/${s}/${v}` : `/urgence/${s}` },
  { key: 'devis' as Intent, label: 'Devis', icon: FileText, href: (s: string, v?: string) => v ? `/devis/${s}/${v}` : `/devis/${s}` },
]

export default function CrossIntentLinks({
  service,
  serviceName,
  ville,
  villeName,
  currentIntent,
}: CrossIntentLinksProps) {
  return (
    <nav
      aria-label={`Voir aussi pour ${serviceName}${villeName ? ` a ${villeName}` : ''}`}
      className="border-t border-sand-300 bg-sand-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
          {serviceName}{villeName ? ` à ${villeName}` : ''} — voir aussi
        </p>
        <div className="flex flex-wrap gap-2">
          {intents.map(({ key, label, icon: Icon, href }) => {
            const isCurrent = key === currentIntent
            const anchorText = getAnchorText({
              serviceSlug: service,
              serviceName,
              villeName,
              intent: key,
              seed: 'cross-intent',
            })
            if (isCurrent) {
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary-400 text-white cursor-default"
                  aria-current="page"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              )
            }
            return (
              <Link
                key={key}
                href={href(service, ville)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white text-charcoal-700 border border-sand-300 hover:border-blue-300 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <Icon className="w-4 h-4" />
                {anchorText}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
