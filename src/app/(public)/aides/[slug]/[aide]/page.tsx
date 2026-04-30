import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Calculator, MapPin } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import AideMontants from '@/components/aides/AideMontants'
import AideEligibilite from '@/components/aides/AideEligibilite'
import AideDemarche from '@/components/aides/AideDemarche'
import AideFAQ from '@/components/aides/AideFAQ'
import RelatedAides from '@/components/aides/RelatedAides'
import AideSources from '@/components/aides/AideSources'
import YmylDisclaimer from '@/components/aides/YmylDisclaimer'
import { aidesSlugs, getAideBySlug, getCumulableAides } from '@/lib/aides/aides-catalog'
import { authors } from '@/lib/data/authors'
import { CLIMATE_ZONE_LABELS, deptToClimateZone } from '@/lib/aides/climate-zones'
import { getDepartementBySlug } from '@/lib/data/france'
import { getDeptPreposition } from '@/lib/geo-strings'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getHowToSchema,
  getPlaceSchema,
} from '@/lib/seo/jsonld'

export const dynamicParams = true
export const revalidate = 86_400

const VALID_SLUG = /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$/

const PRERENDER_DEPTS: readonly string[] = [
  'paris',
  'nord',
  'bouches-du-rhone',
  'rhone',
  'haute-garonne',
  'gironde',
  'loire-atlantique',
  'ille-et-vilaine',
  'hauts-de-seine',
  'pas-de-calais',
]

export function generateStaticParams() {
  // V3 #3 stratégie 140K — pre-render top 10 dépts × 11 aides hors MPR
  // (la route /aides/[dept]/maprimerenov est statique et prend la priorité).
  // Total pre-renders : ~110. Reste ISR on-demand.
  const otherAides = aidesSlugs.filter((s) => s !== 'maprimerenov')
  return PRERENDER_DEPTS.flatMap((slug) => otherAides.map((aide) => ({ slug, aide })))
}

interface PageProps {
  params: Promise<{ slug: string; aide: string }>
}

function truncate(s: string, max = 60): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: deptSlug, aide: aideSlug } = await params
  if (!VALID_SLUG.test(deptSlug) || !VALID_SLUG.test(aideSlug)) return {}
  const dept = getDepartementBySlug(deptSlug)
  const aide = getAideBySlug(aideSlug)
  if (!dept || !aide) return {}

  const path = `/aides/${deptSlug}/${aideSlug}`
  const title = truncate(`${aide.name} ${dept.name} (${dept.code}) 2026 — barèmes & artisans`)
  const description = truncate(
    `${aide.name} ${getDeptPreposition(dept.name)} (${dept.code}) : montants 2026, éligibilité, démarche pas-à-pas, artisans RGE locaux. ${aide.tagline}`,
    158
  )

  return {
    title,
    description,
    alternates: getAlternates(path),
    robots: { index: true, follow: true },
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${aide.name} — ${dept.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
  }
}

