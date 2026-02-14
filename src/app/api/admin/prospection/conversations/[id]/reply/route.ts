import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { sendWhatsAppReply } from '@/lib/prospection/channels/whatsapp'
import { sendProspectionSMS } from '@/lib/prospection/channels/sms'
import { sendProspectionEmail } from '@/lib/prospection/channels/email'
import { z } from 'zod'

const replySchema = z.object({
  content: z.string().min(1).max(5000),
  sender_type: z.enum(['human', 'ai']).optional().default('human'),
})

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission('prospection', 'write')
    if (!authResult.success) return authResult.error

    const { id } = await params
    const body = await request.json()
    const parsed = replySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { message: 'Données invalides' } }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Charger la conversation avec le contact
    const { data: conversation } = await supabase
      .from('prospection_conversations')
      .select('*, contact:prospection_contacts(*)')
      .eq('id', id)
      .single()

    if (!conversation) {
      return NextResponse.json({ success: false, error: { message: 'Conversation non trouvée' } }, { status: 404 })
    }

    const contact = conversation.contact as { phone_e164?: string; email?: string }

    // Envoyer via le bon canal
    let externalId: string | undefined

    switch (conversation.channel) {
      case 'whatsapp':
        if (contact.phone_e164) {
          const result = await sendWhatsAppReply(contact.phone_e164, parsed.data.content)
          externalId = result.sid
        }
        break
      case 'sms':
        if (contact.phone_e164) {
          const result = await sendProspectionSMS({ to: contact.phone_e164, body: parsed.data.content })
          externalId = result.sid
        }
        break
      case 'email':
        if (contact.email) {
          const result = await sendProspectionEmail({
            to: contact.email,
            subject: 'Re: ServicesArtisans',
            html: `<p>${parsed.data.content.replace(/\n/g, '<br>')}</p>`,
          })
          externalId = result.id
        }
        break
    }

    // Sauvegarder le message dans la conversation
    const { data: msg, error: msgError } = await supabase
      .from('prospection_conversation_messages')
      .insert({
        conversation_id: id,
        direction: 'outbound',
        sender_type: parsed.data.sender_type,
        content: parsed.data.content,
        external_id: externalId,
      })
      .select()
      .single()

    if (msgError) {
      logger.error('Save reply error', msgError)
    }

    // Mettre à jour la conversation
    await supabase
      .from('prospection_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', id)

    return NextResponse.json({ success: true, data: msg })
  } catch (error) {
    logger.error('Reply error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
