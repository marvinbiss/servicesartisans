'use client'

import { memo } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import type { EstimationContext } from './utils'
import type { UseLeadSubmitReturn } from './hooks/useLeadSubmit'

interface LeadFormProps {
  context: EstimationContext
  lead: UseLeadSubmitReturn
}

export const LeadForm = memo(function LeadForm({ context, lead }: LeadFormProps) {
  return (
    <form
      onSubmit={lead.handleLeadSubmit}
      className="rounded-xl border border-sand-200 bg-white p-4 shadow-soft space-y-3"
    >
      <p className="text-sm font-semibold text-charcoal-900">
        {context.artisan
          ? `Envoyer ma demande à ${context.artisan.name}`
          : 'Recevoir mon estimation personnalisée'}
      </p>
      <input
        type="text"
        placeholder="Votre nom (optionnel)"
        value={lead.leadName}
        onChange={(e) => lead.setLeadName(e.target.value)}
        className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
      />
      <div>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="Votre téléphone *"
          value={lead.leadPhone}
          onChange={(e) => {
            lead.setLeadPhone(e.target.value)
            // Clear error on type (handled internally but we re-set here for UX)
          }}
          className={
            'w-full rounded-lg border px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-1 ' +
            (lead.leadPhoneError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : 'border-sand-300 focus:border-primary-400 focus:ring-primary-400')
          }
          style={{ fontSize: '16px' }}
        />
        {lead.leadPhoneError && <p className="text-xs text-red-600 mt-1">{lead.leadPhoneError}</p>}
      </div>
      <input
        type="email"
        inputMode="email"
        placeholder="Votre email (optionnel)"
        value={lead.leadEmail}
        onChange={(e) => lead.setLeadEmail(e.target.value)}
        className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
      />
      {/* RGPD consent */}
      <label className="flex items-start gap-2 text-xs text-charcoal-500">
        <input
          type="checkbox"
          checked={lead.rgpdConsent}
          onChange={(e) => lead.setRgpdConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          J&apos;accepte que mes données soient utilisées pour traiter ma demande et me mettre en
          relation avec des artisans partenaires. Voir notre{' '}
          <a href="/confidentialite" target="_blank" rel="noopener" className="underline">
            politique de confidentialité
          </a>
          .
        </span>
      </label>
      {lead.leadError && (
        <p className="text-xs text-red-600 text-center">
          Une erreur est survenue. Veuillez réessayer.
        </p>
      )}
      <button
        type="submit"
        disabled={lead.leadLoading || !lead.leadPhone.trim() || !lead.rgpdConsent}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-cta"
      >
        {lead.leadLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <ArrowRight className="h-4 w-4" />
            {context.artisan ? 'Contacter mon artisan' : 'Obtenir mon devis gratuit'}
          </>
        )}
      </button>
    </form>
  )
})
