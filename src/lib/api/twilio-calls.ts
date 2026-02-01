/**
 * Twilio Call Tracking
 * Documentation: https://www.twilio.com/docs/voice
 *
 * Tracking des appels entrants pour facturation des leads
 * Numéros virtuels par ville/métier
 */

import twilio from 'twilio'
import { logger } from '@/lib/logger'

// Lazy-loaded Twilio client to avoid build errors when env vars are not set
let twilioClient: ReturnType<typeof twilio> | null = null

function getTwilioClient() {
  if (twilioClient) return twilioClient

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    logger.warn('Twilio credentials not configured')
    return null
  }

  twilioClient = twilio(accountSid, authToken)
  return twilioClient
}

function getAuthToken() {
  return process.env.TWILIO_AUTH_TOKEN || ''
}

// Types
export interface NumeroVirtuel {
  phoneNumber: string
  friendlyName: string
  ville: string
  metier: string
  artisanId?: string
  createdAt: Date
}

export interface AppelLog {
  callSid: string
  from: string
  to: string
  direction: 'inbound' | 'outbound'
  status: 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'failed'
  duration: number // secondes
  ville: string
  metier: string
  artisanId?: string
  timestamp: Date
  recordingUrl?: string
}

export interface StatsAppels {
  total: number
  dureeTotal: number
  dureeMoyenne: number
  appelsManques: number
  tauxReponse: number
  parJour: Record<string, number>
  parHeure: Record<string, number>
}

// ============================================
// GESTION DES NUMEROS VIRTUELS
// ============================================

/**
 * Recherche les numéros disponibles en France
 */
export async function rechercherNumerosDisponibles(options?: {
  areaCode?: string
  contains?: string
  limit?: number
}) {
  const client = getTwilioClient()
  if (!client) return []

  try {
    const numbers = await client.availablePhoneNumbers('FR')
      .local
      .list({
        areaCode: options?.areaCode ? parseInt(options.areaCode) : undefined,
        contains: options?.contains,
        limit: options?.limit || 10
      })

    return numbers.map(n => ({
      phoneNumber: n.phoneNumber,
      locality: n.locality,
      region: n.region,
      capabilities: {
        voice: n.capabilities.voice,
        sms: n.capabilities.sms
      }
    }))
  } catch (error) {
    logger.error('Erreur recherche numéros', error as Error)
    return []
  }
}

/**
 * Achète un numéro et configure le webhook
 */
export async function acheterNumero(
  phoneNumber: string,
  ville: string,
  metier: string
): Promise<NumeroVirtuel | null> {
  const client = getTwilioClient()
  if (!client) return null

  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://servicesartisans.fr'

    const numero = await client.incomingPhoneNumbers.create({
      phoneNumber,
      friendlyName: `${metier}-${ville}`.toLowerCase().replace(/\s+/g, '-'),
      voiceUrl: `${baseUrl}/api/twilio/voice`,
      voiceMethod: 'POST',
      statusCallback: `${baseUrl}/api/twilio/status`,
      statusCallbackMethod: 'POST'
    })

    return {
      phoneNumber: numero.phoneNumber,
      friendlyName: numero.friendlyName || '',
      ville,
      metier,
      createdAt: new Date()
    }
  } catch (error) {
    logger.error('Erreur achat numéro', error as Error)
    return null
  }
}

/**
 * Liste tous les numéros achetés
 */
export async function listerNumeros(): Promise<NumeroVirtuel[]> {
  const client = getTwilioClient()
  if (!client) return []

  try {
    const numbers = await client.incomingPhoneNumbers.list({ limit: 100 })

    return numbers.map(n => {
      const [metier, ville] = (n.friendlyName || '').split('-')
      return {
        phoneNumber: n.phoneNumber,
        friendlyName: n.friendlyName || '',
        ville: ville || 'inconnu',
        metier: metier || 'inconnu',
        createdAt: n.dateCreated
      }
    })
  } catch (error) {
    logger.error('Erreur listing numéros', error as Error)
    return []
  }
}

/**
 * Supprime un numéro
 */
export async function supprimerNumero(phoneNumberSid: string): Promise<boolean> {
  const client = getTwilioClient()
  if (!client) return false

  try {
    await client.incomingPhoneNumbers(phoneNumberSid).remove()
    return true
  } catch (error) {
    logger.error('Erreur suppression numéro', error as Error)
    return false
  }
}

// ============================================
// GENERATION TwiML (Voice Response)
// ============================================

/**
 * Génère la réponse TwiML pour router un appel
 */
