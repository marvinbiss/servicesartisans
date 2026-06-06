import { Award, ShieldCheck, CreditCard, Languages } from 'lucide-react'

/**
 * Bloc « Garanties & informations pratiques » — expose les 4 colonnes mig 306
 * restantes (certifications, insurance, payment_methods, languages).
 *
 * Props dédiées (PAS via le type Artisan) : le GUARD de
 * src/components/artisan/types.ts interdit d'ajouter ces champs au type
 * Artisan pour empêcher la résurgence de colonnes droppées. Les données
 * arrivent directement de ProviderRecord dans page.tsx.
 *
 * Rendu UNIQUEMENT pour les fiches claimed (gate au call site) : contenu
 * auto-déclaré par l'artisan dans son espace — jamais affiché sur les fiches
 * non revendiquées (languages a un DEFAULT ['Français'] sur toute la base,
 * l'afficher hors claim = bruit non validé par l'artisan).
 *
 * Ces certifications/assurances déclaratives ne sont PAS émises en JSON-LD
 * hasCredential (réservé aux sources officielles RGE ADEME + INSEE — règle
 * zéro-tolérance legal data).
 */

interface ArtisanCredentialsBlockProps {
  certifications?: string[] | null
  insurance?: string[] | null
  paymentMethods?: string[] | null
  languages?: string[] | null
}

interface CredentialGroup {
  key: string
  title: string
  icon: typeof Award
  items: string[]
}

const clean = (values?: string[] | null): string[] =>
  (values ?? []).filter((v) => typeof v === 'string' && v.trim().length > 0).map((v) => v.trim())

export function ArtisanCredentialsBlock({
  certifications,
  insurance,
  paymentMethods,
  languages,
}: ArtisanCredentialsBlockProps) {
  const groups: CredentialGroup[] = [
    { key: 'certifications', title: 'Certifications', icon: Award, items: clean(certifications) },
    { key: 'insurance', title: 'Assurances', icon: ShieldCheck, items: clean(insurance) },
    {
      key: 'payment',
      title: 'Moyens de paiement',
      icon: CreditCard,
      items: clean(paymentMethods),
    },
    { key: 'languages', title: 'Langues parlées', icon: Languages, items: clean(languages) },
  ].filter((g) => g.items.length > 0)

  if (groups.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-6">
      <h2 className="text-lg font-bold text-charcoal-900 font-heading mb-4">
        Garanties &amp; informations pratiques
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {groups.map((group) => {
          const Icon = group.icon
          return (
            <div key={group.key}>
              <dt className="flex items-center gap-2 text-sm font-semibold text-charcoal-700 mb-2">
                <Icon className="w-4 h-4 text-primary-500" aria-hidden="true" />
                {group.title}
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sand-50 border border-sand-200 text-sm text-charcoal-700"
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
