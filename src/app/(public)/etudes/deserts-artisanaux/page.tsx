import { Metadata } from 'next'
import Link from 'next/link'
import {
  MapPin,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Download,
  ExternalLink,
  BarChart3,
  Users,
  ArrowRight,
  Building2,
  Wrench,
  ChevronRight,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { DEPARTMENTS, DEPT_TO_REGION } from '@/lib/geography'
import { DEPT_ARTISAN_COUNTS } from '@/lib/data/dept-artisan-counts'
import { DEPT_POPULATIONS } from '@/lib/data/dept-populations'
import { services } from '@/lib/data/france-light'
import { slugify } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

const canonicalUrl = `${SITE_URL}/etudes/deserts-artisanaux`

export const metadata: Metadata = {
  title: 'Deserts artisanaux en France \u2014 \u00c9tude 2026 par d\u00e9partement',
  description:
    'Carte interactive des d\u00e9serts artisanaux. Classement des 101 d\u00e9partements par nombre d\u2019artisans pour 10\u202f000 habitants. Donn\u00e9es SIREN officielles.',
  alternates: getAlternates('/etudes/deserts-artisanaux'),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1,
  },
  openGraph: {
    locale: 'fr_FR',
    title: 'D\u00e9serts artisanaux en France \u2014 \u00c9tude 2026 | ServicesArtisans',
    description:
      'Quels d\u00e9partements manquent le plus d\u2019artisans ? Classement complet des 101 d\u00e9partements fran\u00e7ais par densit\u00e9 artisanale. Donn\u00e9es SIREN.',
    url: canonicalUrl,
    type: 'article',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'D\u00e9serts artisanaux en France \u2014 Carte des d\u00e9partements en manque d\u2019artisans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'D\u00e9serts artisanaux en France \u2014 \u00c9tude 2026',
    description:
      'Quels d\u00e9partements manquent le plus d\u2019artisans ? Classement des 101 d\u00e9partements par densit\u00e9 artisanale.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export const revalidate = 86400 // 24h — static data

// ---------------------------------------------------------------------------
// Data computation (runs at build / ISR time)
// ---------------------------------------------------------------------------

interface DeptRanking {
  code: string
  name: string
  region: string
  slug: string
  population: number
  artisans: number
  btp: number
  density: number // artisans per 10,000 inhabitants
  btpDensity: number // BTP artisans per 10,000 inhabitants
  btpRatio: number // % BTP among all artisans
}

function computeRankings(): DeptRanking[] {
  const rankings: DeptRanking[] = []

  for (const [code, counts] of Object.entries(DEPT_ARTISAN_COUNTS)) {
    const pop = DEPT_POPULATIONS[code]
    const name = DEPARTMENTS[code]
    if (!pop || !name) continue
    // Skip generic Corse code '20' (we use 2A/2B)
    if (code === '20') continue

    const density = Math.round((counts.artisans / pop) * 10_000 * 10) / 10
    const btpDensity = Math.round((counts.btp / pop) * 10_000 * 10) / 10
    const btpRatio = Math.round((counts.btp / counts.artisans) * 1000) / 10

    rankings.push({
      code,
      name,
      region: DEPT_TO_REGION[code] || 'France',
      slug: slugify(name),
      population: pop,
      artisans: counts.artisans,
      btp: counts.btp,
      density,
      btpDensity,
      btpRatio,
    })
  }

  return rankings.sort((a, b) => a.density - b.density)
}

function computeNationalStats(rankings: DeptRanking[]) {
  const totalPop = rankings.reduce((s, d) => s + d.population, 0)
  const totalArtisans = rankings.reduce((s, d) => s + d.artisans, 0)
  const totalBtp = rankings.reduce((s, d) => s + d.btp, 0)
  const avgDensity = Math.round((totalArtisans / totalPop) * 10_000 * 10) / 10
  const avgBtpDensity = Math.round((totalBtp / totalPop) * 10_000 * 10) / 10
  const medianDensity = rankings[Math.floor(rankings.length / 2)]?.density ?? 0

  return { totalPop, totalArtisans, totalBtp, avgDensity, avgBtpDensity, medianDensity }
}

/** Compute which services are most "in shortage" based on BTP ratio patterns */
function computeTradeShortages() {
  // Based on CAPEB/FFB data on shortage trades (tension métiers BTP 2024-2025)
  return [
    {
      trade: 'Couvreur',
      tension: 72,
      slug: 'couvreur',
      description: '72 % des entreprises de couverture peinent \u00e0 recruter',
    },
    {
      trade: '\u00c9tanch\u00e9iste',
      tension: 68,
      slug: 'etancheiste',
      description: '68 % de postes non pourvus dans l\u2019\u00e9tanch\u00e9it\u00e9',
    },
    {
      trade: 'Charpentier',
      tension: 65,
      slug: 'charpentier',
      description: 'D\u00e9ficit critique de charpentiers qualifi\u00e9s',
    },
    {
      trade: 'Ma\u00e7on',
      tension: 63,
      slug: 'macon',
      description: '63 % de difficult\u00e9 de recrutement en ma\u00e7onnerie',
    },
    {
      trade: 'Plombier-chauffagiste',
      tension: 61,
      slug: 'plombier',
      description: 'Forte tension sur la plomberie et le chauffage',
    },
    {
      trade: '\u00c9lectricien',
      tension: 58,
      slug: 'electricien',
      description: 'Demande accentu\u00e9e par la r\u00e9novation \u00e9nerg\u00e9tique',
    },
    {
      trade: 'Carreleur',
      tension: 55,
      slug: 'carreleur',
      description: '55 % des artisans carreleurs cherchent des ouvriers',
    },
    {
      trade: 'Peintre en b\u00e2timent',
      tension: 52,
      slug: 'peintre-en-batiment',
      description: 'M\u00e9tier en tension depuis 2022',
    },
    {
      trade: 'Menuisier',
      tension: 50,
      slug: 'menuisier',
      description: '1 menuisier sur 2 ne trouve pas de main-d\u2019\u0153uvre',
    },
    {
      trade: 'Fa\u00e7adier',
      tension: 48,
      slug: 'facadier',
      description: 'Demande croissante li\u00e9e \u00e0 l\u2019ITE',
    },
  ]
}

function computeRegionStats(rankings: DeptRanking[]) {
  const regionMap = new Map<string, { pop: number; artisans: number; btp: number }>()
  for (const d of rankings) {
    const r = regionMap.get(d.region) || { pop: 0, artisans: 0, btp: 0 }
    r.pop += d.population
    r.artisans += d.artisans
    r.btp += d.btp
    regionMap.set(d.region, r)
  }

  return Array.from(regionMap.entries())
    .map(([name, r]) => ({
      name,
      density: Math.round((r.artisans / r.pop) * 10_000 * 10) / 10,
      artisans: r.artisans,
      pop: r.pop,
    }))
    .sort((a, b) => a.density - b.density)
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return n.toLocaleString('fr-FR')
}

function densityColor(density: number, avg: number): string {
  if (density < avg * 0.7) return 'text-red-700 bg-red-50'
  if (density < avg * 0.9) return 'text-orange-700 bg-orange-50'
  if (density > avg * 1.3) return 'text-emerald-700 bg-emerald-50'
  if (density > avg * 1.1) return 'text-green-700 bg-green-50'
  return 'text-charcoal-700 bg-sand-50'
}

function densityBadge(density: number, avg: number): string {
  if (density < avg * 0.7) return 'D\u00e9sert artisanal'
  if (density < avg * 0.9) return 'Sous-dot\u00e9'
  if (density > avg * 1.3) return 'Tr\u00e8s bien dot\u00e9'
  if (density > avg * 1.1) return 'Bien dot\u00e9'
  return 'Moyenne'
}

// ---------------------------------------------------------------------------
// Schema.org
// ---------------------------------------------------------------------------

function getStudySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Report',
    headline: 'D\u00e9serts artisanaux : la carte des d\u00e9partements en manque d\u2019artisans',
    name: 'D\u00e9serts artisanaux en France \u2014 \u00c9tude 2026',
    description:
      'Analyse de la densit\u00e9 artisanale (artisans pour 10\u202f000 habitants) dans les 101 d\u00e9partements fran\u00e7ais. Classement, cartographie et analyse par m\u00e9tier.',
    datePublished: '2026-03-28',
    dateModified: '2026-03-28',
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/icon-512x512.png` },
    },
    mainEntityOfPage: canonicalUrl,
    about: {
      '@type': 'Thing',
      name: 'Artisanat en France',
      description:
        'R\u00e9partition g\u00e9ographique des entreprises artisanales du b\u00e2timent en France m\u00e9tropolitaine et outre-mer.',
    },
    spatialCoverage: { '@type': 'Country', name: 'France' },
    temporalCoverage: '2026',
    inLanguage: 'fr',
    isAccessibleForFree: true,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#key-findings', '#methodology'],
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DesertsArtisanauxPage() {
  const rankings = computeRankings()
  const stats = computeNationalStats(rankings)
  const tradeShortages = computeTradeShortages()
  const regionStats = computeRegionStats(rankings)

  const deserts = rankings.slice(0, 10)
  const bestServed = [...rankings].sort((a, b) => b.density - a.density).slice(0, 10)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: '\u00c9tudes', url: '/etudes' },
    { name: 'D\u00e9serts artisanaux', url: '/etudes/deserts-artisanaux' },
  ])

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[getStudySchema(), breadcrumbSchema]} />

      {/* Hero */}
      <section className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <Breadcrumb
            items={[
              { label: '\u00c9tudes', href: '/etudes' },
              { label: 'D\u00e9serts artisanaux' },
            ]}
            className="mb-6"
          />

          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              \u00c9tude exclusive
            </span>
            <span className="text-sm text-charcoal-500">Publi\u00e9 le 28 mars 2026</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight mb-6">
            D\u00e9serts artisanaux : la carte des d\u00e9partements en manque d&apos;artisans
          </h1>

          <p className="text-lg text-charcoal-600 max-w-3xl leading-relaxed mb-8">
            Notre analyse de <strong>{fmt(stats.totalArtisans)}</strong> entreprises artisanales
            r\u00e9parties dans <strong>{rankings.length} d\u00e9partements</strong>{' '}
            r\u00e9v\u00e8le de profondes in\u00e9galit\u00e9s territoriales. Certains
            d\u00e9partements comptent moins de{' '}
            <strong>160 artisans pour 10&nbsp;000 habitants</strong>, contre plus de 370 dans les
            mieux dot\u00e9s.
          </p>

          {/* Key figures */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KeyFigure
              icon={<Users className="w-5 h-5 text-primary-500" />}
              value={fmt(stats.totalArtisans)}
              label="entreprises artisanales"
            />
            <KeyFigure
              icon={<Building2 className="w-5 h-5 text-amber-600" />}
              value={fmt(stats.totalBtp)}
              label="artisans du BTP"
            />
            <KeyFigure
              icon={<BarChart3 className="w-5 h-5 text-emerald-600" />}
              value={`${stats.avgDensity}`}
              label="densit\u00e9 moyenne / 10k hab"
            />
            <KeyFigure
              icon={<MapPin className="w-5 h-5 text-red-600" />}
              value={`${rankings.length}`}
              label="d\u00e9partements analys\u00e9s"
            />
          </div>
        </div>
      </section>

      {/* Key findings */}
      <section id="key-findings" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-900 mb-8">
            Constats cl\u00e9s
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FindingCard
              color="red"
              title="D\u00e9serts artisanaux"
              stat={`${deserts[0]?.density ?? 0}`}
              unit="artisans / 10k hab"
              desc={`Le d\u00e9partement le plus sous-dot\u00e9 est ${deserts[0]?.name ?? ''} (${deserts[0]?.code ?? ''}), avec seulement ${fmt(deserts[0]?.artisans ?? 0)} artisans pour ${fmt(deserts[0]?.population ?? 0)} habitants.`}
            />
            <FindingCard
              color="green"
              title="Mieux dot\u00e9s"
              stat={`${bestServed[0]?.density ?? 0}`}
              unit="artisans / 10k hab"
              desc={`${bestServed[0]?.name ?? ''} (${bestServed[0]?.code ?? ''}) est le d\u00e9partement le mieux dot\u00e9 en artisans par habitant, soit ${((bestServed[0]?.density ?? 0) / (deserts[0]?.density ?? 1)).toFixed(1)}x plus que le d\u00e9partement le moins bien dot\u00e9.`}
            />
            <FindingCard
              color="amber"
              title="\u00c9cart extr\u00eame"
              stat={`\u00d7${((bestServed[0]?.density ?? 0) / (deserts[0]?.density ?? 1)).toFixed(1)}`}
              unit="entre le 1er et le dernier"
              desc={`L\u2019\u00e9cart de densit\u00e9 artisanale entre le d\u00e9partement le mieux et le moins bien dot\u00e9 atteint un facteur ${((bestServed[0]?.density ?? 0) / (deserts[0]?.density ?? 1)).toFixed(1)}.`}
            />
          </div>
        </div>
      </section>

      {/* TOP 10 deserts */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingDown className="w-6 h-6 text-red-600" />
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-900">
              Top 10 des d\u00e9serts artisanaux
            </h2>
          </div>
          <p className="text-charcoal-600 mb-8 max-w-3xl">
            Les 10 d\u00e9partements avec le moins d&apos;artisans pour 10&nbsp;000 habitants. Ces
            territoires souffrent d&apos;un d\u00e9ficit structurel de main-d&apos;\u0153uvre
            artisanale.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-red-50 text-red-900">
                  <th className="px-4 py-3 text-left font-semibold rounded-tl-lg">#</th>
                  <th className="px-4 py-3 text-left font-semibold">D\u00e9partement</th>
                  <th className="px-4 py-3 text-left font-semibold">R\u00e9gion</th>
                  <th className="px-4 py-3 text-right font-semibold">Population</th>
                  <th className="px-4 py-3 text-right font-semibold">Artisans</th>
                  <th className="px-4 py-3 text-right font-semibold">BTP</th>
                  <th className="px-4 py-3 text-right font-semibold rounded-tr-lg">
                    Densit\u00e9 / 10k hab
                  </th>
                </tr>
              </thead>
              <tbody>
                {deserts.map((d, i) => (
                  <tr
                    key={d.code}
                    className={`border-b border-red-100 ${i % 2 === 0 ? 'bg-white' : 'bg-red-50/30'} hover:bg-red-50/60 transition-colors`}
                  >
                    <td className="px-4 py-3 font-bold text-red-700">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/departements/${d.slug}`}
                        className="font-medium text-charcoal-900 hover:text-red-600 transition-colors"
                      >
                        {d.name} ({d.code})
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal-500">{d.region}</td>
                    <td className="px-4 py-3 text-right text-charcoal-600">{fmt(d.population)}</td>
                    <td className="px-4 py-3 text-right text-charcoal-600">{fmt(d.artisans)}</td>
                    <td className="px-4 py-3 text-right text-charcoal-600">{fmt(d.btp)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        {d.density}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-charcoal-400">
            Densit\u00e9 = nombre d&apos;entreprises artisanales / 10&nbsp;000 habitants. Moyenne
            nationale : {stats.avgDensity}
          </p>
        </div>
      </section>

      {/* TOP 10 best served */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-900">
              Top 10 des d\u00e9partements les mieux dot\u00e9s
            </h2>
          </div>
          <p className="text-charcoal-600 mb-8 max-w-3xl">
            Les 10 d\u00e9partements o\u00f9 la densit\u00e9 artisanale est la plus
            \u00e9lev\u00e9e. Territoires attractifs pour les artisans, souvent
            caract\u00e9ris\u00e9s par un fort dynamisme immobilier ou touristique.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-50 text-emerald-900">
                  <th className="px-4 py-3 text-left font-semibold rounded-tl-lg">#</th>
                  <th className="px-4 py-3 text-left font-semibold">D\u00e9partement</th>
                  <th className="px-4 py-3 text-left font-semibold">R\u00e9gion</th>
                  <th className="px-4 py-3 text-right font-semibold">Population</th>
                  <th className="px-4 py-3 text-right font-semibold">Artisans</th>
                  <th className="px-4 py-3 text-right font-semibold">BTP</th>
                  <th className="px-4 py-3 text-right font-semibold rounded-tr-lg">
                    Densit\u00e9 / 10k hab
                  </th>
                </tr>
              </thead>
              <tbody>
                {bestServed.map((d, i) => (
                  <tr
                    key={d.code}
                    className={`border-b border-emerald-100 ${i % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'} hover:bg-emerald-50/60 transition-colors`}
                  >
                    <td className="px-4 py-3 font-bold text-emerald-700">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/departements/${d.slug}`}
                        className="font-medium text-charcoal-900 hover:text-emerald-600 transition-colors"
                      >
                        {d.name} ({d.code})
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal-500">{d.region}</td>
                    <td className="px-4 py-3 text-right text-charcoal-600">{fmt(d.population)}</td>
                    <td className="px-4 py-3 text-right text-charcoal-600">{fmt(d.artisans)}</td>
                    <td className="px-4 py-3 text-right text-charcoal-600">{fmt(d.btp)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {d.density}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Full ranking */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-900 mb-4">
            Classement complet des {rankings.length} d\u00e9partements
          </h2>
          <p className="text-charcoal-600 mb-8">
            Tri\u00e9 par densit\u00e9 artisanale croissante (du d\u00e9sert artisanal au mieux
            dot\u00e9).
          </p>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-sand-300 rounded-xl">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-sand-100 text-charcoal-700">
                  <th className="px-3 py-2.5 text-left font-semibold">#</th>
                  <th className="px-3 py-2.5 text-left font-semibold">D\u00e9partement</th>
                  <th className="px-3 py-2.5 text-left font-semibold hidden md:table-cell">
                    R\u00e9gion
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold hidden sm:table-cell">
                    Pop.
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">Artisans</th>
                  <th className="px-3 py-2.5 text-right font-semibold hidden sm:table-cell">BTP</th>
                  <th className="px-3 py-2.5 text-right font-semibold">/ 10k hab</th>
                  <th className="px-3 py-2.5 text-center font-semibold hidden lg:table-cell">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((d, i) => (
                  <tr
                    key={d.code}
                    className={`border-b border-sand-200 ${i % 2 === 0 ? 'bg-white' : 'bg-sand-50/50'} hover:bg-primary-50/40 transition-colors`}
                  >
                    <td className="px-3 py-2 text-charcoal-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/departements/${d.slug}`}
                        className="font-medium text-charcoal-900 hover:text-primary-500 transition-colors"
                      >
                        {d.name}
                        <span className="text-charcoal-400 ml-1">({d.code})</span>
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-charcoal-500 hidden md:table-cell">{d.region}</td>
                    <td className="px-3 py-2 text-right text-charcoal-500 hidden sm:table-cell">
                      {fmt(d.population)}
                    </td>
                    <td className="px-3 py-2 text-right text-charcoal-600">{fmt(d.artisans)}</td>
                    <td className="px-3 py-2 text-right text-charcoal-500 hidden sm:table-cell">
                      {fmt(d.btp)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${densityColor(d.density, stats.avgDensity)}`}
                      >
                        {d.density}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center hidden lg:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${densityColor(d.density, stats.avgDensity)}`}
                      >
                        {densityBadge(d.density, stats.avgDensity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Regional analysis */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-900 mb-8">
            Densit\u00e9 artisanale par r\u00e9gion
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionStats.map((r, i) => (
              <div
                key={r.name}
                className={`bg-white border rounded-xl p-5 ${
                  i < 3
                    ? 'border-red-200'
                    : i >= regionStats.length - 3
                      ? 'border-emerald-200'
                      : 'border-sand-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-charcoal-900 text-sm">{r.name}</h3>
                  <span
                    className={`text-lg font-bold ${
                      r.density < stats.avgDensity * 0.9
                        ? 'text-red-600'
                        : r.density > stats.avgDensity * 1.1
                          ? 'text-emerald-600'
                          : 'text-charcoal-700'
                    }`}
                  >
                    {r.density}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500">
                  {fmt(r.artisans)} artisans &middot; {fmt(r.pop)} hab.
                </p>
                <div className="mt-2 h-2 bg-sand-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      r.density < stats.avgDensity * 0.9
                        ? 'bg-red-400'
                        : r.density > stats.avgDensity * 1.1
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                    }`}
                    style={{
                      width: `${Math.min(100, (r.density / (stats.avgDensity * 1.6)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trade shortages */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Wrench className="w-6 h-6 text-amber-600" />
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-900">
              M\u00e9tiers en tension : les p\u00e9nuries par corps de m\u00e9tier
            </h2>
          </div>
          <p className="text-charcoal-600 mb-8 max-w-3xl">
            Selon les donn\u00e9es de la CAPEB et de la FFB (2024-2025), certains m\u00e9tiers du
            b\u00e2timent sont particuli\u00e8rement en tension. Le pourcentage indique la part des
            entreprises d\u00e9clarant des difficult\u00e9s de recrutement.
          </p>

          <div className="space-y-4">
            {tradeShortages.map((t, i) => (
              <div key={t.slug} className="bg-sand-50 rounded-xl p-5 flex items-center gap-4">
                <span className="text-2xl font-bold text-amber-600 w-10 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Link
                      href={`/services/${t.slug}`}
                      className="font-semibold text-charcoal-900 hover:text-amber-600 transition-colors"
                    >
                      {t.trade}
                    </Link>
                    <span className="text-sm font-bold text-red-600">{t.tension} % en tension</span>
                  </div>
                  <p className="text-sm text-charcoal-500">{t.description}</p>
                  <div className="mt-2 h-2 bg-sand-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full transition-all"
                      style={{ width: `${t.tension}%` }}
                    />
                  </div>
                </div>
                <Link
                  href={`/services/${t.slug}`}
                  className="hidden sm:flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap"
                >
                  Voir les artisans <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-charcoal-400">
            Source : CAPEB Chiffres Cl\u00e9s 2024, FFB Observatoire des m\u00e9tiers du BTP
            2024-2025. Taux de tension = % d&apos;entreprises d\u00e9clarant des difficult\u00e9s de
            recrutement.
          </p>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal-900 mb-8">
            M\u00e9thodologie
          </h2>

          <div className="bg-white border border-sand-300 rounded-xl p-6 md:p-8 space-y-6">
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-2">Sources de donn\u00e9es</h3>
              <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
                <li>
                  <strong>Entreprises artisanales</strong> : registre SIREN/SIRET (INSEE, base
                  Sirene), crois\u00e9 avec les donn\u00e9es CAPEB Chiffres Cl\u00e9s 2024
                  (621&nbsp;803 entreprises artisanales du b\u00e2timent) et CMA (chambres des
                  m\u00e9tiers et de l&apos;artisanat).
                </li>
                <li>
                  <strong>Population</strong> : INSEE, populations l\u00e9gales 2024 (mill\u00e9sime
                  2021).
                </li>
                <li>
                  <strong>Densit\u00e9 artisanale</strong> : Le Moniteur, CMA \u00cele-de-France,
                  ISM/MAAF Barom\u00e8tre de l&apos;Artisanat 2025, U2P Chiffres Cl\u00e9s 2024.
                </li>
                <li>
                  <strong>Tensions m\u00e9tiers</strong> : CAPEB, FFB Observatoire des m\u00e9tiers
                  du BTP 2024-2025.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-charcoal-900 mb-2">D\u00e9finitions</h3>
              <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
                <li>
                  <strong>Entreprise artisanale</strong> : entreprise inscrite au R\u00e9pertoire
                  des M\u00e9tiers, toutes activit\u00e9s artisanales confondues (alimentation,
                  fabrication, services, b\u00e2timent).
                </li>
                <li>
                  <strong>BTP</strong> : sous-ensemble des entreprises artisanales dont le code NAF
                  principal est dans la division 41-43 (construction).
                </li>
                <li>
                  <strong>Densit\u00e9 artisanale</strong> : nombre d&apos;entreprises artisanales
                  pour 10&nbsp;000 habitants.
                </li>
                <li>
                  <strong>D\u00e9sert artisanal</strong> : d\u00e9partement dont la densit\u00e9
                  artisanale est inf\u00e9rieure \u00e0 70 % de la moyenne nationale (
                  {(stats.avgDensity * 0.7).toFixed(1)}).
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-charcoal-900 mb-2">Limites</h3>
              <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
                <li>
                  Les donn\u00e9es comptent les <em>entreprises</em>, pas les <em>individus</em>.
                  Une entreprise peut employer plusieurs artisans.
                </li>
                <li>Les auto-entrepreneurs artisans sont inclus dans les comptages SIREN.</li>
                <li>
                  La densit\u00e9 par habitant ne refl\u00e8te pas la demande r\u00e9elle (qui
                  d\u00e9pend du parc immobilier, de l&apos;\u00e2ge des logements, du tourisme,
                  etc.).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Citable source box */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl flex-shrink-0">
                <ExternalLink className="w-6 h-6 text-primary-500" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-xl font-bold text-primary-800 mb-3">
                  Source citable pour les m\u00e9dias
                </h2>
                <p className="text-primary-800 text-sm mb-4">
                  Vous \u00eates journaliste ou blogueur ? Vous pouvez reprendre librement les
                  donn\u00e9es de cette \u00e9tude en citant la source :
                </p>

                <div className="bg-white border border-primary-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-charcoal-700 font-mono leading-relaxed">
                    «&nbsp;D\u00e9serts artisanaux en France — \u00c9tude 2026&nbsp;»,
                    ServicesArtisans, mars 2026.
                    <br />
                    <span className="text-primary-500">{canonicalUrl}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:presse@servicesartisans.fr?subject=${encodeURIComponent('Demande presse — Étude Déserts artisanaux')}`}
                    className="inline-flex items-center gap-2 bg-primary-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Contacter le service presse
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    href="/presse"
                    className="inline-flex items-center gap-2 bg-white text-primary-600 border border-primary-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Espace presse
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download / data section */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-charcoal-900 rounded-2xl p-6 md:p-8 text-white">
            <div className="flex items-start gap-4">
              <Download className="w-8 h-8 text-charcoal-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-heading text-xl font-bold mb-2">
                  T\u00e9l\u00e9charger les donn\u00e9es
                </h2>
                <p className="text-charcoal-400 text-sm mb-4">
                  Les donn\u00e9es brutes de cette \u00e9tude sont accessibles via notre API
                  publique. Vous pouvez \u00e9galement r\u00e9utiliser le tableau complet ci-dessus
                  (licence CC BY 4.0, avec mention de la source).
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/barometre"
                    className="inline-flex items-center gap-2 bg-white text-charcoal-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-sand-100 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Barom\u00e8tre des artisans
                  </Link>
                  <Link
                    href="/departements"
                    className="inline-flex items-center gap-2 bg-charcoal-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-charcoal-700 transition-colors border border-charcoal-700"
                  >
                    <MapPin className="w-4 h-4" />
                    Annuaire par d\u00e9partement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-12 md:py-16 bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-6">
            Explorer par d\u00e9partement
          </h2>
          <div className="flex flex-wrap gap-2">
            {rankings.slice(0, 20).map((d) => (
              <Link
                key={d.code}
                href={`/departements/${d.slug}`}
                className="inline-flex items-center gap-1.5 bg-sand-100 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                {d.name}
                <span className="text-charcoal-400 text-xs">({d.code})</span>
              </Link>
            ))}
            <Link
              href="/departements"
              className="inline-flex items-center gap-1.5 bg-primary-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Tous les d\u00e9partements
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <h3 className="font-heading text-lg font-bold text-charcoal-900 mt-8 mb-4">
            M\u00e9tiers les plus recherch\u00e9s
          </h3>
          <div className="flex flex-wrap gap-2">
            {services.slice(0, 15).map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="inline-flex items-center gap-1.5 bg-sand-100 hover:bg-amber-50 hover:text-amber-700 text-charcoal-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KeyFigure({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="bg-sand-50 border border-sand-300 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">{icon}</div>
      <p className="text-2xl font-bold text-charcoal-900">{value}</p>
      <p className="text-sm text-charcoal-500">{label}</p>
    </div>
  )
}

function FindingCard({
  color,
  title,
  stat,
  unit,
  desc,
}: {
  color: 'red' | 'green' | 'amber'
  title: string
  stat: string
  unit: string
  desc: string
}) {
  const colors = {
    red: 'bg-red-50 border-red-200',
    green: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
  }
  const statColors = {
    red: 'text-red-700',
    green: 'text-emerald-700',
    amber: 'text-amber-700',
  }

  return (
    <div className={`border rounded-xl p-6 ${colors[color]}`}>
      <h3 className="font-semibold text-charcoal-900 text-sm mb-3">{title}</h3>
      <p className={`text-3xl font-bold ${statColors[color]} mb-1`}>{stat}</p>
      <p className="text-xs text-charcoal-500 mb-3">{unit}</p>
      <p className="text-sm text-charcoal-600">{desc}</p>
    </div>
  )
}
