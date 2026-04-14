import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { villes } from '@/lib/data/france'

// Top 20 villes françaises par population/volume de recherche
const TOP_CITIES_COUNT = 20

// Pré-calculer les top villes (le tableau est déjà trié par population)
const topVilles = villes.slice(0, TOP_CITIES_COUNT)

type Intent = 'services' | 'tarifs' | 'devis'

interface TopCitiesGridProps {
  /** Slug du service (ex: "plombier") */
  serviceSlug: string
  /** Nom du service (ex: "Plombier") */
  serviceName: string
  /** Intent de la page : services, tarifs ou devis */
  intent: Intent
  /** Titre de section personnalisé (optionnel) */
  title?: string
  /** Classes CSS additionnelles pour la section */
  className?: string
}

function getAnchorText(serviceName: string, villeName: string, intent: Intent): string {
  const name = serviceName.toLowerCase()
  switch (intent) {
    case 'services':
      return `${serviceName} à ${villeName}`
    case 'tarifs':
      return `Tarifs ${name} à ${villeName}`
    case 'devis':
      return `Devis ${name} à ${villeName}`
  }
}

function getDefaultTitle(serviceName: string, intent: Intent): string {
  const name = serviceName.toLowerCase()
  switch (intent) {
    case 'services':
      return `Trouvez un ${name} près de chez vous`
    case 'tarifs':
      return `Tarifs ${name} par ville`
    case 'devis':
      return `Devis ${name} par ville`
  }
}

function getCtaText(serviceName: string, intent: Intent): string {
  const name = serviceName.toLowerCase()
  switch (intent) {
    case 'services':
      return `Voir ${name} dans toutes les villes`
    case 'tarifs':
      return `Voir les tarifs ${name} dans toutes les villes`
    case 'devis':
      return `Voir devis ${name} dans toutes les villes`
  }
}

function getHref(serviceSlug: string, villeSlug: string, intent: Intent): string {
  return `/${intent}/${serviceSlug}/${villeSlug}`
}

export default function TopCitiesGrid({
  serviceSlug,
  serviceName,
  intent,
  title,
  className = '',
}: TopCitiesGridProps) {
  const sectionTitle = title || getDefaultTitle(serviceName, intent)

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
          {sectionTitle}
        </h2>

        {/* Grille principale : top 10 grandes métropoles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          {topVilles.slice(0, 10).map((ville) => (
            <Link
              key={ville.slug}
              href={getHref(serviceSlug, ville.slug, intent)}
              className="bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group text-center shadow-sm"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-primary-400 group-hover:text-primary-500 flex-shrink-0" />
                <span className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                  {getAnchorText(serviceName, ville.name, intent)}
                </span>
              </div>
              <span className="text-xs text-charcoal-400">({ville.departementCode})</span>
            </Link>
          ))}
        </div>

        {/* Grille secondaire : villes 11-20 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {topVilles.slice(10, TOP_CITIES_COUNT).map((ville) => (
            <Link
              key={ville.slug}
              href={getHref(serviceSlug, ville.slug, intent)}
              className="bg-sand-50 hover:bg-primary-50 border border-sand-200 hover:border-primary-300 rounded-lg px-3 py-2.5 transition-all group text-center"
            >
              <span className="text-sm text-charcoal-700 group-hover:text-primary-500 transition-colors">
                {getAnchorText(serviceName, ville.name, intent)}
              </span>
            </Link>
          ))}
        </div>

        {/* CTA voir toutes les villes */}
        <div className="text-center mt-8">
          <Link
            href="/villes"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold text-sm"
          >
            {getCtaText(serviceName, intent)} ({villes.length})
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
