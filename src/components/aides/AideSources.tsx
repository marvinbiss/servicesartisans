import Link from 'next/link'
import { ExternalLink, ShieldCheck } from 'lucide-react'

import type { AideSource } from '@/lib/aides/aides-catalog'

type Props = {
  sources: AideSource[]
  lastReviewed: string
  /** Auteur identifié pour l'E-E-A-T YMYL. */
  author?: { name: string; profileUrl?: string }
}

export default function AideSources({ sources, lastReviewed, author }: Props) {
  return (
    <section
      className="bg-white py-10 border-t border-charcoal-100"
      aria-labelledby="sources-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-5">
          <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2
            id="sources-heading"
            className="font-heading text-xl font-extrabold text-charcoal-900"
          >
            Sources officielles
          </h2>
        </div>
        <ul className="space-y-2 text-sm">
          {sources.map((src) => (
            <li key={src.url}>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-start gap-2 text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{src.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-5 pt-5 border-t border-charcoal-100 text-xs text-charcoal-500 space-y-1">
          {author && (
            <p>
              Rédigé par{' '}
              {author.profileUrl ? (
                <a href={author.profileUrl} className="underline hover:text-emerald-700">
                  {author.name}
                </a>
              ) : (
                <span className="font-medium text-charcoal-700">{author.name}</span>
              )}{' '}
              · méthodologie publiée sur{' '}
              <Link href="/methodologie" className="underline hover:text-emerald-700">
                /methodologie
              </Link>
            </p>
          )}
          <p>
            Dernière vérification :{' '}
            <time dateTime={lastReviewed} className="font-medium text-charcoal-700">
              {lastReviewed}
            </time>
          </p>
        </div>
      </div>
    </section>
  )
}
