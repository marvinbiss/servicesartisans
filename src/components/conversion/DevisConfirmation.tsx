'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  Shield,
  Clock,
  Star,
  MapPin,
  Wallet,
  Mail,
  MessageCircle,
  Copy,
  Check,
  BookOpen,
  FileText,
  ThumbsUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Leaf,
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { services } from '@/lib/data/france-light'
import { getArtisanUrl } from '@/lib/utils'
import { getCeeOperationDetails, type CeeOperationDetail } from '@/lib/cee/qualify'
import { CeeTracking } from '@/lib/analytics/tracking'
import CeeSavingsComparator from '@/components/cee/CeeSavingsComparator'

/* ─── Types ────────────────────────────────────────────────────────── */

interface MatchedProvider {
  id: string
  name: string
  slug: string | null
  stable_id: string | null
  specialty: string | null
  address_city: string | null
  rating_average: number | null
  review_count: number | null
  is_verified: boolean
}

/** Budget option value → human-readable label */
const budgetLabels: Record<string, string> = {
  'moins-500': 'Moins de 500 €',
  '500-2000': '500‑2 000 €',
  '2000-5000': '2 000‑5 000 €',
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
  /** TRUE si au moins une opération CEE matche le service (qualifié côté API) */
  ceeEligible?: boolean
  /** Codes FOS applicables (ex: ['BAR-EN-101','BAR-TH-129']) */
  ceeOperationCodes?: string[]
  /** Slug du service (ex: "chauffagiste") — utilisé pour le contexte CEE */
  serviceSlug?: string
  /** Code postal 5 chiffres — utilisé pour le contexte CEE */
  postalCode?: string
  /**
   * Audit funnel vague 4 (2026-05-04) — différenciation des outcomes :
   * - 'duplicate' : le serveur a renvoyé 409 (demande similaire dans l'heure).
   *   Pas une erreur ; on remercie l'utilisateur et on évite de relancer un
   *   nouveau dispatch. F4 du root cause analysis.
   * - 'pending_dispatch' : 200 mais artisans_notified === 0 (aucun match
   *   immédiat). Lead créé en DB ; l'équipe recontacte sous 24h. F3 du root
   *   cause analysis (Pipedrive silent failure).
   */
  outcome?: 'duplicate' | 'pending_dispatch' | null
  /** UUID returned by /api/devis. Short prefix is shown as a human-readable
   *  reference so the user can quote it when calling the conseiller. */
  requestId?: string | null
}

