'use client'

import { useState, useCallback } from 'react'
import { trackEvent } from '@/lib/analytics/tracking'
import { isValidFrenchPhone } from '../utils'
import type { EstimationContext, ChatMessage } from '../utils'

export interface UseLeadSubmitReturn {
  // Lead form
  leadName: string
  setLeadName: (v: string) => void
  leadPhone: string
  setLeadPhone: (v: string) => void
  leadEmail: string
  setLeadEmail: (v: string) => void
  leadPhoneError: string
  leadLoading: boolean
  leadError: boolean
  leadSubmitted: boolean
  rgpdConsent: boolean
  setRgpdConsent: (v: boolean) => void
  handleLeadSubmit: (e: React.FormEvent) => void
  // Callback
  callbackPhone: string
  setCallbackPhone: (v: string) => void
  callbackPhoneError: string
  callbackLoading: boolean
  callbackError: boolean
  callbackSubmitted: boolean
  rgpdCallbackConsent: boolean
  setRgpdCallbackConsent: (v: boolean) => void
  handleCallbackSubmit: (e: React.FormEvent) => void
}

export function useLeadSubmit(
  context: EstimationContext,
  _messages?: ChatMessage[],
  onLeadSubmitted?: (confirmationMsg: string) => void,
  onCallbackSubmitted?: () => void,
): UseLeadSubmitReturn {
  // Lead form fields
  const [leadName, setLeadName] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadPhoneError, setLeadPhoneError] = useState('')
  const [leadLoading, setLeadLoading] = useState(false)
  const [leadError, setLeadError] = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [rgpdConsent, setRgpdConsent] = useState(false)

  // Callback fields
  const [callbackPhone, setCallbackPhone] = useState('')
  const [callbackPhoneError, setCallbackPhoneError] = useState('')
  const [callbackLoading, setCallbackLoading] = useState(false)
  const [callbackError, setCallbackError] = useState(false)
  const [callbackSubmitted, setCallbackSubmitted] = useState(false)
  const [rgpdCallbackConsent, setRgpdCallbackConsent] = useState(false)

  const handleLeadSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!leadPhone.trim()) return
      if (!rgpdConsent) return

      if (!isValidFrenchPhone(leadPhone)) {
        setLeadPhoneError('Numéro invalide (ex: 06 12 34 56 78)')
        return
      }
      setLeadPhoneError('')

      setLeadLoading(true)
      setLeadError(false)
      try {
        const response = await fetch('/api/devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: context.metierSlug || 'general',
            urgency: 'semaine',
            telephone: leadPhone,
            nom: leadName || undefined,
            email: leadEmail || undefined,
            ville: context.ville || undefined,
            description: `Estimation chat — ${context.metier}${context.ville ? ` à ${context.ville}` : ''}`,
          }),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || `Erreur serveur (${response.status})`)
        }

        trackEvent('estimation_lead_submitted' as any, {
          source: 'chat',
          metier: context.metierSlug,
          ville: context.ville,
          has_email: !!leadEmail,
        })

        setLeadSubmitted(true)

        const confirmationMsg = context.artisan
          ? `Parfait ! Votre demande a bien été envoyée à ${context.artisan.name}. Il vous recontactera dans les plus brefs délais.`
          : `Parfait ! Votre demande a bien été enregistrée. Un ${context.metier.toLowerCase()} qualifié à ${context.ville} vous recontactera dans les plus brefs délais.`

        onLeadSubmitted?.(confirmationMsg)
      } catch (error) {
        console.error('Lead submission error:', error)
        setLeadError(true)
      } finally {
        setLeadLoading(false)
      }
    },
    [leadPhone, leadName, leadEmail, rgpdConsent, context, onLeadSubmitted],
  )

  const handleCallbackSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!callbackPhone.trim()) return
      if (!rgpdCallbackConsent) return

      if (!isValidFrenchPhone(callbackPhone)) {
        setCallbackPhoneError('Numéro invalide (ex: 06 12 34 56 78)')
        return
      }
      setCallbackPhoneError('')

      setCallbackLoading(true)
      setCallbackError(false)
      try {
        const response = await fetch('/api/devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: context.metierSlug || 'general',
            urgency: 'semaine',
            telephone: callbackPhone,
            ville: context.ville || undefined,
            description: `Demande de rappel — ${context.metier}${context.ville ? ` à ${context.ville}` : ''}`,
          }),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || `Erreur serveur (${response.status})`)
        }

        trackEvent('estimation_lead_submitted' as any, {
          source: 'callback',
          metier: context.metierSlug,
          ville: context.ville,
        })

        setCallbackSubmitted(true)
        onCallbackSubmitted?.()
      } catch (error) {
        console.error('Callback submission error:', error)
        setCallbackError(true)
      } finally {
        setCallbackLoading(false)
      }
    },
    [callbackPhone, rgpdCallbackConsent, context, onCallbackSubmitted],
  )

  return {
    leadName,
    setLeadName,
    leadPhone,
    setLeadPhone,
    leadEmail,
    setLeadEmail,
    leadPhoneError,
    leadLoading,
    leadError,
    leadSubmitted,
    rgpdConsent,
    setRgpdConsent,
    handleLeadSubmit,
    callbackPhone,
    setCallbackPhone,
    callbackPhoneError,
    callbackLoading,
    callbackError,
    callbackSubmitted,
    rgpdCallbackConsent,
    setRgpdCallbackConsent,
    handleCallbackSubmit,
  }
}
