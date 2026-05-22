'use client'

/**
 * DevisQuickForm — 4-champs friction-free devis capture pour templates pSEO.
 *
 * Objectif conversion :
 *  - 4 champs MAX (nom + téléphone + code postal + type de travaux)
 *  - Aucune dépendance simulateur (POST direct /api/devis)
 *  - Réutilisable sur /services/[s]/[v], /rge/[s]/[v],
 *    /renovation-energetique/[cluster], /cee/[operation]
 *
 * Contrat API /api/devis (cf. src/app/api/devis/route.ts) :
 *  - service       : slug (z.string().min(1))
 *  - telephone     : FR `^(\+33|0033|0)[1-9]\d{8}$` post-cleanPhone
 *  - codePostal    : optionnel — envoyé pour ciblage dispatch (5 chiffres)
 *  - ville         : optionnel — envoyé si fourni en prop (template ville)
 *  - nom           : optionnel mais on l'envoie ; min(2) côté serveur
 *  - source        : optionnel — `^[a-z0-9_-]+$` 1-50 chars
 *  - urgency       : default 'flexible' côté serveur (no need to send)
 *
 * A11y :
 *  - `aria-label` sur le `<form>` (résumé du formulaire)
 *  - `<label htmlFor>` obligatoire sur chaque input/select
 *  - `aria-invalid` + `aria-describedby` sur input en erreur
 *  - `role="alert"` sur le bloc erreur, `role="status"` + `aria-live=polite`
 *    sur le bloc succès
 *
 * Règles métier :
 *  - JAMAIS de CTA devis ciblant un artisan unclaimed (cf. CLAUDE.md) — ce
 *    composant est NEUTRE : il ne contient aucun `providerId`/`artisan`.
 *  - Pas de chatbot, pas de superlatifs (cf. memory feedback_chatbot_*).
 *  - Source format strict `^[a-z0-9_-]+$` — pollution Pipedrive sinon.
 */

import { useId, useState, useTransition } from 'react'
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { cleanPhone, isValidFrenchPhone } from '@/lib/validation/phone'

export type DevisQuickFormService = {
  slug: string
  label: string
}

const DEFAULT_SERVICES: DevisQuickFormService[] = [
  { slug: 'pompe-a-chaleur', label: 'Pompe à chaleur' },
  { slug: 'isolation-thermique', label: 'Isolation thermique' },
  { slug: 'panneaux-solaires', label: 'Panneaux solaires' },
  { slug: 'ventilation', label: 'VMC / Ventilation' },
  { slug: 'fenetres', label: 'Fenêtres double vitrage' },
  { slug: 'chauffagiste', label: 'Chauffagiste / Chaudière' },
  { slug: 'renovation-energetique', label: 'Rénovation énergétique globale' },
  { slug: 'audit-energetique', label: 'Audit énergétique' },
]

// Source format aligné avec devisSchema.source côté serveur :
// `^[a-z0-9_-]+$`, 1-50 chars. Tout input non-conforme = lead refusé.
const SOURCE_REGEX = /^[a-z0-9_-]+$/
const CP_REGEX = /^\d{5}$/

export interface DevisQuickFormProps {
  /** Service pré-sélectionné (slug). S'il n'apparaît pas dans `services`, il
   *  est injecté en tête de liste. */
  defaultService?: string
  /** Liste des services proposés. Défaut : 8 services rénovation énergétique. */
  services?: DevisQuickFormService[]
  /** Code postal pré-rempli (page ville). */
  defaultPostalCode?: string
  /** Ville pré-remplie (sera envoyée à /api/devis pour ciblage dispatch). */
  defaultVille?: string
  /** Variant visuel. */
  variant?: 'inline' | 'card' | 'sticky'
  /** H2 personnalisé. */
  heading?: string
  /** Identifiant source Pipedrive ([a-z0-9_-]{1,50}). */
  source?: string
}

