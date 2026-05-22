/**
 * FinalCtaSection — bottom-of-page canonical conversion block.
 *
 * Cohérent sur tous les templates pSEO (services, RGE, rénovation, aides, CEE, communes).
 * Server component (default), pas d'état client.
 *
 * @rules
 *  - 1 H2 unique par page : id="final-cta-heading"
 *  - Accent matching le hero du template (cluster=blue, cee=green, aides=blue, …)
 *  - Pas de superlatifs hype (feedback_no_hype_pipeline)
 *  - TrustLine factuelle (count providers, source RGE ADEME)
 */
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export type FinalCtaSectionProps = {
  heading: string
  description: string
  primaryCta: { label: string; href: string; intent?: string }
  secondaryCta?: { label: string; href: string }
  accent?: 'blue' | 'green' | 'amber'
  trustLine?: string
}

// Palette aliases : 'blue'|'green'|'amber' = noms d'API (9 callsites)
//   blue  → primary  (terra / maple SA design tokens)
//   green → accent   (forest)
//   amber → secondary (honey gold)
const ACCENT = {
  blue: 'bg-primary-50 border-primary-200',
  green: 'bg-accent-50 border-accent-200',
  amber: 'bg-secondary-50 border-secondary-200',
} as const

const BTN_ACCENT = {
  blue: 'bg-primary-600 hover:bg-primary-700 text-white',
  green: 'bg-accent-600 hover:bg-accent-700 text-white',
  amber: 'bg-secondary-600 hover:bg-secondary-700 text-charcoal-900',
} as const

export function FinalCtaSection({
  heading,
  description,
  primaryCta,
  secondaryCta,
  accent = 'blue',
  trustLine,
}: FinalCtaSectionProps) {
  return (
    <section
      className={`${ACCENT[accent]} border-y py-12 mt-8`}
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2
          id="final-cta-heading"
          className="text-2xl md:text-3xl font-bold mb-3 text-charcoal-900"
        >
          {heading}
        </h2>
        <p className="text-lg text-charcoal-700 mb-6">{description}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={primaryCta.href}
            className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg font-semibold shadow-sm ${BTN_ACCENT[accent]}`}
            data-intent={primaryCta.intent ?? 'final-cta'}
          >
            {primaryCta.label}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg font-semibold border border-charcoal-300 hover:bg-white text-charcoal-800"
              data-intent="final-cta-secondary"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>

        {trustLine && <p className="text-sm text-charcoal-600 mt-5">{trustLine}</p>}
      </div>
    </section>
  )
}

export default FinalCtaSection
