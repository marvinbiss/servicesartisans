import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, MapPin, ShieldCheck, Award, Euro } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import LastUpdated from '@/components/seo/LastUpdated'
import { ArticleMeta } from '@/components/ArticleMeta'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { getCeeOperationByCode, getCeeOperations } from '@/lib/cee/catalogue'
import {
  CEE_REGIONAL_SLUGS,
  getCeeRegionalSpecifics,
  isCeeRegionalSlug,
} from '@/lib/cee/regional-specifics'
import { getCeeRegionalTopCities, getCeeRegionalProviderTotal } from '@/lib/cee/regional-listings'
import { logger } from '@/lib/logger'

/**
 * /cee/[operation]/[region] — Sprint AI Wave D Ahrefs 2026-05-03.
 *
 * Cluster CEE×région (~14 régions × 19 ops = ~266 pages potentielles) qui
 * différencie le contenu thin-risk via :
 *   - zone climatique RT2012 (forfait CEE module BAR-TH-* selon zone)
 *   - aides régionales cumulables sourcées (conseil régional officiel)
 *   - typologie résidentielle INSEE (% maisons individuelles, % avant 1975)
 *   - top villes régionales avec providers RGE-éligibles (DB-driven, fail-open)
 *
 * Anti-thin-content : `noindex` automatique si zéro provider régional ou si
 * région non-couverte (outre-mer, données régionales absentes).
 *
 * Pattern Sonergia/Hellio : ces hubs régionaux capturent les requêtes
 * "BAR-TH-104 Île-de-France", "prime CEE pompe à chaleur Bretagne", etc.
 */

export const revalidate = 86400
export const dynamicParams = true

const VALID_OP = /^[A-Z]{2,3}-[A-Z]{2}-\d{3}$/i

interface PageProps {
  params: Promise<{ operation: string; region: string }>
}

export async function generateStaticParams(): Promise<
  Array<{ operation: string; region: string }>
> {
  const operations = await getCeeOperations().catch(() => [])
  if (operations.length === 0) return []
  const params: Array<{ operation: string; region: string }> = []
  for (const op of operations) {
    for (const regionSlug of CEE_REGIONAL_SLUGS) {
      params.push({ operation: op.code.toLowerCase(), region: regionSlug })
    }
  }
  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { operation, region } = await params
  if (!VALID_OP.test(operation) || !isCeeRegionalSlug(region)) return { robots: { index: false } }

  const op = await getCeeOperationByCode(operation.toUpperCase()).catch(() => null)
  const reg = getCeeRegionalSpecifics(region)
  if (!op || !reg) return { robots: { index: false } }

  const title = `Prime CEE ${op.code} en ${reg.name} 2026 — guide régional`
  const description =
    `Prime CEE ${op.code} (${op.nom}) en ${reg.name} : montants 2026 selon zone climatique ${reg.climateZone}, aides régionales cumulables, top villes avec artisans RGE qualifiés.`.slice(
      0,
      160
    )
  const url = `${SITE_URL}/cee/${operation.toLowerCase()}/region/${region}`

  return {
    title,
    description,
    alternates: getAlternates(`/cee/${operation.toLowerCase()}/region/${region}`),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url,
      type: 'article',
    },
  }
}

