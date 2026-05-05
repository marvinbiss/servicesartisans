'use client'

import { useState, useTransition, type FormEvent } from 'react'
import Link from 'next/link'
import { Phone, HardHat, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'

interface Props {
  publicId: string
  callbackToken: string
  parcoursSlug: string | null
  codePostal: string | null
}

type CallbackStatus = 'idle' | 'success' | 'error'

export default function ResultatActions({
  publicId,
  callbackToken,
  parcoursSlug,
  codePostal,
}: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<CallbackStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // parcoursSlug = 'geste' | 'accompagne' (type de parcours MPR), pas un slug
  // métier. Toute estimation du simulateur correspond à de la rénovation
  // énergétique — on route donc vers /devis/renovation-energetique (slug valide
  // dans tradeContent). Le publicId reprécise le contexte.
  const devisHref = `/devis/renovation-energetique${
    codePostal
      ? `?cp=${codePostal}&source=simulateur&publicId=${publicId}&parcours=${parcoursSlug ?? ''}`
      : `?source=simulateur&publicId=${publicId}&parcours=${parcoursSlug ?? ''}`
  }`

  const handleDevisClick = () => {
    trackEvent('simulateur_cta_click', {
      variant: 'resultat-devis',
      serviceSlug: parcoursSlug ?? null,
      city: null,
    })
  }

  const openCallback = () => {
    trackEvent('simulateur_cta_click', {
      variant: 'resultat-callback-open',
      serviceSlug: parcoursSlug ?? null,
      city: null,
    })
    setOpen(true)
    setStatus('idle')
    setErrorMsg(null)
  }

  const submitCallback = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      publicId,
      callbackToken,
      telephone: String(fd.get('telephone') ?? '').trim(),
      preferredSlot: (String(fd.get('preferredSlot') ?? '').trim() || null) as string | null,
      remarquesClient: (String(fd.get('remarquesClient') ?? '').trim() || null) as string | null,
      consentRgpd: fd.get('consentRgpd') === 'on',
      consentDemarchage: fd.get('consentDemarchage') === 'on',
    }

    if (!payload.consentRgpd) {
      setStatus('error')
      setErrorMsg('Le consentement RGPD est obligatoire.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/simulateur/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(data.error ?? `Erreur ${res.status}`)
        }
        setStatus('success')
        trackEvent('simulateur_cta_click', {
          variant: 'resultat-callback-submitted',
          serviceSlug: parcoursSlug ?? null,
          city: null,
        })
      } catch (err) {
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue')
      }
    })
  }

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2">
      {/* Path A — artisan RGE */}
      <div className="rounded-2xl border-2 border-emerald-200 bg-white p-6 flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center">
            <HardHat className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-bold text-charcoal-900">
              Devis d&apos;un artisan RGE
            </h3>
            <p className="text-sm text-charcoal-600 mt-1">
              Un artisan certifié RGE vous recontacte sous 24h avec un chiffrage officiel. Votre
              estimation est pré-remplie.
            </p>
          </div>
        </div>
        <ul className="text-sm text-charcoal-700 space-y-1.5 mb-4 flex-1">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
            <span>Lead exclusif — un seul artisan vous contacte</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
            <span>Certifié RGE pour éligibilité aux aides</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold mt-0.5">✓</span>
            <span>Gratuit, sans engagement</span>
          </li>
        </ul>
        <Link
          href={devisHref}
          onClick={handleDevisClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 transition"
        >
          Recevoir un devis RGE
        </Link>
      </div>

      {/* Path B — callback conseiller */}
      <div className="rounded-2xl border-2 border-primary-200 bg-white p-6 flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-600 flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-bold text-charcoal-900">
              Rappel gratuit par un conseiller
            </h3>
            <p className="text-sm text-charcoal-600 mt-1">
              Un expert rénovation décrypte votre estimation par téléphone et répond à vos questions
              sur les aides.
            </p>
          </div>
        </div>
        <ul className="text-sm text-charcoal-700 space-y-1.5 mb-4 flex-1">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold mt-0.5">✓</span>
            <span>Réponse en moins de 2h ouvrées</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold mt-0.5">✓</span>
            <span>Optimisation du cumul d&apos;aides</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold mt-0.5">✓</span>
            <span>Gratuit, sans engagement</span>
          </li>
        </ul>

        {status === 'success' ? (
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
            <CheckCircle2
              className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Demande enregistrée</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Un conseiller vous rappelle sous 2h ouvrées.
              </p>
            </div>
          </div>
        ) : open ? (
          <form onSubmit={submitCallback} className="space-y-3">
            <div>
              <label
                className="block text-xs font-semibold text-charcoal-700 mb-1"
                htmlFor="cb-tel"
              >
                Téléphone *
              </label>
              <input
                id="cb-tel"
                name="telephone"
                type="tel"
                required
                placeholder="06 12 34 56 78"
                autoComplete="tel"
                className="w-full px-3 py-2 rounded-lg border border-sand-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold text-charcoal-700 mb-1"
                htmlFor="cb-slot"
              >
                Créneau souhaité
              </label>
              <select
                id="cb-slot"
                name="preferredSlot"
                defaultValue=""
                className="w-full px-3 py-2 rounded-lg border border-sand-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
              >
                <option value="">Dès que possible</option>
                <option value="matin">Matin (9h-12h)</option>
                <option value="apres-midi">Après-midi (14h-17h)</option>
                <option value="fin-journee">Fin de journée (17h-19h)</option>
              </select>
            </div>
            <label className="flex items-start gap-2 text-xs text-charcoal-700">
              <input
                type="checkbox"
                name="consentRgpd"
                required
                className="mt-0.5 h-4 w-4 rounded border-sand-300"
              />
              <span>
                J&apos;accepte le traitement de mes données selon la{' '}
                <Link href="/confidentialite" className="underline" target="_blank">
                  politique de confidentialité
                </Link>
                . *
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs text-charcoal-700">
              <input
                type="checkbox"
                name="consentDemarchage"
                className="mt-0.5 h-4 w-4 rounded border-sand-300"
              />
              <span>J&apos;accepte de recevoir des offres commerciales (optionnel).</span>
            </label>
            {status === 'error' && errorMsg && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-2">
                <AlertCircle
                  className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs text-red-700">{errorMsg}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-md hover:bg-primary-700 transition disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Envoi…
                </>
              ) : (
                'Demander mon rappel gratuit'
              )}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={openCallback}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-md hover:bg-primary-700 transition"
          >
            Être rappelé gratuitement
          </button>
        )}
      </div>
    </section>
  )
}
