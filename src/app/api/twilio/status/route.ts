import { NextRequest, NextResponse } from 'next/server'
import { validerSignatureTwilio } from '@/lib/api/twilio-calls'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Webhook Twilio pour les mises à jour de statut d'appel
 * Appelé quand le statut change: ringing → in-progress → completed
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
      CallStatus: callStatus,
      CallDuration: callDuration,
      RecordingUrl: recordingUrl,
      RecordingSid: recordingSid
    } = params

    console.log(`📞 Status update: ${callSid} → ${callStatus}`)

    // Mettre à jour le log d'appel
    const updateData: Record<string, any> = {
      status: callStatus,
      updated_at: new Date().toISOString()
    }

    if (callDuration) {
      updateData.duration = parseInt(callDuration)
    }

    if (recordingUrl) {
      updateData.recording_url = recordingUrl
      updateData.recording_sid = recordingSid
    }

    // Si l'appel est terminé
    if (callStatus === 'completed') {
      updateData.completed_at = new Date().toISOString()

      // Récupérer l'appel pour incrémenter le compteur de leads
      const { data: appelLog } = await supabase
        .from('appels_logs')
        .select('artisan_id, duration')
        .eq('call_sid', callSid)
        .single()

      if (appelLog && parseInt(callDuration || '0') >= 30) {
        // Appel de plus de 30 secondes = lead valide

        // Incrémenter le compteur de leads pour l'artisan
        await supabase.rpc('increment_lead_count', {
          p_artisan_id: appelLog.artisan_id
        })

        // Créer un lead dans la table leads
        await supabase.from('leads').insert({
          provider_id: appelLog.artisan_id,
          source: 'phone_call',
          call_sid: callSid,
          duration: parseInt(callDuration || '0'),
          status: 'new',
          created_at: new Date().toISOString()
        })

        console.log(`✅ Lead créé pour appel ${callSid} (durée: ${callDuration}s)`)
      }
    }

    // Si l'appel a échoué ou pas de réponse
    if (['busy', 'no-answer', 'failed', 'canceled'].includes(callStatus)) {
      updateData.failed_at = new Date().toISOString()

      // Notification à l'artisan pour appel manqué
      const { data: appelLog } = await supabase
        .from('appels_logs')
        .select('artisan_id, from_number, ville, metier')
        .eq('call_sid', callSid)
        .single()

      if (appelLog) {
        // Créer une notification
        await supabase.from('notifications').insert({
          user_id: appelLog.artisan_id,
          type: 'missed_call',
          title: 'Appel manqué',
          message: `Vous avez manqué un appel d'un client potentiel (${appelLog.metier} à ${appelLog.ville})`,
          data: {
            from: appelLog.from_number,
            call_sid: callSid
          },
          created_at: new Date().toISOString()
        })
      }
    }

    await supabase
      .from('appels_logs')
      .update(updateData)
      .eq('call_sid', callSid)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur webhook status:', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
