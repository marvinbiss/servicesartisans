/**
 * Page : /simulateur-aides-renovation/[ville]
 *
 * Sprint 4 — Action 15 : Calculateur géo-localisé (audit l.109-114, 244-249).
 * Variante locale du simulateur racine — capture l'intent local
 * "simulateur aides + ville" avec contexte régional + artisans RGE locaux.
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-04, country=fr) :
 * - "simulateur aides renovation"        → 1 600 vol, KD 22, CPC $1,80 ⭐
 * - "simulateur maprimerenov"            → 8 100 vol, KD 36, CPC $1,40 ⭐⭐
 * - "simulation aides renovation"        → 720 vol, KD 18, CPC $1,30 ⭐
 * - "simulateur prime cee"               → 1 300 vol, KD 24, CPC $1,90 ⭐
 * - Longue traîne géo "simulateur aides [ville]" : 5-50 vol/ville
 * - Famille cumulée pivot top 100 villes : ~3 000 vol/mois cumulés
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI sur longue traîne géo (KD < 15 sur la plupart)
 * Cluster pillar : Rénovation Énergétique → Simulateur → Géo-localisé
 *
 * Anti-cannibalisation :
 *   - Page racine /simulateur-aides-renovation/ = stepper interactif national
 *   - Cette page = SEO content géolocalisé (zone climat, MPR, CEE bonifiée,
 *     aides régionales, artisans RGE locaux) + CTA vers stepper racine.
 *     Pas de duplication du stepper (un seul lieu d'engagement).
 *
 * Conformité YMYL :
 *   - Auteur identifié (Claire Dubois — aides publiques)
 *   - Sources officielles : france-renov, ANAH, ecologie.gouv, service-public
 *   - Schema.org GovernmentService + FinancialProduct + Service + Place + FAQ
 *   - LastUpdated visible
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Calculator,
  Coins,
  Flame,
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
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
} from '@/lib/seo/jsonld'
import {
  getVilleBySlug,
  getRegionSlugByName,
  parsePopulation,
  villes as ALL_VILLES,
  type Ville,
} from '@/lib/data/france'
import { zoneFromCodePostal } from '@/lib/simulateur/zones'
import { getCeeRegionalSpecifics } from '@/lib/cee/regional-specifics'
import { getRgeProvidersByServiceAndCity } from '@/lib/rge/service-city-listings'

export const revalidate = 86400
export const dynamicParams = true

const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'

const PRERENDER_TOP_VILLES_COUNT = 100

export function generateStaticParams() {
  return [...ALL_VILLES]
    .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
    .slice(0, PRERENDER_TOP_VILLES_COUNT)
    .map((v) => ({ ville: v.slug }))
}

type RouteParams = { ville: string }

function buildPageUrl(villeSlug: string): string {
  return `${SITE_URL}/simulateur-aides-renovation/${villeSlug}`
}

function buildTitle(ville: Ville): string {
  return `Simulateur aides rénovation à ${ville.name} 2026 — MPR, CEE, Éco-PTZ`
}

function buildDescription(ville: Ville): string {
  return `Estimez vos aides rénovation à ${ville.name} (${ville.codePostal}) en 45 secondes : MaPrimeRénov', CEE, Coup de pouce, Éco-PTZ. Barèmes 2026, contexte régional, artisans RGE locaux.`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { ville: villeSlug } = await params
  const ville = getVilleBySlug(villeSlug)
  if (!ville) {
    return {
      title: 'Simulateur aides rénovation — Ville inconnue',
      robots: { index: false, follow: false },
    }
  }
  const title = buildTitle(ville)
  const description = buildDescription(ville)
  const path = `/simulateur-aides-renovation/${villeSlug}`
  const url = `${SITE_URL}${path}`

  return {
    title,
    description,
    alternates: getAlternates(path),
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: SITE_NAME,
      locale: 'fr_FR',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true, 'max-snippet': -1 },
  }
}

const ZONE_DESCRIPTIONS: Record<'H1' | 'H2' | 'H3', string> = {
  H1: 'Zone climatique H1 (climat continental, hivers froids) — les forfaits CEE chauffage/isolation y sont les plus élevés grâce au besoin thermique fort.',
  H2: "Zone climatique H2 (climat océanique tempéré) — forfaits CEE intermédiaires, économies d'énergie centrées sur l'enveloppe (isolation toiture, murs).",
  H3: "Zone climatique H3 (climat méditerranéen) — forfaits CEE chauffage plus bas, focus sur la climatisation, l'isolation thermique d'été et les pompes à chaleur réversibles.",
}

const ZONE_LABEL: Record<'H1' | 'H2' | 'H3', string> = {
  H1: 'froid',
  H2: 'tempéré',
  H3: 'méditerranéen',
}

export default async function SimulateurAidesVillePage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { ville: villeSlug } = await params
  const ville = getVilleBySlug(villeSlug)
  if (!ville) notFound()

  const path = `/simulateur-aides-renovation/${villeSlug}`
  const url = buildPageUrl(villeSlug)
  const title = buildTitle(ville)
  const description = buildDescription(ville)

  // Résolution zone climatique + IDF flag (depuis CP).
  const zoneRes = zoneFromCodePostal(ville.codePostal)
  const zone = zoneRes.zone
  const zoneText = ZONE_DESCRIPTIONS[zone]

  // Résolution régionale via slug région.
  const regionSlug = getRegionSlugByName(ville.region)
  const regionalSpec = regionSlug ? getCeeRegionalSpecifics(regionSlug) : null

  // Liste artisans RGE locaux (max 5) — service audit-énergétique pour
  // amorcer le parcours rénovation. Fail-open silencieux côté listings.
  const rgeListing = await getRgeProvidersByServiceAndCity('audit-energetique', villeSlug, {
    limit: 5,
  })
  const localRgeCount = rgeListing.count || 0

  // Schemas YMYL.
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Aides à la rénovation', url: '/aides' },
    { name: 'Simulateur aides rénovation', url: '/simulateur-aides-renovation' },
    { name: ville.name, url: path },
  ])

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: `Aides rénovation énergétique à ${ville.name}`,
    description: `Estimation des aides publiques (MaPrimeRénov', CEE, Coup de pouce, Éco-PTZ, TVA 5,5 %) cumulables pour un projet de rénovation à ${ville.name} (${ville.departement}, zone climatique ${zone}). Barèmes officiels 2026.`,
    url,
    serviceType: "Simulation d'aides à la rénovation énergétique",
    audience: `Propriétaires et locataires de logements résidentiels à ${ville.name} et alentours`,
    temporalCoverage: '2026-01-01/2030-12-31',
    sameAs: [
      'https://france-renov.gouv.fr/',
      'https://www.maprimerenov.gouv.fr/',
      'https://www.service-public.fr/particuliers/vosdroits/F342',
      'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
    ],
  })

  const financialProductSchema = getFinancialProductSchema({
    name: `Aides cumulées rénovation énergétique — ${ville.name}`,
    description: `Cumul aides MaPrimeRénov' (ANAH), CEE classique ou bonification précarité, Coup de pouce, Éco-PTZ jusqu'à 50 000 €, TVA 5,5 % pour un logement situé à ${ville.name} (${ville.codePostal}). Plafond global 90 % TTC ménages très modestes.`,
    url,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      'Simulation gratuite, sans engagement. Versement effectif sous réserve : artisan RGE à la signature du devis, dépôt dossier MPR/CEE AVANT signature, justificatifs revenus + devis détaillé.',
  })

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1[data-speakable]', '.tldr-block', '.faq-question', '.faq-answer'],
    },
    about: {
      '@type': 'Place',
      name: ville.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: ville.name,
        postalCode: ville.codePostal,
        addressRegion: ville.region,
        addressCountry: 'FR',
      },
    },
  }

  const faq = [
    {
      question: `Quelles aides à la rénovation puis-je cumuler à ${ville.name} en 2026 ?`,
      answer: `À ${ville.name} (${ville.departement}, zone climatique ${zone}), vous pouvez cumuler MaPrimeRénov' (ANAH), les primes CEE (standard ou bonification précarité), le Coup de pouce pour certains gestes (isolation, biomasse, PAC), l'Éco-PTZ jusqu'à 50 000 € à taux zéro et la TVA réduite à 5,5 %. Le total des aides ne peut dépasser 90 % du coût TTC pour les ménages très modestes (Bleu), 75 % modestes (Jaune), 60 % intermédiaires (Violet), 40 % supérieurs (Rose).`,
    },
    {
      question: `${ville.name} bénéficie-t-elle de bonifications CEE spécifiques ?`,
      answer: `${zoneText} ${regionalSpec ? `Sur la région ${regionalSpec.name}, ${regionalSpec.regionalAids.length > 0 ? `${regionalSpec.regionalAids.length} aide${regionalSpec.regionalAids.length > 1 ? 's' : ''} régionale${regionalSpec.regionalAids.length > 1 ? 's' : ''} cumulable${regionalSpec.regionalAids.length > 1 ? 's' : ''} avec MPR + CEE` : "aucune aide régionale spécifique n'est référencée à date"}.` : ''}`,
    },
    {
      question: `Combien d'artisans RGE sont disponibles à ${ville.name} ?`,
      answer:
        localRgeCount > 0
          ? `${localRgeCount} artisan${localRgeCount > 1 ? 's' : ''} certifié${localRgeCount > 1 ? 's' : ''} RGE (audit énergétique et famille rénovation) ${localRgeCount > 1 ? 'sont référencés' : 'est référencé'} à ${ville.name} dans la base ServicesArtisans. La certification RGE est obligatoire pour bénéficier de MaPrimeRénov', des primes CEE, de l'Éco-PTZ et de la TVA 5,5 %.`
          : `Plusieurs artisans RGE interviennent dans le département ${ville.departement} et peuvent intervenir à ${ville.name}. Lancez le simulateur ou consultez l'annuaire pour obtenir les coordonnées des artisans RGE à proximité.`,
    },
    {
      question: 'Le simulateur est-il gratuit et sans engagement ?',
      answer:
        "Oui, 100 % gratuit et anonyme. Vous obtenez l'estimation de vos aides sans créer de compte. Si vous souhaitez un accompagnement (pré-qualification éligibilité, devis d'artisan RGE, gestion dossier MPR/CEE), vous pouvez ensuite laisser vos coordonnées — sans obligation.",
    },
    {
      question: "À quel moment dois-je faire la demande d'aides par rapport aux travaux ?",
      answer:
        "Obligatoirement AVANT la signature du devis. Pour MaPrimeRénov', vous devez déposer le dossier sur maprimerenov.gouv.fr et attendre la notification de recevabilité ; pour les primes CEE, l'offre de prime doit être acceptée avant le devis. Tout dépôt après signature entraîne un refus automatique.",
    },
  ]

  const faqSchema = getFAQSchema(faq)

  const tldr: string[] = [
    `${ville.name} est en zone climatique ${zone} (climat ${ZONE_LABEL[zone]}) — ${zone === 'H1' ? 'forfaits CEE chauffage/isolation maximisés' : zone === 'H2' ? 'forfaits CEE équilibrés' : 'forfaits CEE chauffage plus bas, focus PAC réversible et isolation été'}.`,
    `Aides cumulables 2026 : MaPrimeRénov' + CEE + Coup de pouce + Éco-PTZ + TVA 5,5 %.`,
    `Plafond cumul : 90 % TTC ménages Bleu, 75 % Jaune, 60 % Violet, 40 % Rose.`,
    regionalSpec && regionalSpec.regionalAids.length > 0
      ? `${regionalSpec.regionalAids.length} aide${regionalSpec.regionalAids.length > 1 ? 's' : ''} régionale${regionalSpec.regionalAids.length > 1 ? 's' : ''} cumulable${regionalSpec.regionalAids.length > 1 ? 's' : ''} en ${regionalSpec.name}.`
      : `Vérification des aides locales : conseil régional ${ville.region} + ANAH locale.`,
    `Demande d'aides obligatoire AVANT signature du devis (règle stricte ANAH/CEE).`,
    `Artisan RGE obligatoire pour MPR / CEE / Éco-PTZ / TVA 5,5 %.`,
  ]

  const breadcrumbItems = [
    { label: 'Aides', href: '/aides' },
    { label: 'Simulateur', href: '/simulateur-aides-renovation' },
    { label: ville.name },
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema,
          governmentServiceSchema,
          financialProductSchema,
          webPageSchema,
          faqSchema,
        ]}
      />

      <main className="min-h-screen bg-gradient-to-b from-sand-50 to-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <Breadcrumb
              items={breadcrumbItems}
              className="mb-6 text-primary-100 [&_a]:text-primary-100 [&_a:hover]:text-white [&_svg]:text-primary-200 [&>ol>li:last-child_span]:text-white"
            />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              {ville.name} ({ville.codePostal}) · zone climatique {zone}
            </div>
            <h1
              data-speakable="true"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading mb-4 leading-tight"
            >
              Simulateur aides rénovation à {ville.name} 2026
            </h1>
            <p className="text-lg sm:text-xl text-primary-50 max-w-3xl leading-relaxed mb-8">
              Estimez en <strong>45 secondes</strong> vos aides MaPrimeRénov&apos;, CEE, Coup de
              pouce et Éco-PTZ pour votre projet à {ville.name}. Gratuit, sources officielles France
              Rénov&apos;.
            </p>
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:bg-primary-50"
            >
              <Calculator className="w-5 h-5" />
              Lancer le simulateur
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-6 text-sm text-primary-100">
              <LastUpdated date={MODIFIED} label="Page mise à jour le" />
            </p>
          </div>
        </section>

        {/* TL;DR */}
        <section className="py-10 sm:py-12 bg-white border-b border-sand-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <TldrBlock bullets={tldr} title={`L'essentiel — aides rénovation à ${ville.name}`} />
          </div>
        </section>

        {/* Contexte régional + zone climat */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              data-speakable="true"
              className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-8"
            >
              Contexte rénovation à {ville.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white border border-sand-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Flame className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-bold text-charcoal-900">
                    Zone climatique {zone} (climat {ZONE_LABEL[zone]})
                  </h3>
                </div>
                <p className="text-charcoal-700 leading-relaxed">{zoneText}</p>
              </div>

              <div className="bg-white border border-sand-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Award className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-bold text-charcoal-900">
                    {localRgeCount > 0
                      ? `${localRgeCount} artisan${localRgeCount > 1 ? 's' : ''} RGE référencé${localRgeCount > 1 ? 's' : ''} à ${ville.name}`
                      : `Artisans RGE en ${ville.departement}`}
                  </h3>
                </div>
                <p className="text-charcoal-700 leading-relaxed mb-4">
                  La certification RGE (Reconnu Garant de l&apos;Environnement) est obligatoire pour
                  bénéficier de MaPrimeRénov&apos;, des primes CEE, de l&apos;Éco-PTZ et de la TVA
                  5,5 %. ServicesArtisans synchronise quotidiennement la liste officielle ADEME
                  (data.gouv.fr).
                </p>
                <Link
                  href={`/rge/audit-energetique/${ville.slug}`}
                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Voir les artisans RGE à {ville.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Aides régionales */}
            {regionalSpec && regionalSpec.regionalAids.length > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 sm:p-8 mb-8">
                <h3 className="text-xl font-bold text-charcoal-900 mb-2 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary-500" />
                  Aides régionales cumulables — {regionalSpec.name}
                </h3>
                <p className="text-charcoal-700 mb-4 text-sm">
                  En complément de MaPrimeRénov&apos; et CEE, voici les aides spécifiques au conseil
                  régional {regionalSpec.name} :
                </p>
                <ul className="space-y-3">
                  {regionalSpec.regionalAids.map((aid) => (
                    <li key={aid.name} className="bg-white border border-sand-200 rounded-xl p-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <strong className="text-charcoal-900">{aid.name}</strong>
                        <span className="text-primary-600 font-semibold">{aid.montant}</span>
                      </div>
                      <p className="text-sm text-charcoal-700 leading-relaxed">{aid.detail}</p>
                      <a
                        href={aid.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-xs text-primary-600 hover:text-primary-700 underline"
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

        {/* Aides nationales pédagogie */}
        <section className="py-12 sm:py-16 bg-sand-50 border-y border-sand-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-8">
              Aides nationales applicables à {ville.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  href: '/aides/maprimerenov',
                  title: "MaPrimeRénov' 2026",
                  desc: "Aide ANAH par geste ou parcours accompagné, jusqu'à 90 000 € (rénovation d'ampleur, ménages Bleu).",
                },
                {
                  href: '/aides/cee',
                  title: 'Primes CEE 2026',
                  desc: "Certificats d'économies d'énergie : forfaits modulés selon zone climatique et opération standardisée (BAR-TH-*, BAR-EN-*).",
                },
                {
                  href: '/aides/prime-coup-de-pouce',
                  title: 'Coup de pouce 2026',
                  desc: 'Bonifications spécifiques : PAC, biomasse, isolation. Cumulable avec CEE classique.',
                },
                {
                  href: '/aides/eco-ptz',
                  title: 'Éco-PTZ 2026',
                  desc: "Prêt à taux zéro jusqu'à 50 000 € sur 20 ans, sans condition de revenu, pour bouquet travaux.",
                },
                {
                  href: '/aides/tva-5-5',
                  title: 'TVA 5,5 % rénovation',
                  desc: "TVA réduite sur la fourniture + pose réalisée par un artisan RGE pour les travaux d'amélioration énergétique.",
                },
                {
                  href: '/renovation-energetique/diagnostic/audit-energetique',
                  title: 'Audit énergétique obligatoire',
                  desc: 'Préalable à MPR Parcours accompagné. Pris en charge à 100 % pour les ménages Bleu.',
                },
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="bg-white border border-sand-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-charcoal-900 group-hover:text-primary-700 mb-1">
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

        {/* CTA simulateur central */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-4">
              <ShieldCheck className="w-4 h-4" />
              Gratuit · sans engagement · sources officielles
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-4">
              Estimez vos aides en 45 secondes
            </h2>
            <p className="text-charcoal-600 mb-8 max-w-xl mx-auto">
              Le simulateur vous demande votre code postal, votre revenu fiscal et votre projet.
              Vous obtenez immédiatement le détail des aides MPR + CEE + Coup de pouce auxquelles
              vous êtes éligible.
            </p>
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
            >
              <Calculator className="w-5 h-5" />
              Lancer le simulateur
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 bg-sand-50 border-t border-sand-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              data-speakable="true"
              className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-heading mb-10 text-center"
            >
              Questions fréquentes — aides à {ville.name}
            </h2>
            <FlagshipFaq items={faq} />
          </div>
        </section>

        {/* E-E-A-T : Auteur + Sources */}
        <section className="py-12 sm:py-16 bg-white border-t border-sand-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <FlagshipAuthorCard
              authorSlug={AUTHOR_SLUG}
              datePublished={PUBLISHED}
              dateModified={MODIFIED}
            />
            <FlagshipSources
              sources={[
                {
                  label: "France Rénov' — service public officiel",
                  url: 'https://france-renov.gouv.fr/',
                },
                {
                  label: "Portail MaPrimeRénov' (ANAH)",
                  url: 'https://www.maprimerenov.gouv.fr/',
                },
                {
                  label: 'service-public.fr — fiche aides rénovation (F342)',
                  url: 'https://www.service-public.fr/particuliers/vosdroits/F342',
                },
                {
                  label: "Ministère de la Transition écologique — CEE (L221-1 code de l'énergie)",
                  url: 'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
                },
                {
                  label: 'ADEME — liste des entreprises RGE (data.gouv.fr)',
                  url: 'https://data.ademe.fr/datasets/liste-des-entreprises-rge-2',
                },
              ]}
            />
          </div>
        </section>
      </main>
    </>
  )
}
