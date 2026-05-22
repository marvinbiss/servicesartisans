import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowRight, Calculator, Sparkles } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import EnBrefBox from '@/components/seo/EnBrefBox'
import AideMontants from '@/components/aides/AideMontants'
import AideEligibilite from '@/components/aides/AideEligibilite'
import AideDemarche from '@/components/aides/AideDemarche'
import AideFAQ from '@/components/aides/AideFAQ'
import RelatedAides from '@/components/aides/RelatedAides'
import AideSources from '@/components/aides/AideSources'
import FinalCtaSection from '@/components/conversion/FinalCtaSection'
import DevisQuickForm from '@/components/conversion/DevisQuickForm'
import StickyMobileCTA from '@/components/conversion/StickyMobileCTA'
import RelatedLinks from '@/components/seo/RelatedLinks'
import { getAideRelatedLinks } from '@/lib/seo/related-links'
import {
  aidesCatalog,
  aidesSlugs,
  getAideBySlug,
  getCumulableAides,
  type Aide,
} from '@/lib/aides/aides-catalog'
import {
  getAidesDeptHubData,
  getAllAidesDeptHubSlugs,
  isAidesDeptHubSlug,
  type AidesDeptHubData,
} from '@/lib/aides/dept-hub-data'
import { villes } from '@/lib/data/france'
import { MAIN_RGE_SERVICES } from '@/lib/rge/pseo-content'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getHowToSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'

// Sprint AI Wave H 2026-05-03 — passage à dynamicParams=true car le slug peut
// désormais être soit une aide nationale (ex: maprimerenov), soit un dept
// hub aggregator (ex: paris). Les 2 ensembles sont disjoints — pas de
// collision possible. Pre-render exhaustif via generateStaticParams.
export const dynamicParams = true
export const revalidate = 86400

const AUTHOR = authors['claire-dubois']
const REVIEWER = getReviewerForAuthor(AUTHOR)

const CATEGORY_BADGE: Record<Aide['category'], string> = {
  'Subvention nationale': 'bg-accent-500/20 border-accent-400/30 text-accent-100',
  'Prime privée': 'bg-amber-500/20 border-amber-400/30 text-amber-100',
  Prêt: 'bg-sky-500/20 border-sky-400/30 text-sky-100',
  'Avantage fiscal': 'bg-primary-500/20 border-primary-400/30 text-primary-100',
}

export function generateStaticParams() {
  // Sprint AI Wave H — pre-render union {12 aides nationales} ∪ {30 dept hubs}.
  // Les 2 sets sont disjoints par construction (aidesSlugs = noms d'aides type
  // "maprimerenov", AIDES_INDEXED_DEPTS = slugs INSEE type "paris").
  const aideParams = aidesSlugs.map((slug) => ({ slug }))
  const deptParams = getAllAidesDeptHubSlugs().map((slug) => ({ slug }))
  return [...aideParams, ...deptParams]
}

type PageProps = {
  params: Promise<{ slug: string }>
}

// default 46 char raw : +19 char brand suffix (root layout) = ≤ 65 char rendu.
function truncate(s: string, max = 46): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const aide = getAideBySlug(slug)
  if (aide) return metadataForAide(aide, slug)
  if (isAidesDeptHubSlug(slug)) {
    const hub = getAidesDeptHubData(slug)
    if (hub) return metadataForDeptHub(hub)
  }
  return { robots: { index: false, follow: false } }
}

function metadataForAide(aide: Aide, slug: string): Metadata {
  const path = `/aides/${slug}`
  // Title brut sans " | SITE_NAME" : le root layout template l'ajoute déjà.
  // Truncate à 43 chars pour rester ≤ 60 chars une fois suffixé.
  const title = truncate(`${aide.name} 2026 — barèmes & démarche`, 43)
  const description = truncate(
    `${aide.tagline}. Conditions, montants 2026, démarche officielle.`,
    160
  )

  return {
    title,
    description,
    alternates: getAlternates(path),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title: `${aide.name} 2026 — ${SITE_NAME}`,
      description,
      url: `${SITE_URL}${path}`,
      type: 'article',
    },
  }
}