function formatRequestRef(id: string): string {
  // Take first 8 chars of the UUID, upper-case, group as "XXXX-XXXX"
  const cleaned = id.replace(/-/g, '').slice(0, 8).toUpperCase()
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`
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

/* ─── Component ────────────────────────────────────────────────────── */

export default function DevisConfirmation({
  service,
  city,
  phone,
  budget,
  compact = false,
  ceeEligible = false,
  ceeOperationCodes = [],
  serviceSlug: _serviceSlug,
  postalCode: _postalCode,
  outcome = null,
  requestId = null,
}: DevisConfirmationProps) {
  const [providers, setProviders] = useState<MatchedProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [providerCount, setProviderCount] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [refCopied, setRefCopied] = useState(false)
  const [ceeDetails, setCeeDetails] = useState<CeeOperationDetail[]>([])
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the confirmation heading on mount so keyboard / SR
  // users land on the success copy instead of the now-defunct submit
  // button at the bottom of the form. tabIndex={-1} keeps the heading
  // out of the natural tab order; .focus() is the only entry point.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  // Fetch matched providers async — success UI shows immediately
  useEffect(() => {
    let cancelled = false

    async function fetchProviders() {
      try {
        const supabase = getSupabaseClient()
        const providerFields =
          'id, name, slug, stable_id, specialty, address_city, rating_average, review_count, is_verified'

        // Try same city first (ilike for case-insensitive match)
        // Use %service% pattern to match specialty variants (e.g., "plombier" matches "Plombier")
        const { data: cityData } = await supabase
          .from('providers')
          .select(providerFields)
          .eq('is_active', true)
          .ilike('specialty', `%${service}%`)
          .ilike('address_city', city)
          .order('is_verified', { ascending: false })
          .order('rating_average', { ascending: false, nullsFirst: false })
          .limit(5)

        if (cancelled) return

        if (cityData && cityData.length >= 3) {
          setProviders(cityData)
          setProviderCount(cityData.length)
        } else {
          // Fallback: fill remaining slots with nearby providers (different city)
          const existingIds = (cityData || []).map((p) => p.id)
          const remaining = 5 - (cityData?.length || 0)

          const { data: broadData } = await supabase
            .from('providers')
            .select(providerFields)
            .eq('is_active', true)
            .ilike('specialty', `%${service}%`)
            .order('is_verified', { ascending: false })
            .order('rating_average', { ascending: false, nullsFirst: false })
            .limit(remaining + existingIds.length)

          if (cancelled) return

          // Deduplicate: city providers first, then fill with others
          const combined = [...(cityData || [])]
          for (const p of broadData || []) {
            if (!existingIds.includes(p.id) && combined.length < 5) {
              combined.push(p)
            }
          }

          setProviders(combined)
          setProviderCount(combined.length)
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

  // Dispatch analytics event au mount quand l'éligibilité CEE est détectée
  useEffect(() => {
    if (!ceeEligible) return
    CeeTracking.qualificationShown({
      service,
      operation_code: ceeOperationCodes[0],
    })
  }, [ceeEligible, service, ceeOperationCodes])

  // Fetch CEE operation details when eligible — affiche exigences RGE + opérations
  useEffect(() => {
    if (!ceeEligible || ceeOperationCodes.length === 0) {
      setCeeDetails([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const supabase = getSupabaseClient()
        const details = await getCeeOperationDetails(supabase, ceeOperationCodes)
        if (!cancelled) setCeeDetails(details)
      } catch {
        if (!cancelled) setCeeDetails([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ceeEligible, ceeOperationCodes])

  // Agrégat unique des qualifications RGE requises par l'ensemble des opérations
  const requiredRgeQualifs = Array.from(
    new Set(ceeDetails.flatMap((d) => d.rge_qualifications_requises || []))
  ).filter(Boolean)

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
          <CheckCircle className={`${compact ? 'w-7 h-7' : 'w-10 h-10'} text-accent-500`} />
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
          ref={headingRef}
          tabIndex={-1}
          aria-live="polite"
          className={`font-heading font-bold text-charcoal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 rounded-lg ${
            compact ? 'text-lg mb-1' : 'text-2xl md:text-3xl mb-2'
          }`}
        >
          {outcome === 'duplicate'
            ? 'Votre demande a déjà été reçue'
            : outcome === 'pending_dispatch'
              ? 'Demande bien enregistrée'
              : 'Demande envoyée avec succès !'}
        </h3>
        <p className={`text-charcoal-500 ${compact ? 'text-xs mb-1' : 'text-sm mb-2'}`}>
          {outcome === 'duplicate'
            ? 'Une demande similaire est déjà en traitement. Inutile d’en relancer une, vous recevrez les devis prochainement.'
            : outcome === 'pending_dispatch'
              ? `Aucun ${serviceLabel.toLowerCase()} disponible immédiatement à ${city}. Notre équipe élargit la recherche et vous recontacte sous 24 h.`
              : providerCount !== null && providerCount >= 3
                ? `3 artisans ${serviceLabel.toLowerCase()} correspondent à votre besoin`
                : providerCount !== null && providerCount > 0
                  ? `${providerCount} artisan${providerCount > 1 ? 's' : ''} ${serviceLabel.toLowerCase()} trouvé${providerCount > 1 ? 's' : ''} près de chez vous`
                  : 'Nous recherchons des artisans RGE certifiés pour vous'}
        </p>
        <p className={`font-medium text-accent-600 ${compact ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
          {outcome === 'duplicate'
            ? 'Surveillez votre boîte mail (et spams)'
            : 'Un conseiller vous rappelle rapidement'}
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
            <span className="font-medium">Budget indicatif :</span> {budgetLabels[budget]}
          </span>
        </motion.div>
      )}

      {/* ── CEE eligibility badge + détails opérations ── */}
      {ceeEligible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27 }}
          className={`px-4 py-3 bg-gradient-to-br from-accent-50 to-primary-50 border border-accent-200 rounded-xl ${compact ? 'mb-3' : 'mb-5'}`}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-charcoal-900 ${compact ? 'text-xs' : 'text-sm'}`}>
                Vos travaux sont potentiellement éligibles à une prime CEE
              </p>
              <p className={`text-charcoal-600 mt-0.5 ${compact ? 'text-[11px]' : 'text-xs'}`}>
                Certificats d&apos;Économies d&apos;Énergie — estimation et éligibilité confirmées
                par votre artisan.
              </p>
            </div>
          </div>

          {/* Liste des opérations CEE applicables */}
          {ceeDetails.length > 0 && (
            <ul className={`mt-3 space-y-1.5 ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {ceeDetails.slice(0, 4).map((op) => (
                <li key={op.code} className="flex items-start gap-2">
                  <CheckCircle
                    className="w-3.5 h-3.5 text-accent-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-charcoal-800">{op.code}</span>
                    <span className="text-charcoal-600"> — {op.nom}</span>
                  </div>
                </li>
              ))}
              {ceeDetails.length > 4 && (
                <li className="text-charcoal-500 ml-5">
                  + {ceeDetails.length - 4} autre{ceeDetails.length - 4 > 1 ? 's' : ''} opération
                  {ceeDetails.length - 4 > 1 ? 's' : ''}
                </li>
              )}
            </ul>
          )}

          {/* Exigences RGE (agrégées de toutes les opérations) */}
          {requiredRgeQualifs.length > 0 && (
            <div
              className={`mt-3 pt-3 border-t border-accent-100 flex items-start gap-2 ${compact ? 'text-[11px]' : 'text-xs'}`}
            >
              <Leaf
                className="w-3.5 h-3.5 text-accent-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-accent-700">Artisan RGE requis :</span>{' '}
                <span className="text-charcoal-600">
                  {requiredRgeQualifs.slice(0, 4).join(', ')}
                  {requiredRgeQualifs.length > 4 ? ` +${requiredRgeQualifs.length - 4}` : ''}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── CEE savings comparator — coût avec/sans prime ── */}
      {ceeEligible && _serviceSlug && _postalCode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={compact ? 'mb-3' : 'mb-5'}
        >
          <CeeSavingsComparator serviceSlug={_serviceSlug} postalCode={_postalCode} />
        </motion.div>
      )}

      {/* ── CEE mandataire — checklist pièces à préparer ── */}
      {ceeEligible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className={`rounded-xl border border-accent-200 bg-accent-50 p-4 ${compact ? 'mb-3' : 'mb-5'}`}
        >
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent-100"
            >
              <Sparkles className="h-5 w-5 text-accent-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`font-heading font-semibold text-accent-900 ${compact ? 'text-xs' : 'text-sm'}`}
              >
                Bonne nouvelle&nbsp;: vos travaux sont éligibles à une prime CEE&nbsp;!
              </p>
              <p className={`text-accent-800 mt-1 ${compact ? 'text-[11px]' : 'text-xs'}`}>
                Notre équipe prend en charge les démarches pour récupérer votre prime Certificats
                d&apos;Économies d&apos;Énergie. Aucune paperasse supplémentaire pour vous.
              </p>
            </div>
          </div>

          {/* Opérations éligibles */}
          {ceeOperationCodes.length > 0 && (
            <div
              className={`mt-3 pt-3 border-t border-accent-100 ${compact ? 'text-[11px]' : 'text-xs'}`}
            >
              <p className="font-medium text-accent-800">
                Opérations éligibles&nbsp;:{' '}
                <span className="font-semibold text-accent-900">
                  {ceeOperationCodes.join(', ')}
                </span>
              </p>
            </div>
          )}

          {/* Checklist pièces à préparer */}
          <div
            className={`mt-3 pt-3 border-t border-accent-100 ${compact ? 'text-[11px]' : 'text-xs'}`}
          >
            <p className="font-semibold text-accent-900 mb-2">Pièces à préparer&nbsp;:</p>
            <ul className="space-y-1.5">
              {[
                'Facture des travaux',
                'Photos avant/après les travaux (avec géolocalisation activée)',
                'Attestation sur l’honneur signée',
                'Justificatif de propriété ou bail',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle
                    className="w-3.5 h-3.5 text-accent-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-accent-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA — voir le guide de l'opération CEE principale */}
          {ceeOperationCodes.length > 0 && (
            <div className={`mt-3 pt-3 border-t border-accent-100`}>
              <Link
                href={`/cee/${ceeOperationCodes[0].toLowerCase()}/guide?source=devis-confirmation`}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors ${compact ? 'text-xs w-full' : 'text-sm'}`}
              >
                Voir les étapes de votre dossier CEE
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              {ceeOperationCodes.length > 1 && (
                <p className={`mt-2 text-accent-700 ${compact ? 'text-[11px]' : 'text-xs'}`}>
                  + {ceeOperationCodes.length - 1} autre
                  {ceeOperationCodes.length - 1 > 1 ? 's' : ''} opération
                  {ceeOperationCodes.length - 1 > 1 ? 's' : ''} éligible
                  {ceeOperationCodes.length - 1 > 1 ? 's' : ''} —{' '}
                  <Link href="/cee" className="underline font-semibold hover:text-accent-900">
                    voir toutes les primes CEE
                  </Link>
                </p>
              )}
            </div>
          )}

          {/* Texte rassurant */}
          <p
            className={`mt-3 pt-3 border-t border-accent-100 text-accent-700 ${compact ? 'text-[11px]' : 'text-xs'}`}
          >
            Votre artisan RGE vous guidera pour chaque étape. La prime sera déduite de votre facture
            ou versée après validation.
          </p>
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
            {providers.map((provider, i) => {
              const profileUrl = getArtisanUrl({
                stable_id: provider.stable_id,
                slug: provider.slug,
                specialty: provider.specialty,
                city: provider.address_city,
              })

              return (
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
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-charcoal-900 truncate">
                        {provider.name}
                      </p>
                      {provider.is_verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-charcoal-500">
                      {provider.rating_average ? (
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {provider.rating_average.toFixed(1)}
                          {provider.review_count ? (
                            <span className="text-charcoal-400">({provider.review_count})</span>
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

                  {/* CTA: Voir le profil */}
                  <Link
                    href={profileUrl}
                    className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium whitespace-nowrap transition-colors"
                  >
                    Voir le profil
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        ) : null}
      </div>

      {/* ── Reference number ── */}
      {requestId && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`flex items-center justify-between gap-3 px-4 py-3 bg-charcoal-900 text-white rounded-xl ${compact ? 'mb-3 text-xs' : 'mb-5 text-sm'}`}
        >
          <div className="min-w-0">
            <p className="text-charcoal-400 uppercase tracking-wider text-[10px] font-semibold">
              Numéro de votre demande
            </p>
            <p className="font-mono font-bold text-lg tracking-wider">
              {formatRequestRef(requestId)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(formatRequestRef(requestId))
              setRefCopied(true)
              setTimeout(() => setRefCopied(false), 2000)
            }}
            aria-label="Copier le numéro de demande"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-900"
          >
            {refCopied ? (
              <Check className="w-3.5 h-3.5 text-accent-300" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{refCopied ? 'Copié' : 'Copier'}</span>
          </button>
        </motion.div>
      )}

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
          Un conseiller vous rappellera au {maskedPhone}
        </p>
        <div
          className={`mt-4 bg-sand-50 border border-sand-200 rounded-xl p-4 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          <p className="font-semibold text-charcoal-800 mb-2">Prochaines étapes :</p>
          <ol className="list-decimal list-inside space-y-1.5 text-charcoal-600">
            <li>Les artisans analysent votre demande</li>
            <li>Vous recevez des devis détaillés d&apos;artisans disponibles</li>
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
          { icon: Clock, label: 'Réponse rapide', color: 'text-amber-500' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 p-2 bg-sand-50 rounded-xl">
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
          href={`/services/${service}/${city.toLowerCase().replace(/\s+/g, '-')}`}
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
        <p
          className={`font-semibold text-charcoal-800 text-center ${compact ? 'text-xs mb-2' : 'text-sm mb-3'}`}
        >
          Pendant ce temps
        </p>
        <div className="space-y-2">
          <Link
            href={`/avis/${service}/${city}`}
            className="flex items-center gap-3 p-3 bg-sand-50 border border-sand-200 rounded-xl hover:bg-sand-100 transition-colors"
          >
            <ThumbsUp className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className={`text-charcoal-700 ${compact ? 'text-xs' : 'text-sm'}`}>
              Lire les avis de {serviceLabel.toLowerCase()}s {'à'} {city}
            </span>
          </Link>
          <Link
            href={`/services/${service}/${city}`}
            className="flex items-center gap-3 p-3 bg-sand-50 border border-sand-200 rounded-xl hover:bg-sand-100 transition-colors"
          >
            <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className={`text-charcoal-700 ${compact ? 'text-xs' : 'text-sm'}`}>
              Consulter les tarifs {serviceLabel.toLowerCase()} {'à'} {city}
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
        <p
          className={`font-semibold text-charcoal-800 text-center ${compact ? 'text-xs mb-2' : 'text-sm mb-3'}`}
        >
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
            onClick={async () => {
              const url =
                typeof window !== 'undefined' ? window.location.href : 'https://servicesartisans.fr'
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: 'ServicesArtisans',
                    text: "J'ai trouvé des artisans RGE de confiance sur ServicesArtisans",
                    url,
                  })
                  return
                }
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              } catch (err) {
                // navigator.share AbortError when user dismisses the OS sheet — silent
                if (err instanceof Error && err.name === 'AbortError') return
                // Fallback path also failed — surface the URL inline
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }
            }}
            aria-label="Partager ou copier le lien"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-sand-300 text-charcoal-700 font-medium rounded-xl hover:bg-sand-50 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
          >
            {copied ? <Check className="w-4 h-4 text-accent-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copié !' : 'Partager'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
