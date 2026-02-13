import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  channel: z.enum(['email', 'sms', 'whatsapp']),
  audience_type: z.enum(['artisan', 'client', 'mairie']).optional(),
  subject: z.string().max(200).optional(),
  body: z.string().min(1),
  html_body: z.string().optional(),
  whatsapp_template_name: z.string().optional(),
  whatsapp_template_sid: z.string().optional(),
  ai_system_prompt: z.string().optional(),
  ai_context: z.record(z.string(), z.unknown()).optional(),
  variables: z.array(z.string()).optional(),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission('prospection', 'read')
    if (!authResult.success) return authResult.error

    const supabase = createAdminClient()
    const channel = request.nextUrl.searchParams.get('channel')
    const audience = request.nextUrl.searchParams.get('audience_type')

    let query = supabase
      .from('prospection_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (channel) query = query.eq('channel', channel)
    if (audience) query = query.eq('audience_type', audience)

    const { data, error } = await query

    if (error) {
      logger.error('List templates error', error)
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Templates GET error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission('prospection', 'write')
    if (!authResult.success || !authResult.admin) return authResult.error

    const supabase = createAdminClient()
    const body = await request.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('prospection_templates')
      .insert({ ...parsed.data, created_by: authResult.admin.id })
      .select()
      .single()

    if (error) {
      logger.error('Create template error', error)
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    logger.error('Templates POST error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
