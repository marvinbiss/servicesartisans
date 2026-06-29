import { Wallet, Unlock, ShieldCheck, BadgeCheck } from 'lucide-react'

/**
 * Bandeau de réassurance ARTISAN — lève les objections clés sous le hero.
 * Tout est factuel (pas de promesse non tenable).
 */
const ITEMS = [
  { icon: Wallet, title: 'Gratuit à l’inscription', text: 'Paiement uniquement au résultat' },
  { icon: Unlock, title: 'Sans engagement', text: 'Pause ou départ quand vous voulez' },
  { icon: BadgeCheck, title: 'Profils vérifiés SIRET', text: 'Via les données officielles INSEE' },
  { icon: ShieldCheck, title: 'Données protégées', text: 'Jamais revendues — conforme RGPD' },
]

export function LandingGuarantees() {
  return (
    <section aria-label="Garanties" className="bg-white border-b border-sand-200">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-accent-700" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-charcoal-900 text-sm">{title}</div>
              <div className="text-xs text-charcoal-500 mt-0.5">{text}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
