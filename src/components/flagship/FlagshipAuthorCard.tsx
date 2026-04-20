import Link from 'next/link'
import { BookOpen, ExternalLink } from 'lucide-react'
import { authors, getAuthorByName, type Author } from '@/lib/data/authors'

type Props = {
  authorSlug?: string
  authorName?: string
  reviewerName?: string
  datePublished: string
  dateModified?: string
}

function resolveAuthor(slug?: string, name?: string): Author | undefined {
  if (slug && authors[slug]) return authors[slug]
  if (name) return getAuthorByName(name)
  return undefined
}

const MOIS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

function formatFR(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MOIS_FR[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * E-E-A-T author card shown at the bottom of flagship articles.
 * Renders author bio, credentials and publication / review dates.
 */
export default function FlagshipAuthorCard({
  authorSlug,
  authorName,
  reviewerName,
  datePublished,
  dateModified,
}: Props) {
  const author = resolveAuthor(authorSlug, authorName)
  const reviewer = reviewerName ? getAuthorByName(reviewerName) : undefined
  if (!author) return null

  return (
    <section className="border border-sand-200 rounded-xl bg-white p-5 md:p-6 my-10">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary-100 text-primary-800 font-heading font-bold text-xl md:text-2xl flex items-center justify-center shrink-0">
          {author.name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-sand-500 mb-1">Écrit par</p>
          <Link
            href={`/equipe/${author.slug}`}
            className="font-heading text-lg font-semibold text-sand-900 hover:text-primary-700"
          >
            {author.name}
          </Link>
          <p className="text-sm text-sand-600 mb-3">{author.role}</p>
          <p className="text-sm text-sand-700 mb-3">{author.bio}</p>
          <p className="text-xs text-sand-600 flex items-center gap-1.5 flex-wrap">
            <BookOpen className="w-3.5 h-3.5" aria-hidden />
            <span>Bases rédactionnelles&nbsp;:</span>
            <span className="text-sand-700">{author.credentialsBasis}</span>
          </p>
          {reviewer && reviewer.slug !== author.slug && (
            <p className="text-xs text-sand-600 mt-1">
              Relu par{' '}
              <Link
                href={`/equipe/${reviewer.slug}`}
                className="font-medium text-primary-700 hover:underline"
              >
                {reviewer.name}
              </Link>{' '}
              — {reviewer.role}
            </p>
          )}
          <p className="text-xs text-sand-500 mt-3">
            Publié le <time dateTime={datePublished}>{formatFR(datePublished)}</time>
            {dateModified && dateModified !== datePublished && (
              <>
                {' '}
                · Mis à jour le <time dateTime={dateModified}>{formatFR(dateModified)}</time>
              </>
            )}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <Link
              href={`/equipe/${author.slug}`}
              className="inline-flex items-center gap-1 text-xs text-primary-700 hover:underline"
            >
              Profil & méthodologie <ExternalLink className="w-3 h-3" aria-hidden />
            </Link>
            <Link
              href="/equipe#process-editorial"
              className="inline-flex items-center gap-1 text-xs text-primary-700 hover:underline"
            >
              Notre process éditorial <ExternalLink className="w-3 h-3" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
