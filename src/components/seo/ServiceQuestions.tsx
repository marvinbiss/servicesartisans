import Link from 'next/link'
import { HelpCircle, ArrowRight } from 'lucide-react'
import { getQuestionsByService } from '@/lib/data/questions'

/**
 * Contextual "Questions fréquentes" block for a service hub. Surfaces the
 * questions whose relatedService matches, giving the orphan-prone /questions
 * cluster inbound internal links from topically-relevant, higher-PageRank hubs.
 * Renders nothing when no question matches (no empty section, no dead links).
 */
export default function ServiceQuestions({
  serviceSlug,
  serviceName,
  limit = 6,
  heading,
}: {
  serviceSlug: string
  serviceName: string
  limit?: number
  /** Override the H2 — avoids colliding with a trade FAQ "Questions fréquentes" H2. */
  heading?: string
}) {
  const questions = getQuestionsByService(serviceSlug, limit)
  if (questions.length === 0) return null

  const title = heading ?? `Questions détaillées — ${serviceName.toLowerCase()}`

  return (
    <section className="py-10 bg-sand-50 border-t border-sand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50">
            <HelpCircle className="w-5 h-5 text-primary-500" />
          </span>
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 tracking-tight">
            {title}
          </h2>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
          {questions.map((q) => (
            <li key={q.slug}>
              <Link
                href={`/questions/${q.slug}`}
                className="group flex items-start gap-3 p-5 bg-white border border-sand-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all h-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
              >
                <ArrowRight className="w-5 h-5 mt-0.5 shrink-0 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
                <span>
                  <span className="block font-medium text-charcoal-900 group-hover:text-primary-600 transition-colors leading-snug">
                    {q.question}
                  </span>
                  <span className="block text-sm text-charcoal-500 mt-1.5 line-clamp-2">
                    {q.shortAnswer}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Link
            href="/questions"
            className="text-sm text-primary-500 hover:text-primary-700 underline-offset-2 hover:underline"
          >
            Toutes les questions travaux →
          </Link>
        </div>
      </div>
    </section>
  )
}
