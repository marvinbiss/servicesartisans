'use client'

import { memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination = memo(function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label={`Page précédente (page ${page - 1})`}
        className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-sand-200 bg-white disabled:opacity-40 hover:bg-sand-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">Précédent</span>
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum: number
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (page <= 3) {
            pageNum = i + 1
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = page - 2 + i
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              aria-label={`Page ${pageNum}`}
              aria-current={pageNum === page ? 'page' : undefined}
              className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                pageNum === page
                  ? 'bg-primary-600 text-white font-medium'
                  : 'text-charcoal-600 hover:bg-sand-100'
              }`}
            >
              {pageNum}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label={`Page suivante (page ${page + 1})`}
        className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-sand-200 bg-white disabled:opacity-40 hover:bg-sand-50 transition-colors"
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </nav>
  )
})
