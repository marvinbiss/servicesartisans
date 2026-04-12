'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  className?: string
}

export function Pagination({ currentPage, totalPages, baseUrl, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const url = new URL(baseUrl, origin)
    url.searchParams.set('page', String(page))
    return `${url.pathname}${url.search}`
  }

  const pages: (number | 'ellipsis')[] = []

  // Always show first page
  pages.push(1)

  // Add ellipsis if needed
  if (currentPage > 3) {
    pages.push('ellipsis')
  }

  // Add pages around current
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    if (!pages.includes(i)) {
      pages.push(i)
    }
  }

  // Add ellipsis if needed
  if (currentPage < totalPages - 2) {
    pages.push('ellipsis')
  }

  // Always show last page
  if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages)
  }

  return (
    <nav
      className={clsx('flex items-center justify-center gap-2', className)}
      aria-label="Pagination"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-charcoal-600 hover:bg-sand-100 rounded-lg min-h-[44px] min-w-[44px] justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm text-sand-500 cursor-not-allowed min-h-[44px] min-w-[44px] justify-center">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1.5">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-charcoal-400">
              ...
            </span>
          ) : page === currentPage ? (
            <span
              key={page}
              className="min-w-[44px] h-11 flex items-center justify-center rounded-lg text-sm font-medium bg-primary-500 text-white"
              aria-current="page"
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              className="min-w-[44px] h-11 flex items-center justify-center rounded-lg text-sm font-medium transition-colors text-charcoal-600 hover:bg-sand-100"
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-charcoal-600 hover:bg-sand-100 rounded-lg min-h-[44px] min-w-[44px] justify-center"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm text-sand-500 cursor-not-allowed min-h-[44px] min-w-[44px] justify-center">
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  )
}

export default Pagination