function metadataForDeptHub(hub: AidesDeptHubData): Metadata {
  const path = `/aides/${hub.dept.slug}`
  const title = truncate(`Aides rénovation ${hub.dept.name} 2026`, 43)
  const description = truncate(
    `Toutes les aides rénovation énergétique ${hub.dept.name} (${hub.dept.code}) en 2026 : MaPrimeRénov’, CEE, éco-PTZ, TVA 5,5 %. Cumul + zone climatique ${hub.climate.zone}.`,
    160
  )
  return {
    title,
    description,
    alternates: getAlternates(path),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title: `Aides rénovation ${hub.dept.name} 2026 — ${SITE_NAME}`,
      description,
      url: `${SITE_URL}${path}`,
      type: 'article',
    },
  }
}

export default async function AidePage({ params }: PageProps) {
  const { slug } = await params
  const aide = getAideBySlug(slug)
  if (!aide) {
    if (isAidesDeptHubSlug(slug)) {
      const hub = getAidesDeptHubData(slug)
      if (hub) return renderDeptHub(hub)
    }
    notFound()
  }

  const path = `/aides/${slug}`
  const url = `${SITE_URL}${path}`
  const cumulables = getCumulableAides(slug)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: aide.name, url: path },
  ])

  const sameAs = aide.sources.map((s) => s.url)

  const mainSchema =
    aide.kind === 'GovernmentService'
      ? getGovernmentServiceSchema({
          name: aide.name,
          description: aide.schemaDescription,
          url,
          serviceType: 'Aide à la rénovation énergétique',
          audience: aide.eligibilite[0],
          temporalCoverage: aide.temporalCoverage,
          sameAs,
        })
      : getFinancialProductSchema({
          name: aide.name,
          description: aide.schemaDescription,
          url,
          // Code-reviewer P1.1 — distinguer Prêt (Loan), Prime privée (Rebate
          // CEE = obligation privée des fournisseurs d'énergie, pas État) et
          // fallback Government Grant. Émettre "Government Grant" pour des
          // CEE privés serait factuellement inexact côté Schema.org.
          category:
            aide.category === 'Prêt'
              ? 'Loan'
              : aide.category === 'Prime privée'
                ? 'Rebate'
                : 'Government Grant',
          feesAndCommissionsSpecification:
            "Aucun frais pour le bénéficiaire — aide versée par l'organisme financeur.",
        })

  const faqSchema = getFAQSchema(aide.faqs, {
    pageUrl: url,
    name: `FAQ — ${aide.name}`,
    includeSpeakable: true,
  })

  const howToSchema = getHowToSchema(aide.demarche, {
    name: `Obtenir ${aide.name} en 2026`,
    description: `Démarche officielle pour bénéficier de ${aide.name} en France en 2026.`,
    totalTime: 'P90D',
  })

  // Sprint ULTRA YMYL — Article+Speakable, byline Person.
  // dateModified = aide.lastReviewed (date éditoriale honnête, pas fake
  // freshness — déjà géré par le système de revue rubric v1.3).
  const reviewedIso = `${aide.lastReviewed}T00:00:00+02:00`
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    url,
    headline: `${aide.name} 2026 — barèmes, conditions et démarche officielle`,
    description: `${aide.name} 2026 — ${aide.tagline}. Barèmes, conditions, démarche officielle et cumul avec les autres aides.`,
    image: [`${SITE_URL}/og-aides-${aide.slug}.jpg`, `${SITE_URL}/og-default.jpg`],
    datePublished: '2026-01-01T00:00:00+02:00',
    dateModified: reviewedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: aide.category,
    keywords: [
      aide.name,
      aide.category,
      ...cumulables.slice(0, 4).map((c) => c.name),
      'rénovation énergétique',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: aide.name },
      { '@type': 'Thing', name: aide.category },
      ...cumulables.slice(0, 3).map((c) => ({ '@type': 'Thing', name: c.name })),
    ],
    ...spreadCitationsForTopics(
      `${aide.name} ${aide.category} ${cumulables.map((c) => c.name).join(' ')}`
    ),
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
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: url,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const jsonLdItems: Record<string, unknown>[] = [
    breadcrumbSchema as Record<string, unknown>,
    mainSchema as Record<string, unknown>,
    articleSchema as Record<string, unknown>,
  ]
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)
  if (howToSchema) jsonLdItems.push(howToSchema as Record<string, unknown>)

  const tldrBullets = [
    `${aide.category} : ${aide.tagline.toLowerCase()}.`,
    `Plafond principal : ${aide.montants[0]?.max ?? 'voir détails'}.`,
    `Cumulable avec : ${
      cumulables
        .slice(0, 3)
        .map((c) => c.name)
        .join(', ') || 'aucune autre aide listée'
    }.`,
    `Vérifié le ${aide.lastReviewed} sur sources officielles France Rénov'.`,
  ]

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: aide.name },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`${aide.name} 2026 — ${aide.tagline}. Barèmes officiels, conditions d'éligibilité, démarche pas-à-pas et artisans RGE locaux. Vérifié le ${aide.lastReviewed}.`}
          keyPoints={[
            `Catégorie : ${aide.category}`,
            `Plafond principal : ${aide.montants[0]?.max ?? 'voir détails'}`,
            cumulables.length > 0
              ? `Cumulable avec ${cumulables.length} autre(s) aide(s)`
              : `Aide standalone, conditions strictes`,
            `Artisan RGE obligatoire pour la majorité des travaux éligibles`,
          ]}
        />
      </div>

      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div
            className={`inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-5 ${CATEGORY_BADGE[aide.category]}`}
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium">{aide.category}</span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            {aide.name}
          </h1>
          <p className="text-base md:text-lg text-accent-50/90 max-w-3xl leading-relaxed">
            {aide.tagline}
          </p>
          {AUTHOR && (
            <p className="mt-3 text-sm text-accent-100/80">
              Auteur : <span className="font-medium text-white">{AUTHOR.name}</span>
              {' · '}
              Mis à jour le{' '}
              <time dateTime={aide.lastReviewed} className="font-medium">
                {new Date(reviewedIso).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'Europe/Paris',
                })}
              </time>
            </p>
          )}
          <LastUpdated
            label="Barèmes vérifiés le"
            date={aide.lastReviewed}
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
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* DevisQuickForm immédiat post-Hero — YMYL aide financière, intention
          haute, on capture le lead avant les sections explicatives longues.
          NEUTRE artisan : pas de provider ciblé. */}
      <section
        data-devis-form
        aria-labelledby="devis-quick-aide"
        className="bg-warm-cream-50 py-10 border-b border-charcoal-100"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 id="devis-quick-aide" className="sr-only">
            Demande de devis pour {aide.name}
          </h2>
          <DevisQuickForm
            defaultService="renovation-energetique"
            source={`aide_${aide.slug.replace(/[^a-z0-9_-]/g, '-').slice(0, 30)}`}
            heading={`Éligible ${aide.name} ? Recevez 3 devis RGE en 24h`}
          />
        </div>
      </section>

      <section className="bg-white py-10 border-b border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <TldrBlock title={`${aide.name} en 4 points`} bullets={tldrBullets} />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-base text-charcoal-700 leading-relaxed">{aide.description}</p>
        </div>
      </section>

      <AideMontants aideName={aide.name} montants={aide.montants} />

      <AideEligibilite eligibilite={aide.eligibilite} />

      <AideDemarche demarche={aide.demarche} />

      <AideFAQ aideName={aide.name} faqs={aide.faqs} />

      <RelatedAides title={`Aides cumulables avec ${aide.name}`} aides={cumulables} />

      {/* Maillage topical : CEE + services + cluster reno spécifiques à l'aide */}
      <RelatedLinks
        title={`Travaux et primes CEE liés à ${aide.name}`}
        links={getAideRelatedLinks(slug)}
        ariaLabel={`Pages associées à ${aide.name}`}
      />

      <section
        className="bg-accent-50/40 py-10 border-t border-accent-100"
        aria-labelledby="rge-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="rge-heading"
            className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-3"
          >
            Trouver un artisan RGE pour {aide.name}
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-6 max-w-3xl">
            La quasi-totalité des aides 2026 exige un artisan certifié RGE actif à la signature du
            devis. ServicesArtisans synchronise quotidiennement la base ADEME des artisans RGE
            (qualifications Qualibat, QualiPAC, QualiBois, Qualifelec).
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-accent-900 uppercase tracking-wide mb-3">
                Par spécialité RGE
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {MAIN_RGE_SERVICES.map((svc) => (
                  <Link
                    key={svc.slug}
                    href={`/rge/${svc.slug}`}
                    className="block px-3 py-2 rounded-lg bg-white border border-accent-200 text-sm text-charcoal-800 hover:border-accent-400 hover:bg-accent-50 transition"
                  >
                    {svc.label} RGE
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-accent-900 uppercase tracking-wide mb-3">
                Par grande ville
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {villes.slice(0, 8).map((v) => (
                  <Link
                    key={v.slug}
                    href={`/artisans-rge/${v.slug}`}
                    className="block px-3 py-2 rounded-lg bg-white border border-accent-200 text-sm text-charcoal-800 hover:border-accent-400 hover:bg-accent-50 transition"
                  >
                    Artisans RGE à {v.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-600 text-white font-semibold hover:bg-accent-700 transition"
            >
              Annuaire artisans RGE
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-accent-600 text-accent-700 font-semibold hover:bg-accent-50 transition"
            >
              Demander un devis
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-accent-600 text-accent-700 font-semibold hover:bg-accent-50 transition"
            >
              Voir les opérations CEE
            </Link>
            <Link
              href="/aides"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-accent-600 text-accent-700 font-semibold hover:bg-accent-50 transition"
            >
              Toutes les aides
            </Link>
          </div>
        </div>
      </section>

      <AideSources
        sources={aide.sources}
        lastReviewed={aide.lastReviewed}
        author={AUTHOR ? { name: AUTHOR.name } : undefined}
      />

      <FinalCtaSection
        heading={`Estimer mes aides : ${aide.name}`}
        description="Simulateur officiel + 3 devis d'artisans RGE en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Estimer mes aides',
          href: '/simulateur-aides-renovation',
          intent: 'final-aide-simu',
        }}
        secondaryCta={{
          label: "Voir l'annuaire RGE",
          href: '/artisans-rge',
        }}
        accent="blue"
        trustLine="Artisans RGE certifiés • Source : Registre RGE ADEME • RGPD"
      />

      <StickyMobileCTA serviceSlug="renovation-energetique" ctaText={`Devis ${aide.name}`} />
    </>
  )
}

/**
 * Sprint AI Wave H 2026-05-03 — vue dept hub aggregator (cross-aides).
 * Rendu lorsque le slug correspond à un dept dans AIDES_INDEXED_DEPTS
 * plutôt qu'à une aide nationale du catalogue.
 *
 * Distribution PageRank : la page distribue vers /aides/[dept]/[aide]
 * (whitelist 5 aides indexées) + /aides/[aide] nationales + /cee + /devis.
 */
function renderDeptHub(hub: AidesDeptHubData) {
  const path = `/aides/${hub.dept.slug}`
  const url = `${SITE_URL}${path}`
  const monthYear = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: `Aides ${hub.dept.name}`, url: path },
  ])

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: `Aides rénovation énergétique ${hub.dept.name} 2026`,
    description: `Toutes les aides rénovation énergétique applicables dans le ${hub.dept.name} (${hub.dept.code}, zone climatique ${hub.climate.zone}) en 2026 : MaPrimeRénov’, CEE, éco-PTZ, TVA 5,5 %, aides régionales.`,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    breadcrumb: breadcrumbSchema,
    dateModified: new Date().toISOString().slice(0, 10),
    publisher: { '@id': `${SITE_URL}#organization` },
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Aides rénovation ${hub.dept.name} 2026`,
    numberOfItems: hub.deptIndexedAides.length + 1, // +1 maprimerenov dept-aware
    itemListElement: [
      ...hub.deptIndexedAides.map((a, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}/aides/${hub.dept.slug}/${a.slug}`,
        name: `${a.name} ${hub.dept.name}`,
      })),
      {
        '@type': 'ListItem',
        position: hub.deptIndexedAides.length + 1,
        url: `${SITE_URL}/aides/${hub.dept.slug}/maprimerenov`,
        name: `MaPrimeRénov’ ${hub.dept.name}`,
      },
    ],
  }

  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'AdministrativeArea',
    name: hub.dept.name,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'INSEE department code', value: hub.dept.code },
      { '@type': 'PropertyValue', name: 'Région', value: hub.dept.region },
      { '@type': 'PropertyValue', name: 'Zone climatique RT2012', value: hub.climate.zone },
    ],
  }

  const tldrBullets = [
    `${hub.dept.name} (${hub.dept.code}) — chef-lieu ${hub.dept.chefLieu}, région ${hub.dept.region}.`,
    `Zone climatique RT2012 : ${hub.climate.label} — module les forfaits CEE chauffage / isolation.`,
    `${aidesCatalog.length} aides nationales applicables (MaPrimeRénov’, CEE, éco-PTZ, TVA 5,5 %, etc.).`,
    hub.regionalAids.length > 0
      ? `${hub.regionalAids.length} aide${hub.regionalAids.length > 1 ? 's' : ''} régionale${hub.regionalAids.length > 1 ? 's' : ''} ${hub.dept.region} cumulables.`
      : `Aucune aide régionale ${hub.dept.region} recensée — focus sur les aides nationales.`,
    'Artisan certifié RGE obligatoire pour la quasi-totalité des dispositifs.',
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema as Record<string, unknown>,
          webPageSchema as Record<string, unknown>,
          itemListSchema as Record<string, unknown>,
          placeSchema as Record<string, unknown>,
        ]}
      />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: `Aides ${hub.dept.name}` },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`Toutes les aides rénovation énergétique applicables dans le ${hub.dept.name} (${hub.dept.code}) en 2026. Zone climatique ${hub.climate.zone}, ${aidesCatalog.length} aides nationales recensées et ${hub.regionalAids.length} aide${hub.regionalAids.length > 1 ? 's' : ''} régionale${hub.regionalAids.length > 1 ? 's' : ''} ${hub.dept.region}.`}
          keyPoints={[
            `Zone climatique RT2012 : ${hub.climate.zone}`,
            `${aidesCatalog.length} aides nationales (MaPrimeRénov’, CEE, éco-PTZ, TVA 5,5 %, …)`,
            `${hub.regionalAids.length} aide${hub.regionalAids.length > 1 ? 's' : ''} régionale${hub.regionalAids.length > 1 ? 's' : ''} ${hub.dept.region}`,
            'Artisans RGE locaux + simulateur d’aides en 2 minutes',
          ]}
        />
      </div>

      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-4 h-4 text-accent-300" aria-hidden="true" />
            <span className="text-sm font-medium text-accent-100">
              Hub aides {hub.dept.name} · zone {hub.climate.zone}
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Aides rénovation énergétique {hub.dept.name} 2026
          </h1>
          <p className="text-base md:text-lg text-accent-50/90 max-w-3xl leading-relaxed">
            {hub.dept.name} (département {hub.dept.code}, région {hub.dept.region}) :{' '}
            {hub.climate.impact}
          </p>
          <LastUpdated
            label="Catalogue vérifié pour"
            date={monthYear}
            className="mt-4 text-accent-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-accent-800 font-semibold shadow-lg hover:bg-accent-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides {hub.dept.name}
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <TldrBlock title={`L’essentiel des aides ${hub.dept.name}`} bullets={tldrBullets} />
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="aides-locales-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="aides-locales-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3"
          >
            Aides indexées spécifiquement {hub.dept.name}
          </h2>
          <p className="text-charcoal-700 mb-6">
            Les aides ci-dessous disposent d’une page dédiée au {hub.dept.name} avec barèmes locaux,
            zone climatique appliquée et conditions précises selon la fiscalité départementale.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href={`/aides/${hub.dept.slug}/maprimerenov`}
              className="group block rounded-xl border border-accent-200 bg-accent-50/40 p-5 hover:border-accent-400 hover:shadow-md transition"
            >
              <span className="inline-block text-xs font-medium text-accent-700 mb-2">
                Subvention nationale · dept-aware
              </span>
              <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-accent-700 mb-2">
                MaPrimeRénov’ {hub.dept.name}
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Barèmes 2026, plafonds revenus appliqués au {hub.dept.name}, démarche officielle
                Anah.
              </p>
            </Link>
            {hub.deptIndexedAides.map((a) => (
              <Link
                key={a.slug}
                href={`/aides/${hub.dept.slug}/${a.slug}`}
                className="group block rounded-xl border border-charcoal-100 bg-white p-5 hover:border-accent-300 hover:shadow-md transition"
              >
                <span className="inline-block text-xs font-medium text-accent-700 mb-2">
                  {a.category} · dept-aware
                </span>
                <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-accent-700 mb-2">
                  {a.name} {hub.dept.name}
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">{a.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {hub.regionalAids.length > 0 && (
        <section
          className="bg-accent-50/40 py-12 border-y border-accent-100"
          aria-labelledby="aides-regionales-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2
              id="aides-regionales-heading"
              className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3"
            >
              Aides régionales {hub.dept.region} cumulables
            </h2>
            <p className="text-charcoal-700 mb-6">
              Les aides ci-dessous sont émises par la région {hub.dept.region} et cumulables avec
              les aides nationales (MaPrimeRénov’ + CEE + TVA 5,5 % + éco-PTZ).
            </p>
            <ul className="space-y-4">
              {hub.regionalAids.map((aid) => (
                <li key={aid.name} className="rounded-xl border border-accent-200 bg-white p-5">
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <h3 className="font-heading font-bold text-charcoal-900">{aid.name}</h3>
                    <span className="text-accent-700 font-semibold">{aid.montant}</span>
                  </div>
                  <p className="text-sm text-charcoal-700 leading-relaxed mb-2">{aid.detail}</p>
                  <a
                    href={aid.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent-700 underline hover:text-accent-900"
                  >
                    Source officielle
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-white py-12" aria-labelledby="catalog-national-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="catalog-national-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3"
          >
            Toutes les aides nationales applicables {hub.dept.name}
          </h2>
          <p className="text-charcoal-700 mb-6">
            Catalogue complet des aides nationales (subventions, primes privées, prêts, fiscalité).
            Cliquer pour consulter les barèmes et conditions de chaque aide.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hub.nationalAides.map((a) => (
              <Link
                key={a.slug}
                href={`/aides/${a.slug}`}
                className="group block rounded-xl border border-charcoal-100 bg-white p-5 hover:border-accent-300 hover:shadow-md transition"
              >
                <span className="inline-block text-xs font-medium text-accent-700 mb-2">
                  {a.category}
                </span>
                <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-accent-700 mb-2">
                  {a.name}
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">{a.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FinalCtaSection
        heading={`Estimer mes aides ${hub.dept.name}`}
        description="Simulateur officiel MaPrimeRénov' / CEE + 3 devis d'artisans RGE en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Estimer mes aides',
          href: '/simulateur-aides-renovation',
          intent: 'final-aide-dept-simu',
        }}
        secondaryCta={{
          label: "Voir l'annuaire RGE",
          href: '/artisans-rge',
        }}
        accent="blue"
        trustLine="Artisans RGE certifiés • Source : Registre RGE ADEME • RGPD"
      />
    </>
  )
}
