import Link from 'next/link'
import { Euro, Star, Search, AlertTriangle, FileText, HelpCircle } from 'lucide-react'
import { getAnchorText, type Intent } from '@/lib/seo/anchor-variants'
import { getProblemsByService } from '@/lib/data/problems'

type CurrentIntent = 'tarifs' | 'avis' | 'services' | 'urgence' | 'devis' | 'problemes'

interface CrossIntentLinksProps {
  service: string
  serviceName: string
  ville?: string
  villeName?: string
  currentIntent?: CurrentIntent
  /** Display variant — defaults to 'pills' for backward compatibility */
  variant?: 'pills' | 'inline' | 'compact'
}

// ---------------------------------------------------------------------------
// Intent definitions
// ---------------------------------------------------------------------------

interface IntentDef {
  key: Intent
  label: string
  icon: typeof Euro
  href: (s: string, v?: string) => string
}

const ALL_INTENTS: IntentDef[] = [
  { key: 'tarifs', label: 'Tarifs', icon: Euro, href: (s, v) => v ? `/tarifs/${s}/${v}` : `/tarifs/${s}` },
  { key: 'avis', label: 'Avis', icon: Star, href: (s, v) => v ? `/avis/${s}/${v}` : `/avis/${s}` },
  { key: 'services', label: 'Artisans', icon: Search, href: (s, v) => v ? `/services/${s}/${v}` : `/services/${s}` },
  { key: 'urgence', label: 'Urgence', icon: AlertTriangle, href: (s, v) => v ? `/urgence/${s}/${v}` : `/urgence/${s}` },
  { key: 'devis', label: 'Devis', icon: FileText, href: (s, v) => v ? `/devis/${s}/${v}` : `/devis/${s}` },
]

// ---------------------------------------------------------------------------
// Full cross-linking: show ALL other intents on every page.
// Each service×ville page links to the 4 other intents — no deprioritization.
// This maximizes internal linking between intent clusters for SEO.
// ---------------------------------------------------------------------------
function selectIntents(currentIntent?: CurrentIntent): IntentDef[] {
  return ALL_INTENTS.filter(i => i.key !== currentIntent)
}

// ---------------------------------------------------------------------------
// Deterministic hash (same as MoneyPageBoost)
// ---------------------------------------------------------------------------

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

// ---------------------------------------------------------------------------
// Section label variants
// ---------------------------------------------------------------------------

const SECTION_LABELS = [
  'Voir aussi',
  'Explorer',
  'À consulter',
  'Autres rubriques',
]

// ---------------------------------------------------------------------------
// Renderers per variant
// ---------------------------------------------------------------------------

interface ResolvedLink {
  key: string
  href: string
  anchor: string
  label: string
  icon: typeof Euro
  isCurrent: boolean
}

function renderPills(links: ResolvedLink[], sectionLabel: string, serviceName: string, villeName?: string) {
  return (
    <nav
      aria-label={`${sectionLabel} pour ${serviceName}${villeName ? ` à ${villeName}` : ''}`}
      className="border-t border-sand-300 bg-sand-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">
          {serviceName}{villeName ? ` à ${villeName}` : ''} — {sectionLabel.toLowerCase()}
        </p>
        <div className="flex flex-wrap gap-2">
          {links.map(({ key, href, anchor, label, icon: Icon, isCurrent }) => {
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
                href={href}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white text-charcoal-700 border border-sand-300 hover:border-blue-300 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <Icon className="w-4 h-4" />
                {anchor}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

function renderInline(links: ResolvedLink[], serviceName: string, villeName?: string) {
  const activeLinks = links.filter(l => !l.isCurrent)
  if (activeLinks.length === 0) return null

  return (
    <nav
      aria-label={`Liens connexes pour ${serviceName}${villeName ? ` à ${villeName}` : ''}`}
      className="border-t border-sand-300 bg-sand-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <p className="text-sm text-charcoal-600 leading-relaxed">
          Consultez également{' '}
          {activeLinks.map((link, i) => (
            <span key={link.key}>
              {i > 0 && i < activeLinks.length - 1 && ', '}
              {i > 0 && i === activeLinks.length - 1 && ' et '}
              <Link
                href={link.href}
                className="text-primary-600 hover:text-primary-800 underline underline-offset-2"
              >
                {link.anchor}
              </Link>
            </span>
          ))}
          {'.'}
        </p>
      </div>
    </nav>
  )
}

function renderCompact(links: ResolvedLink[], serviceName: string, villeName?: string) {
  return (
    <nav
      aria-label={`Rubriques pour ${serviceName}${villeName ? ` à ${villeName}` : ''}`}
      className="border-t border-sand-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs text-charcoal-400 font-medium">Voir :</span>
          {links.map(({ key, href, anchor, label, isCurrent }) => {
            if (isCurrent) {
              return (
                <span
                  key={key}
                  className="text-xs font-semibold text-charcoal-800"
                  aria-current="page"
                >
                  {label}
                </span>
              )
            }
            return (
              <Link
                key={key}
                href={href}
                className="text-xs text-primary-600 hover:text-primary-800 hover:underline"
              >
                {anchor}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CrossIntentLinks({
  service,
  serviceName,
  ville,
  villeName,
  currentIntent,
  variant = 'pills',
}: CrossIntentLinksProps) {
  // Select contextually relevant intents (4-5 instead of always 6)
  const visibleIntents = selectIntents(currentIntent)

  // Resolve problem link
  const serviceProblems = getProblemsByService(service)
  const primaryProblem = serviceProblems.length > 0 ? serviceProblems[0] : null

  // Deterministic seed for section label variation
  const seed = hashCode(`ci-${service}-${ville || ''}-${currentIntent || ''}`)
  const sectionLabel = SECTION_LABELS[seed % SECTION_LABELS.length]

  // Build resolved links
  const links: ResolvedLink[] = visibleIntents.map(({ key, label, icon, href }) => {
    const anchorText = getAnchorText({
      serviceSlug: service,
      serviceName,
      villeName,
      intent: key,
      seed: `cross-${seed}`,
    })
    return {
      key,
      href: href(service, ville),
      anchor: anchorText,
      label,
      icon,
      isCurrent: key === currentIntent,
    }
  })

  // Add problemes intent if available and not deprioritized
  if (primaryProblem) {
    const isCurrentProblemes = currentIntent === 'problemes'
    const problemHref = ville
      ? `/problemes/${primaryProblem.slug}/${ville}`
      : `/problemes/${primaryProblem.slug}`
    const problemAnchor = villeName
      ? `Problèmes ${serviceName.toLowerCase()} à ${villeName}`
      : `Problèmes ${serviceName.toLowerCase()}`
    links.push({
      key: 'problemes',
      href: problemHref,
      anchor: problemAnchor,
      label: 'Problèmes',
      icon: HelpCircle,
      isCurrent: isCurrentProblemes,
    })
  }

  if (links.length === 0) return null

  switch (variant) {
    case 'inline':
      return renderInline(links, serviceName, villeName)
    case 'compact':
      return renderCompact(links, serviceName, villeName)
    case 'pills':
    default:
      return renderPills(links, sectionLabel, serviceName, villeName)
  }
}
