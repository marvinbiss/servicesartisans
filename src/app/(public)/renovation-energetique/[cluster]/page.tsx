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
import { ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react'

import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import MiniSimulateurInline from '@/components/conversion/MiniSimulateurInline'
import FinalCtaSection from '@/components/conversion/FinalCtaSection'
import SocialProofBadge from '@/components/conversion/SocialProofBadge'
import { getSocialProofForCluster, getSocialProofGlobal } from '@/lib/conversion/social-proof'
import DevisQuickForm from '@/components/conversion/DevisQuickForm'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProvidersByService } from '@/lib/supabase'
import { getAuthorByName, getReviewerForAuthor } from '@/lib/data/authors'
import type { ClusterContent } from '@/lib/clusters'

// ISR aligné avec autres templates pSEO (rge/cee/services/communes/aides = 86400).
// Cluster content ne change pas plus vite que les autres pSEO data-driven.
export const revalidate = 86400

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

// { ok: true, row: X } = found · { ok: true, row: null } = genuine 0-row ·
// { ok: false, row: null } = DB error. WHY: the old body ignored `error`, so a
// timeout returned `data: null` = indistinguishable from "not published" → the
// page's `if (!row) notFound()` soft-404'd (200 to Googlebot, Next #69103) on
// transient DB blips. Callers MUST NOT notFound() on ok:false.
type ClusterLookup = { ok: boolean; row: ClusterRow | null }

