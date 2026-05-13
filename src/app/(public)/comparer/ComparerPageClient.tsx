'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Star,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Wallet,
  Leaf,
  Share2,
  Trash2,
} from 'lucide-react'
import { Provider } from '@/types'
import { getArtisanUrl } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatHourlyRange, resolveProviderPricing } from '@/lib/data/specialty-pricing'
import { hasActiveRgeQualification } from '@/lib/rge/has-active-qualification'

interface ComparerPageClientProps {
  providers: Provider[]
  requestedCount: number
}

function CheckCell({ value }: { value: boolean | undefined | null }) {
  if (value) return <CheckCircle className="w-5 h-5 text-accent-600" aria-label="Oui" />
  return <XCircle className="w-5 h-5 text-charcoal-300" aria-label="Non" />
}

function RatingCell({ provider }: { provider: Provider }) {
  if (!provider.rating_average || !provider.review_count) {
    return <span className="text-charcoal-400 text-sm">Pas encore noté</span>
  }
  return (
    <div className="flex items-center gap-1.5">
      <Star className="w-4 h-4 text-secondary-400 fill-secondary-400" />
      <span className="font-bold text-charcoal-900">{provider.rating_average.toFixed(1)}</span>
      <span className="text-charcoal-500 text-xs">({provider.review_count})</span>
    </div>
  )
}

