import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { genererTwiMLRouting, validerSignatureTwilio } from '@/lib/api/twilio-calls'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Webhook Twilio pour les appels entrants
 * Route l'appel vers le bon artisan basé sur le numéro appelé
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      params[key] = value.toString()
    })

    // Valider la signature Twilio en production
    if (process.env.NODE_ENV === 'production') {
      const signature = request.headers.get('x-twilio-signature') || ''
      const url = request.url
      if (!validerSignatureTwilio(signature, url, params)) {
        return new NextResponse('Invalid signature', { status: 403 })
      }
    }

    const {
      CallSid: callSid,
      From: from,
      To: to,
      CallerCity: callerCity,
      CallerState: callerState,
      CallerCountry: callerCountry
    } = params

    // Logger l'appel entrant
    logger.info('Appel entrant', { from, to })

    // Trouver le numéro virtuel et l'artisan associé
    const { data: numeroVirtuel } = await supabase
      .from('numeros_virtuels')
      .select('*, artisan:providers(*)')
      .eq('phone_number', to)
      .single()

    if (!numeroVirtuel) {
      // Numéro non configuré - message d'erreur
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say language="fr-FR" voice="Polly.Lea">
            Désolé, ce numéro n'est plus attribué. Veuillez visiter servicesartisans.fr pour trouver un artisan.
          </Say>
          <Hangup/>
        </Response>`

      return new NextResponse(twiml, {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Logger l'appel en base de données
    await supabase.from('appels_logs').insert({
      call_sid: callSid,
      from_number: from,
      to_number: to,
      numero_virtuel_id: numeroVirtuel.id,
      artisan_id: numeroVirtuel.artisan_id,
      ville: numeroVirtuel.ville,
      metier: numeroVirtuel.metier,
      caller_city: callerCity,
      caller_state: callerState,
      caller_country: callerCountry,
      status: 'ringing',
      created_at: new Date().toISOString()
    })

    // Vérifier si l'artisan a un abonnement actif
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('provider_id', numeroVirtuel.artisan_id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      // Pas d'abonnement actif - message
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say language="fr-FR" voice="Polly.Lea">
            Cet artisan n'est plus disponible sur notre plateforme. Veuillez visiter servicesartisans.fr pour trouver un autre professionnel.
          </Say>
          <Hangup/>
        </Response>`

      return new NextResponse(twiml, {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Générer TwiML pour router l'appel
    const artisan = numeroVirtuel.artisan
    const message = `Bienvenue sur ServicesArtisans. Nous vous mettons en relation avec ${artisan?.name || 'votre artisan'}, ${numeroVirtuel.metier} à ${numeroVirtuel.ville}.`

    const twiml = genererTwiMLRouting({
      message,
      forwardTo: artisan?.phone || '',
      callerIdNumber: to, // Afficher le numéro ServicesArtisans
      timeout: 30,
      record: subscription.plan === 'premium' // Enregistrer pour les premium
    })

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })
  } catch (error) {
    logger.error('Erreur webhook voice', error)

    // Réponse d'erreur gracieuse
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say language="fr-FR" voice="Polly.Lea">
          Une erreur est survenue. Veuillez réessayer ultérieurement.
        </Say>
        <Hangup/>
      </Response>`

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
}
