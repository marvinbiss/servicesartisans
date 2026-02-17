import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BookOpen, Wrench, ChevronRight, HelpCircle, Clock, List } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getGuideBySlug, getGuideSlugs, getGuidesByCategory } from '@/lib/data/guides'
import { getTradeContent } from '@/lib/data/trade-content'

export function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }))
}

export const dynamicParams = false
export const revalidate = 86400

interface PageProps {
  params: Promise<{ slug: string }>
}

const categoryLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  choisir: { label: 'Choisir son artisan', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  entretien: { label: 'Entretien', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  reglementation: { label: 'Réglementation', color: 'text-violet-700', bgColor: 'bg-violet-100' },
  economiser: { label: 'Économiser', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  urgence: { label: 'Urgences', color: 'text-red-700', bgColor: 'bg-red-100' },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return { title: 'Guide non trouvé' }

  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: `${SITE_URL}/guides/${slug}` },
    openGraph: {
      locale: 'fr_FR',
      title: guide.title,
      description: guide.metaDescription,
      type: 'article',
      url: `${SITE_URL}/guides/${slug}`,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: guide.title,
      description: guide.metaDescription,
    },
  }
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  const catMeta = categoryLabels[guide.category] || categoryLabels.choisir

  // Related services with trade content
  const relatedTrades = guide.relatedServices
    .map(s => {
      const trade = getTradeContent(s)
      return trade ? { slug: s, name: trade.name } : null
    })
    .filter(Boolean) as { slug: string; name: string }[]

  // Related guides (same category, excluding current)
  const relatedGuides = getGuidesByCategory(guide.category)
    .filter(g => g.slug !== slug)
    .slice(0, 4)

  // FAQ for JSON-LD
  const faqItems = guide.faq.map(f => ({ question: f.q, answer: f.a }))

  // JSON-LD
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: guide.title, url: `/guides/${slug}` },
  ])

  const faqSchema = getFAQSchema(faqItems)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: guide.lastUpdated,
    dateModified: guide.lastUpdated,
    author: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/guides/${slug}`,
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[breadcrumbSchema, faqSchema, articleSchema]} />

      {/* ─── DARK HERO ──────────────────────────────────────── */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,70,229,0.20) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(99,102,241,0.12) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-28 md:pt-14 md:pb-36">
          <div className="mb-10">
            <Breadcrumb
              items={[
                { label: 'Guides', href: '/guides' },
                { label: guide.title },
              ]}
              className="text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
            />
          </div>
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3 mb-5">
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 ${catMeta.bgColor} ${catMeta.color} rounded-full text-sm font-semibold`}>
                <BookOpen className="w-4 h-4" />
                {catMeta.label}
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 text-sm text-slate-300">
                <Clock className="w-4 h-4" />
                Mis à jour le {new Date(guide.lastUpdated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.025em] leading-[1.1] mb-5">
              {guide.title}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
              {guide.metaDescription}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ─── TABLE OF CONTENTS ────────────────────────────── */}
        <nav className="mb-12 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-indigo-600" />
            <h2 className="font-heading text-lg font-bold text-slate-900">Sommaire</h2>
          </div>
          <ol className="space-y-2">
            {guide.sections.map((section, i) => (
              <li key={i}>
                <a
                  href={`#section-${i}`}
                  className="flex items-center gap-3 text-sm text-slate-600 hover:text-indigo-600 py-1.5 transition-colors"
                >
                  <span className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0">
                    {i + 1}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ─── ARTICLE SECTIONS ─────────────────────────────── */}
        <article className="space-y-12">
          {guide.sections.map((section, i) => (
            <section key={i} id={`section-${i}`} className="scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight mb-6">
                {section.title}
              </h2>
              <div className="prose prose-slate max-w-none">
                {section.content.split('\n\n').map((paragraph, j) => (
                  <p key={j} className="text-slate-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>

        {/* ─── RELATED SERVICES ─────────────────────────────── */}
        {relatedTrades.length > 0 && (
          <section className="mt-16 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900 tracking-tight">
                Services associés
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedTrades.map((trade) => (
                <Link
                  key={trade.slug}
                  href={`/services/${trade.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition-all group"
                >
                  <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{trade.name}</div>
                  <div className="flex items-center gap-1 text-xs text-indigo-500 mt-2">
                    Voir le service <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── FAQ ──────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
              Questions fréquentes
            </h2>
          </div>
          <div className="space-y-4">
            {guide.faq.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── RELATED GUIDES ───────────────────────────────── */}
        {relatedGuides.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900 tracking-tight">
                Guides similaires
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-violet-300 hover:-translate-y-0.5 transition-all group"
                >
                  <h3 className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors text-sm leading-tight mb-1">
                    {g.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{g.metaDescription}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="relative bg-[#0a0f1e] overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(79,70,229,0.12) 0%, transparent 60%)',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
            Prêt à lancer vos travaux ?
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Recevez jusqu&apos;à 3 devis gratuits de professionnels qualifiés.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/devis" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 transition-all duration-300">
              Demander un devis gratuit
            </Link>
            <Link href="/guides" className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium transition-colors">
              Tous les guides <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEO INTERNAL LINKS ───────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-slate-900 mb-8 tracking-tight">
            Voir aussi
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Services associés</h3>
              <div className="space-y-2">
                {relatedTrades.map((t) => (
                  <Link key={t.slug} href={`/services/${t.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Devis gratuits</h3>
              <div className="space-y-2">
                {relatedTrades.map((t) => (
                  <Link key={t.slug} href={`/devis/${t.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    Devis {t.name.toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Navigation</h3>
              <div className="space-y-2">
                <Link href="/guides" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />Tous les guides
                </Link>
                <Link href="/services" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />Tous les services
                </Link>
                <Link href="/departements" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />Départements
                </Link>
                <Link href="/regions" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />Régions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
