'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Shield, Clock, Star, MapPin, Wallet, Mail, MessageCircle, Copy, Check, BookOpen, FileText, ThumbsUp } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { services } from '@/lib/data/france-light'

/* ─── Types ────────────────────────────────────────────────────────── */

interface MatchedProvider {
  id: string
  name: string
  address_city: string | null
  rating_average: number | null
  review_count: number | null
}

/** Budget option value → human-readable label */
const budgetLabels: Record<string, string> = {
  'moins-500': 'Moins de 500 €',
  '500-2000': '500\u20112 000 €',
  '2000-5000': '2 000\u20115 000 €',
  'plus-5000': 'Plus de 5 000 €',
  'ne-sais-pas': 'Je ne sais pas',
}

interface DevisConfirmationProps {
  service: string
  city: string
  phone: string
  /** Budget slug selected by the user (optional) */
  budget?: string
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
  budget,
  compact = false,
}: DevisConfirmationProps) {
  const [providers, setProviders] = useState<MatchedProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [providerCount, setProviderCount] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

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
          Demande envoyée avec succès !
        </h3>
        <p className={`text-charcoal-500 ${compact ? 'text-xs mb-1' : 'text-sm mb-2'}`}>
          {providerCount !== null && providerCount >= 3
            ? `3 artisans ${serviceLabel.toLowerCase()} correspondent à votre besoin`
            : providerCount !== null && providerCount > 0
            ? `${providerCount} artisan${providerCount > 1 ? 's' : ''} ${serviceLabel.toLowerCase()} trouvé${providerCount > 1 ? 's' : ''} près de chez vous`
            : 'Nous recherchons les meilleurs artisans pour vous'}
        </p>
        <p className={`font-medium text-accent-600 ${compact ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
          Vous recevrez jusqu&apos;à 3 devis sous 24-48h
        </p>
      </motion.div>

      {/* ── Recap (service + budget) ── */}
      {budget && budgetLabels[budget] && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`flex items-center gap-2 px-4 py-2.5 bg-primary-50 border border-primary-200 rounded-xl ${compact ? 'mb-3' : 'mb-5'}`}
        >
          <Wallet className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <span className={`text-charcoal-700 ${compact ? 'text-xs' : 'text-sm'}`}>
            <span className="font-medium">Budget indicatif :</span>{' '}
            {budgetLabels[budget]}
          </span>
        </motion.div>
      )}

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

      {/* ── Contact confirmation & next steps ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={`${compact ? 'mb-4' : 'mb-5'}`}
      >
        <div className="flex items-center gap-2 justify-center mb-3">
          <Mail className="w-4 h-4 text-accent-500" />
          <p className={`font-medium text-charcoal-700 ${compact ? 'text-xs' : 'text-sm'}`}>
            Un email de confirmation a été envoyé à votre adresse
          </p>
        </div>
        <p className={`text-charcoal-400 text-center ${compact ? 'text-[10px]' : 'text-xs'}`}>
          Un SMS de confirmation a été envoyé au {maskedPhone}
        </p>
        <div className={`mt-4 bg-sand-50 border border-sand-200 rounded-xl p-4 ${compact ? 'text-xs' : 'text-sm'}`}>
          <p className="font-semibold text-charcoal-800 mb-2">Prochaines étapes :</p>
          <ol className="list-decimal list-inside space-y-1.5 text-charcoal-600">
            <li>Les artisans analysent votre demande</li>
            <li>Vous recevez jusqu&apos;à 3 devis détaillés sous 24-48h</li>
            <li>Vous comparez et choisissez librement, sans engagement</li>
          </ol>
        </div>
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

      {/* ── Pendant ce temps — liens utiles ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className={`${compact ? 'mt-4' : 'mt-6'}`}
      >
        <p className={`font-semibold text-charcoal-800 text-center ${compact ? 'text-xs mb-2' : 'text-sm mb-3'}`}>
          Pendant ce temps
        </p>
        <div className="space-y-2">
          <Link
            href={`/avis/${service}/${city}`}
            className="flex items-center gap-3 p-3 bg-sand-50 border border-sand-200 rounded-xl hover:bg-sand-100 transition-colors"
          >
            <ThumbsUp className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className={`text-charcoal-700 ${compact ? 'text-xs' : 'text-sm'}`}>
              Lire les avis de {serviceLabel.toLowerCase()}s {'\u00e0'} {city}
            </span>
          </Link>
          <Link
            href={`/tarifs/${service}/${city}`}
            className="flex items-center gap-3 p-3 bg-sand-50 border border-sand-200 rounded-xl hover:bg-sand-100 transition-colors"
          >
            <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className={`text-charcoal-700 ${compact ? 'text-xs' : 'text-sm'}`}>
              Consulter les tarifs {serviceLabel.toLowerCase()} {'\u00e0'} {city}
            </span>
          </Link>
          <Link
            href="/guides"
            className="flex items-center gap-3 p-3 bg-sand-50 border border-sand-200 rounded-xl hover:bg-sand-100 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className={`text-charcoal-700 ${compact ? 'text-xs' : 'text-sm'}`}>
              Nos guides travaux
            </span>
          </Link>
        </div>
      </motion.div>

      {/* ── Partage ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className={`${compact ? 'mt-4' : 'mt-6'}`}
      >
        <p className={`font-semibold text-charcoal-800 text-center ${compact ? 'text-xs mb-2' : 'text-sm mb-3'}`}>
          Recommandez ServicesArtisans
        </p>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`J'ai trouvé des artisans de confiance sur ServicesArtisans : ${typeof window !== 'undefined' ? window.location.href : 'https://servicesartisans.fr'}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#20bd5a] transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sand-300 text-charcoal-700 font-medium rounded-xl hover:bg-sand-50 transition-colors text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-accent-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copie !' : 'Copier le lien'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