async function loadCluster(slug: string): Promise<ClusterLookup> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('renovation_clusters')
      .select(
        'slug, primary_kw, cluster_type, parent_cluster_slug, service_slug, content_jsonb, published_at, noindex, updated_at'
      )
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .eq('noindex', false)
      .maybeSingle<ClusterRow>()
    if (error) throw new Error(`cluster_db_error:${error.code ?? 'unknown'}`)
    return { ok: true, row: data ?? null }
  } catch {
    return { ok: false, row: null }
  }
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
  const { row } = await loadCluster(params.cluster)
  if (!row || !row.content_jsonb) {
    // Metadata never notFound()s here (safe), so ok:false and genuine-empty
    // both yield noindex — the render decides the real status.
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
  const { ok, row } = await loadCluster(params.cluster)
  if (!row || !row.content_jsonb) {
    // DB error → throw (→ 500, retryable, no catch here). Genuine 0-row → notFound().
    if (!ok) throw new Error('cluster_db_unavailable')
    notFound()
  }

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

  // Social proof above-fold (mini-badge sous H1). Cluster-level si on a un
  // service_slug, sinon global. Skip silencieux si <3 reviews (anti-fake).
  const socialProof = row.service_slug
    ? await getSocialProofForCluster([row.service_slug]).catch(() => null)
    : await getSocialProofGlobal('avis vérifiés en France').catch(() => null)

  // Peer cross-review YMYL (cf. Tier 1-8 patterns) — auto-derive from the
  // author's reviewerSlug map when the author is a known editorial Person ;
  // fall back to the editorial committee (link réel `/equipe`) sinon. Pas
  // d'invention de Person : `getAuthorByName` retourne undefined si l'auteur
  // du cluster (ex. "Rédaction ServicesArtisans") n'est pas dans le registre.
  const authorProfile = c.author?.name ? getAuthorByName(c.author.name) : undefined
  const reviewerProfile = getReviewerForAuthor(authorProfile)
  const reviewedBy = reviewerProfile
    ? {
        '@type': 'Person',
        name: reviewerProfile.name,
        url: `${SITE_URL}/equipe/${reviewerProfile.slug}`,
      }
    : {
        '@type': 'Person',
        name: 'Comité éditorial ServicesArtisans',
        url: `${SITE_URL}/equipe`,
      }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
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
    reviewedBy,
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

  // Hero subtitle = first sentence of intro (above-fold concision).
  // Full intro is preserved further down in the article body for E-E-A-T.
  const introFirstSentence = c.intro.split(/\.\s+/)[0].replace(/\.$/, '') + '.'
  const introRest = c.intro.slice(introFirstSentence.length).trim()

  // Primary CTA = simulateur (intent capture, 30s engagement).
  // Secondary CTA = artisans RGE (intent fully-formed users).
  const simulateurHref = row.service_slug
    ? `/simulateur-aides-renovation?service=${row.service_slug}`
    : '/simulateur-aides-renovation'
  const providersHref = row.service_slug ? `/rge/${row.service_slug}` : '/rge'

  return (
    <main>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* HERO — above-fold conversion. Émet l'unique H1 de la page. */}
      <section className="bg-gradient-to-b from-primary-50 via-white to-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4 leading-tight">
            {c.h1}
          </h1>
          {socialProof && (
            <div className="mb-4">
              <SocialProofBadge {...socialProof} size="md" />
            </div>
          )}
          <p className="text-lg md:text-xl text-charcoal-700 mb-6 max-w-3xl">
            {introFirstSentence}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link
              href={simulateurHref}
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-md font-semibold transition-colors shadow-sm"
            >
              Estimer mes aides en 2 min
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={providersHref}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-charcoal-50 text-charcoal-900 border border-charcoal-300 px-6 py-3 rounded-md font-semibold transition-colors"
            >
              {row.service_slug ? 'Voir les artisans RGE' : 'Tous les artisans RGE'}
            </Link>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-charcoal-700">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Artisans RGE certifiés</span>
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>MaPrimeRénov&apos; + CEE + Éco-PTZ</span>
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Source : ANAH / Service-Public.fr</span>
            </li>
          </ul>
        </div>
      </section>

      {/* SOCIAL PROOF / PROVIDERS — fold 2. Cartes visibles (pas jsonLdOnly)
          pour donner un signal humain immédiat sous le hero. */}
      {showProviderShowcase && showcaseProviders.length > 0 && (
        <section className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-8">
            <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 mb-4">
              Quelques artisans RGE recommandés
            </h2>
            <LocalProviderShowcase
              providers={showcaseProviders}
              serviceName={c.h1}
              cityName="France"
              max={3}
            />
          </div>
        </section>
      )}

      {/* SIMULATEUR INLINE — fold 3. Capture funnel avant scroll. */}
      <section className="bg-primary-50/30 border-b">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <MiniSimulateurInline
            service={row.service_slug ?? row.primary_kw}
            source={`renovation_cluster:${row.slug}`}
            variant="card"
            headline={`${c.h1} — combien d'aides pouvez-vous toucher ?`}
          />
        </div>
      </section>

      {/* BREADCRUMB — navigation discrète post-hero (SEO préservé via JSON-LD). */}
      <nav className="mx-auto max-w-4xl px-4 pt-6" aria-label="Fil d'Ariane">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Rénovation énergétique', href: '/renovation-energetique' },
            { label: c.h1 },
          ]}
        />
      </nav>

      {/* ARTICLE CONTENT — long-read SEO. E-E-A-T préservé : intro complète,
          sections, FAQ, sources, author byline. */}
      <article className="mx-auto max-w-4xl px-4 py-8">
        {introRest.length > 0 && (
          <p className="text-base text-charcoal-700 mb-8 leading-relaxed">{introRest}</p>
        )}

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

        {/* DevisQuickForm — friction-free avant FAQ. Cluster sans ville :
            defaultService = primary_kw du cluster, source taggue le cluster
            pour analytics Pipedrive. NEUTRE artisan. */}
        <section className="mb-8">
          <DevisQuickForm
            defaultService={row.service_slug ?? undefined}
            source={`renovation_cluster_${row.slug.replace(/[^a-z0-9_-]/g, '-').slice(0, 30)}`}
            heading={`${c.h1} — recevez 3 devis RGE en 24h`}
          />
        </section>

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

      <FinalCtaSection
        heading="Estimez vos aides + recevez 3 devis"
        description="Simulateur officiel MaPrimeRénov' / CEE + 3 devis d'artisans RGE en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: c.ctaText || 'Obtenir mes devis gratuits',
          href: simulateurHref,
          intent: 'final-devis-cluster',
        }}
        accent="blue"
        trustLine="Artisans RGE certifiés • Source : Registre RGE ADEME • RGPD"
      />
    </main>
  )
}
