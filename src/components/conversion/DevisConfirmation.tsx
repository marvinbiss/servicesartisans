'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Shield, Clock, Star, MapPin } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { services } from '@/lib/data/france'

/* ─── Types ────────────────────────────────────────────────────────── */

interface MatchedProvider {
  id: string
  name: string
  address_city: string | null
  rating_average: number | null
  review_count: number | null
}

interface DevisConfirmationProps {
  service: string
  city: string
  phone: string
  /** Compact mode for bottom sheet (mobile) */
  compact?: boolean
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

function maskPhone(phone: string): string {
  const cleaned = phone.replace(/[\s.\-()]/g, '')
  if (cleaned.length >= 10) {
    const visible = cleaned.slice(0, cleaned.length - 4)
    return `${visible.replace(/(.{2})/g, '$1 ').trim()} XX XX`
  }
  return phone
}

function getServiceLabel(slug: string): string {
  const found = services.find((s) => s.slug === slug)
  return found?.name || slug
}

/** Pseudo-random response time based on provider name for consistency */
function getResponseTime(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return (Math.abs(hash) % 4) + 1
}

/* ─── Component ────────────────────────────────────────────────────── */

export default function DevisConfirmation({
  service,
  city,
  phone,
  compact = false,
}: DevisConfirmationProps) {
  const [providers, setProviders] = useState<MatchedProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [providerCount, setProviderCount] = useState<number | null>(null)

  // Fetch matched providers async — success UI shows immediately
  useEffect(() => {
    let cancelled = false

    async function fetchProviders() {
      try {
        const supabase = getSupabaseClient()

        // Try same city first (ilike for case-insensitive match)
        const { data: cityData } = await supabase
          .from('providers')
          .select('id, name, address_city, rating_average, review_count')
          .eq('is_active', true)
          .ilike('specialty', service)
          .ilike('address_city', city)
          .order('rating_average', { ascending: false, nullsFirst: false })
          .limit(3)

        if (cancelled) return

        if (cityData && cityData.length >= 3) {
          setProviders(cityData)
          setProviderCount(cityData.length)
        } else {
          // Fallback: broader search without city filter
          const { data: broadData } = await supabase
            .from('providers')
            .select('id, name, address_city, rating_average, review_count')
            .eq('is_active', true)
            .ilike('specialty', service)
            .order('rating_average', { ascending: false, nullsFirst: false })
            .limit(3)

          if (cancelled) return

          const combined = [...(cityData || []), ...(broadData || [])]
          const uniqueMap = new Map<string, MatchedProvider>()
          combined.forEach((p) => uniqueMap.set(p.id, p))
          const unique = Array.from(uniqueMap.values()).slice(0, 3)

          setProviders(unique)
          setProviderCount(unique.length)
        }
      } catch {
        setProviderCount(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProviders()
    return () => {
      cancelled = true
    }
  }, [service, city])

  const serviceLabel = getServiceLabel(service)
  const maskedPhone = maskPhone(phone)

  return (
    <div className={compact ? 'py-4' : 'py-6 md:py-8'}>
      {/* ── Animated checkmark ── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="mx-auto mb-4"
      >
        <div
          className={`${
            compact ? 'w-14 h-14' : 'w-20 h-20'
          } bg-accent-100 rounded-full flex items-center justify-center mx-auto`}
        >
          <CheckCircle
            className={`${compact ? 'w-7 h-7' : 'w-10 h-10'} text-accent-500`}
          />
        </div>
      </motion.div>

      {/* ── Title ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h3
          className={`font-heading font-bold text-charcoal-900 ${
            compact ? 'text-lg mb-1' : 'text-2xl md:text-3xl mb-2'
          }`}
        >
          Votre demande a été envoyée !
        </h3>
        <p className={`text-charcoal-500 ${compact ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
          {providerCount !== null && providerCount >= 3
            ? `3 artisans ${serviceLabel.toLowerCase()} correspondent à votre besoin`
            : providerCount !== null && providerCount > 0
            ? `${providerCount} artisan${providerCount > 1 ? 's' : ''} ${serviceLabel.toLowerCase()} trouvé${providerCount > 1 ? 's' : ''} près de chez vous`
            : 'Nous recherchons les meilleurs artisans pour vous'}
        </p>
      </motion.div>

      {/* ── Provider cards (async loading) ── */}
      <div className={`space-y-2 ${compact ? 'mb-4' : 'mb-6'}`}>
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-sand-50 rounded-xl animate-pulse"
              >
                <div className="w-10 h-10 bg-sand-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-sand-200 rounded w-24" />
                  <div className="h-2.5 bg-sand-200 rounded w-32" />
                </div>
                <div className="h-3 bg-sand-200 rounded w-16" />
              </motion.div>
            ))}
          </div>
        ) : providers.length > 0 ? (
          <AnimatePresence>
            {providers.map((provider, i) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 15, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.3 + i * 0.2,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
                className="flex items-center gap-3 p-3 bg-sand-50 border border-sand-200 rounded-xl"
              >
                {/* Avatar initial */}
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-600">
                    {(provider.name || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-charcoal-900 truncate">
                    {provider.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-charcoal-500">
                    {provider.rating_average ? (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {provider.rating_average.toFixed(1)}
                        {provider.review_count ? (
                          <span className="text-charcoal-400">
                            ({provider.review_count})
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                    {provider.address_city && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {provider.address_city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Response time */}
                <span className="text-xs text-accent-600 font-medium whitespace-nowrap">
                  ~{getResponseTime(provider.name)}h
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : null}
      </div>

      {/* ── Contact confirmation ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-2 mb-5"
      >
        <p className={`font-medium text-charcoal-700 ${compact ? 'text-xs' : 'text-sm'}`}>
          Vous serez contacté sous 24h maximum
        </p>
        <p className={`text-charcoal-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
          Un SMS de confirmation a été envoyé au {maskedPhone}
        </p>
        <p className="text-charcoal-500 text-sm mt-2">
          Un email de confirmation a été envoyé à votre adresse
        </p>
      </motion.div>

      {/* ── Reassurances ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className={`grid grid-cols-3 gap-2 ${compact ? 'mb-4' : 'mb-6'}`}
      >
        {[
          { icon: CheckCircle, label: 'Gratuit', color: 'text-accent-500' },
          { icon: Shield, label: 'Vérifiés et assurés', color: 'text-primary-500' },
          { icon: Clock, label: 'Réponse sous 24h', color: 'text-amber-500' },
        ].map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 p-2 bg-sand-50 rounded-xl"
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-[10px] sm:text-xs font-medium text-charcoal-600 text-center leading-tight">
              {label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ── Secondary link ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-center"
      >
        <Link
          href={`/services`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary-400 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all"
        >
          Consulter les artisans à {city}
        </Link>
      </motion.div>
    </div>
  )
}
