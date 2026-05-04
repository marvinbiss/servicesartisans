/**
 * Page : /carte-artisans-rge/[region]
 *
 * Sprint 4 — Action 16 : Carte interactive artisans RGE par région (audit l.247).
 * Hub régional RGE — entrée géographique vers les listings RGE locaux,
 * différenciée du /carte-artisans national (carte Leaflet) en se focalisant
 * sur le sous-segment RGE + contexte régional climatique + aides régionales.
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-04, country=fr) :
 * - "carte artisans rge"            → 70 vol, KD 8, CPC $1,20 ⭐ EASY WIN
 * - "artisans rge [region]"         → 30-200 vol/region, KD 5-15 ⭐
 * - "trouver artisan rge"           → 880 vol, KD 24 — ranking secondaire
 * - "annuaire rge [region]"         → 20-80 vol/region, KD 8-12
 * - Famille cumulée pivot 13 régions : ~800 vol/mois cumulés
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI sur "carte artisans rge" (KD 8, vol 70, CPC élevé) +
 *            longue traîne géo (KD < 15)
 * Cluster pillar : Rénovation Énergétique → RGE → Carte régionale
 *
 * Anti-cannibalisation :
 *   - /carte-artisans = carte interactive nationale (tous métiers, Leaflet client)
 *   - /rge/[service]/[ville] = listing RGE par métier × ville
 *   - /rge/[service] = listing RGE par métier national
 *   - Cette page = HUB régional RGE — pas de carte interactive (server-rendered),
 *     focus sur navigation contextualisée vers /rge/[service]/[ville top]
 *
 * Pourquoi pas de Leaflet ici :
 *   La carte interactive nationale couvre déjà l'usage "exploration géo".
 *   Cette page sert le SEO long-tail régional + maillage. Server-rendered =
 *   crawl friendly + 0 bailout SSR + page rapide.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Coins,
  Flame,
  Map as MapIcon,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'

import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import {
  getRegionBySlug,
  parsePopulation,
  villes as ALL_VILLES,
  type Ville,
} from '@/lib/data/france'
import {
  CEE_REGIONAL_SLUGS,
  getCeeRegionalSpecifics,
  type RegionalCeeSpecifics,
} from '@/lib/cee/regional-specifics'

export const revalidate = 86400
export const dynamicParams = false

const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'sophie-martin'

const TOP_CITIES_PER_REGION = 12

// 17 catégories décret RGE 2014-812 (alignées sur RGE_ALLOWED_SERVICES).
// Ces métiers concentrent l'éligibilité MPR/CEE/Éco-PTZ/TVA 5,5 %.
const RGE_FEATURED_SERVICES: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: 'audit-energetique', label: 'Audit énergétique' },
  { slug: 'pompe-a-chaleur', label: 'Pompe à chaleur' },
  { slug: 'isolation', label: 'Isolation' },
  { slug: 'chauffe-eau-thermodynamique', label: 'Chauffe-eau thermodynamique' },
  { slug: 'fenetres', label: 'Fenêtres double vitrage' },
  { slug: 'ventilation', label: 'VMC double flux' },
]

export function generateStaticParams() {
  return CEE_REGIONAL_SLUGS.map((slug) => ({ region: slug }))
}

type RouteParams = { region: string }

function buildPageUrl(regionSlug: string): string {
  return `${SITE_URL}/carte-artisans-rge/${regionSlug}`
}

function getTopCitiesForRegion(regionName: string): Ville[] {
  return [...ALL_VILLES]
    .filter((v) => v.region === regionName)
    .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
    .slice(0, TOP_CITIES_PER_REGION)
}

function buildTitle(regionName: string): string {
  return `Carte artisans RGE en ${regionName} 2026 — annuaire MPR/CEE certifiés`
}

function buildDescription(spec: RegionalCeeSpecifics): string {
  return `Annuaire des artisans RGE certifiés en ${spec.name} : audit énergétique, PAC, isolation, ventilation, fenêtres. Filtrage par ville, zone climatique ${spec.climateZone}, sources officielles ADEME / data.gouv.fr.`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { region: regionSlug } = await params
  const spec = getCeeRegionalSpecifics(regionSlug)
  if (!spec) {
    return {
      title: 'Carte artisans RGE — Région inconnue',
      robots: { index: false, follow: false },
    }
  }
  const title = buildTitle(spec.name)
  const description = buildDescription(spec)
  const path = `/carte-artisans-rge/${regionSlug}`

  return {
    title,
    description,
    alternates: getAlternates(path),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: 'website',
      siteName: SITE_NAME,
      locale: 'fr_FR',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true, 'max-snippet': -1 },
  }
}

export default async function CarteArtisansRgeRegionPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { region: regionSlug } = await params
  const spec = getCeeRegionalSpecifics(regionSlug)
  if (!spec) notFound()

  const region = getRegionBySlug(regionSlug)
  const topCities = getTopCitiesForRegion(spec.name)
  const path = `/carte-artisans-rge/${regionSlug}`
  const url = buildPageUrl(regionSlug)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Carte des artisans', url: '/carte-artisans' },
    { name: `Artisans RGE en ${spec.name}`, url: path },
  ])

  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: spec.name,
    description: `Région française ${spec.name}, zone climatique ${spec.climateZone}.`,
    address: {
      '@type': 'PostalAddress',
      addressRegion: spec.name,
      addressCountry: 'FR',
    },
    containsPlace: topCities.slice(0, 6).map((v) => ({
      '@type': 'City',
      name: v.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: v.name,
        postalCode: v.codePostal,
        addressRegion: spec.name,
        addressCountry: 'FR',
      },
    })),
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Villes principales de ${spec.name} pour la rénovation RGE`,
    numberOfItems: topCities.length,
    itemListElement: topCities.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/rge/audit-energetique/${v.slug}`,
      name: v.name,
    })),
  }

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: `Annuaire RGE en ${spec.name}`,
    description: `Liste officielle des artisans RGE (Reconnu Garant de l'Environnement) en ${spec.name}, synchronisée avec la base ADEME data.gouv.fr. Indispensable pour bénéficier de MaPrimeRénov', des CEE, de l'Éco-PTZ et de la TVA 5,5 %.`,
    url,
    serviceType: 'Annuaire artisans RGE certifiés',
    audience: `Propriétaires et locataires en ${spec.name} préparant un projet de rénovation énergétique`,
    temporalCoverage: '2026-01-01/2030-12-31',
    sameAs: [
      'https://france-renov.gouv.fr/trouver-un-professionnel',
      'https://data.ademe.fr/datasets/liste-des-entreprises-rge-2',
      'https://www.maprimerenov.gouv.fr/',
    ],
  })

  const faq = [
    {
      question: `Combien d'artisans RGE sont référencés en ${spec.name} ?`,
      answer: `ServicesArtisans synchronise quotidiennement la liste officielle ADEME (data.gouv.fr/datasets/liste-des-entreprises-rge-2). Le décompte exact évolue chaque mois en fonction des nouvelles certifications et expirations. Pour obtenir la liste à jour pour une ville précise de ${spec.name}, consultez la page /rge/audit-energetique/[ville] ou tout autre service RGE.`,
    },
    {
      question: `${spec.name} a-t-elle des aides régionales pour la rénovation ?`,
      answer:
        spec.regionalAids.length > 0
          ? `Oui, ${spec.regionalAids.length} aide${spec.regionalAids.length > 1 ? 's régionales' : ' régionale'} cumulable${spec.regionalAids.length > 1 ? 's' : ''} avec MaPrimeRénov' et les CEE en ${spec.name} : ${spec.regionalAids.map((a) => a.name).join(', ')}. Détails et sources officielles plus bas dans la page.`
          : `À ce jour, aucune aide régionale dédiée à la rénovation énergétique n'est référencée en ${spec.name}. Les ménages restent éligibles aux aides nationales (MPR, CEE, Coup de pouce, Éco-PTZ, TVA 5,5 %) et aux aides communales/départementales éventuelles. Consultez votre conseil régional ou France Rénov' pour les actualités.`,
    },
    {
      question: `Pourquoi la zone climatique ${spec.climateZone} compte-t-elle pour mes aides ?`,
      answer: `${spec.climateLabel} La zone climatique module les forfaits CEE des opérations chauffage (BAR-TH-*) et isolation : à kWh économisé équivalent, le forfait est calé sur le besoin thermique du logement. C'est pour cela que les aides peuvent varier d'une région à l'autre pour un même geste de rénovation.`,
    },
    {
      question: `La certification RGE est-elle obligatoire pour toutes les aides ?`,
      answer: `Oui, pour bénéficier de MaPrimeRénov' (ANAH), des primes CEE (article L221-1 du code de l'énergie), de l'Éco-PTZ (article 244 quater U du CGI) et de la TVA réduite à 5,5 %, l'artisan doit être titulaire d'une qualification RGE valide à la date de signature du devis, dans la famille de travaux concernée (QualiPAC pour les pompes à chaleur, QualiBois pour le bois énergie, Qualibat 7141 pour l'isolation des combles, etc.).`,
    },
    {
      question: `Comment vérifier qu'un artisan RGE est bien certifié ?`,
      answer: `Trois moyens convergents : (1) consultez sa fiche sur france-renov.gouv.fr/trouver-un-professionnel (annuaire officiel ADEME), (2) demandez-lui ses attestations Qualibat / QualiPAC / QualiBois en cours de validité, (3) vérifiez sur la fiche ServicesArtisans la mention "RGE certifié" qui pointe vers la qualification ADEME. La validité s'expire — exigez une attestation de moins de 12 mois.`,
    },
  ]

  const faqSchema = getFAQSchema(faq)

  const tldr = [
    `${spec.name} est en zone climatique ${spec.climateZone} — ${spec.climateLabel.split('—')[1]?.trim() || 'forfaits CEE adaptés au climat local.'}`,
    `${topCities.length} villes principales référencées : ${topCities
      .slice(0, 5)
      .map((v) => v.name)
      .join(', ')}…`,
    spec.regionalAids.length > 0
      ? `${spec.regionalAids.length} aide${spec.regionalAids.length > 1 ? 's régionales' : ' régionale'} cumulable${spec.regionalAids.length > 1 ? 's' : ''} avec MPR + CEE.`
      : `Pas d'aide régionale spécifique : MPR + CEE + Coup de pouce + Éco-PTZ + TVA 5,5 % suffisent.`,
    `Typologie résidentielle dominante : ${spec.housingMix.pctMaisonsIndividuelles} % maisons individuelles, ${spec.housingMix.pctConstructionPre1975} % construction antérieure à 1975 (gisement isolation important).`,
    `Annuaire ServicesArtisans = synchro quotidienne ADEME (data.gouv.fr) — fiabilité maximale.`,
    `Certification RGE obligatoire pour toutes les aides nationales (MPR / CEE / Éco-PTZ / TVA 5,5 %).`,
  ]

  const breadcrumbItems = [
    { label: 'Carte des artisans', href: '/carte-artisans' },
    { label: `Artisans RGE en ${spec.name}` },
  ]

  return (
    <>
      <JsonLd
        data={[breadcrumbSchema, governmentServiceSchema, placeSchema, itemListSchema, faqSchema]}
      />

      <main className="min-h-screen bg-gradient-to-b from-sand-50 to-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-primary-600 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <Breadcrumb
              items={breadcrumbItems}
              className="mb-6 text-emerald-100 [&_a]:text-emerald-100 [&_a:hover]:text-white [&_svg]:text-emerald-200 [&>ol>li:last-child_span]:text-white"
            />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-sm font-medium mb-6">
              <MapIcon className="w-4 h-4" />
              Annuaire ADEME synchronisé · zone climatique {spec.climateZone}
            </div>
            <h1
              data-speakable="true"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading mb-4 leading-tight"
            >
              Carte artisans RGE en {spec.name}
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50 max-w-3xl leading-relaxed mb-8">
              Annuaire des artisans Reconnu Garant de l&apos;Environnement en {spec.name},
              indispensables pour MaPrimeRénov&apos;, CEE, Éco-PTZ et TVA 5,5 %. Sources officielles
              ADEME mises à jour chaque jour.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/carte-artisans"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:bg-emerald-50"
              >
                <MapIcon className="w-5 h-5" />
                Carte interactive nationale
              </Link>
              <Link
                href={`/aides/${regionSlug}/renovation`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-800/40 hover:bg-emerald-800/60 text-white font-semibold rounded-xl border border-white/20 transition-all"
              >
                Aides rénovation en {spec.name}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="mt-6 text-sm text-emerald-100">
              <LastUpdated date={MODIFIED} label="Page mise à jour le" />
            </p>
          </div>
        </section>

        {/* TL;DR */}
        <section className="py-10 sm:py-12 bg-white border-b border-sand-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <TldrBlock bullets={tldr} title={`L'essentiel — RGE en ${spec.name}`} />
          </div>
        </section>

        {/* Contexte régional */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              data-speakable="true"
              className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-8"
            >
              Contexte rénovation en {spec.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white border border-sand-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Flame className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-bold text-charcoal-900">
                    Zone climatique {spec.climateZone}
                  </h3>
                </div>
                <p className="text-charcoal-700 leading-relaxed">{spec.climateLabel}</p>
              </div>

              <div className="bg-white border border-sand-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Sparkles className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-bold text-charcoal-900">Typologie résidentielle</h3>
                </div>
                <ul className="space-y-1 text-charcoal-700 text-sm">
                  <li>
                    <strong>{spec.housingMix.pctMaisonsIndividuelles} %</strong> maisons
                    individuelles (potentiel isolation extérieure ITE élevé).
                  </li>
                  <li>
                    <strong>{spec.housingMix.pctConstructionPre1975} %</strong> construction
                    antérieure à 1975 (gisement isolation toiture/murs majeur, première RT 1974).
                  </li>
                </ul>
                <p className="text-xs text-charcoal-500 mt-3">
                  Source : INSEE Recensement de la population 2021.
                </p>
              </div>
            </div>

            {/* Aides régionales */}
            {spec.regionalAids.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-charcoal-900 mb-2 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-600" />
                  Aides régionales cumulables — {spec.name}
                </h3>
                <p className="text-charcoal-700 mb-4 text-sm">
                  En complément de MaPrimeRénov&apos; et CEE :
                </p>
                <ul className="space-y-3">
                  {spec.regionalAids.map((aid) => (
                    <li key={aid.name} className="bg-white border border-sand-200 rounded-xl p-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <strong className="text-charcoal-900">{aid.name}</strong>
                        <span className="text-emerald-700 font-semibold">{aid.montant}</span>
                      </div>
                      <p className="text-sm text-charcoal-700 leading-relaxed">{aid.detail}</p>
                      <a
                        href={aid.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-xs text-emerald-700 hover:text-emerald-800 underline"
                      >
                        Source officielle
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Top villes */}
        <section className="py-12 sm:py-16 bg-sand-50 border-y border-sand-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-3">
              Villes principales — annuaire RGE
            </h2>
            <p className="text-charcoal-600 mb-8">
              {topCities.length} villes principales en {spec.name}. Cliquez pour voir
              l&apos;annuaire RGE local et les artisans certifiés audit énergétique.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {topCities.map((v) => (
                <Link
                  key={v.slug}
                  href={`/rge/audit-energetique/${v.slug}`}
                  className="flex items-start gap-2 p-4 bg-white rounded-xl border border-sand-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-charcoal-900 group-hover:text-emerald-700">
                      {v.name}
                    </div>
                    <div className="text-xs text-charcoal-500">{v.codePostal}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Métiers RGE par région */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-3">
              Annuaire par métier RGE
            </h2>
            <p className="text-charcoal-600 mb-8">
              6 familles de travaux RGE prioritaires pour la rénovation énergétique en {spec.name}.
              Chaque métier a son annuaire national avec filtre par ville.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RGE_FEATURED_SERVICES.map((s) => (
                <Link
                  key={s.slug}
                  href={`/rge/${s.slug}`}
                  className="flex items-center gap-3 p-5 bg-white border border-sand-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-charcoal-900 group-hover:text-emerald-700">
                      Artisans RGE {s.label}
                    </div>
                    <div className="text-xs text-charcoal-500">
                      Annuaire national + filtre ville
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Maillage interne */}
        <section className="py-12 sm:py-16 bg-sand-50 border-y border-sand-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-3">
              Aller plus loin
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  href: `/aides/${regionSlug}/renovation`,
                  title: `Aides rénovation en ${spec.name}`,
                  desc: 'Vue régionale des aides MPR + CEE + aides régionales cumulables.',
                },
                {
                  href: '/simulateur-aides-renovation',
                  title: 'Simulateur aides rénovation',
                  desc: 'Estimez vos aides en 45 secondes — gratuit, sans engagement.',
                },
                {
                  href: '/renovation-energetique',
                  title: 'Hub rénovation énergétique',
                  desc: 'Aides, travaux, diagnostic, passoires thermiques.',
                },
                {
                  href: '/rge/glossaire',
                  title: 'Glossaire RGE',
                  desc: 'Toutes les qualifications : Qualibat, QualiPAC, QualiBois, Qualifelec, RGE Études.',
                },
                ...(region
                  ? region.departments.slice(0, 4).map((d) => ({
                      href: `/aides/${d.slug}/cee`,
                      title: `CEE en ${d.name}`,
                      desc: `Aides CEE par département (${d.code}).`,
                    }))
                  : []),
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="bg-white border border-sand-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-charcoal-900 group-hover:text-emerald-700 mb-1">
                        {card.title}
                      </h3>
                      <p className="text-sm text-charcoal-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 bg-white border-t border-sand-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              data-speakable="true"
              className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-10 text-center"
            >
              Questions fréquentes — RGE en {spec.name}
            </h2>
            <FlagshipFaq items={faq} />
          </div>
        </section>

        {/* E-E-A-T */}
        <section className="py-12 sm:py-16 bg-sand-50 border-t border-sand-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <FlagshipAuthorCard
              authorSlug={AUTHOR_SLUG}
              datePublished={PUBLISHED}
              dateModified={MODIFIED}
            />
            <FlagshipSources
              sources={[
                {
                  label: "France Rénov' — annuaire officiel des professionnels RGE",
                  url: 'https://france-renov.gouv.fr/trouver-un-professionnel',
                },
                {
                  label: 'ADEME / data.gouv.fr — liste des entreprises RGE 2',
                  url: 'https://data.ademe.fr/datasets/liste-des-entreprises-rge-2',
                },
                {
                  label: 'Décret n° 2014-812 du 16 juillet 2014 — qualifications RGE (Légifrance)',
                  url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000029259520',
                },
                {
                  label: "Code de l'énergie article L221-1 — CEE et obligation RGE (Légifrance)",
                  url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043975198',
                },
                {
                  label: 'INSEE — Recensement population 2021 (typologie logements régionale)',
                  url: 'https://www.insee.fr/fr/statistiques?theme=1&conjoncture=39',
                },
              ]}
            />
          </div>
        </section>
      </main>
    </>
  )
}
