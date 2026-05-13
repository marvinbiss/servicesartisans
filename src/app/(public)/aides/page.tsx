/**
 * /aides — hub racine rénovation énergétique (Pilier 2 stratégie CEO).
 *
 * @kw-primary    aides renovation energetique 2026
 * @kw-volume     33000
 * @kw-kd         28
 * @kw-cpc        4.80
 * @cluster       2
 * @ahrefs-source docs/ahrefs-renovation-keywords-extracted-2026-05-04.json:cluster=aides
 * @backlog-item  P3-aides-hub-racine
 * @snapshot      2026-05-04 (Ahrefs renovation keywords + V2 fused)
 *
 * Patterns DoD (cf. scripts/audit-aides-hub.mjs) :
 *   - 12 sous-pages dans aidesCatalog (route /aides/[slug] dynamique)
 *   - ≥6 pages comparatives statiques (anah-vs-maprimerenov, etc.)
 *   - WebPage @id + inLanguage + isPartOf #website
 *   - ItemList hub ≥10 items
 *   - TldrBlock + EnBrefBox rendered
 *   - Auteur+reviewer (E-E-A-T YMYL aide financière)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Compass, ShieldCheck } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import EnBrefBox from '@/components/seo/EnBrefBox'
import { ArticleMeta } from '@/components/ArticleMeta'
import { aidesCatalog } from '@/lib/aides/aides-catalog'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema, getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { getPublishedDate } from '@/lib/seo/published-dates'

export const dynamic = 'force-static'
export const revalidate = 86400

const PATH = '/aides'
const HUB_TITLE = 'Aides rénovation énergétique 2026'
const HUB_DESCRIPTION =
  "Catalogue 2026 : MaPrimeRénov', CEE, éco-PTZ, TVA 5,5 %, chèque énergie, MaPrimeAdapt'. Cumuls, conditions, démarches officielles."

const REVIEW_DATE = aidesCatalog.reduce(
  (min, a) => (a.lastReviewed < min ? a.lastReviewed : min),
  aidesCatalog[0]?.lastReviewed ?? '2026-04-29'
)
const PUBLISHED_DATE = getPublishedDate('/aides')

const AUTHOR = authors['claire-dubois']
const REVIEWER = getReviewerForAuthor(AUTHOR)

export const metadata: Metadata = {
  // Le template root layout ajoute déjà ` | ServicesArtisans`. Ne pas
  // dupliquer le brand dans le title sinon dépasse 60 chars (audit Meta
  // Quality 2026-04-30 : 71 → 50 chars).
  title: HUB_TITLE,
  description: HUB_DESCRIPTION,
  alternates: getAlternates(PATH),
  openGraph: {
    ...getOgDefaults(),
    locale: 'fr_FR',
    title: `${HUB_TITLE} — ${SITE_NAME}`,
    description: HUB_DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    type: 'website',
  },
}

const tldrBullets = [
  '12 aides nationales en 2026 : 4 catégories (subventions, primes privées, prêts, avantages fiscaux)',
  "Cumul possible MaPrimeRénov' + CEE + TVA 5,5 % + éco-PTZ sur les mêmes travaux",
  'Artisan certifié RGE obligatoire pour la quasi-totalité des aides',
  "Dépôt du dossier AVANT signature du devis pour MaPrimeRénov' et CEE",
]

export default function AidesHubPage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: HUB_TITLE,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: aidesCatalog.length,
    itemListElement: aidesCatalog.map((a, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${SITE_URL}/aides/${a.slug}`,
      name: a.name,
    })),
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${PATH}#webpage`,
    url: `${SITE_URL}${PATH}`,
    name: HUB_TITLE,
    description: HUB_DESCRIPTION,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    breadcrumb: breadcrumbSchema,
    primaryImageOfPage: { '@id': `${SITE_URL}/opengraph-image` },
    dateModified: REVIEW_DATE,
    author: AUTHOR
      ? {
          '@type': 'Person',
          name: AUTHOR.name,
          jobTitle: AUTHOR.role,
          ...(AUTHOR.methodology &&
            AUTHOR.methodology.length > 0 && { skills: AUTHOR.methodology }),
        }
      : undefined,
    publisher: { '@id': `${SITE_URL}#organization` },
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: HUB_TITLE,
    description: HUB_DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    datePublished: PUBLISHED_DATE,
    dateModified: REVIEW_DATE,
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
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(REVIEWER && { reviewedBy: getReviewedByPersonSchema(REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${PATH}` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints = [
    `${aidesCatalog.length} aides nationales recensées (subventions, primes, prêts, fiscalité)`,
    `Cumul possible MaPrimeRénov' + CEE + TVA 5,5 % + éco-PTZ`,
    `Artisan certifié RGE obligatoire pour la majorité des dispositifs`,
    `Sources : ANAH, ADEME, gouv.fr — révision mensuelle`,
  ]

  const jsonLdItems: Record<string, unknown>[] = [
    breadcrumbSchema as Record<string, unknown>,
    articleSchema as Record<string, unknown>,
    webPageSchema as Record<string, unknown>,
    itemListSchema as Record<string, unknown>,
  ]

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Aides' }]} />

      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
            <Compass className="w-4 h-4 text-accent-300" aria-hidden="true" />
            <span className="text-sm font-medium text-accent-100">Hub aides 2026</span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            {HUB_TITLE}
          </h1>
          <p className="text-base md:text-lg text-accent-50/90 max-w-3xl leading-relaxed">
            {HUB_DESCRIPTION}
          </p>
          <LastUpdated
            label="Catalogue vérifié le"
            date={REVIEW_DATE}
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
              href="/devis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-accent-300/60 text-white font-semibold hover:bg-accent-600/30 transition"
            >
              Devis gratuit RGE
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 border-b border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <ArticleMeta
            author={AUTHOR?.name ?? 'Équipe éditoriale ServicesArtisans'}
            authorHref={AUTHOR ? `/equipe/${AUTHOR.slug}` : '/a-propos'}
            datePublished={PUBLISHED_DATE}
            dateModified={REVIEW_DATE}
          />
          <EnBrefBox keyPoints={enBrefPoints} />
          <TldrBlock title="L'essentiel des aides 2026" bullets={tldrBullets} />
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="catalog-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="catalog-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
          >
            12 aides à connaître en 2026
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aidesCatalog.map((a) => (
              <Link
                key={a.slug}
                href={`/aides/${a.slug}`}
                className="group block rounded-xl border border-charcoal-100 bg-white p-5 hover:border-accent-300 hover:shadow-md transition"
              >
                <span className="inline-block text-xs font-medium text-accent-700 mb-2">
                  {a.category}
                </span>
                <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-accent-700 transition mb-2">
                  {a.name}
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed mb-3">{a.tagline}</p>
                <span className="inline-flex items-center gap-1 text-sm text-accent-700 font-medium">
                  Conditions et montants {a.name}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="cumul-aides"
        aria-labelledby="cumul-heading"
        className="bg-white py-12 border-t border-charcoal-100"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="cumul-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3"
          >
            Cumul des aides 2026 : combien au maximum&nbsp;?
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-5">
            Les 4 dispositifs principaux (MaPrimeRénov’, prime CEE, TVA 5,5 %, éco-PTZ) sont{' '}
            <strong>cumulables sur les mêmes travaux</strong>. La règle Anah dite{' '}
            «&nbsp;anti-enrichissement&nbsp;» plafonne le cumul d’aides à{' '}
            <strong>100 % du coût TTC</strong> des travaux : un ménage très modeste peut donc
            atteindre la quasi-gratuité sur certaines opérations bonifiées (chaudière biomasse,
            isolation combles 1&nbsp;€).
          </p>
          <ul className="space-y-3 text-sm text-charcoal-700 leading-relaxed mb-6">
            <li>
              <strong className="text-accent-700">MaPrimeRénov’ + CEE</strong> : cumul de droit
              commun, sans plafond spécifique au-delà de la règle anti-enrichissement.
            </li>
            <li>
              <strong className="text-accent-700">+ TVA 5,5 %</strong> : appliquée automatiquement
              par l’artisan RGE sur main-d’œuvre et matériaux énergétiques (économie ~14 %).
            </li>
            <li>
              <strong className="text-accent-700">+ éco-PTZ jusqu’à 50 000 €</strong> : prêt à taux
              zéro pour préfinancer le reste à charge ou un bouquet de travaux.
            </li>
            <li>
              <strong className="text-accent-700">+ aides locales</strong> (régions, départements,
              communes) : à vérifier sur france-renov.gouv.fr selon votre adresse.
            </li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-700 text-white font-semibold shadow-md hover:bg-accent-800 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mon cumul d’aides
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-accent-300 text-accent-700 font-semibold hover:bg-accent-50 transition"
            >
              Voir les 19 primes CEE 2026
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="bg-accent-50/40 py-12 border-y border-accent-100"
        aria-labelledby="recap-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="recap-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
          >
            Tableau récapitulatif des plafonds
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-charcoal-100 bg-white">
            <table className="w-full text-left">
              <thead className="bg-charcoal-50 text-sm text-charcoal-700">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Aide
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Plafond principal
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Catégorie
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-sm text-charcoal-800">
                {aidesCatalog.map((a) => (
                  <tr key={a.slug}>
                    <th scope="row" className="px-5 py-3 font-medium align-top">
                      <Link
                        href={`/aides/${a.slug}`}
                        className="hover:text-accent-700 hover:underline"
                      >
                        {a.name}
                      </Link>
                    </th>
                    <td className="px-5 py-3 text-accent-700 font-semibold align-top whitespace-nowrap">
                      {a.montants[0]?.max ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-charcoal-600 align-top">{a.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-charcoal-500 leading-relaxed">
            Plafonds maximums affichés. Voir détails par aide pour les conditions exactes selon
            revenus, type de travaux et zone climatique. Cumul des aides plafonné au coût TTC des
            travaux (règle anti-enrichissement Anah).
          </p>
        </div>
      </section>

      <section
        className="bg-white py-10 border-t border-charcoal-100"
        aria-labelledby="trust-heading"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-accent-700" aria-hidden="true" />
            <h2
              id="trust-heading"
              className="font-heading text-xl font-extrabold text-charcoal-900"
            >
              Notre méthodologie
            </h2>
          </div>
          <p className="text-sm text-charcoal-700 leading-relaxed mb-3">
            Catalogue rédigé par {AUTHOR?.name ?? 'la rédaction ServicesArtisans'} (
            {AUTHOR?.role ?? 'rédacteur spécialisé'}). Méthodologie publiée :
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-charcoal-700">
            {(AUTHOR?.methodology ?? []).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-charcoal-500">
            Détail complet de la méthodologie éditoriale sur{' '}
            <Link href="/methodologie" className="underline hover:text-accent-700">
              /methodologie
            </Link>{' '}
            · Sources officielles citées sur chaque page d&apos;aide.
          </p>
          <p className="mt-4 text-sm text-charcoal-700">
            Restez informé des évolutions barèmes :{' '}
            <Link
              href="/newsletter/aides-renovation"
              className="text-accent-700 underline hover:text-accent-800 font-medium"
            >
              newsletter mensuelle aides rénovation
            </Link>{' '}
            (gratuit, désinscription en un clic).
          </p>
        </div>
      </section>
    </>
  )
}
