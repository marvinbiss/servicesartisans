import { ExternalLink, CreditCard, Landmark } from 'lucide-react'
import type { FinancingPartner } from '@/lib/financing/partners'

/**
 * CTA financement — POSTURE INDICATEUR. Affiche l'offre du partenaire + un lien
 * sortant. AUCUNE donnée personnelle transmise, aucune simulation/éligibilité.
 * Le lien part sur le site du partenaire qui gère tout le parcours.
 *
 * rel="sponsored noopener" : lien commercial partenaire (conforme règles Google
 * — lien sponsorisé balisé). Rendu uniquement si le partenaire est actif (flag).
 */

const ICONS = { younited: CreditCard, aria: Landmark } as const

export function FinancingCta({ partner }: { partner: FinancingPartner }) {
  const Icon = ICONS[partner.key]
  const accent =
    partner.key === 'younited'
      ? 'border-primary-200 bg-primary-50'
      : 'border-secondary-200 bg-secondary-50'

  return (
    <div className={`rounded-xl border p-5 space-y-3 ${accent}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-charcoal-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-semibold text-charcoal-900">{partner.pitch}</p>
          <p className="text-sm text-charcoal-600 mt-0.5">Proposé par {partner.name}.</p>
        </div>
      </div>

      <a
        href={partner.learnMoreUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-charcoal-900 rounded-lg hover:bg-charcoal-800"
      >
        En savoir plus chez {partner.name}
        <ExternalLink className="w-4 h-4" aria-hidden="true" />
      </a>

      <p className="text-xs text-charcoal-400 leading-relaxed">{partner.legalMention}</p>
    </div>
  )
}