export default async function AideDeptPage({ params }: PageProps) {
  const { slug: deptSlug, aide: aideSlug } = await params
  if (!VALID_SLUG.test(deptSlug) || !VALID_SLUG.test(aideSlug)) notFound()
  const dept = getDepartementBySlug(deptSlug)
  const aide = getAideBySlug(aideSlug)
  if (!dept || !aide) notFound()

  const path = `/aides/${dept.slug}/${aide.slug}`
  const zone = deptToClimateZone(dept.code)
  const zoneLabel = CLIMATE_ZONE_LABELS[zone]
  const cumulables = getCumulableAides(aide.slug)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: aide.name, url: `/aides/${aide.slug}` },
    { name: dept.name, url: path },
  ])

  const placeSchema = getPlaceSchema({
    slug: dept.slug,
    name: dept.name,
    region: dept.region,
  })

  const aideMainSchema =
    aide.kind === 'GovernmentService'
      ? getGovernmentServiceSchema({
          name: `${aide.name} ${dept.name} ${dept.code}`,
          description: `${aide.name} ${getDeptPreposition(dept.name)} (${dept.code}) : ${aide.schemaDescription}`,
          url: `${SITE_URL}${path}`,
          serviceType: 'Aide financière à la rénovation énergétique',
          audience: `Bénéficiaires éligibles ${getDeptPreposition(dept.name)}`,
          temporalCoverage: aide.temporalCoverage,
          sameAs: aide.sources.map((s) => s.url),
        })
      : getFinancialProductSchema({
          name: `${aide.name} — ${dept.name}`,
          description: aide.schemaDescription,
          url: `${SITE_URL}${path}`,
          category: 'Renovation aid',
        })

  const faqs = buildLocalFaqs(aide.name, dept.name, dept.code, zoneLabel)
  const faqSchema = getFAQSchema(faqs, {
    pageUrl: `${SITE_URL}${path}`,
    name: `FAQ — ${aide.name} ${dept.name}`,
    includeSpeakable: true,
  })

  const howToSchema = getHowToSchema(
    aide.demarche.map((d) => ({ name: d.name, text: d.text })),
    {
      name: `Demander ${aide.name} ${getDeptPreposition(dept.name)}`,
      description: `Étapes pour obtenir ${aide.name} en ${dept.name} (${dept.code}).`,
      totalTime: 'P30D',
    }
  )

  // Sprint ULTRA YMYL — Article+Speakable, byline Person, dateModified =
  // aide.lastReviewed (date éditoriale honnête, pas fake freshness).
  const author = authors['claire-dubois']
  const reviewedIso = `${aide.lastReviewed}T00:00:00+02:00`
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${aide.name} ${dept.name} ${dept.code} — barèmes 2026`,
    image: [`${SITE_URL}/og-aides-${aide.slug}.jpg`, `${SITE_URL}/og-default.jpg`],
    datePublished: '2026-01-01T00:00:00+02:00',
    dateModified: reviewedIso,
    author: { '@type': 'Person', name: author.name, url: `${SITE_URL}/equipe/${author.slug}` },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}${path}`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const tldrBullets: string[] = [
    `${aide.name} ${getDeptPreposition(dept.name)} ${dept.name} (${dept.code}) — aide nationale, barèmes identiques sur tout le territoire.`,
    `Cumulable avec MaPrimeRénov', CEE, TVA 5,5 % et éco-PTZ dans la limite de 100 % du devis TTC.`,
    `Zone climatique ${zoneLabel} — impacte les primes CEE associées (modulées H1/H2/H3), pas ${aide.name} elle-même.`,
    `Artisan RGE obligatoire pour la majorité des travaux éligibles. Vérification quotidienne base ADEME.`,
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={placeSchema} />
      <JsonLd data={aideMainSchema} />
      <JsonLd data={articleSchema} />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      {howToSchema ? <JsonLd data={howToSchema} /> : null}

      <main className="min-h-screen bg-warm-cream-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Aides', href: '/aides' },
              { label: aide.name, href: `/aides/${aide.slug}` },
              { label: dept.name },
            ]}
          />

          <EnBrefBox
            summary={`${aide.name} ${getDeptPreposition(dept.name)} ${dept.name} (${dept.code}) — barèmes 2026, conditions d'éligibilité, démarche pas-à-pas et artisans RGE locaux. ${aide.tagline}`}
            keyPoints={[
              `Aide nationale — barèmes identiques sur tout le territoire`,
              `Cumul possible MaPrimeRénov' + CEE + TVA 5,5 % + éco-PTZ`,
              `Zone climatique ${zoneLabel} (impact CEE associés)`,
              `Artisan RGE obligatoire — vérification quotidienne ADEME`,
            ]}
          />

          <header className="mt-6 mb-8">
            <h1 data-speakable="true" className="text-3xl md:text-4xl font-bold text-charcoal-900">
              {aide.name} {getDeptPreposition(dept.name)} {dept.name} ({dept.code}) — 2026
            </h1>
            <p className="mt-3 text-charcoal-700">{aide.description}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-charcoal-600">
              <MapPin className="h-4 w-4" /> Région : {dept.region} · Zone climatique {zoneLabel}
            </p>
            <p className="mt-3 text-sm text-charcoal-500">
              Auteur : <span className="font-medium text-charcoal-700">{author.name}</span>
              {' · '}
              Mis à jour le{' '}
              <time dateTime={aide.lastReviewed}>
                {new Date(reviewedIso).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'Europe/Paris',
                })}
              </time>
            </p>
          </header>

          <YmylDisclaimer />

          <section className="mb-8">
            <AideMontants aideName={aide.name} montants={aide.montants} />
          </section>

          <section className="mb-8">
            <AideEligibilite eligibilite={aide.eligibilite} />
          </section>

          <section className="mb-8">
            <AideDemarche demarche={aide.demarche} />
          </section>

          <section className="mb-8 rounded-xl bg-coral-50 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-charcoal-900">
              <Calculator className="h-6 w-6" /> Estimer votre prime
            </h2>
            <p className="mb-4 text-charcoal-700">
              Notre simulateur agrège {aide.name} et les aides cumulables (CEE, MaPrimeRénov’, TVA
              5,5 %, éco-PTZ) pour vous donner le reste à charge réel sur votre projet.
            </p>
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 rounded-lg bg-coral-600 px-5 py-3 font-semibold text-white hover:bg-coral-700"
            >
              Lancer le simulateur <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <section className="mb-8">
            <h2 className="sr-only">
              L’essentiel de {aide.name} {getDeptPreposition(dept.name)} {dept.name}
            </h2>
            <TldrBlock bullets={tldrBullets} />
          </section>

          <section className="mb-8">
            <AideFAQ aideName={aide.name} faqs={faqs} />
          </section>

          {cumulables.length > 0 ? (
            <section className="mb-8">
              <RelatedAides aides={cumulables} title="Aides cumulables" />
            </section>
          ) : null}

          <section className="mb-8">
            <AideSources sources={aide.sources} lastReviewed={aide.lastReviewed} />
          </section>

          <LastUpdated date={aide.lastReviewed} />
        </div>
      </main>
    </>
  )
}

