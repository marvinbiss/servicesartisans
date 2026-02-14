import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { renderPreview, extractVariables } from '@/lib/prospection/template-renderer'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission('prospection', 'read')
    if (!authResult.success) return authResult.error

    const { body, subject } = await request.json()

    if (!body) {
      return NextResponse.json(
        { success: false, error: { message: 'Body requis' } },
        { status: 400 }
      )
    }

    const renderedBody = renderPreview(body)
    const renderedSubject = subject ? renderPreview(subject) : null
    const variables = extractVariables(body + (subject || ''))

    return NextResponse.json({
      success: true,
      data: {
        rendered_body: renderedBody,
        rendered_subject: renderedSubject,
        variables,
      },
    })
  } catch (error) {
    logger.error('Template preview error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