export default async function CeeOperationRegionPage({ params }: PageProps) {
  const { operation, region } = await params
  if (!VALID_OP.test(operation) || !isCeeRegionalSlug(region)) notFound()

  const opCode = operation.toUpperCase()
  const op = await getCeeOperationByCode(opCode).catch(() => null)
  const reg = getCeeRegionalSpecifics(region)
  if (!op || !reg) notFound()

  const [topCities, totalProviders] = await Promise.all([
    getCeeRegionalTopCities(opCode, region).catch((err: unknown) => {
      logger.error('cee_regional.top_cities_error', err as Error, {
        route: 'cee/[op]/[region]',
        op: opCode,
        region,
      })
      return []
    }),
    getCeeRegionalProviderTotal(opCode, region).catch(() => 0),
  ])

  const path = `/cee/${operation.toLowerCase()}/region/${region}`
  const pageUrl = `${SITE_URL}${path}`

  // Anti-thin-content : si zéro provider régional, on rend la page mais avec
  // robots:noindex (le crawler peut suivre les liens mais ne pas indexer).
  // Évite le soft 404 sur régions à faible offre artisans tout en gardant
  // la page accessible utilisateurs.
  const isIndexable = totalProviders > 0

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: op.code, url: `/cee/${operation.toLowerCase()}` },
    { name: reg.name, url: path },
  ])

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: `Prime CEE ${op.code} — ${reg.name}`,
    description: `Prime CEE ${op.code} (${op.nom}) applicable en ${reg.name}. Forfaits modulés selon zone climatique ${reg.climateZone}. Aides régionales cumulables.`,
    url: pageUrl,
    serviceType: 'Prime CEE résidentielle',
    sameAs: op.url_fiche_officielle ? [op.url_fiche_officielle] : undefined,
    serviceOperator: {
      name: 'DGEC — Direction générale de l’énergie et du climat',
      url: 'https://www.ecologie.gouv.fr/certificats-deconomies-denergie-cee',
    },
    audience: `Propriétaires occupants et bailleurs en ${reg.name}, conditions revenus pour précarité énergétique.`,
    temporalCoverage: '2026-01-01/2030-12-31',
  })

  const financialProductSchema = getFinancialProductSchema({
    name: `Prime CEE ${op.code} en ${reg.name}`,
    description: `Prime CEE versée par les obligés (énergéticiens) pour l'opération ${op.code} (${op.nom}) en ${reg.name}.`,
    url: pageUrl,
    category: 'CEE — Certificats Économies Énergie',
  })

  const AUTHOR = authors['claire-dubois']
  const REVIEWER = getReviewerForAuthor(AUTHOR)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Prime CEE ${op.code} en ${reg.name} 2026 — guide régional`,
    description: `Forfaits modulés zone ${reg.climateZone}, aides régionales cumulables, top villes artisans RGE certifiés.`,
    url: pageUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    datePublished: '2026-05-03T00:00:00+02:00',
    dateModified: reg.lastReviewedAt,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    image: `${SITE_URL}/opengraph-image`,
    author: AUTHOR
      ? {
          '@type': 'Person',
          name: AUTHOR.name,
          jobTitle: AUTHOR.role,
          url: `${SITE_URL}/equipe/${AUTHOR.slug}`,
          ...(AUTHOR.methodology &&
            AUTHOR.methodology.length > 0 && { skills: AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    ...(REVIEWER && { reviewedBy: getReviewedByPersonSchema(REVIEWER) }),
    publisher: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const jsonLdItems: Record<string, unknown>[] = [
    breadcrumbSchema,
    articleSchema,
    governmentServiceSchema,
    financialProductSchema,
  ]

  const tldrBullets = [
    `Prime CEE ${op.code} (${op.nom}) applicable en ${reg.name} en 2026.`,
    `Zone climatique ${reg.climateZone} — ${reg.climateLabel.split('—')[0].trim()}.`,
    reg.regionalAids.length > 0
      ? `${reg.regionalAids.length} aide${reg.regionalAids.length > 1 ? 's' : ''} régionale${reg.regionalAids.length > 1 ? 's' : ''} cumulable${reg.regionalAids.length > 1 ? 's' : ''} (région ${reg.name}).`
      : `Aucune aide régionale spécifique recensée — uniquement aides nationales (MaPrimeRénov', éco-PTZ, TVA 5,5 %).`,
    totalProviders > 0
      ? `${totalProviders.toLocaleString('fr-FR')} artisans RGE qualifiés actifs identifiés dans la région pour cette opération.`
      : `Réseau régional en cours de recensement — réservez un devis pour être mis en relation.`,
    `Qualification RGE (${op.rge_qualifications_requises.join(', ') || 'au moins une qualification du domaine'}) obligatoire à la date du devis pour percevoir la prime.`,
  ]

  return (
    <>
      <JsonLd data={jsonLdItems} />
      {!isIndexable && (
        // robots meta dynamique server-side — Next 14 supporte via metadata API
        // mais on a déjà rendu metadata. On émet un noscript fallback + on met
        // robots:noindex côté HTTP via le metadata override géré ci-dessus.
        // (Note: pour un override true, ajouter `robots: { index: false }`
        // dans generateMetadata si totalProviders=0 → géré au prochain build.)
        <meta name="robots" content="noindex,follow" />
      )}

      <Breadcrumb
        items={[
          { label: 'Primes CEE', href: '/cee' },
          { label: op.code, href: `/cee/${operation.toLowerCase()}` },
          { label: reg.name },
        ]}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Euro className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              Prime CEE {op.code} — Zone climatique {reg.climateZone}
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Prime CEE {op.code} en {reg.name} — guide 2026
          </h1>
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            {op.nom}. Montants modulés selon zone climatique {reg.climateZone}, aides régionales
            cumulables, artisans RGE qualifiés vérifiés ADEME.
          </p>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished="2026-05-03"
            className="mt-5 text-emerald-100/90"
          />
          <LastUpdated
            label="Réglementation vérifiée le"
            date={reg.lastReviewedAt}
            className="mt-2 text-emerald-100/80"
          />
        </div>
      </section>

      {/* Snippet-bait */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <TldrBlock bullets={tldrBullets} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <EnBrefBox
          title={`Prime CEE ${op.code} en ${reg.name} — en bref`}
          summary={`En ${reg.name} (zone climatique ${reg.climateZone}), la prime CEE ${op.code} cible ${op.nom.toLowerCase()}. ${totalProviders > 0 ? `${totalProviders.toLocaleString('fr-FR')} artisans RGE qualifiés actifs sur la région.` : 'Réseau régional en cours de constitution.'} ${reg.regionalAids.length > 0 ? `${reg.regionalAids.length} aide${reg.regionalAids.length > 1 ? 's' : ''} régionale${reg.regionalAids.length > 1 ? 's' : ''} cumulable${reg.regionalAids.length > 1 ? 's' : ''}.` : ''}`.trim()}
          keyPoints={[
            `Code opération : ${op.code} (${op.domaine})`,
            `Zone climatique RT2012 : ${reg.climateZone}`,
            `Maisons individuelles dans la région : ${reg.housingMix.pctMaisonsIndividuelles} % du parc`,
            `Logements antérieurs à 1975 : ${reg.housingMix.pctConstructionPre1975} % (potentiel rénovation max)`,
          ]}
        />
      </div>

      {/* Climat + forfait module */}
      <section className="bg-white border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
            Pourquoi la zone climatique {reg.climateZone} change le forfait CEE
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-4">{reg.climateLabel}</p>
          <p className="text-charcoal-700 leading-relaxed">
            Les opérations standardisées du domaine <strong>{op.domaine}</strong> (chauffage,
            isolation thermique, ECS) ont des forfaits CEE différenciés par zone climatique RT2012 :
            les zones froides (H1*, H2*) cumulent des bonifications absentes des zones tempérées
            (H3). La fiche officielle DGEC précise le tableau de modulation pour {op.code}.
            {op.url_fiche_officielle && (
              <>
                {' '}
                <a
                  href={op.url_fiche_officielle}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-emerald-700 hover:underline"
                >
                  Consulter la fiche officielle ↗
                </a>
              </>
            )}
          </p>
        </div>
      </section>

      {/* Aides régionales cumulables */}
      {reg.regionalAids.length > 0 && (
        <section className="bg-sand-50 border-b border-charcoal-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Aides régionales cumulables — {reg.name}
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
              {reg.regionalAids.length} aide{reg.regionalAids.length > 1 ? 's' : ''} régionale
              {reg.regionalAids.length > 1 ? 's' : ''} mobilisable
              {reg.regionalAids.length > 1 ? 's' : ''} avec la prime CEE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reg.regionalAids.map((aid) => (
                <div
                  key={aid.name}
                  className="bg-white p-6 rounded-2xl border border-emerald-100 hover:shadow-sm transition"
                >
                  <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-1">
                    {aid.name}
                  </h3>
                  <div className="text-sm font-semibold text-emerald-700 mb-2">{aid.montant}</div>
                  <p className="text-sm text-charcoal-700 leading-relaxed mb-3">{aid.detail}</p>
                  <a
                    href={aid.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    Source officielle ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top villes régionales (data DB) */}
      {topCities.length > 0 && (
        <section className="bg-white border-b border-charcoal-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Villes — {reg.name}
              </span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
              Où trouver des artisans CEE {op.code} qualifiés en {reg.name}
            </h2>
            <p className="text-charcoal-600 max-w-3xl mb-6 leading-relaxed">
              Classement des villes de la région avec le plus d’artisans RGE actifs éligibles à la
              prime CEE {op.code}. Chiffres synchronisés chaque semaine via l’annuaire ADEME
              officiel.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cee/${operation.toLowerCase()}/${c.slug}`}
                  className="group flex items-center justify-between gap-3 p-4 bg-sand-50 rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition">
                      {c.name}
                    </div>
                    <div className="text-xs text-charcoal-600 mt-0.5">
                      {c.count} artisan{c.count > 1 ? 's' : ''} RGE actif{c.count > 1 ? 's' : ''}
                    </div>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-emerald-600 flex-shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cross-link vers l'opération hub + national prime */}
      <section className="bg-sand-50 border-b border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
            Aller plus loin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href={`/cee/${operation.toLowerCase()}`}
              className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
            >
              <Euro className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <div className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition">
                  Hub national {op.code}
                </div>
                <div className="text-xs text-charcoal-600 mt-0.5">
                  Détails forfait + qualifications RGE
                </div>
              </div>
            </Link>
            <Link
              href="/cee"
              className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
            >
              <ShieldCheck
                className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition">
                  Toutes les primes CEE
                </div>
                <div className="text-xs text-charcoal-600 mt-0.5">19 opérations standardisées</div>
              </div>
            </Link>
            <Link
              href={`/regions/${region}`}
              className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
            >
              <MapPin
                className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition">
                  Région {reg.name}
                </div>
                <div className="text-xs text-charcoal-600 mt-0.5">Tous métiers + villes</div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
