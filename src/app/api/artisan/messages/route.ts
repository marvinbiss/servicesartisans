/**
 * Artisan Messages API
 * GET: Fetch conversations and messages
 * POST: Send a new message
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const messagesQuerySchema = z.object({
  with: z.string().uuid().optional(),
})

// POST request schema
const sendMessageSchema = z.object({
  receiver_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  devis_request_id: z.string().uuid().optional().nullable(),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const queryParams = {
      with: searchParams.get('with') || undefined,
    }
    const result = messagesQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const conversationWith = result.data.with

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (conversationWith) {
      // Fetch specific conversation messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url),
          receiver:profiles!receiver_id(id, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${conversationWith},receiver_id.eq.${conversationWith}`)
        .order('created_at', { ascending: true })

      if (messagesError) {
        logger.error('Error fetching messages:', messagesError)
        return NextResponse.json(
          { error: 'Erreur lors de la récupération des messages' },
          { status: 500 }
        )
      }

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', conversationWith)

      return NextResponse.json({ messages: messages || [] })
    }

    // Fetch all conversations (grouped by other user)
    const { data: allMessages, error: allMessagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url, company_name),
        receiver:profiles!receiver_id(id, full_name, avatar_url, company_name),
        devis_request:devis_requests(id, service_name)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (allMessagesError) {
      logger.error('Error fetching all messages:', allMessagesError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des conversations' },
        { status: 500 }
      )
    }

    // Group messages by conversation partner
    const conversationsMap = new Map()

    allMessages?.forEach(msg => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      const partner = msg.sender_id === user.id ? msg.receiver : msg.sender

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          id: partnerId,
          partner,
          lastMessage: msg,
          unreadCount: 0,
          service: msg.devis_request?.service_name || null,
        })
      }

      // Count unread messages
      if (msg.receiver_id === user.id && !msg.is_read) {
        const conv = conversationsMap.get(partnerId)
        conv.unreadCount++
      }
    })

    const conversations = Array.from(conversationsMap.values())

    return NextResponse.json({ conversations })
  } catch (error) {
    logger.error('Messages GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = sendMessageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { receiver_id, content, devis_request_id } = result.data

    // Insert new message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id,
        content,
        devis_request_id: devis_request_id || null,
        is_read: false,
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Error sending message:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message
    })
  } catch (error) {
    logger.error('Messages POST error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
