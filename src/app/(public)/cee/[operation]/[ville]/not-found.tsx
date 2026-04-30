import Link from 'next/link'

export default function CeeOperationVilleNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-3xl font-bold text-charcoal-900 mb-4">
          Opération CEE indisponible pour cette ville
        </h1>
        <p className="text-charcoal-600 mb-8">
          Cette combinaison opération CEE / ville n&apos;est pas active actuellement. Consultez la
          fiche nationale de l&apos;opération ou explorez les autres aides éligibles.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/cee"
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Toutes les opérations CEE
          </Link>
          <Link
            href="/aides"
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-emerald-700 border border-emerald-300 bg-white hover:bg-emerald-50 transition-colors"
          >
            Aides rénovation 2026
          </Link>
          <Link
            href="/simulateur-aides-renovation"
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-charcoal-700 border border-sand-300 bg-white hover:bg-sand-50 transition-colors"
          >
            Simulateur d&apos;aides
          </Link>
        </div>
      </div>
    </div>
  )
}
