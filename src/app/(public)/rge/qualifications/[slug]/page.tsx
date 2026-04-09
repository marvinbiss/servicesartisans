import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShieldCheck, CheckCircle2, ExternalLink, ArrowRight, Award } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import {
  RGE_QUALIFICATIONS_WITH_GUIDE,
  getRgeQualificationGuide,
  hasRgeQualificationGuide,
} from '@/lib/rge/qualification-guides-content'

export const revalidate = 86400
export const dynamicParams = false

const VALID_SLUG = /^[a-z][a-z0-9-]{0,39}$/

export function generateStaticParams(): Array<{ slug: string }> {
  return RGE_QUALIFICATIONS_WITH_GUIDE.map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '\u2026'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (!VALID_SLUG.test(slug) || !hasRgeQualificationGuide(slug)) notFound()

  const guide = getRgeQualificationGuide(slug)!
  const path = `/rge/qualifications/${slug}`

  return {
    title: truncate(guide.metaTitle, 60),
    description: truncate(guide.metaDescription, 158),
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1 as const,
      'max-image-preview': 'large' as const,
      'max-video-preview': -1 as const,
    },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      type: 'article',
      locale: 'fr_FR',
      url: `${SITE_URL}${path}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
    },
    alternates: getAlternates(path),
  }
}

export default async function RgeQualificationGuidePage({ params }: PageProps) {
  const { slug } = await params
  if (!VALID_SLUG.test(slug) || !hasRgeQualificationGuide(slug)) notFound()

  const guide = getRgeQualificationGuide(slug)!
  const path = `/rge/qualifications/${slug}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: '/rge' },
    { name: 'Qualifications', url: '/rge/qualifications' },
    { name: guide.name, url: path },
  ])

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.h1,
    description: guide.metaDescription,
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    inLanguage: 'fr-FR',
    author: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    about: {
      '@type': 'Certification',
      name: guide.name,
      issuedBy: { '@type': 'Organization', name: guide.organisme },
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <Breadcrumb
        items={[
          { label: 'Artisans RGE', href: '/rge' },
          { label: 'Qualifications', href: '/rge/qualifications' },
          { label: guide.name },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Award className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              D&eacute;livr&eacute;e par {guide.organisme}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            {guide.h1}
          </h1>
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">{guide.lede}</p>
        </div>
      </section>

      {/* Travaux couverts & CEE débloquées */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
            <h2 className="font-heading text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              Travaux couverts
            </h2>
            <ul className="space-y-2">
              {guide.travauxCouverts.map((travail) => (
                <li key={travail} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{travail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6">
            <h2 className="font-heading text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-700" aria-hidden="true" />
              Primes CEE d&eacute;bloqu&eacute;es
            </h2>
            <ul className="space-y-2">
              {guide.ceeDebloquees.map((cee) => (
                <li key={cee} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{cee}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sections éditoriales */}
        <article className="prose prose-emerald max-w-none prose-headings:font-heading prose-headings:font-extrabold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed">
          {guide.sections.map((section, i) => (
            <section key={i} className="mb-10">
              <h2 className="text-2xl md:text-3xl mb-4">{section.heading}</h2>
              {section.paragraphs.map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </section>
          ))}
        </article>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
            Questions fr&eacute;quentes &mdash; {guide.name}
          </h2>
          <div className="space-y-3">
            {guide.faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-lg border border-slate-200 bg-white p-5 open:border-emerald-300 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-slate-900 flex items-start justify-between gap-4">
                  <span>{item.question}</span>
                  <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-slate-700 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Vérification officielle */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-6">
          <h2 className="font-heading text-xl font-extrabold text-slate-900 mb-3">
            V&eacute;rifier une qualification {guide.name}
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Toujours v&eacute;rifier la qualification d&rsquo;un artisan sur les sources officielles
            avant signature du devis. La v&eacute;rification prend moins de 2 minutes.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://france-renov.gouv.fr/annuaire-rge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-300 bg-white text-emerald-800 font-semibold hover:bg-emerald-100 transition text-sm"
            >
              Annuaire France R&eacute;nov&rsquo;
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
            <Link
              href={`/rge/${guide.linkedRgeService}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-300 bg-white text-emerald-800 font-semibold hover:bg-emerald-100 transition text-sm"
            >
              Nos artisans {guide.linkedRgeService.replace(/-/g, ' ')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Trouvez un artisan {guide.name}
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Tous nos artisans sont v&eacute;rifi&eacute;s via la synchronisation hebdomadaire de
            l&rsquo;annuaire ADEME officiel. Qualifications actives uniquement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Demander un devis gratuit
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Tous les artisans RGE
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
