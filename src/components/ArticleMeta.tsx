import { User } from 'lucide-react'
import Link from 'next/link'

type Props = {
  author: string
  authorHref?: string
  datePublished: string
  dateModified?: string
  className?: string
}

function formatFrDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function ArticleMeta({
  author,
  authorHref,
  datePublished,
  dateModified,
  className = '',
}: Props) {
  const pubFmt = formatFrDate(datePublished)
  const modFmt = dateModified && dateModified !== datePublished ? formatFrDate(dateModified) : null
  const authorEl = authorHref ? (
    <Link
      href={authorHref}
      className="font-semibold text-charcoal-900 hover:underline underline-offset-2"
    >
      {author}
    </Link>
  ) : (
    <span className="font-semibold text-charcoal-900">{author}</span>
  )

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-charcoal-600 ${className}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <User className="w-3.5 h-3.5" aria-hidden="true" />
        Par {authorEl}
      </span>
      <span aria-hidden="true" className="text-charcoal-300">
        ·
      </span>
      <span>
        Publié le <time dateTime={datePublished}>{pubFmt}</time>
      </span>
      {modFmt && (
        <>
          <span aria-hidden="true" className="text-charcoal-300">
            ·
          </span>
          <span>
            Mis à jour le <time dateTime={dateModified}>{modFmt}</time>
          </span>
        </>
      )}
    </div>
  )
}