export function genererTwiMLRouting(options: {
  message: string
  forwardTo: string
  callerIdNumber: string
  timeout?: number
  record?: boolean
}): string {
  const twiml = new twilio.twiml.VoiceResponse()

  // Message d'accueil
  twiml.say(
    { language: 'fr-FR', voice: 'Polly.Lea' },
    options.message
  )

  // Configuration du dial
  const dial = twiml.dial({
    callerId: options.callerIdNumber,
    timeout: options.timeout || 30,
    action: `${process.env.NEXT_PUBLIC_URL}/api/twilio/dial-status`,
    record: options.record ? 'record-from-answer-dual' : undefined,
    recordingStatusCallback: options.record ? `${process.env.NEXT_PUBLIC_URL}/api/twilio/recording` : undefined,
  })

  dial.number(options.forwardTo)

  // Si pas de réponse
  twiml.say(
    { language: 'fr-FR', voice: 'Polly.Lea' },
    'Désolé, votre correspondant n\'est pas disponible. Veuillez réessayer ultérieurement.'
  )

  return twiml.toString()
}

/**
 * Génère TwiML pour messagerie vocale
 */
export function genererTwiMLMessagerie(artisanNom: string): string {
  const twiml = new twilio.twiml.VoiceResponse()

  twiml.say(
    { language: 'fr-FR', voice: 'Polly.Lea' },
    `Vous êtes sur la messagerie de ${artisanNom}. Laissez votre message après le bip.`
  )

  twiml.record({
    maxLength: 120, // 2 minutes max
    transcribe: true,
    transcribeCallback: `${process.env.NEXT_PUBLIC_URL}/api/twilio/transcription`,
    playBeep: true
  })

  twiml.say(
    { language: 'fr-FR', voice: 'Polly.Lea' },
    'Merci pour votre message. Au revoir.'
  )

  return twiml.toString()
}

// ============================================
// RECUPERATION STATISTIQUES
// ============================================

/**
 * Récupère l'historique des appels depuis Twilio
 */
export async function getHistoriqueAppels(options?: {
  from?: string
  to?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}): Promise<AppelLog[]> {
  const client = getTwilioClient()
  if (!client) return []

  try {
    const calls = await client.calls.list({
      from: options?.from,
      to: options?.to,
      startTimeAfter: options?.startDate,
      startTimeBefore: options?.endDate,
      limit: options?.limit || 100
    })

    return calls.map(call => {
      // Extraire ville/métier du numéro appelé
      const [metier, ville] = (call.toFormatted || '').split('-')

      return {
        callSid: call.sid,
        from: call.from,
        to: call.to,
        direction: call.direction as 'inbound' | 'outbound',
        status: call.status as AppelLog['status'],
        duration: parseInt(call.duration || '0'),
        ville: ville || 'inconnu',
        metier: metier || 'inconnu',
        timestamp: call.dateCreated
      }
    })
  } catch (error) {
    logger.error('Erreur historique appels', error as Error)
    return []
  }
}

/**
 * Calcule les statistiques d'appels
 */
export function calculerStatsAppels(appels: AppelLog[]): StatsAppels {
  const completed = appels.filter(a => a.status === 'completed')
  const manques = appels.filter(a => ['busy', 'no-answer', 'failed'].includes(a.status))

  const dureeTotal = completed.reduce((sum, a) => sum + a.duration, 0)

  // Stats par jour
  const parJour: Record<string, number> = {}
  appels.forEach(appel => {
    const jour = appel.timestamp.toISOString().split('T')[0]
    parJour[jour] = (parJour[jour] || 0) + 1
  })

  // Stats par heure
  const parHeure: Record<string, number> = {}
  appels.forEach(appel => {
    const heure = appel.timestamp.getHours().toString().padStart(2, '0')
    parHeure[heure] = (parHeure[heure] || 0) + 1
  })

  return {
    total: appels.length,
    dureeTotal,
    dureeMoyenne: completed.length > 0 ? Math.round(dureeTotal / completed.length) : 0,
    appelsManques: manques.length,
    tauxReponse: appels.length > 0
      ? Math.round((completed.length / appels.length) * 100)
      : 0,
    parJour,
    parHeure
  }
}

// ============================================
// UTILS
// ============================================

/**
 * Formate un numéro de téléphone français
 */
export function formaterNumeroFR(numero: string): string {
  // Nettoyer le numéro
  const clean = numero.replace(/\D/g, '')

  // Si c'est un numéro français
  if (clean.startsWith('33')) {
    const local = clean.slice(2)
    return `0${local.slice(0, 1)} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`
  }

  if (clean.startsWith('0') && clean.length === 10) {
    return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 8)} ${clean.slice(8, 10)}`
  }

  return numero
}

/**
 * Valide la signature Twilio pour les webhooks
 */
export function validerSignatureTwilio(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = getAuthToken()
  if (!authToken) return false

  return twilio.validateRequest(
    authToken,
    signature,
    url,
    params
  )
}
