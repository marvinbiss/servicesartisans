import Link from 'next/link'
import { BookOpenText, ExternalLink } from 'lucide-react'

export type SourceItem = {
  label: string
  url: string
  note?: string
}

type Props = {
  title?: string
  sources: SourceItem[]
}

/**
 * Reference list for YMYL / factual flagship articles.
 * Builds Trust signal by citing official sources (service-public.fr, ADEME,
 * Code de la consommation, etc.).
 */
export default function FlagshipSources({ title = 'Sources officielles', sources }: Props) {
  if (!sources || sources.length === 0) return null
  return (
    <section className="border-t border-sand-200 pt-6 mt-10">
      <h2 className="font-heading text-base font-semibold text-sand-900 flex items-center gap-2 mb-3">
        <BookOpenText className="w-4 h-4 text-sand-500" aria-hidden />
        {title}
      </h2>
      <ul className="space-y-1.5 text-sm text-sand-700">
        {sources.map((s, i) => {
          const isInternal = s.url.startsWith('/')
          return (
            <li key={i} className="flex items-start gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-sand-400 mt-0.5 shrink-0" aria-hidden />
              <span>
                {isInternal ? (
                  <Link href={s.url} className="text-primary-700 hover:underline">
                    {s.label}
                  </Link>
                ) : (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener nofollow"
                    className="text-primary-700 hover:underline"
                  >
                    {s.label}
                  </a>
                )}
                {s.note && <span className="text-sand-500"> — {s.note}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
