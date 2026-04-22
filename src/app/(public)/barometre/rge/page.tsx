import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Award, MapPin, ExternalLink, BookOpen, Database } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { ArticleMeta } from '@/components/ArticleMeta'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { createAdminClient } from '@/lib/supabase/admin'

export const revalidate = 86400 // 24h — régénéré par le cron mensuel

type RegionBucket = {
  region: string
  region_slug: string
  nb_rge_active: number
  nb_rge_expired: number
  top_qualification: string | null
  top_qualification_count: number
}
type QualificationBucket = { code: string; nb_artisans: number; rank: number }
type SpecialtyBucket = { specialty: string; nb_rge_active: number; share_pct: number }
type OrganismeBucket = { organisme: string; nb_artisans: number }

type Snapshot = {
  yearmonth: string
  captured_at: string
  total_rge_active: number
  total_rge_expired: number
  total_providers: number
  by_region: RegionBucket[]
  by_qualification: QualificationBucket[]
  by_specialty: SpecialtyBucket[]
  organismes: OrganismeBucket[]
  methodology: string
  source_note: string
}

const IS_BUILD = process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL

async function getLatestSnapshot(): Promise<Snapshot | null> {
  if (IS_BUILD) return null
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('barometre_rge_snapshots')
      .select('*')
      .order('yearmonth', { ascending: false })
      .limit(1)
    if (error || !data || data.length === 0) return null
    return data[0] as Snapshot
  } catch {
    return null
  }
}

function formatMonth(yearmonth: string): string {
  return new Date(`${yearmonth}-01T00:00:00Z`).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

const canonicalUrl = `${SITE_URL}/barometre/rge`

export async function generateMetadata(): Promise<Metadata> {
  const snap = await getLatestSnapshot()
  const month = snap ? formatMonth(snap.yearmonth) : '2026'
  const active = snap ? snap.total_rge_active.toLocaleString('fr-FR') : '50 000+'
  return {
    title: `Baromètre RGE ${month} — ${active} artisans certifiés en France`,
    description: `Statistiques ${month} : ${active} artisans RGE actifs en France, top régions, qualifications (QualiPAC, Qualibat). Source ADEME.`,
    alternates: getAlternates('/barometre/rge'),
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large' as const,
      'max-video-preview': -1,
    },
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title: `Baromètre RGE ${month} | ${SITE_NAME}`,
      description: `${active} artisans RGE actifs en France. Source ADEME, mise à jour mensuelle.`,
      url: canonicalUrl,
      type: 'article',
    },
  }
}

