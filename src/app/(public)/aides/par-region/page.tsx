import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MapPin,
  Snowflake,
  Database,
  ArrowRight,
  Calculator,
  Sparkles,
  Building2,
  Info,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_NAME, SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getGovernmentServiceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'
import {
  getAidesRegionHubEntries,
  getAidesRegionHubLastReviewedAt,
  getAidesRegionHubTotalRegionalAids,
  REGION_HUB_FEATURED_OP_CODE,
} from '@/lib/aides/region-hub-data'
import { aidesCatalog } from '@/lib/aides/aides-catalog'

/**
 * /aides/par-region — Sprint AI Wave L 2026-05-03.
 *
 * Hub racine cluster aides par région (13 régions métropolitaines, outre-mer
 * exclu — cohérence avec CEE_REGIONAL_SLUGS Wave D).
 *
 * Capture l'intent navigationnel "aides rénovation [région]", "MaPrimeRénov
 * [région]", "prime CEE [région]" et redirige vers :
 *   - /datasets/cee-regional-aids (download data ouverte CC-BY 4.0)
 *   - /cee/bar-th-171/region/[region] (PAC air-eau, op CEE la plus volumineuse)
 *   - /aides/[dept] (Wave H, 30 dépts indexés)
 *   - /aides/maprimerenov-vs-cee (Wave I, comparator)
 *   - /aides hub
 *
 * Auteur : claire-dubois (YMYL aides financières publiques).
 *
 * Justification SEO : "par région" est une expression d'agrégation territoriale
 * recherchée + le hub est l'enfant canonical de /aides hub et le parent
 * sémantique des 13 entrées régionales — clé pour le PageRank descendant
 * vers les pages /cee/[op]/region/[region] (266 pages) et /aides/[dept] (30).
 */

export const revalidate = 86400

const PATH = '/aides/par-region'
const PAGE_URL = `${SITE_URL}${PATH}`
const PUBLISHED_AT = '2026-05-03'
const REVIEWED_AT = getAidesRegionHubLastReviewedAt()
const AUTHOR = authors['claire-dubois']
const REVIEWER = getReviewerForAuthor(AUTHOR)

const TITLE = 'Aides rénovation énergétique par région 2026 : 13 régions'
const DESCRIPTION =
  "Aides rénovation énergétique 2026 par région : MaPrimeRénov', CEE, éco-PTZ + aides régionales cumulables. 13 régions métropolitaines, zones climatiques RT2012, dataset open-data."

// Alias court pour la lisibilité du JSX. Source canonique + verrou invariant
// dans `region-hub-data.ts` (test `isRegionHubFeaturedOpInSeed`).
const FEATURED_OP_CODE = REGION_HUB_FEATURED_OP_CODE

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PATH),
  openGraph: {
    ...getOgDefaults(),
    locale: 'fr_FR',
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
  },
}

