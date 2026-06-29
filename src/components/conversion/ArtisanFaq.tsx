import { ChevronDown } from 'lucide-react'

/**
 * FAQ orientée ARTISAN (objections à l'inscription) pour la landing d'acquisition.
 * Utilise <details>/<summary> natif : accessible, zéro JS, pas de client component.
 */
interface QA {
  q: string
  a: string
}

const ITEMS: QA[] = [
  {
    q: 'Combien ça coûte ?',
    a: "L'inscription et la réception de demandes sont gratuites. Vous ne payez que pour les demandes que vous décidez de contacter — aucun abonnement imposé, aucun frais caché.",
  },
  {
    q: 'Suis-je engagé ?',
    a: "Non. Aucun engagement de durée, vous restez libre de mettre votre profil en pause ou de partir à tout moment.",
  },
  {
    q: 'Comment vérifiez-vous les artisans ?',
    a: "Chaque profil est vérifié via le SIRET auprès des données officielles INSEE. Cela protège votre métier des faux profils et rassure les clients.",
  },
  {
    q: 'Quand vais-je recevoir ma première demande ?',
    a: "Dès que votre profil est validé, vous êtes visible dans votre zone. Les premières demandes arrivent généralement dans les jours qui suivent, selon la demande locale pour votre métier.",
  },
  {
    q: 'Mes données sont-elles protégées ?',
    a: "Oui. Vos informations ne sont jamais revendues à des tiers. Elles servent uniquement à vous mettre en relation avec des clients de votre zone (conformité RGPD).",
  },
]

export function ArtisanFaq() {
  return (
    <section aria-label="Questions fréquentes" className="max-w-3xl mx-auto px-4 py-14">
      <h2 className="font-heading text-2xl lg:text-3xl font-bold text-charcoal-900 text-center">
        Vos questions, nos réponses
      </h2>
      <div className="mt-8 divide-y divide-sand-200 rounded-2xl bg-white ring-1 ring-sand-200">
        {ITEMS.map(({ q, a }) => (
          <details key={q} className="group px-5">
            <summary className="flex cursor-pointer items-center justify-between py-4 font-semibold text-charcoal-900 list-none">
              <span>{q}</span>
              <ChevronDown
                className="w-5 h-5 text-charcoal-400 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="pb-4 -mt-1 text-charcoal-600">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
