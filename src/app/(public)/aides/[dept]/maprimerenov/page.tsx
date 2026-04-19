import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  Calculator,
  FileCheck2,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  Thermometer,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import LastUpdated from '@/components/seo/LastUpdated'
import { getDepartementBySlug } from '@/lib/data/france'
import { getDeptPreposition } from '@/lib/geo-strings'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getPlaceSchema,
} from '@/lib/seo/jsonld'

export const revalidate = 86400
export const dynamicParams = true
const CONTENT_UPDATED_AT = '2026-04-19'

// Top 20 departements pré-rendus au build (≥70 % du trafic pSEO attendu).
// Le reste passe en ISR on-demand, invalidation quotidienne.
const PRERENDER_DEPTS: readonly string[] = [
  'paris',
  'nord',
  'bouches-du-rhone',
  'rhone',
  'seine-saint-denis',
  'yvelines',
  'hauts-de-seine',
  'gironde',
  'haute-garonne',
  'val-de-marne',
  'pas-de-calais',
  'isere',
  'essonne',
  'val-doise',
  'seine-et-marne',
  'alpes-maritimes',
  'loire-atlantique',
  'ille-et-vilaine',
  'moselle',
  'finistere',
]

export function generateStaticParams() {
  return PRERENDER_DEPTS.map((dept) => ({ dept }))
}

interface PageProps {
  params: Promise<{ dept: string }>
}

// Zones climatiques RT2012 — impact direct sur bonifications CEE.
const H3_DEPT_CODES = new Set(['06', '11', '13', '2A', '2B', '30', '34', '66', '83', '84'])
const H2_DEPT_CODES = new Set([
  '14',
  '17',
  '22',
  '29',
  '35',
  '44',
  '50',
  '56',
  '76',
  '85',
  '16',
  '24',
  '31',
  '32',
  '33',
  '40',
  '46',
  '47',
  '64',
  '65',
  '79',
  '81',
  '82',
  '86',
  '04',
  '07',
  '09',
  '12',
  '26',
  '48',
])

function deptToClimateZone(code: string): 'H1' | 'H2' | 'H3' {
  if (H3_DEPT_CODES.has(code)) return 'H3'
  if (H2_DEPT_CODES.has(code)) return 'H2'
  return 'H1'
}

const ZONE_LABELS: Record<'H1' | 'H2' | 'H3', string> = {
  H1: 'H1 (Nord, Est, Ile-de-France — climat froid)',
  H2: 'H2 (façade atlantique, sud-ouest — climat tempéré)',
  H3: 'H3 (pourtour méditerranéen — climat doux)',
}

const ZONE_IMPACT: Record<'H1' | 'H2' | 'H3', string> = {
  H1: "Les primes CEE forfaitaires pour l'isolation et le chauffage sont les plus élevées en zone H1 (gains énergétiques supérieurs au froid). La pompe à chaleur air-eau et l'isolation combles sont particulièrement rentables.",
  H2: "Zone tempérée : les primes CEE sont intermédiaires. L'isolation des murs par l'extérieur (ITE) et la pompe à chaleur restent très amortissables, surtout en maison individuelle.",
  H3: "Zone chaude : les primes CEE sont réduites sur le chauffage mais la climatisation réversible (PAC air-air) et la protection solaire toiture deviennent compétitives. L'audit énergétique est souvent décisif.",
}

function truncate(s: string, max = 58): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { dept: deptSlug } = await params
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) return {}

  const path = `/aides/${deptSlug}/maprimerenov`
  const title = truncate(`MaPrimeRénov' ${dept.name} (${dept.code}) 2026 — artisans RGE`)
  const description = `MaPrimeRénov' ${getDeptPreposition(dept.name)} : barèmes 2026, parcours geste et accompagné, artisans RGE vérifiés ADEME, simulateur officiel d'éligibilité.`

  return {
    title,
    description,
    alternates: getAlternates(path),
    openGraph: {
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: 'ServicesArtisans',
      type: 'website',
    },
  }
}

