'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface Props {
  estimatePayload: Record<string, unknown>
  onNext: () => void
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 15 })
  const display = useTransform(spring, (v) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(v))
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}

export default function ScreenTeaser({ estimatePayload, onNext }: Props) {
  const [loading, setLoading] = useState(true)
  const [totalBas, setTotalBas] = useState(0)
  const [totalHaut, setTotalHaut] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    async function fetchEstimate() {
      try {
        const res = await fetch('/api/simulateur/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(estimatePayload),
        })
        if (!res.ok) {
          setError('Calcul temporairement indisponible')
          setLoading(false)
          return
        }
        const data = await res.json()
        const bas =
          (data.mprTotal ?? 0) +
          (data.ceeFourchetteBas ?? 0) +
          (data.cdpEstimationBas ?? 0)
        const haut =
          (data.mprTotal ?? 0) +
          (data.ceeFourchetteHaut ?? 0) +
          (data.cdpEstimationHaut ?? 0)
        setTotalBas(Math.max(bas, 0))
        setTotalHaut(Math.max(haut, 0))
      } catch {
        setError('Erreur réseau')
      } finally {
        setLoading(false)
      }
    }
    void fetchEstimate()
  }, [estimatePayload])

  const mid = Math.round((totalBas + totalHaut) / 2)

  return (
    <div className="text-center">
      {loading ? (
        <div className="py-12">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="mt-4 text-sm text-charcoal-500">Calcul de vos aides en cours…</p>
        </div>
      ) : error ? (
        <div className="py-12">
          <p className="text-charcoal-600">{error}</p>
          <button
            type="button"
            onClick={onNext}
            className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-700"
          >
            Continuer quand même
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-8"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Sparkles className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="mt-5 text-lg font-medium text-charcoal-700">Bonne nouvelle !</p>
          <p className="mt-1 text-sm text-charcoal-500">Vous pouvez prétendre à environ</p>
          <p className="mt-3 text-4xl font-extrabold text-emerald-700 sm:text-5xl">
            <AnimatedNumber value={mid} /> €
          </p>
          {totalBas !== totalHaut && (
            <p className="mt-1 text-sm text-charcoal-500">
              Fourchette : {new Intl.NumberFormat('fr-FR').format(totalBas)} –{' '}
              {new Intl.NumberFormat('fr-FR').format(totalHaut)} €
            </p>
          )}

          <div className="mx-auto mt-6 max-w-xs">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="mt-8 w-full max-w-xs rounded-xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-emerald-700 hover:shadow-xl"
          >
            Découvrir mon estimation détaillée
          </button>
          <p className="mt-2 text-xs text-charcoal-400">Gratuit, sans engagement</p>
        </motion.div>
      )}
    </div>
  )
}
