/**
 * /aides/[slug]/renovation — Sprint 3 territorial 2026-05-04
 *
 * Cluster pillar régional cumulant aides nationales (MaPrimeRénov', CEE,
 * éco-PTZ, TVA 5,5 %) + aides régionales spécifiques pour la rénovation
 * énergétique résidentielle.
 *
 * Cible audit STRATEGIE-RENOVATION-ENERGETIQUE.md ligne 240 :
 * "13 pages /aides/[region]/renovation".
 *
 * Routing Next.js : utilise `[slug]` (pas `[region]`) pour cohérence avec
 * /aides/[slug]/ et /aides/[slug]/[aide]/. Le segment static `renovation`
 * prend précédence sur le dynamic `[aide]` quand slug correspond à une
 * région — `isCeeRegionalSlug()` filtre les non-régions.
 *
 * KW cibles (Ahrefs 2026-05) :
 * - "aides rénovation [région]" (vol 200-1 200 / KD 12-22)
 * - "MaPrimeRénov [région]" (vol 150-800 / KD 18-25)
 * - "rénovation énergétique [région]" (vol 100-600 / KD 8-15)
 * - Cluster pillar : pillar pillar -> 96 dépts -> aides nationales
 *
 * Easy win flag : OUI — KD <25 sur l'ensemble de la fenêtre, intent
 * navigationnel + commercial, page parent canonique cluster aides régional.
 *
 * Source data : `getCeeRegionalSpecifics(slug)` (regional-specifics.ts).
 * Couverture : 13 régions métropolitaines françaises (Île-de-France,
 * Auvergne-Rhône-Alpes, PACA, Occitanie, Nouvelle-Aquitaine, Hauts-de-France,
 * Grand Est, Pays de la Loire, Bretagne, Normandie, Bourgogne-Franche-Comté,
 * Centre-Val de Loire, Corse). Outre-mer exclu (forfaits CEE distincts via
 * dispositif GUSE — Sprint dédié si demande SEO confirmée).
 *
 * Author : claire-dubois (YMYL aides financières publiques).
 * Schema.org : GovernmentService + FinancialProduct + Article + Speakable
 *              + ItemList (top dépts région) + BreadcrumbList + FAQPage.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Calculator, Home, MapPin, ShieldCheck } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import {
  CEE_REGIONAL_SLUGS,
  getCeeRegionalSpecifics,
  isCeeRegionalSlug,
} from '@/lib/cee/regional-specifics'
import { regions } from '@/lib/data/france'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_NAME, SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'

export const revalidate = 86400
export const dynamicParams = false

const VALID_SLUG = /^[a-z][a-z0-9-]{0,78}[a-z0-9]$/

export function generateStaticParams() {
  // Pré-rend les 13 régions métropolitaines couvertes par REGIONAL_DATA.
  // Outre-mer exclu (cohérent avec CEE_REGIONAL_SLUGS Sprint AI Wave D —
  // forfaits CEE distincts via dispositif GUSE).
  return CEE_REGIONAL_SLUGS.map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

function truncate(s: string, max = 41): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: regionSlug } = await params
  if (!VALID_SLUG.test(regionSlug)) return {}
  if (!isCeeRegionalSlug(regionSlug)) return {}

  const reg = getCeeRegionalSpecifics(regionSlug)
  if (!reg) return {}

  const path = `/aides/${regionSlug}/renovation`
  const title = truncate(`Aides rénovation ${reg.name} 2026`)
  const description = `Aides rénovation énergétique ${reg.name} 2026 : MaPrimeRénov', CEE (zone ${reg.climateZone}), éco-PTZ, TVA 5,5 % + ${reg.regionalAids.length} aides régionales cumulables. Sources officielles.`

  return {
    title,
    description,
    alternates: getAlternates(path),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}${path}`,
      type: 'article',
    },
  }
}

export default async function AidesRegionRenovationPage({ params }: PageProps) {
  const { slug: regionSlug } = await params
  if (!VALID_SLUG.test(regionSlug)) notFound()
  if (!isCeeRegionalSlug(regionSlug)) notFound()

  const reg = getCeeRegionalSpecifics(regionSlug)
  if (!reg) notFound()

  const regionMeta = regions.find((r) => r.slug === regionSlug)
  const departementsList = regionMeta?.departments ?? []

  const path = `/aides/${regionSlug}/renovation`
  const pageUrl = `${SITE_URL}${path}`
  const author = authors['claire-dubois']
  const reviewer = getReviewerForAuthor(author)
  const reviewedIso = `${reg.lastReviewedAt}T00:00:00+02:00`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: 'Par région', url: '/aides/par-region' },
    { name: reg.name, url: path },
  ])

  const govSchema = getGovernmentServiceSchema({
    name: `Aides rénovation énergétique ${reg.name} 2026`,
    description: `Cumul MaPrimeRénov' (Anah), Certificats d'Économies d'Énergie (CEE, zone climatique ${reg.climateZone}), éco-PTZ et TVA 5,5 % pour les ménages ${reg.name}. ${reg.regionalAids.length} aide${reg.regionalAids.length > 1 ? 's' : ''} régionale${reg.regionalAids.length > 1 ? 's' : ''} spécifique${reg.regionalAids.length > 1 ? 's' : ''} cumulable${reg.regionalAids.length > 1 ? 's' : ''} avec les aides nationales.`,
    url: pageUrl,
    serviceType: 'Aide financière à la rénovation énergétique',
    audience: `Propriétaires occupants et bailleurs ${reg.name}`,
    temporalCoverage: '2026-01-01/2026-12-31',
    sameAs: [
      'https://france-renov.gouv.fr/',
      'https://www.maprimerenov.gouv.fr/',
      'https://www.ecologie.gouv.fr/aides-financieres-renovation-habitat',
    ],
  })

  const finProdSchema = getFinancialProductSchema({
    name: `Aides cumulées rénovation ${reg.name}`,
    description: `MaPrimeRénov' (jusqu'à 11 000 €) + prime CEE (zone ${reg.climateZone}) + Éco-PTZ (jusqu'à 50 000 € à taux zéro) + TVA 5,5 %, cumulables avec les ${reg.regionalAids.length} aide${reg.regionalAids.length > 1 ? 's' : ''} régionale${reg.regionalAids.length > 1 ? 's' : ''} ${reg.name}. Le total des aides ne peut excéder 100 % du coût TTC des travaux.`,
    url: pageUrl,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Aides versées sous condition d'éligibilité. Artisan RGE obligatoire à la signature du devis pour MaPrimeRénov' et CEE. Engagement CEE AVANT signature du devis.",
  })

  const faqs = [
    {
      question: `Quelles aides sont cumulables ${reg.name} en 2026 ?`,
      answer: `MaPrimeRénov' (aide nationale Anah), prime CEE (zone climatique ${reg.climateZone}), éco-PTZ et TVA 5,5 % se cumulent automatiquement. ${reg.regionalAids.length > 0 ? `S'ajoutent ${reg.regionalAids.length} aide${reg.regionalAids.length > 1 ? 's' : ''} régionale${reg.regionalAids.length > 1 ? 's' : ''} : ${reg.regionalAids.map((a) => a.name).join(', ')}.` : "Aucune aide régionale spécifique n'est actuellement recensée pour la rénovation énergétique résidentielle."} Le total des aides ne peut excéder 100 % du coût TTC des travaux.`,
    },
    {
      question: `Zone climatique ${reg.climateZone} : quel impact sur les primes ?`,
      answer: reg.climateLabel,
    },
    {
      question: `Comment trouver un artisan RGE ${reg.name} ?`,
      answer: `ServicesArtisans synchronise quotidiennement la base ADEME des artisans RGE actifs. Filtrez par département (${departementsList.length} départements en ${reg.name}), métier (chauffagiste, isolation, menuiserie, PAC) et qualification exacte (Qualibat, QualiPAC, QualiBois). Vérifiez systématiquement la date d'expiration de la qualification sur france-renov.gouv.fr avant signature du devis.`,
    },
    {
      question: `Qu'est-ce qui distingue ${reg.name} pour la rénovation énergétique ?`,
      answer: `${reg.housingMix.pctMaisonsIndividuelles}% de maisons individuelles ${reg.name} et ${reg.housingMix.pctConstructionPre1975}% du parc construit avant 1975 (source INSEE RP 2021). Le parc ancien est prioritaire pour la rénovation thermique : il concentre les passoires énergétiques (DPE F/G) interdites à la location dès 2025, 2028 et 2034.`,
    },
  ]
  const faqSchema = getFAQSchema(faqs, {
    pageUrl,
    name: `FAQ — Aides rénovation ${reg.name}`,
    includeSpeakable: true,
  })

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    url: pageUrl,
    headline: `Aides rénovation énergétique ${reg.name} 2026`,
    description: `Aides rénovation énergétique en ${reg.name} 2026 : MaPrimeRénov', CEE zone ${reg.climateZone}, éco-PTZ, TVA 5,5 % et aides régionales spécifiques.`,
    image: [`${SITE_URL}/og-aides-region.jpg`, `${SITE_URL}/og-default.jpg`],
    datePublished: '2026-05-04T00:00:00+02:00',
    dateModified: reviewedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Aides à la rénovation énergétique',
    keywords: [
      "MaPrimeRénov'",
      'CEE',
      'éco-PTZ',
      'TVA 5,5%',
      reg.name,
      `zone climatique ${reg.climateZone}`,
      'rénovation énergétique',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: "MaPrimeRénov'" },
      { '@type': 'Thing', name: "Certificats d'économies d'énergie" },
      { '@type': 'AdministrativeArea', name: reg.name },
      { '@type': 'Thing', name: `Zone climatique ${reg.climateZone}` },
    ],
    ...spreadCitationsForTopics(`MaPrimeRénov CEE éco-PTZ TVA ${reg.name} rénovation énergétique`),
    author: {
      '@type': 'Person',
      name: author.name,
      jobTitle: author.role,
      url: `${SITE_URL}/equipe/${author.slug}`,
      ...(author.methodology && author.methodology.length > 0 && { skills: author.methodology }),
    },
    ...(reviewer && { reviewedBy: getReviewedByPersonSchema(reviewer) }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: pageUrl,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const itemListSchema =
    departementsList.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Aides rénovation par département en ${reg.name}`,
          numberOfItems: departementsList.length,
          itemListElement: departementsList.map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `Aides rénovation ${d.name} (${d.code})`,
            url: `${SITE_URL}/aides/${d.slug}/maprimerenov`,
          })),
        }
      : null

  const tldrBullets: string[] = [
    `Cumul MaPrimeRénov' + CEE (zone ${reg.climateZone}) + Éco-PTZ + TVA 5,5 % en ${reg.name}.`,
    reg.regionalAids.length > 0
      ? `${reg.regionalAids.length} aide${reg.regionalAids.length > 1 ? 's' : ''} régionale${reg.regionalAids.length > 1 ? 's' : ''} spécifique${reg.regionalAids.length > 1 ? 's' : ''} en plus des aides nationales.`
      : 'Aides régionales spécifiques en cours de recensement.',
    `Parc immobilier : ${reg.housingMix.pctMaisonsIndividuelles}% maisons individuelles, ${reg.housingMix.pctConstructionPre1975}% construit avant 1975.`,
    `Artisan RGE obligatoire à la signature du devis (Qualibat, QualiPAC, QualiBois) — base ADEME synchronisée quotidiennement.`,
  ]

  const jsonLdItems: Record<string, unknown>[] = [
    breadcrumbSchema,
    govSchema,
    finProdSchema,
    articleSchema as Record<string, unknown>,
  ]
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)
  if (itemListSchema) jsonLdItems.push(itemListSchema as Record<string, unknown>)

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: 'Par région', href: '/aides/par-region' },
          { label: reg.name },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`Aides rénovation énergétique ${reg.name} 2026 : cumul MaPrimeRénov' + CEE + Éco-PTZ + TVA 5,5 %, plus ${reg.regionalAids.length} aide${reg.regionalAids.length > 1 ? 's' : ''} régionale${reg.regionalAids.length > 1 ? 's' : ''} spécifique${reg.regionalAids.length > 1 ? 's' : ''}. Zone climatique ${reg.climateZone}.`}
          keyPoints={[
            `${reg.regionalAids.length} aide${reg.regionalAids.length > 1 ? 's' : ''} régionale${reg.regionalAids.length > 1 ? 's' : ''} cumulable${reg.regionalAids.length > 1 ? 's' : ''} avec MPR + CEE`,
            `Zone climatique ${reg.climateZone}`,
            `${departementsList.length} départements couverts`,
            'Artisan RGE obligatoire — vérification quotidienne ADEME',
          ]}
        />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
            <MapPin className="w-4 h-4 text-accent-300" aria-hidden="true" />
            <span className="text-sm font-medium text-accent-100">
              {reg.name} — Zone climatique {reg.climateZone}
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Aides rénovation énergétique <span className="text-accent-200">{reg.name}</span> 2026
          </h1>
          <p className="text-base md:text-lg text-accent-50/90 max-w-3xl leading-relaxed">
            MaPrimeRénov&apos;, CEE, éco-PTZ et TVA 5,5 % cumulables avec {reg.regionalAids.length}{' '}
            aide{reg.regionalAids.length > 1 ? 's' : ''} régionale
            {reg.regionalAids.length > 1 ? 's' : ''} spécifique
            {reg.regionalAids.length > 1 ? 's' : ''}. Sources officielles ANAH + conseils régionaux.
          </p>
          <p className="mt-4 text-sm text-accent-100/80">
            Auteur : <span className="font-medium text-white">{author.name}</span>
            {' · '}
            Mis à jour le{' '}
            <time dateTime={reg.lastReviewedAt} className="font-medium">
              {new Date(reviewedIso).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'Europe/Paris',
              })}
            </time>
          </p>
          <LastUpdated
            label="Aides régionales vérifiées le"
            date={reg.lastReviewedAt}
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
              href="/rge"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent-200/30 text-white font-semibold hover:bg-accent-700/40 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Trouver un artisan RGE
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <TldrBlock bullets={tldrBullets} />
      </div>

      {/* Climat */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-4">
            Zone climatique {reg.climateZone} : impact sur les forfaits CEE
          </h2>
          <p className="text-charcoal-700 leading-relaxed">{reg.climateLabel}</p>
        </div>
      </section>

      {/* Aides régionales spécifiques */}
      {reg.regionalAids.length > 0 && (
        <section className="bg-accent-50/40 border-y border-accent-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
              {reg.regionalAids.length} aide{reg.regionalAids.length > 1 ? 's' : ''} régionale
              {reg.regionalAids.length > 1 ? 's' : ''} en {reg.name}
            </h2>
            <p className="text-charcoal-600 mb-8 leading-relaxed">
              Aides spécifiques au conseil régional ou aux collectivités locales, cumulables avec
              MaPrimeRénov&apos; et les CEE.
            </p>
            <div className="grid gap-5">
              {reg.regionalAids.map((aid, i) => (
                <article
                  key={`${aid.name}-${i}`}
                  className="p-6 bg-white rounded-2xl border border-accent-100"
                >
                  <div className="flex items-baseline gap-2 flex-wrap mb-2">
                    <h3 className="font-heading font-bold text-charcoal-900 text-lg">{aid.name}</h3>
                    <span className="text-sm font-bold text-accent-700">{aid.montant}</span>
                  </div>
                  <p className="text-sm text-charcoal-700 leading-relaxed mb-3">{aid.detail}</p>
                  <a
                    href={aid.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent-700 hover:underline"
                  >
                    Source officielle ↗
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Aides nationales */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
            Aides nationales cumulables {reg.name}
          </h2>
          <p className="text-charcoal-600 mb-8 leading-relaxed">
            Toutes les aides nationales pour la rénovation énergétique sont applicables en{' '}
            {reg.name}.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { slug: 'maprimerenov', label: "MaPrimeRénov'", detail: "jusqu'à 11 000 €" },
              { slug: 'cee', label: 'Prime CEE', detail: `zone ${reg.climateZone}` },
              { slug: 'eco-ptz', label: 'Éco-PTZ', detail: "jusqu'à 50 000 € à taux zéro" },
              { slug: 'tva-5-5', label: 'TVA 5,5 %', detail: 'travaux énergétiques RGE' },
            ].map((aide) => (
              <Link
                key={aide.slug}
                href={`/aides/${aide.slug}`}
                className="group flex items-center justify-between p-5 bg-accent-50/40 rounded-xl border border-accent-100 hover:border-accent-300 hover:bg-accent-50 transition"
              >
                <div>
                  <div className="font-bold text-charcoal-900 group-hover:text-accent-800 transition">
                    {aide.label}
                  </div>
                  <div className="text-sm text-charcoal-600 mt-0.5">{aide.detail}</div>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-accent-600 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Départements de la région */}
      {departementsList.length > 0 && (
        <section className="bg-sand-50 border-y border-charcoal-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
              Aides par département en {reg.name}
            </h2>
            <p className="text-charcoal-600 mb-8 leading-relaxed">
              Détail des aides MaPrimeRénov&apos; et CEE pour chaque département de la région.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {departementsList.map((d) => (
                <Link
                  key={d.slug}
                  href={`/aides/${d.slug}/maprimerenov`}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-charcoal-200 hover:border-accent-400 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Home className="w-4 h-4 text-accent-600 flex-shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-charcoal-900 group-hover:text-accent-700 transition truncate">
                      {d.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-charcoal-500 ml-2">{d.code}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Typologie habitat */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
            Parc immobilier {reg.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-6 bg-accent-50/40 rounded-2xl border border-accent-100">
              <div className="text-3xl font-extrabold text-accent-700">
                {reg.housingMix.pctMaisonsIndividuelles}%
              </div>
              <div className="text-sm text-charcoal-700 mt-2 leading-relaxed">
                de maisons individuelles dans le parc résidentiel (vs collectif).
              </div>
            </div>
            <div className="p-6 bg-accent-50/40 rounded-2xl border border-accent-100">
              <div className="text-3xl font-extrabold text-accent-700">
                {reg.housingMix.pctConstructionPre1975}%
              </div>
              <div className="text-sm text-charcoal-700 mt-2 leading-relaxed">
                du parc construit avant 1975 — premiers concernés par les passoires DPE F/G.
              </div>
            </div>
          </div>
          <p className="mt-5 text-xs text-charcoal-500">Source : INSEE RP 2021.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
          Questions fréquentes
        </h2>
        <p className="text-charcoal-600 mb-8 leading-relaxed">
          Les questions les plus fréquentes sur les aides rénovation énergétique {reg.name}.
        </p>
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <details
              key={`faq-${i}-${item.question.slice(0, 30)}`}
              className="group bg-white rounded-2xl border border-charcoal-200 hover:border-accent-300 transition p-6"
            >
              <summary className="font-heading font-bold text-lg text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-4">
                <span>{item.question}</span>
                <span className="text-accent-600 text-2xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-charcoal-700 mt-4 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Tier 1 2026-05-04 : YmylDisclaimer injecté via layout cluster aides. */}

      {/* CTA */}
      <section className="bg-gradient-to-br from-accent-700 to-accent-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-4">
            Lancez votre projet de rénovation en {reg.name}
          </h2>
          <p className="text-accent-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Simulez vos aides en 2 minutes ou trouvez un artisan RGE certifié dans votre
            département.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-accent-800 font-semibold shadow-lg hover:bg-accent-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides
            </Link>
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-500 text-white font-semibold hover:bg-accent-400 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Trouver un artisan RGE
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