function buildLocalFaqs(aideName: string, deptName: string, deptCode: string, zoneLabel: string) {
  const prep = getDeptPreposition(deptName)
  return [
    {
      question: `${aideName} est-elle accessible ${prep} ${deptName} ?`,
      answer: `Oui, ${aideName} est une aide nationale française : tous les départements y sont éligibles, ${prep} ${deptName} (${deptCode}) y compris. Les conditions d'éligibilité et les montants sont identiques sur tout le territoire métropolitain. Les délais d'instruction peuvent toutefois varier selon la charge des guichets locaux.`,
    },
    {
      question: `Comment cumuler ${aideName} avec d'autres aides ${prep} ${deptName} ?`,
      answer: `${aideName} se cumule avec MaPrimeRénov', les certificats d'économies d'énergie (CEE), la TVA réduite à 5,5 % et l'éco-PTZ sous conditions. ${prep} ${deptName}, vous pouvez aussi solliciter les aides régionales ou départementales (Éco-chèque, primes locales) — le cumul reste possible dans la limite de 100 % du devis TTC. Faites simuler votre projet pour calculer le reste à charge réel.`,
    },
    {
      question: `Zone climatique ${deptCode} : quel impact sur les barèmes ?`,
      answer: `${deptName} est en zone climatique ${zoneLabel}. Cela influence principalement les primes CEE (modulées H1/H2/H3 pour le chauffage et l'isolation), pas ${aideName} elle-même qui applique des plafonds nationaux. Pour optimiser, combinez ${aideName} avec les CEE bonifiés qui prennent en compte votre zone.`,
    },
    {
      question: `Faut-il un artisan RGE pour bénéficier de ${aideName} ${prep} ${deptName} ?`,
      answer: `Oui, comme la majorité des aides à la rénovation énergétique, ${aideName} exige un artisan certifié RGE (Reconnu Garant de l'Environnement) pour les travaux éligibles. ${prep} ${deptName}, ServicesArtisans synchronise quotidiennement la base ADEME des artisans RGE actifs : vérifiez la qualification exacte (Qualibat, QualiPAC, QualiBois, Qualifelec) et sa date d'expiration avant signature.`,
    },
  ]
}
