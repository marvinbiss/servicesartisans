/**
 * Loading skeleton — /espace-artisan/cee dashboard.
 * Shown by Next.js App Router while the Server Component fetches data.
 * Light-only, no dark:* classes. Respects prefers-reduced-motion.
 */

export default function CeeDashboardLoading() {
  return (
    <div
      className="min-h-screen bg-sand-50"
      aria-busy="true"
      aria-label="Chargement du tableau de bord CEE…"
    >
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-7 w-48 animate-pulse rounded-lg bg-primary-400/50" />
              <div className="h-4 w-64 animate-pulse rounded bg-primary-400/30" />
            </div>
            <div className="h-10 w-36 animate-pulse rounded-xl bg-white/20" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* KPI cards skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-sand-300 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 animate-pulse rounded bg-sand-200" />
                <div className="h-5 w-5 animate-pulse rounded bg-sand-200" />
              </div>
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-sand-200" />
            </div>
          ))}
        </div>

        {/* Dossier list skeleton */}
        <div className="space-y-3" aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-sand-300 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-28 animate-pulse rounded bg-sand-200" />
                    <div className="h-5 w-20 animate-pulse rounded-full bg-sand-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-sand-100" />
                    <div className="h-4 w-28 animate-pulse rounded bg-sand-100" />
                  </div>
                </div>
                <div className="h-5 w-5 animate-pulse rounded bg-sand-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Chargement en cours…</span>
    </div>
  )
}
