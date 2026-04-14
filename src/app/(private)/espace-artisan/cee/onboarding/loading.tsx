/**
 * Loading skeleton — /espace-artisan/cee/onboarding.
 * Shown while the Server Component auth-guards and fetches partner data.
 * Light-only, no dark:* classes. Respects prefers-reduced-motion.
 */

export default function OnboardingLoading() {
  return (
    <div
      className="min-h-screen bg-sand-50"
      aria-busy="true"
      aria-label="Chargement de l'onboarding CEE…"
    >
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-7 w-52 animate-pulse rounded-lg bg-primary-400/50" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-primary-400/30" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Stepper skeleton */}
        <nav aria-hidden="true">
          <div className="flex items-center gap-0">
            {[1, 2, 3, 4, 5].map((i, idx) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className="h-11 w-11 animate-pulse rounded-full bg-sand-200" />
                  <div className="mt-1 hidden h-3 w-16 animate-pulse rounded bg-sand-100 sm:block" />
                </div>
                {idx < 4 && <div className="mx-2 mb-4 h-0.5 flex-1 animate-pulse bg-sand-200" />}
              </div>
            ))}
          </div>
        </nav>

        {/* Step content skeleton */}
        <div className="rounded-2xl border border-sand-300 bg-white shadow-soft p-6 sm:p-8 space-y-6">
          <div className="h-5 w-24 animate-pulse rounded-full bg-primary-100" />
          <div className="h-8 w-64 animate-pulse rounded-lg bg-sand-200" />
          <div className="h-4 w-full animate-pulse rounded bg-sand-100" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-sand-100" />
            ))}
          </div>
          <div className="flex justify-end">
            <div className="h-11 w-36 animate-pulse rounded-xl bg-primary-100" />
          </div>
        </div>
      </div>

      <span className="sr-only">Chargement en cours…</span>
    </div>
  )
}
