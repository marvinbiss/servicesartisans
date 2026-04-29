/**
 * EnBrefBox — Boite "En bref" pour capturer les Google Featured Snippets.
 *
 * Affiche un resume concis (2-3 phrases ou liste de points cles) en haut
 * d'un article ou guide long-form. Google extrait preferentiellement ce type
 * de contenu court et structure pour les Featured Snippets (Position 0).
 *
 * Server Component — pas de 'use client'.
 */

type EnBrefBoxProps = {
  /** Resume de l'article (2-3 phrases max, 40-60 mots idealement) */
  summary?: string
  /** Points cles (alternative ou complement au summary) */
  keyPoints?: string[]
  /** Titre personnalise (defaut: "En bref") */
  title?: string
}

export default function EnBrefBox({ summary, keyPoints, title = 'En bref' }: EnBrefBoxProps) {
  if (!summary && (!keyPoints || keyPoints.length === 0)) return null

  return (
    <div
      className="snippet-answer rounded-xl border border-emerald-200 bg-emerald-50/50 px-6 py-5 mb-8"
      data-speakable="true"
      role="region"
      aria-label={title}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-3.5 h-3.5 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">{title}</span>
      </div>

      {summary && <p className="text-base leading-relaxed text-charcoal-800 mb-0">{summary}</p>}

      {keyPoints && keyPoints.length > 0 && (
        <ul className={`space-y-1.5 ${summary ? 'mt-3' : ''}`}>
          {keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-charcoal-700">
              <svg
                className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
