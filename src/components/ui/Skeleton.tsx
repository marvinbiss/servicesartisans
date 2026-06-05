import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  shimmer?: boolean
}

export function Skeleton({ className, shimmer = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-sand-300 relative overflow-hidden',
        shimmer &&
          'after:absolute after:inset-0 after:translate-x-[-100%] after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent',
        className
      )}
    />
  )
}

// Card skeleton for artisan/service cards
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-sand-300 p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  )
}

// List skeleton
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-sand-300">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Grid skeleton
export function GridSkeleton({ count = 8, cols = 4 }: { count?: number; cols?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Page skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-sand-300 to-sand-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-10 w-96 mb-4 bg-sand-400" />
          <Skeleton className="h-6 w-72 bg-sand-400" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <GridSkeleton count={8} />
      </div>
    </div>
  )
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-4 w-28 mb-2" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}

// Provider card skeleton — mirrors the real ProviderCard footprint
// (padding, header, rating row, RGE badges, pricing, response-time, CTA)
// so swapping skeleton → live card produces near-zero CLS on the listing.
export function ProviderCardSkeleton() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-sand-300 bg-white p-5 sm:p-6 shadow-soft min-h-[340px] sm:min-h-[360px]"
      role="article"
      aria-busy="true"
      aria-label="Chargement d'un artisan"
    >
      {/* Avatar + name + specialty pill */}
      <div className="flex items-start gap-3 pr-12">
        <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-6 w-56 max-w-full mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Rating + review count row */}
      <div className="flex items-center gap-2 mt-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Address line */}
      <div className="flex items-center gap-2 mt-3">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>

      {/* Pricing + response-time inline metrics */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-sand-200">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-full" />
      </div>

      {/* CTA pair (Voir la fiche / Devis) */}
      <div className="flex gap-2 mt-4">
        <Skeleton className="flex-1 h-11 rounded-xl" />
        <Skeleton className="flex-1 h-11 rounded-xl" />
      </div>
    </div>
  )
}

// Provider list skeleton
export function ProviderListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Chargement des artisans">
      {Array.from({ length: count }).map((_, i) => (
        <ProviderCardSkeleton key={i} />
      ))}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  )
}
