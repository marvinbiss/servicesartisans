/**
 * @kw-primary  dynamique (renovation_clusters.primary_kw)
 * @source-csv  audits Ahrefs 2026-05-04 (memory bloc1-niche-v3)
 * @gate        published_at != null && noindex = false (Critic-validated)
 * @rule        Ahrefs-first SA 2026-05-04 — chaque cluster a un primary_kw
 *              traçable + ahrefs_source_date.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import MiniSimulateurInline from '@/components/conversion/MiniSimulateurInline'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProvidersByService } from '@/lib/supabase'
import type { ClusterContent } from '@/lib/clusters'

export const revalidate = 21600

type ClusterRow = {
  slug: string
  primary_kw: string
  cluster_type: 'pillar' | 'cluster' | 'long-tail'
  parent_cluster_slug: string | null
  service_slug: string | null
  content_jsonb: ClusterContent | null
  published_at: string | null
  noindex: boolean
  updated_at: string
}

async function loadCluster(slug: string): Promise<ClusterRow | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('renovation_clusters')
    .select(
      'slug, primary_kw, cluster_type, parent_cluster_slug, service_slug, content_jsonb, published_at, noindex, updated_at'
    )
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .eq('noindex', false)
    .maybeSingle<ClusterRow>()
  return data ?? null
}

export async function generateStaticParams(): Promise<Array<{ cluster: string }>> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('renovation_clusters')
    .select('slug')
    .not('published_at', 'is', null)
    .eq('noindex', false)
    .limit(2000)
  return (data ?? []).map((row: { slug: string }) => ({ cluster: row.slug }))
}

export const dynamicParams = true

type PageProps = { params: { cluster: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const row = await loadCluster(params.cluster)
  if (!row || !row.content_jsonb) {
    return { title: 'Page introuvable — ServicesArtisans', robots: { index: false } }
  }
  const c = row.content_jsonb
  const pagePath = `/renovation-energetique/${row.slug}`
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: getAlternates(pagePath),
    openGraph: {
      type: 'article',
      title: c.metaTitle,
      description: c.metaDescription,
      url: `${SITE_URL}${pagePath}`,
      siteName: 'ServicesArtisans',
      locale: 'fr_FR',
    },
  }
}

export default async function ClusterPage({ params }: PageProps) {
  const row = await loadCluster(params.cluster)
  if (!row || !row.content_jsonb) notFound()

  const c = row.content_jsonb
  const pageUrl = `${SITE_URL}/renovation-energetique/${row.slug}`

  // Funnel conversion 2026-05-22 — pages cluster éditoriales étaient sans
  // surface artisans ni simulateur (seul un Link CTA en bas). Inject :
  //   - LocalProviderShowcase (jsonLdOnly) si service_slug !== null et que le
  //     cluster n'est pas un hub pillar (skip Aleyda data-uniqueness rule).
  //   - MiniSimulateurInline après l'intro (toujours, 100 % renovation intent).
  // Fetch national RGE-only via getProvidersByService — pas de query
  // dupliquée, helper existant. Best-effort : la page éditoriale survit si
  // Supabase hoquette (fallback liste vide).
  const showProviderShowcase = row.cluster_type !== 'pillar' && Boolean(row.service_slug)
  const showcaseProviders = showProviderShowcase
    ? await getProvidersByService(row.service_slug as string, 3, { rgeOnly: true }).catch(() => [])
    : []

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: c.h1,
    description: c.metaDescription,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    inLanguage: 'fr-FR',
    image: `${SITE_URL}/og-renovation-energetique.jpg`,
    datePublished: row.published_at ?? row.updated_at,
    dateModified: row.updated_at,
    author: c.author?.profileUrl
      ? { '@type': 'Person', name: c.author.name, url: c.author.profileUrl }
      : { '@type': 'Person', name: c.author?.name ?? 'Rédaction ServicesArtisans' },
    reviewedBy: {
      '@type': 'Person',
      name: 'Comité éditorial ServicesArtisans',
      url: `${SITE_URL}/equipe`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
    },
    citation: c.citedSources.map((s) => ({
      '@type': 'CreativeWork',
      name: s.title,
      url: s.url,
      dateAccessed: s.retrievedAt,
    })),
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: SITE_URL },
    { name: 'Rénovation énergétique', url: `${SITE_URL}/renovation-energetique` },
    { name: c.h1, url: pageUrl },
  ])

  const faqSchema =
    c.faq.length > 0
      ? getFAQSchema(c.faq.map((f) => ({ question: f.question, answer: f.answer })))
      : null

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Rénovation énergétique', href: '/renovation-energetique' },
          { label: c.h1 },
        ]}
      />

      <article>
        <h1 className="text-3xl font-bold mb-4">{c.h1}</h1>
        <p className="text-lg text-charcoal-700 mb-6">{c.intro}</p>

        {/* Funnel conversion — MiniSimulateurInline juste après l'intro pour
            capturer le funnel rénovation avant que l'utilisateur scrolle dans
            les sections éditoriales. 100 % renovation intent par construction
            du cluster (table renovation_clusters). Injecté 2026-05-22. */}
        <section className="mb-8">
          <MiniSimulateurInline
            service={row.service_slug ?? row.primary_kw}
            source={`renovation_cluster:${row.slug}`}
            variant="inline"
            headline={`${c.h1} — combien d'aides pouvez-vous toucher ?`}
          />
        </section>

        {c.sections.map((section) => (
          <section key={section.h2} className="mb-8">
            <h2 className="text-2xl font-bold mb-3">{section.h2}</h2>
            <div className="text-charcoal-800 whitespace-pre-line">{section.body}</div>
            {section.factsInjected && section.factsInjected.length > 0 && (
              <aside className="mt-4 border-l-4 border-accent-500 pl-4 text-sm text-charcoal-600">
                <p className="font-semibold mb-1">Source officielle :</p>
                <ul className="list-disc ml-5">
                  {section.factsInjected.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </aside>
            )}
          </section>
        ))}

        {c.faq.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3">Questions fréquentes</h2>
            {c.faq.map((f) => (
              <details key={f.question} className="mb-3 border-b pb-2">
                <summary className="cursor-pointer font-semibold">{f.question}</summary>
                <p className="mt-2 text-charcoal-700">{f.answer}</p>
              </details>
            ))}
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Sources officielles</h2>
          <ul className="list-disc ml-5 text-sm">
            {c.citedSources.map((s) => (
              <li key={s.url}>
                <a href={s.url} className="underline" rel="noreferrer">
                  {s.title}
                </a>{' '}
                — consulté le {s.retrievedAt}
              </li>
            ))}
          </ul>
        </section>

        {c.author && (
          <p className="text-sm text-charcoal-500 mt-8">
            Rédigé par <strong>{c.author.name}</strong>, {c.author.role}. Mis à jour le{' '}
            {row.updated_at.split('T')[0]}.
          </p>
        )}

        <div className="mt-8 border-t pt-6">
          <Link
            href="/simulateur-aides-renovation"
            className="inline-block bg-accent-500 text-white px-6 py-3 rounded-md font-semibold"
          >
            {c.ctaText}
          </Link>
        </div>

        {/* LocalProviderShowcase en mode jsonLdOnly — émet 3 LocalBusiness
            JSON-LD pour donner à Google des signaux artisans rattachés au
            cluster éditorial, sans afficher de cartes hors contexte
            géographique (UX confuse à l'échelle nationale). Gated sur
            cluster_type !== 'pillar' (Aleyda data-uniqueness). */}
        {showProviderShowcase && showcaseProviders.length > 0 && (
          <LocalProviderShowcase
            providers={showcaseProviders.slice(0, 3)}
            serviceName={c.h1}
            cityName=""
            max={3}
            jsonLdOnly
          />
        )}
      </article>
    </main>
  )
}