export default async function MprDeptPage({ params }: PageProps) {
  const { dept: deptSlug } = await params
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) notFound()

  const path = `/aides/${dept.slug}/maprimerenov`
  const zone = deptToClimateZone(dept.code)
  const zoneLabel = ZONE_LABELS[zone]
  const zoneImpact = ZONE_IMPACT[zone]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/renovation-energetique' },
    { name: dept.name, url: path },
  ])

  const mprSchema = getGovernmentServiceSchema({
    name: `MaPrimeRénov' ${dept.name} ${dept.code}`,
    description: `MaPrimeRénov' ${getDeptPreposition(dept.name)} (${dept.code}) : aide Anah pour la rénovation énergétique en ${dept.region}. Barèmes 2026, artisan RGE obligatoire, cumul CEE + TVA 5,5 %.`,
    url: `${SITE_URL}${path}`,
    serviceType: 'Aide financière à la rénovation énergétique',
    audience: `Propriétaires occupants et bailleurs de logements achevés depuis +15 ans ${getDeptPreposition(dept.name)}`,
    temporalCoverage: '2026-01-01/2026-12-31',
    sameAs: [
      'https://www.anah.gouv.fr/',
      'https://france-renov.gouv.fr/aides/maprimerenov',
      'https://www.maprimerenov.gouv.fr/',
    ],
  })

  const mprProductSchema = getFinancialProductSchema({
    name: `MaPrimeRénov' — ${dept.name}`,
    description: `Aide Anah versée aux ménages ${getDeptPreposition(dept.name)} pour les travaux d'économies d'énergie. Montant selon catégorie de revenus (bleu, jaune, violet, rose) et type de travaux. Artisan RGE obligatoire à la signature du devis.`,
    url: `${SITE_URL}${path}`,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Aide versée directement par l'Anah, sans frais pour le bénéficiaire.",
  })

  const placeSchema = getPlaceSchema({
    slug: dept.slug,
    name: dept.name,
    region: dept.region,
  })

  const faqs = [
    {
      question: `Qui peut bénéficier de MaPrimeRénov' ${getDeptPreposition(dept.name)} ?`,
      answer: `Tous les propriétaires ${getDeptPreposition(dept.name)} d'un logement achevé depuis plus de 15 ans (ou 2 ans pour le changement de chauffage) et occupé en résidence principale. Les propriétaires bailleurs y ont également droit avec engagement de plafonnement du loyer. Les 4 catégories de revenus (bleu, jaune, violet, rose) déterminent le montant de l'aide — les plafonds sont les mêmes sur tout le territoire métropolitain, mais les délais de versement varient selon la charge des dossiers locaux.`,
    },
    {
      question: `Zone climatique ${dept.code} : quel impact sur les primes CEE ?`,
      answer: `${dept.name} est en zone climatique ${zoneLabel}. ${zoneImpact} La prime MaPrimeRénov' elle-même n'est pas modulée par la zone climatique — ce sont les primes CEE (certificats d'économies d'énergie) cumulables qui varient selon H1/H2/H3.`,
    },
    {
      question: `Comment trouver un artisan RGE ${getDeptPreposition(dept.name)} ?`,
      answer: `ServicesArtisans synchronise quotidiennement la base ADEME des artisans RGE actifs en France. Filtrez par métier (chauffagiste, isolation, menuiserie), consultez la qualification exacte (Qualibat, QualiPAC, QualiBois, Qualit'EnR) et sa date d'expiration. Vérifiez systématiquement sur france-renov.gouv.fr avant signature du devis : la qualification doit être active à la date de signature.`,
    },
  ]

  const faqSchema = getFAQSchema(faqs)

  const topVilles = (dept.villes || []).slice(0, 3)

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={mprSchema} />
      <JsonLd data={mprProductSchema} />
      {placeSchema && <JsonLd data={placeSchema} />}
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/renovation-energetique' },
          { label: dept.name },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <MapPin className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              {dept.region} — {zoneLabel.split('—')[0].trim()}
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4">
            MaPrimeRénov&apos; {getDeptPreposition(dept.name)}{' '}
            <span className="text-emerald-200">({dept.code})</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Aide officielle de l&apos;Anah pour rénover votre logement en {dept.region}. Barèmes
            2026, artisans RGE vérifiés via l&apos;API ADEME, cumul avec primes CEE et TVA 5,5 %
            automatique.
          </p>
          <LastUpdated
            label="Barèmes vérifiés le"
            date={CONTENT_UPDATED_AT}
            className="mt-4 text-emerald-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Devis gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* Simulateur CTA inline */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <SimulateurCTA variant="banner" />
        </div>
      </section>

      {/* Parcours MaPrimeRénov' */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
            Les 2 parcours MaPrimeRénov&apos; 2026
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal-900">
                  Parcours par geste
                </h3>
              </div>
              <p className="text-sm text-charcoal-600 leading-relaxed mb-3">
                Pour 1 ou 2 travaux isolés : isolation combles, fenêtres, pompe à chaleur, poêle
                granulés. Demande autonome en ligne sur maprimerenov.gouv.fr.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mb-3">
                Plafond 30 000 € / logement
              </div>
              <Link
                href="/guides/maprimerenov-2026"
                className="inline-flex items-center gap-1 text-sm text-emerald-700 font-medium hover:text-emerald-800"
              >
                Voir le guide détaillé
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-2xl border border-charcoal-100 bg-white p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal-900">
                  Parcours accompagné
                </h3>
              </div>
              <p className="text-sm text-charcoal-600 leading-relaxed mb-3">
                Obligatoire dès 2 gestes d&apos;isolation + changement de chauffage OU pour un saut
                d&apos;au moins 2 classes DPE. Accompagnement MAR obligatoire.
              </p>
              <div className="text-sm font-semibold text-emerald-700 mb-3">
                Plafond 70 000 € / logement
              </div>
              <Link
                href="/guides/maprimerenov-parcours-accompagne"
                className="inline-flex items-center gap-1 text-sm text-emerald-700 font-medium hover:text-emerald-800"
              >
                Voir le parcours accompagné
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Zone climatique */}
      <section className="bg-emerald-50/40 py-12 border-y border-emerald-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Thermometer className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-charcoal-900 mb-2">
                Zone climatique {zone} — impact sur les primes CEE
              </h2>
              <p className="text-charcoal-700 leading-relaxed">{zoneImpact}</p>
              <Link
                href="/cee"
                className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-700 font-medium hover:text-emerald-800"
              >
                Voir les primes CEE 2026
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Villes principales + artisans RGE */}
      {topVilles.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
              Artisans RGE {getDeptPreposition(dept.name)}
            </h2>
            <p className="text-charcoal-600 leading-relaxed mb-6">
              Retrouvez les artisans RGE dans les principales villes du département ({dept.chefLieu}{' '}
              et autres). Qualifications vérifiées quotidiennement via l&apos;API ADEME.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topVilles.map((ville) => (
                <Link
                  key={ville}
                  href={`/rge/renovation-energetique/${ville.toLowerCase().replace(/[\s']/g, '-').replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ûü]/g, 'u').replace(/ç/g, 'c')}`}
                  className="group block rounded-xl border border-charcoal-100 bg-white p-5 hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                    <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition">
                      Artisans RGE {ville}
                    </h3>
                  </div>
                  <p className="text-sm text-charcoal-600">
                    Chauffagistes, couvreurs, menuisiers et maçons RGE à {ville}.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-charcoal-50 py-12 border-t border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
            Questions fréquentes — MaPrimeRénov&apos; {dept.name}
          </h2>
          <div className="space-y-3">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-charcoal-200 bg-white p-5 open:border-emerald-300"
              >
                <summary className="cursor-pointer font-heading font-bold text-charcoal-900 list-none flex justify-between items-start gap-4">
                  <span>{item.question}</span>
                  <ArrowRight
                    className="w-5 h-5 rotate-90 group-open:rotate-[-90deg] transition flex-shrink-0 text-charcoal-400"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 text-charcoal-700 leading-relaxed text-sm">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signal */}
      <section className="bg-white py-8 border-t border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-4 text-sm text-charcoal-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            Sources officielles Anah et France Rénov&apos;
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            Annuaire artisans RGE synchronisé ADEME
          </div>
        </div>
      </section>
    </>
  )
}