export default function AidesParRegionPage() {
  const entries = getAidesRegionHubEntries()
  const totalRegionalAids = getAidesRegionHubTotalRegionalAids()

  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: 'Par région', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Aides rénovation énergétique par région 2026',
    numberOfItems: entries.length,
    itemListElement: entries.map((e, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'AdministrativeArea',
        name: e.name,
        url: `${SITE_URL}/cee/${FEATURED_OP_CODE}/region/${e.slug}`,
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Zone climatique RT2012', value: e.climateZone },
          {
            '@type': 'PropertyValue',
            name: 'Aides régionales recensées',
            value: e.regionalAids.length,
          },
        ],
      },
    })),
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${PAGE_URL}#article`,
    url: PAGE_URL,
    headline: TITLE,
    description: DESCRIPTION,
    image: [`${SITE_URL}/og-default.jpg`],
    datePublished: `${PUBLISHED_AT}T00:00:00+02:00`,
    dateModified: `${REVIEWED_AT}T00:00:00+02:00`,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Aides à la rénovation énergétique',
    keywords: [
      'aides par région',
      'aides régionales',
      'rénovation énergétique',
      "MaPrimeRénov'",
      'CEE',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: 'Aides régionales rénovation' },
      { '@type': 'Thing', name: "MaPrimeRénov'" },
      { '@type': 'Thing', name: 'France métropolitaine' },
    ],
    ...spreadCitationsForTopics('MaPrimeRénov CEE rénovation énergétique'),
    author: AUTHOR
      ? {
          '@type': 'Person',
          name: AUTHOR.name,
          jobTitle: AUTHOR.role,
          url: `${SITE_URL}/equipe/${AUTHOR.slug}`,
          ...(AUTHOR.methodology &&
            AUTHOR.methodology.length > 0 && { skills: AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(REVIEWER && { reviewedBy: getReviewedByPersonSchema(REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints = [
    `${entries.length} régions métropolitaines couvertes — outre-mer exclu (dispositif CEE DOM/COM distinct).`,
    `${totalRegionalAids} aide${totalRegionalAids > 1 ? 's' : ''} régionale${totalRegionalAids > 1 ? 's' : ''} cumulable${totalRegionalAids > 1 ? 's' : ''} avec MaPrimeRénov’ + CEE.`,
    'Zone climatique RT2012 (H1a/H1b/H1c/H2a/H2b/H2c/H2d/H3) — module les forfaits CEE chauffage et isolation.',
    'Cumul possible : aide nationale + aide régionale + aide locale (≤ 100 % du coût TTC, règle anti-enrichissement Anah).',
    'Dataset open-data CC-BY 4.0 téléchargeable (JSON + CSV) — vérifiable et réutilisable.',
  ]

  const tldrBullets = [
    `${entries.length} régions métropolitaines · ${totalRegionalAids} aides régionales recensées · vérifié ${REVIEWED_AT}.`,
    'Zones climatiques RT2012 H1/H2/H3 — les forfaits CEE chauffage sont 30 à 60 % plus élevés en H1 (hivers froids) qu’en H3 (méditerranéen).',
    "Cumul national + régional toujours possible : MaPrimeRénov' + prime CEE + aide région + aide locale + TVA 5,5 % + éco-PTZ.",
    'Toutes les sources sont officielles (conseils régionaux + ADEME + ministère) et accessibles via le dataset open-data.',
    'Pour un projet précis : utilisez le simulateur d’aides — tous dispositifs nationaux + régionaux selon votre code postal.',
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema as Record<string, unknown>,
          articleSchema as Record<string, unknown>,
          itemListSchema as Record<string, unknown>,
          getGovernmentServiceSchema({
            name: 'Aides régionales à la rénovation énergétique',
            description:
              "Aides versées par les conseils régionaux et certaines collectivités locales en complément de MaPrimeRénov' et des CEE pour la rénovation énergétique des logements.",
            url: `${SITE_URL}/aides/par-region`,
            serviceType: 'Aide territoriale à la rénovation énergétique',
            audience: 'Propriétaires occupants et bailleurs en France métropolitaine et DOM',
            temporalCoverage: '2026-01-01/2026-12-31',
            sameAs: [
              'https://france-renov.gouv.fr/',
              'https://www.maprimerenov.gouv.fr/',
              'https://www.service-public.fr/particuliers/vosdroits/F35083',
            ],
            serviceOperator: {
              name: 'Conseils régionaux et collectivités locales',
              url: 'https://france-renov.gouv.fr/',
            },
          }) as Record<string, unknown>,
        ]}
      />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: 'Par région' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`Hub aides rénovation énergétique 2026 organisées par région. ${entries.length} régions métropolitaines, ${totalRegionalAids} aide${totalRegionalAids > 1 ? 's' : ''} régionale${totalRegionalAids > 1 ? 's' : ''} cumulable${totalRegionalAids > 1 ? 's' : ''} avec MaPrimeRénov' et la prime CEE, classées par zone climatique RT2012.`}
          keyPoints={enBrefPoints}
        />
      </div>

      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
            <MapPin className="w-4 h-4 text-accent-300" aria-hidden="true" />
            <span className="text-sm font-medium text-accent-100">
              Aides régionales 2026 · YMYL vérifié · open-data
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Aides rénovation énergétique par région en 2026
          </h1>
          <p className="text-base md:text-lg text-accent-50/90 max-w-3xl leading-relaxed">
            Toutes les aides cumulables avec MaPrimeRénov’ et la prime CEE, classées par région
            métropolitaine. Sources : conseils régionaux, ADEME, ministère de la Transition
            écologique. Dataset téléchargeable (CC-BY 4.0).
          </p>
          <LastUpdated
            label="Recensement vérifié le"
            date={REVIEWED_AT}
            className="mt-4 text-accent-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-accent-800 font-semibold shadow-lg hover:bg-accent-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides
            </Link>
            <Link
              href="/datasets/cee-regional-aids"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-accent-300/60 text-white font-semibold hover:bg-accent-600/30 transition"
            >
              <Database className="w-5 h-5" aria-hidden="true" />
              Dataset open-data
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 border-b border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <ArticleMeta
            author={AUTHOR?.name ?? 'Équipe éditoriale ServicesArtisans'}
            authorHref={AUTHOR ? `/equipe/${AUTHOR.slug}` : '/a-propos'}
            datePublished={PUBLISHED_AT}
            dateModified={REVIEWED_AT}
          />
          <TldrBlock title="L’essentiel du hub par région" bullets={tldrBullets} />
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="regions-grid-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-accent-700" aria-hidden="true" />
            <h2
              id="regions-grid-heading"
              className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900"
            >
              {entries.length} régions métropolitaines
            </h2>
          </div>
          <p className="text-charcoal-700 mb-8 max-w-3xl">
            Cliquez sur une région pour découvrir les aides cumulables avec MaPrimeRénov’ et la
            prime CEE, ainsi que les départements indexés et la page CEE pompe à chaleur air-eau (
            <code className="text-xs bg-charcoal-100 px-1.5 py-0.5 rounded">
              {FEATURED_OP_CODE.toUpperCase()}
            </code>
            ) la plus demandée.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((e) => (
              <article
                key={e.slug}
                className="rounded-2xl border border-charcoal-100 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <header className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-heading text-lg font-bold text-charcoal-900 leading-snug">
                    {e.name}
                  </h3>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 bg-accent-50 border border-accent-100 rounded-full px-2.5 py-1"
                    aria-label={`Zone climatique RT2012 ${e.climateZone}`}
                  >
                    <Snowflake className="w-3.5 h-3.5" aria-hidden="true" />
                    Zone {e.climateZone}
                  </span>
                </header>
                <p className="text-sm text-charcoal-700 leading-relaxed mb-4">{e.climateLabel}</p>

                <div className="text-xs text-charcoal-500 uppercase tracking-wide font-semibold mb-2">
                  {e.regionalAids.length} aide{e.regionalAids.length > 1 ? 's' : ''} régionale
                  {e.regionalAids.length > 1 ? 's' : ''} cumulable
                  {e.regionalAids.length > 1 ? 's' : ''}
                </div>
                {e.regionalAids.length > 0 ? (
                  <ul className="space-y-2 mb-4 text-sm text-charcoal-800">
                    {e.regionalAids.map((aid) => (
                      <li key={aid.name} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-500 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          <a
                            href={aid.sourceUrl}
                            rel="noopener nofollow"
                            target="_blank"
                            className="font-semibold text-accent-800 hover:underline"
                          >
                            {aid.name}
                          </a>{' '}
                          — <span className="text-charcoal-600">{aid.montant}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-charcoal-500 italic mb-4">
                    Aucune aide régionale recensée — focus sur les aides nationales.
                  </p>
                )}

                {e.topIndexedDepts.length > 0 && (
                  <div className="border-t border-charcoal-100 pt-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-charcoal-500 uppercase tracking-wide font-semibold mb-2">
                      <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Départements indexés
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {e.topIndexedDepts.map((d) => (
                        <li key={d.slug}>
                          <Link
                            href={`/aides/${d.slug}`}
                            className="inline-flex items-center text-xs font-medium text-accent-800 bg-accent-50 hover:bg-accent-100 border border-accent-100 rounded-full px-2.5 py-1 transition"
                          >
                            {d.name} ({d.code})
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-charcoal-100 pt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/cee/${FEATURED_OP_CODE}/region/${e.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-accent-800 hover:underline"
                  >
                    Prime CEE PAC air-eau {e.name}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-accent-50/40 py-12 border-y border-accent-100"
        aria-labelledby="climat-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="climat-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3"
          >
            Pourquoi la zone climatique RT2012 change-t-elle vos aides ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white border border-accent-200 p-5">
              <h3 className="font-heading font-bold text-charcoal-900 mb-2">
                Zone H1 (a/b/c) — hivers froids
              </h3>
              <p className="text-sm text-charcoal-700 leading-relaxed">
                Île-de-France, Hauts-de-France, Grand Est, Auvergne-Rhône-Alpes,
                Bourgogne-Franche-Comté, Centre-Val de Loire, Normandie. Les forfaits CEE chauffage
                (BAR-TH-171 PAC air-eau, BAR-TH-113 chaudière biomasse) et isolation (BAR-EN-101
                combles) sont à leur maximum.
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-accent-200 p-5">
              <h3 className="font-heading font-bold text-charcoal-900 mb-2">
                Zone H2 (a/b/c/d) — climat océanique tempéré
              </h3>
              <p className="text-sm text-charcoal-700 leading-relaxed">
                Bretagne, Pays de la Loire, Nouvelle-Aquitaine, Occitanie. Forfaits CEE chauffage
                modérés. Importance croissante du confort été (BAR-TH-148 chauffe-eau
                thermodynamique, isolation) et des PAC air-eau performantes.
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-accent-200 p-5">
              <h3 className="font-heading font-bold text-charcoal-900 mb-2">
                Zone H3 — climat méditerranéen
              </h3>
              <p className="text-sm text-charcoal-700 leading-relaxed">
                Provence-Alpes-Côte d’Azur, Corse. Forfaits CEE chauffage les plus faibles. En
                contrepartie, les opérations ECS thermodynamique (BAR-TH-148) et la climatisation
                passive (isolation toiture BAR-EN-103) sont prioritaires.
              </p>
            </div>
          </div>
          <p className="text-sm text-charcoal-600 mt-6 flex items-start gap-2">
            <Info className="w-4 h-4 text-accent-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            Source : Réglementation thermique RT2012 + arrêtés DGEC (forfaits CEE différenciés selon
            zone climatique pour les opérations chauffage et isolation).
          </p>
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="cluster-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="cluster-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-4"
          >
            Continuer l’exploration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/aides"
              className="group rounded-2xl border border-charcoal-100 p-5 hover:border-accent-300 hover:bg-accent-50/40 transition"
            >
              <div className="font-heading font-bold text-charcoal-900 mb-1 group-hover:text-accent-800">
                Hub des aides nationales
              </div>
              <p className="text-sm text-charcoal-700">
                MaPrimeRénov’, CEE, éco-PTZ, TVA 5,5 %, Coup de pouce — les {aidesCatalog.length}{' '}
                dispositifs nationaux expliqués.
              </p>
            </Link>
            <Link
              href="/aides/maprimerenov-vs-cee"
              className="group rounded-2xl border border-charcoal-100 p-5 hover:border-accent-300 hover:bg-accent-50/40 transition"
            >
              <div className="font-heading font-bold text-charcoal-900 mb-1 group-hover:text-accent-800">
                MaPrimeRénov’ vs prime CEE — 10 différences
              </div>
              <p className="text-sm text-charcoal-700">
                Comparatif officiel des deux principaux dispositifs et règles de cumul (≤ 100 %
                TTC).
              </p>
            </Link>
            <Link
              href="/datasets/cee-regional-aids"
              className="group rounded-2xl border border-charcoal-100 p-5 hover:border-accent-300 hover:bg-accent-50/40 transition"
            >
              <div className="font-heading font-bold text-charcoal-900 mb-1 group-hover:text-accent-800">
                Dataset CEE régional (CC-BY 4.0)
              </div>
              <p className="text-sm text-charcoal-700">
                Téléchargez le recensement complet en JSON ou CSV — citation académique fournie.
              </p>
            </Link>
            <Link
              href="/maprimerenov-cumulaison-cee"
              className="group rounded-2xl border border-charcoal-100 p-5 hover:border-accent-300 hover:bg-accent-50/40 transition"
            >
              <div className="font-heading font-bold text-charcoal-900 mb-1 group-hover:text-accent-800">
                Cumul MaPrimeRénov’ + CEE famille par famille
              </div>
              <p className="text-sm text-charcoal-700">
                Détail par geste : PAC air-eau, isolation combles, chaudière biomasse, fenêtres…
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
