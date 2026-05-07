'use client'

import { Phone, ShieldCheck } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { ClaimButton } from '@/components/artisan/ClaimButton'

interface ArtisanRgeAdemeCardProps {
  artisanId: string
  displayName: string
  phone: string | null | undefined
  hasSiret?: boolean
}

function formatFrenchPhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '')
  const local = digits.startsWith('+33')
    ? '0' + digits.slice(3)
    : digits.startsWith('33') && digits.length === 11
      ? '0' + digits.slice(2)
      : digits
  if (local.length !== 10) return raw
  return local.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
}

export function ArtisanRgeAdemeCard({
  artisanId,
  displayName,
  phone,
  hasSiret,
}: ArtisanRgeAdemeCardProps) {
  const cleanPhone = phone?.replace(/[^\d+]/g, '') ?? ''
  const showPhone = cleanPhone.length >= 10

  return (
    <div
      className="mb-6 rounded-xl border border-accent-200 bg-accent-50/60 px-5 py-4"
      role="region"
      aria-label="Coordonnées officielles ADEME"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-charcoal-900">
              Coordonnées officielles {displayName}
            </p>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Source&nbsp;: Registre RGE ADEME (data.gouv.fr — Licence Etalab 2.0)
            </p>
          </div>
        </div>

        {showPhone && (
          <a
            href={`tel:${cleanPhone}`}
            onClick={() => {
              trackEvent('phone_click', {
                artisanId,
                source: 'rge_ademe_card',
              })
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent-600/20 transition-all hover:bg-accent-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
            aria-label={`Appeler ${displayName} au ${formatFrenchPhone(cleanPhone)}`}
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            {formatFrenchPhone(cleanPhone)}
          </a>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal-500">
        <span>
          Fiche établie depuis le registre RGE — non encore revendiquée par l&apos;artisan.
        </span>
        <ClaimInlineLink providerId={artisanId} providerName={displayName} hasSiret={hasSiret} />
      </div>
    </div>
  )
}

function ClaimInlineLink({
  providerId,
  providerName,
  hasSiret,
}: {
  providerId: string
  providerName: string
  hasSiret?: boolean
}) {
  return (
    <span className="inline-flex">
      {/* Re-use ClaimButton for the modal flow but render as a discrete link */}
      <ClaimButtonInlineWrapper
        providerId={providerId}
        providerName={providerName}
        hasSiret={hasSiret}
      />
    </span>
  )
}

/**
 * Wrapper qui réutilise la modale + tracking de `ClaimButton` mais rend
 * un libellé discret en lien (vs gros bouton amber). On évite de dupliquer
 * la logique de modal en exposant simplement un trigger custom via un
 * div qui mime un click sur ClaimButton — implémenté en montant ClaimButton
 * tel quel mais avec un style override via classe wrapper.
 *
 * Approche choisie : monter `<ClaimButton>` tel quel — son look amber n'est
 * pas idéal pour un placement inline, mais le préserver garantit que le
 * tracking PostHog (`ARTISAN_CLAIM_STARTED`/`SUCCEEDED`) reste cohérent
 * avec les autres surfaces. Pour un look vraiment discret, voir
 * `RemovalRequestButton` qui a un styling lien — mais le funnel Claim
 * doit rester l'unique chemin "C'est ma fiche".
 */
function ClaimButtonInlineWrapper({
  providerId,
  providerName,
  hasSiret,
}: {
  providerId: string
  providerName: string
  hasSiret?: boolean
}) {
  return (
    <span className="[&>button]:!w-auto [&>button]:!bg-transparent [&>button]:!text-amber-700 [&>button]:!shadow-none [&>button]:!py-0 [&>button]:!px-0 [&>button]:!text-xs [&>button]:underline [&>button]:underline-offset-2 [&>button>svg]:!hidden hover:[&>button]:!text-amber-800">
      <ClaimButton providerId={providerId} providerName={providerName} hasSiret={hasSiret} />
    </span>
  )
}