export function ComparerPageClient({ providers, requestedCount }: ComparerPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [shareLabel, setShareLabel] = useState('Partager')

  const removeProvider = useCallback(
    (id: string) => {
      const currentIds = (searchParams.get('ids') ?? '').split(',').filter(Boolean)
      const next = currentIds.filter((cid) => cid !== id)
      if (next.length === 0) {
        router.push('/comparer')
        return
      }
      router.push(`/comparer?ids=${next.join(',')}`)
    },
    [router, searchParams]
  )

  const share = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: 'Comparaison artisans', url })
        return
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setShareLabel('Lien copié !')
      setTimeout(() => setShareLabel('Partager'), 2000)
    }
  }, [])

  // Empty state — no ids in URL or 0 valid providers
  if (providers.length === 0) {
    return (
      <div className="min-h-[60vh] bg-sand-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-heading font-bold text-charcoal-900 mb-2">
            Comparer des artisans
          </h1>
          <p className="text-charcoal-600 mb-8">
            Sélectionnez 2 à 3 artisans via le bouton « Comparer » sur leurs cartes pour les
            confronter côte à côte.
          </p>
          <div className="bg-white rounded-2xl border border-sand-300">
            <EmptyState
              variant="search"
              title={requestedCount > 0 ? 'Artisans introuvables' : 'Aucun artisan sélectionné'}
              description={
                requestedCount > 0
                  ? "Les identifiants fournis dans l'URL ne correspondent plus à des fiches actives."
                  : 'Parcourez la liste des artisans et cliquez sur « Comparer » pour les ajouter ici.'
              }
              action={{ label: 'Parcourir les artisans', href: '/artisans' }}
              secondaryAction={{ label: 'Demander un devis', href: '/devis' }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <Link
              href="/artisans"
              className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-800 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux artisans
            </Link>
            <h1 className="text-3xl font-heading font-bold text-charcoal-900">
              Comparer {providers.length} artisan{providers.length > 1 ? 's' : ''}
            </h1>
            <p className="text-charcoal-600 mt-1">
              Vue côte à côte de leurs caractéristiques principales.
            </p>
          </div>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border-2 border-sand-300 text-charcoal-700 rounded-xl hover:bg-sand-100 hover:border-primary-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {shareLabel}
          </button>
        </div>

        {/* Cards header — sticky on scroll */}
        <div className="sticky top-[60px] z-30 bg-sand-50/95 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-2 pb-4 mb-6 border-b border-sand-200">
          <div
            className={`grid gap-4 ${
              providers.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : providers.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2 md:grid-cols-3'
            }`}
          >
            {providers.map((provider) => {
              const url = getArtisanUrl({
                stable_id: provider.stable_id,
                slug: provider.slug,
                specialty: provider.specialty,
                city: provider.address_city,
              })
              return (
                <div
                  key={provider.id}
                  className="relative bg-white rounded-2xl border border-sand-300 p-4 shadow-soft"
                >
                  <button
                    type="button"
                    onClick={() => removeProvider(provider.stable_id || provider.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label={`Retirer ${provider.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={url}
                    className="block font-heading font-bold text-charcoal-900 hover:text-primary-500 transition-colors line-clamp-2 pr-6"
                  >
                    {provider.name}
                  </Link>
                  {provider.specialty && (
                    <p className="text-xs text-charcoal-500 mt-1">{provider.specialty}</p>
                  )}
                  {provider.address_city && (
                    <p className="text-xs text-charcoal-500 mt-0.5 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {provider.address_city}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-2xl border border-sand-300 shadow-soft overflow-hidden">
          <ComparerRow label="Note" icon={<Star className="w-4 h-4 text-secondary-400" />}>
            {providers.map((p) => (
              <RatingCell key={p.id} provider={p} />
            ))}
          </ComparerRow>

          <ComparerRow label="Tarif horaire" icon={<Wallet className="w-4 h-4 text-accent-600" />}>
            {providers.map((p) => {
              const pricing = resolveProviderPricing({
                hourlyRateMin: p.hourly_rate_min,
                hourlyRateMax: p.hourly_rate_max,
                specialty: p.specialty,
              })
              return (
                <div key={p.id}>
                  <p
                    className={`font-semibold ${
                      pricing.kind === 'provider' ? 'text-charcoal-900' : 'text-charcoal-700'
                    }`}
                  >
                    {formatHourlyRange(pricing)}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {pricing.kind === 'provider' ? 'Tarif indicatif' : 'Moyenne métier'}
                  </p>
                </div>
              )
            })}
          </ComparerRow>

          <ComparerRow label="Certifié RGE" icon={<Leaf className="w-4 h-4 text-accent-600" />}>
            {providers.map((p) => (
              <CheckCell key={p.id} value={hasActiveRgeQualification(p.rge_qualifications)} />
            ))}
          </ComparerRow>

          <ComparerRow label="Vérifié" icon={<Shield className="w-4 h-4 text-accent-600" />}>
            {providers.map((p) => (
              <CheckCell key={p.id} value={p.is_verified} />
            ))}
          </ComparerRow>

          <ComparerRow label="Localisation" icon={<MapPin className="w-4 h-4 text-charcoal-400" />}>
            {providers.map((p) => (
              <div key={p.id} className="text-sm text-charcoal-700">
                <p>{p.address_city || '—'}</p>
                {p.address_postal_code && (
                  <p className="text-xs text-charcoal-500">{p.address_postal_code}</p>
                )}
              </div>
            ))}
          </ComparerRow>

          <ComparerRow label="SIREN">
            {providers.map((p) => (
              <p key={p.id} className="text-xs font-mono text-charcoal-600">
                {p.siret ? p.siret.slice(0, 9) : '—'}
              </p>
            ))}
          </ComparerRow>

          <ComparerRow label="Inscrit depuis">
            {providers.map((p) => (
              <p key={p.id} className="text-xs text-charcoal-600">
                {p.created_at ? new Date(p.created_at).getFullYear() : '—'}
              </p>
            ))}
          </ComparerRow>

          <ComparerRow label="Profil revendiqué">
            {providers.map((p) => (
              <CheckCell key={p.id} value={Boolean(p.user_id)} />
            ))}
          </ComparerRow>

          <ComparerRow label="Action">
            {providers.map((p) => {
              const url = getArtisanUrl({
                stable_id: p.stable_id,
                slug: p.slug,
                specialty: p.specialty,
                city: p.address_city,
              })
              return (
                <Link
                  key={p.id}
                  href={`${url}#devis`}
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-lg shadow-cta transition-all duration-200"
                >
                  Demander un devis
                </Link>
              )
            })}
          </ComparerRow>
        </div>

        {/* Footnote */}
        <p className="text-xs text-charcoal-500 text-center mt-6 max-w-2xl mx-auto">
          Tarifs horaires : valeurs renseignées par l&apos;artisan lorsque disponibles, sinon
          moyenne de marché du métier (sources&nbsp;: FFB, Capeb 2026). Une comparaison ne remplace
          pas un devis détaillé personnalisé.
        </p>
      </div>
    </div>
  )
}

function ComparerRow({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  const cells = Array.isArray(children) ? children : [children]
  const cols =
    cells.length === 1
      ? 'grid-cols-1'
      : cells.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-2 md:grid-cols-3'
  return (
    <div className="grid grid-cols-[120px_1fr] md:grid-cols-[180px_1fr] border-b border-sand-200 last:border-b-0">
      <div className="flex items-center gap-2 px-4 py-4 bg-sand-50 text-sm font-medium text-charcoal-600">
        {icon}
        {label}
      </div>
      <div className={`grid ${cols} gap-4 px-4 py-4`}>
        {cells.map((cell, i) => (
          <div key={i} className="flex items-center">
            {cell}
          </div>
        ))}
      </div>
    </div>
  )
}
