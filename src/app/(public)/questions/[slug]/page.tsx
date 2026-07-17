import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CheckCircle, ArrowRight, ArrowLeft, BookOpen, Euro, Calculator } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getQAPageSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getQuestionBySlug, getQuestionSlugs, getQuestionsByCategory } from '@/lib/data/questions'
import RelatedHubs from '@/components/seo/RelatedHubs'
import { resolveCitationsFromText } from '@/lib/seo/authoritative-citations'

import StickyMobileCTA from '@/components/conversion/StickyMobileCTA.client'
import ExitIntentPopup from '@/components/conversion/ExitIntentModal.client'

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getQuestionSlugs().map((slug) => ({ slug }))
}

export const dynamicParams = false
export const revalidate = 86400

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const question = getQuestionBySlug(slug)
  if (!question) return {}

  const title = `${question.question} | ${SITE_NAME}`
  const description = question.shortAnswer

  return {
    title: question.question,
    description,
    alternates: getAlternates(`/questions/${question.slug}`),
    openGraph: {
      ...getOgDefaults(),
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/questions/${question.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function QuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const question = getQuestionBySlug(slug)
  if (!question) notFound()

  // Curated cross-category links when defined (concentrates internal link
  // equity on the commercial price cluster) — else fall back to same category.
  const relatedQuestions = (
    question.relatedQuestions?.length
      ? question.relatedQuestions
          .map((slug) => getQuestionBySlug(slug))
          .filter((q): q is NonNullable<typeof q> => Boolean(q))
      : getQuestionsByCategory(question.category).filter((q) => q.slug !== question.slug)
  ).slice(0, 5)

  // Authoritative .gouv/official sources matched to the answer's topics (aides,
  // RGE, CEE, TVA…). Returns [] when nothing relevant → block hidden. Honest
  // E-E-A-T: real outbound citations only, never fabricated. Cf. CLAUDE.md.
  const sources = resolveCitationsFromText(
    [question.shortAnswer, ...question.detailedAnswer].join(' ')
  )

  const breadcrumbItems = [{ label: 'Questions', href: '/questions' }, { label: question.question }]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Questions', url: '/questions' },
    { name: question.question, url: `/questions/${question.slug}` },
  ])

  const qaPageSchema = getQAPageSchema({
    pageUrl: `${SITE_URL}/questions/${question.slug}`,
    question: question.question,
    acceptedAnswerText: question.shortAnswer,
    suggestedAnswerTexts: question.detailedAnswer,
    name: question.question,
  })

  return (
    <>
      <JsonLd data={[breadcrumbSchema, qaPageSchema]} />

      {/* Breadcrumb */}
      <div className="bg-sand-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/questions"
            className="inline-flex items-center gap-1.5 text-primary-100 hover:text-white transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Toutes les questions
          </Link>
          <h1
            data-speakable="true"
            className="text-3xl sm:text-4xl font-bold font-heading leading-tight"
          >
            {question.question}
          </h1>
          <p className="mt-4 text-sm text-primary-100">
            Par <span className="font-semibold text-white">l'équipe ServicesArtisans</span> ·
            Réponse vérifiée et mise à jour régulièrement
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          {/* Main content */}
          <article className="flex-1 max-w-3xl">
            {/* Featured snippet box */}
            <div className="bg-primary-50 border-l-4 border-primary-400 rounded-lg p-6 mb-10">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-primary-800 mb-1">Réponse rapide</p>
                  <p className="text-primary-800 leading-relaxed">{question.shortAnswer}</p>
                </div>
              </div>
            </div>

            {/* Price grid — semantic <table> for "prix … au m²" snippet capture */}
            {question.priceTable && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold font-heading text-charcoal-900 mb-4">
                  Grille de prix détaillée
                </h2>
                <div className="overflow-x-auto rounded-xl border border-sand-200">
                  <table className="w-full text-left border-collapse text-sm sm:text-base">
                    <caption className="sr-only">{question.priceTable.caption}</caption>
                    <thead>
                      <tr className="bg-sand-50 border-b-2 border-primary-200">
                        {question.priceTable.columns.map((col) => (
                          <th
                            key={col}
                            scope="col"
                            className="py-3 px-4 font-semibold text-charcoal-900"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {question.priceTable.rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-sand-100 last:border-0">
                          {row.map((cell, ci) => (
                            <td
                              key={ci}
                              className={`py-2.5 px-4 text-charcoal-700 ${
                                ci === row.length - 1 ? 'font-medium whitespace-nowrap' : ''
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {question.priceTable.note && (
                  <p className="text-xs text-charcoal-500 mt-3">{question.priceTable.note}</p>
                )}
              </section>
            )}

            {/* Detailed answer */}
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold font-heading text-charcoal-900 mb-6">
                Réponse détaillée
              </h2>
              {question.detailedAnswer.map((paragraph, index) => (
                <p key={index} className="text-charcoal-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Sources officielles — E-E-A-T, citations .gouv réelles uniquement */}
            {sources.length > 0 && (
              <div className="mt-10 pt-8 border-t">
                <h2 className="text-xl font-bold font-heading text-charcoal-900 mb-4">
                  Sources officielles
                </h2>
                <ul className="space-y-2">
                  {sources.map((url) => {
                    let host = url
                    try {
                      host = new URL(url).hostname.replace(/^www\./, '')
                    } catch {
                      /* keep raw url */
                    }
                    return (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 underline underline-offset-2 break-words"
                        >
                          {host}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Cross-links */}
            <div className="mt-10 pt-8 border-t">
              <h2 className="text-xl font-bold font-heading text-charcoal-900 mb-4">
                En savoir plus
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Link
                  href={`/services/${question.relatedService}`}
                  className="flex items-center gap-3 p-4 bg-white border rounded-xl hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <BookOpen className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="font-medium text-charcoal-900 group-hover:text-primary-600 transition-colors">
                      Services
                    </p>
                    <p className="text-sm text-charcoal-500">Trouver un professionnel</p>
                  </div>
                </Link>
                <Link
                  href={`/tarifs/${question.relatedService}`}
                  className="flex items-center gap-3 p-4 bg-white border rounded-xl hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <Euro className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-charcoal-900 group-hover:text-primary-600 transition-colors">
                      Tarifs
                    </p>
                    <p className="text-sm text-charcoal-500">Grille de prix détaillée</p>
                  </div>
                </Link>
                <Link
                  href={`/devis/${question.relatedService}`}
                  className="flex items-center gap-3 p-4 bg-white border rounded-xl hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <Calculator className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-charcoal-900 group-hover:text-primary-600 transition-colors">
                      Devis gratuit
                    </p>
                    <p className="text-sm text-charcoal-500">Demander une estimation</p>
                  </div>
                </Link>
              </div>
            </div>
          </article>

          {/* Sidebar: related questions */}
          {relatedQuestions.length > 0 && (
            <aside className="lg:w-80 shrink-0">
              <div className="bg-sand-50 rounded-xl p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold font-heading text-charcoal-900 mb-4">
                  Questions similaires
                </h2>
                <div className="space-y-3">
                  {relatedQuestions.map((q) => (
                    <Link
                      key={q.slug}
                      href={`/questions/${q.slug}`}
                      className="flex items-start gap-2 p-3 bg-white rounded-lg border hover:border-primary-300 hover:shadow-sm transition-all group"
                    >
                      <ArrowRight className="w-4 h-4 text-primary-400 mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      <span className="text-sm text-charcoal-700 group-hover:text-primary-600 transition-colors leading-snug">
                        {q.question}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      <RelatedHubs
        currentPath="/faq"
        extraLinks={[
          { href: '/glossaire', label: 'Glossaire' },
          { href: '/guides', label: 'Guides travaux' },
        ]}
      />

      {question.relatedService && (
        <StickyMobileCTA serviceSlug={question.relatedService} ctaText="Devis gratuit" />
      )}
      <ExitIntentPopup />
    </>
  )
}