export default function DevisQuickForm({
  defaultService,
  services = DEFAULT_SERVICES,
  defaultPostalCode,
  defaultVille,
  variant = 'card',
  heading = 'Devis gratuit en 2 minutes',
  source = 'devis-quick',
}: DevisQuickFormProps) {
  const formTitleId = useId()
  const nameId = useId()
  const phoneId = useId()
  const cpId = useId()
  const serviceId = useId()
  const errorId = useId()

  // Validation du `source` props : si invalide, on l'omettra de la requête
  // (le serveur garde sa default Pipedrive `servicesartisans.fr` dans ce cas).
  // On loggue silencieusement côté client pour aider le debug intégrateur.
  const safeSource = SOURCE_REGEX.test(source) && source.length <= 50 ? source : undefined

  // Si defaultService n'est pas dans la liste, on l'injecte en tête pour ne
  // pas perdre l'intention de la page (ex : `service=plombier` sur /services).
  const mergedServices: DevisQuickFormService[] =
    defaultService && !services.some((s) => s.slug === defaultService)
      ? [{ slug: defaultService, label: defaultService }, ...services]
      : services

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [postalCode, setPostalCode] = useState(defaultPostalCode ?? '')
  const [service, setService] = useState(defaultService ?? mergedServices[0]?.slug ?? '')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState<string>('')
  const [errField, setErrField] = useState<'name' | 'phone' | 'cp' | 'service' | null>(null)
  const [pending, startTransition] = useTransition()

  function validate():
    | { ok: true }
    | { ok: false; field: 'name' | 'phone' | 'cp' | 'service'; msg: string } {
    if (!name.trim() || name.trim().length < 2) {
      return { ok: false, field: 'name', msg: 'Nom requis (2 caractères minimum)' }
    }
    if (!phone.trim()) {
      return { ok: false, field: 'phone', msg: 'Téléphone requis' }
    }
    if (!isValidFrenchPhone(phone)) {
      return { ok: false, field: 'phone', msg: 'Téléphone invalide (format 0X XX XX XX XX)' }
    }
    if (!postalCode.trim() || !CP_REGEX.test(postalCode)) {
      return { ok: false, field: 'cp', msg: 'Code postal invalide (5 chiffres)' }
    }
    if (!service) {
      return { ok: false, field: 'service', msg: 'Type de travaux requis' }
    }
    return { ok: true }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return

    const v = validate()
    if (!v.ok) {
      setStatus('error')
      setErrMsg(v.msg)
      setErrField(v.field)
      return
    }

    setStatus('idle')
    setErrMsg('')
    setErrField(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service,
            nom: name.trim(),
            telephone: cleanPhone(phone),
            codePostal: postalCode.trim(),
            ...(defaultVille ? { ville: defaultVille } : {}),
            ...(safeSource ? { source: safeSource } : {}),
          }),
        })

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(data.error ?? `Erreur ${res.status}`)
        }

        setStatus('success')
        setName('')
        setPhone('')
        // Garde codePostal + service pour cohérence UX (page ville/service).
      } catch (err) {
        setStatus('error')
        setErrField(null)
        setErrMsg(err instanceof Error ? err.message : 'Erreur réseau. Réessayez.')
      }
    })
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-accent-300 bg-accent-50 p-6 text-accent-900"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-7 h-7 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="font-heading font-bold text-lg mb-1">Demande reçue</h3>
            <p className="text-sm leading-relaxed">
              Un artisan RGE de votre région va vous contacter sous 24h. Aucun spam : vos
              coordonnées ne sont transmises qu&apos;à <strong>un seul artisan</strong> (leads
              exclusifs).
            </p>
          </div>
        </div>
      </div>
    )
  }

  const wrapperCls =
    variant === 'card'
      ? 'rounded-2xl border border-sand-200 bg-white shadow-card p-6 sm:p-8'
      : variant === 'sticky'
        ? 'rounded-t-2xl border-t-4 border-accent-500 bg-white shadow-lg p-4 sm:p-5'
        : 'rounded-2xl border border-primary-200 bg-primary-50/60 p-5 sm:p-6'

  return (
    <form onSubmit={handleSubmit} className={wrapperCls} aria-labelledby={formTitleId} noValidate>
      <h2
        id={formTitleId}
        className="font-heading font-extrabold text-xl sm:text-2xl text-charcoal-900 mb-1"
      >
        {heading}
      </h2>
      <p className="text-sm text-charcoal-500 mb-4">
        Artisans RGE certifiés · Devis gratuit · Sans engagement
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={nameId} className="block text-sm font-semibold text-charcoal-700 mb-1">
            Nom complet
          </label>
          <input
            id={nameId}
            name="nom"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errField === 'name'}
            aria-describedby={errField === 'name' ? errorId : undefined}
            className="w-full h-11 rounded-lg border border-sand-300 bg-white px-3 text-base text-charcoal-900 placeholder:text-charcoal-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label htmlFor={phoneId} className="block text-sm font-semibold text-charcoal-700 mb-1">
            Téléphone
          </label>
          <input
            id={phoneId}
            name="telephone"
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={errField === 'phone'}
            aria-describedby={errField === 'phone' ? errorId : undefined}
            className="w-full h-11 rounded-lg border border-sand-300 bg-white px-3 text-base text-charcoal-900 placeholder:text-charcoal-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="06 12 34 56 78"
          />
        </div>

        <div>
          <label htmlFor={cpId} className="block text-sm font-semibold text-charcoal-700 mb-1">
            Code postal
          </label>
          <input
            id={cpId}
            name="codePostal"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            required
            autoComplete="postal-code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            aria-invalid={errField === 'cp'}
            aria-describedby={errField === 'cp' ? errorId : undefined}
            className="w-full h-11 rounded-lg border border-sand-300 bg-white px-3 text-base text-charcoal-900 placeholder:text-charcoal-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="75001"
          />
        </div>

        <div>
          <label htmlFor={serviceId} className="block text-sm font-semibold text-charcoal-700 mb-1">
            Type de travaux
          </label>
          <select
            id={serviceId}
            name="service"
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
            aria-invalid={errField === 'service'}
            aria-describedby={errField === 'service' ? errorId : undefined}
            className="w-full h-11 rounded-lg border border-sand-300 bg-white px-3 text-base text-charcoal-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            {mergedServices.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {status === 'error' && errMsg && (
        <p id={errorId} role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {errMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-heading font-bold text-base shadow-cta hover:shadow-cta-hover transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {pending ? 'Envoi…' : 'Recevoir mes devis gratuits'}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-charcoal-500 text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-accent-500" aria-hidden="true" />
        Données protégées —{' '}
        <a href="/rgpd" className="underline hover:text-charcoal-700">
          RGPD
        </a>{' '}
        · Leads exclusifs (1 artisan)
      </p>
    </form>
  )
}
