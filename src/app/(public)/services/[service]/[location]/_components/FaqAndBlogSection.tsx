import Link from 'next/link'
import type { Service, Location as LocationType } from '@/types'

interface FaqItem {
  question: string
  answer: string
}

interface Props {
  combinedFaq: FaqItem[]
  service: Service
  location: LocationType
  serviceSlug: string
}

export default function FaqAndBlogSection({ combinedFaq, service, location, serviceSlug }: Props) {
  const isPlombier = serviceSlug === 'plombier'
  // Pivot full RGE 2026-05-03 : 'carreleur' retiré (commodity hors RGE)
  // — remplacé par 'salle-de-bain' (intent rénovation pièces humides RGE-canon).
  const isBatiment = [
    'peintre-en-batiment',
    'macon',
    'couvreur',
    'salle-de-bain',
    'menuisier',
  ].includes(serviceSlug)

  return (
    <>
      {/* FAQ accordion */}
      {combinedFaq.length > 0 && (
        <section className="py-12 bg-white border-t border-sand-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-8">
              <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-6 border-l-4 border-primary-400 pl-4">
                Questions fréquentes — {service.name.toLowerCase()} à {location.name}
              </h2>
              <div className="space-y-3">
                {combinedFaq.map((item, i) => (
                  <details
                    key={i}
                    open={i === 0}
                    className="group bg-sand-50 rounded-xl border border-sand-200 overflow-hidden transition-shadow duration-300 hover:shadow-soft"
                  >
                    <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left hover:bg-sand-100 transition-colors duration-200 [&::-webkit-details-marker]:hidden list-none">
                      <span className="font-semibold text-charcoal-900 pr-4">{item.question}</span>
                      <svg
                        className="w-5 h-5 text-primary-400 shrink-0 group-open:rotate-180 transition-transform duration-300 ease-premium"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-5 text-charcoal-600 leading-relaxed text-sm animate-fade-in">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog articles */}
      <section className="py-12 bg-sand-50 border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-6 flex items-center gap-2 border-l-4 border-primary-400 pl-4">
            <svg
              className="w-5 h-5 text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Guides et conseils
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {isPlombier ? (
              <>
                <BlogLink
                  href="/blog/comment-choisir-son-plombier"
                  emoji="&#128295;"
                  title="Comment choisir son plombier ?"
                  desc="Les critères essentiels pour trouver un plombier fiable et compétent."
                />
                <BlogLink
                  href="/blog/fuite-eau-que-faire-urgence"
                  emoji="&#128680;"
                  title="Fuite d'eau : guide complet des gestes et coûts"
                  desc="Les bons réflexes en cas de fuite ou de dégât des eaux."
                />
              </>
            ) : isBatiment ? (
              <>
                <BlogLink
                  href="/blog/renovation-energetique-aides-2026"
                  emoji="&#127969;"
                  title="Rénovation énergétique : aides disponibles en 2026"
                  desc="Découvrez les aides disponibles et les travaux prioritaires pour votre logement."
                />
                <BlogLink
                  href="/blog/tendances-salle-de-bain-2026"
                  emoji="&#127912;"
                  title="Tendances salle de bain 2026"
                  desc="Les styles et matériaux qui font la tendance cette année."
                />
              </>
            ) : (
              <>
                <BlogLink
                  href="/blog/tendances-salle-de-bain-2026"
                  emoji="&#127912;"
                  title="Tendances salle de bain 2026"
                  desc="Les styles et matériaux qui font la tendance cette année."
                />
                <BlogLink
                  href="/blog/renovation-energetique-aides-2026"
                  emoji="&#127969;"
                  title="Rénovation énergétique : aides disponibles en 2026"
                  desc="Découvrez les aides disponibles et les travaux prioritaires pour votre logement."
                />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function BlogLink({
  href,
  emoji,
  title,
  desc,
}: {
  href: string
  emoji: string
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 bg-white rounded-xl border border-sand-200 hover:border-primary-200 hover:shadow-soft transition-all group"
    >
      <span
        className="text-2xl shrink-0"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: emoji }}
      />
      <div>
        <span className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors">
          {title}
        </span>
        <p className="text-sm text-charcoal-500 mt-1">{desc}</p>
      </div>
    </Link>
  )
}
