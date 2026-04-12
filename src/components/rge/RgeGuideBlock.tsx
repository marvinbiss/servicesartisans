/**
 * RgeGuideBlock — bloc RSC "Artisans RGE certifiés" pour les guides.
 *
 * S'insère dans les guides éditoriaux (`src/app/(public)/guides/**`) pour
 * exposer un compteur national et un top villes, avec liens vers les pSEO
 * `/artisans-rge/[ville]` (générique) ou `/rge/[service]/[ville]` (filtré
 * par métier énergétique).
 *
 * Deux variantes :
 * - `generic`  : guide non lié à un métier RGE précis → lien /artisans-rge/[ville]
 * - `service`  : guide métier énergétique (PAC, isolation, etc.) → lien
 *                /rge/[service]/[ville] + label QualiPAC/Qualibat etc.
 *
 * Fail-open : si la DB renvoie 0 résultat, on affiche le CTA générique sans
 * chiffres plutôt que de masquer le bloc, pour ne jamais casser le guide.
 */

import Link from 'next/link'
import { Leaf, ShieldCheck, ArrowRight, MapPin } from 'lucide-react'
import RgePseoCtaLink from '@/components/rge/RgePseoCtaLink'
import JsonLd from '@/components/JsonLd'
import { SITE_URL } from '@/lib/seo/config'
import { getRgeNationalStats, getRgeServiceStats, type RgeTopCity } from '@/lib/rge/guide-stats'
import { RGE_QUALIFICATION_LABELS, type RgeAllowedService } from '@/lib/rge/service-city-listings'

interface RgeGuideBlockProps {
  variant: 'generic' | 'service'
  serviceSlug?: RgeAllowedService
  title?: string
  /** Masque le lien vers le guide /guides/artisan-rge (utile quand on est déjà dessus). */
  hideGuideCta?: boolean
}

function buildCityHref(serviceSlug: RgeAllowedService | undefined, citySlug: string): string {
  if (serviceSlug) return `/rge/${serviceSlug}/${citySlug}`
  return `/artisans-rge/${citySlug}`
}

function formatCount(n: number): string {
  if (n <= 0) return ''
  return new Intl.NumberFormat('fr-FR').format(n)
}

export default async function RgeGuideBlock({
  variant,
  serviceSlug,
  title,
  hideGuideCta = false,
}: RgeGuideBlockProps) {
  let totalActive = 0
  let topCities: RgeTopCity[] = []
  let qualificationLabel: string | null = null

  if (variant === 'service' && serviceSlug) {
    const stats = await getRgeServiceStats(serviceSlug)
    totalActive = stats.total
    topCities = stats.topCities
    const meta = RGE_QUALIFICATION_LABELS[serviceSlug]
    qualificationLabel = meta?.label ?? null
  } else {
    const stats = await getRgeNationalStats()
    totalActive = stats.totalActive
    topCities = stats.topCities
  }

  const displayCities = topCities.slice(0, 8)
  const effectiveServiceSlug = variant === 'service' ? serviceSlug : undefined
  const headingText =
    title ??
    (variant === 'service' && qualificationLabel
      ? `Artisans RGE ${qualificationLabel} près de chez vous`
      : 'Artisans RGE certifiés près de chez vous')

  // JSON-LD ItemList des villes (si disponibles) pour aider l'indexation.
  const itemListSchema =
    displayCities.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: headingText,
          itemListElement: displayCities.map((city, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: `Artisans RGE ${city.name}`,
            url: `${SITE_URL}${buildCityHref(effectiveServiceSlug, city.slug)}`,
          })),
        }
      : null

  const hasData = totalActive > 0 && displayCities.length > 0

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      {itemListSchema ? <JsonLd data={itemListSchema} /> : null}

      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 md:p-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <Leaf className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 font-heading mb-2">
              {headingText}
            </h2>
            {hasData ? (
              <p className="text-charcoal-700 leading-relaxed">
                {'Plus de '}
                <strong className="text-emerald-700">{formatCount(totalActive)}</strong>
                {variant === 'service' && qualificationLabel
                  ? ` artisans certifiés ${qualificationLabel} recensés dans notre annuaire, `
                  : ' artisans RGE certifiés recensés dans notre annuaire, '}
                {'issus du référentiel officiel '}
                <a
                  href="https://france-renov.gouv.fr/annuaire-rge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 underline hover:text-emerald-800"
                >
                  France Rénov&apos;
                </a>
                {' (ADEME). Éligibles à MaPrimeRénov&apos; et aux CEE.'}
              </p>
            ) : (
              <p className="text-charcoal-700 leading-relaxed">
                {
                  "Tous nos artisans partenaires RGE sont vérifiés via le référentiel officiel France Rénov' (ADEME). Leurs qualifications vous donnent accès à MaPrimeRénov' et aux aides CEE."
                }
              </p>
            )}
          </div>
        </div>

        {hasData ? (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 mb-3 uppercase tracking-wide">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>Villes avec le plus d&apos;artisans RGE certifiés</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {displayCities.map((city) => (
                  <RgePseoCtaLink
                    key={city.slug}
                    href={buildCityHref(effectiveServiceSlug, city.slug)}
                    surface="guide"
                    className="group flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2.5 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-charcoal-900 truncate">
                      {city.name}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5 ml-2">
                      {formatCount(city.count)}
                    </span>
                  </RgePseoCtaLink>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/verifier-artisan"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            <span>Vérifier un artisan RGE</span>
          </Link>
          {!hideGuideCta ? (
            <Link
              href="/guides/artisan-rge"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 border border-emerald-300 px-5 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
            >
              <span>Tout savoir sur le label RGE</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