export default async function BarometreRgePage() {
  const snap = await getLatestSnapshot()

  if (!snap) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900">Baromètre RGE</h1>
        <p className="mt-4 text-slate-600">
          Le premier snapshot mensuel sera publié prochainement. Revenez bientôt.
        </p>
      </div>
    )
  }

  const monthLabel = formatMonth(snap.yearmonth)
  const nf = (n: number) => n.toLocaleString('fr-FR')

  const breadcrumbs = [
    { name: 'Accueil', url: SITE_URL },
    { name: 'Baromètre', url: `${SITE_URL}/barometre` },
    { name: `RGE ${monthLabel}`, url: canonicalUrl },
  ]

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Baromètre RGE ${monthLabel} — ${SITE_NAME}`,
    description: `Statistiques mensuelles des artisans RGE (Reconnu Garant de l'Environnement) actifs en France : totaux nationaux, répartition par région, top qualifications, organismes certificateurs. Source : répertoire ADEME officiel.`,
    url: canonicalUrl,
    keywords: [
      'RGE',
      'artisan',
      'France',
      'ADEME',
      'QualiPAC',
      'Qualibat',
      'rénovation énergétique',
    ],
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    datePublished: snap.captured_at,
    dateModified: snap.captured_at,
    temporalCoverage: snap.yearmonth,
    spatialCoverage: { '@type': 'Place', name: 'France' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${SITE_URL}/api/v1/rge/search?qualification=RGE&limit=50`,
        description: 'Échantillon JSON — 50 artisans RGE actifs, via l’API publique.',
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/html',
        contentUrl: `${SITE_URL}/api/v1/docs`,
        description: 'Documentation HTML de l’API publique RGE.',
      },
    ],
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'Artisans RGE actifs', value: snap.total_rge_active },
      { '@type': 'PropertyValue', name: 'Artisans RGE expirés', value: snap.total_rge_expired },
      { '@type': 'PropertyValue', name: 'Total artisans référencés', value: snap.total_providers },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    image: `${SITE_URL}/opengraph-image`,
    headline: `Baromètre RGE ${monthLabel} — ${nf(snap.total_rge_active)} artisans certifiés en France`,
    datePublished: snap.captured_at,
    dateModified: snap.captured_at,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: canonicalUrl,
  }

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      <JsonLd data={datasetSchema} />
      <JsonLd data={articleSchema} />

      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: 'Baromètre', href: '/barometre' },
              { label: `RGE ${monthLabel}`, href: '/barometre/rge' },
            ]}
          />

          <header className="mt-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Database className="h-3.5 w-3.5" />
              Données officielles — sync ADEME hebdo
            </div>
            <h1 className="mt-4 text-4xl font-extrabold text-slate-900">
              Baromètre RGE {monthLabel}
            </h1>
            <ArticleMeta
              author="ServicesArtisans"
              datePublished={snap.captured_at}
              dateModified={snap.captured_at}
              className="mt-3"
            />
            <p className="mt-3 text-lg text-slate-600">
              {nf(snap.total_rge_active)} artisans RGE actifs en France, suivis chaque mois depuis
              le répertoire ADEME. Les chiffres qui comptent pour MaPrimeRénov', les CEE et la
              rénovation énergétique.
            </p>
          </header>

          {/* KPIs */}
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <Shield className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-3xl font-bold text-slate-900">{nf(snap.total_rge_active)}</p>
              <p className="mt-1 text-sm text-slate-600">Artisans RGE actifs</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <Award className="h-5 w-5 text-amber-600" />
              <p className="mt-3 text-3xl font-bold text-slate-900">{nf(snap.total_rge_expired)}</p>
              <p className="mt-1 text-sm text-slate-600">RGE expirés (à renouveler)</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <MapPin className="h-5 w-5 text-blue-600" />
              <p className="mt-3 text-3xl font-bold text-slate-900">{nf(snap.total_providers)}</p>
              <p className="mt-1 text-sm text-slate-600">Artisans total référencés</p>
            </div>
          </section>

          {/* Régions */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-900">Top régions — RGE actifs</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Région</th>
                    <th className="px-4 py-3 text-right font-semibold">RGE actifs</th>
                    <th className="px-4 py-3 text-right font-semibold">Expirés</th>
                    <th className="px-4 py-3 font-semibold">Qualification #1</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.by_region.slice(0, 13).map((r) => (
                    <tr key={r.region_slug} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">{r.region}</td>
                      <td className="px-4 py-3 text-right text-emerald-700">
                        {nf(r.nb_rge_active)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {nf(r.nb_rge_expired)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{r.top_qualification ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Qualifications */}
          <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Top 10 qualifications</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Code</th>
                      <th className="px-4 py-3 text-right font-semibold">Artisans</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.by_qualification.map((q) => (
                      <tr key={q.code} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-900">{q.code}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{nf(q.nb_artisans)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Top spécialités</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Spécialité</th>
                      <th className="px-4 py-3 text-right font-semibold">RGE actifs</th>
                      <th className="px-4 py-3 text-right font-semibold">Part</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.by_specialty.map((s) => (
                      <tr key={s.specialty} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-900">{s.specialty}</td>
                        <td className="px-4 py-3 text-right text-slate-700">
                          {nf(s.nb_rge_active)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">{s.share_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Organismes */}
          {snap.organismes.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-slate-900">Organismes certificateurs</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {snap.organismes.map((o) => (
                  <span
                    key={o.organisme}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                  >
                    {o.organisme}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {nf(o.nb_artisans)}
                    </span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Usage & API */}
          <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <ExternalLink className="h-5 w-5 text-blue-600" />
              Reprendre ces données
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Données libres de réutilisation sous licence <strong>CC-BY 4.0</strong>. Attribution
              obligatoire :
            </p>
            <blockquote className="mt-3 rounded-md border-l-4 border-blue-500 bg-blue-50 p-3 text-sm text-slate-700">
              Source :{' '}
              <a href={canonicalUrl} className="font-semibold text-blue-700 hover:underline">
                {SITE_NAME} — Baromètre RGE {monthLabel}
              </a>
            </blockquote>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link
                href="/api/v1/docs"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700"
              >
                <BookOpen className="h-4 w-4" />
                API publique RGE
              </Link>
              <Link
                href="/api/v1/rge/search?qualification=RGE&limit=20"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Rechercher un artisan RGE
              </Link>
            </div>
          </section>

          {/* Méthodologie */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">Méthodologie</h2>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{snap.methodology}</p>
            <p className="mt-3 text-xs text-slate-500">
              Snapshot capturé le {new Date(snap.captured_at).toLocaleDateString('fr-FR')}. Source
              officielle :{' '}
              <a
                className="text-blue-600 hover:underline"
                href="https://annuaire-entreprises.data.gouv.fr/"
                rel="noopener noreferrer"
              >
                annuaire-entreprises.data.gouv.fr
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
