import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { importContacts, parseCSV, suggestColumnMapping } from '@/lib/prospection/import-service'
import type { ContactType, ColumnMapping } from '@/types/prospection'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission('prospection', 'write')
    if (!authResult.success) return authResult.error

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const contactType = formData.get('contact_type') as ContactType | null
    const mappingJson = formData.get('mapping') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: 'Fichier requis' } },
        { status: 400 }
      )
    }

    if (!contactType || !['artisan', 'client', 'mairie'].includes(contactType)) {
      return NextResponse.json(
        { success: false, error: { message: 'Type de contact invalide' } },
        { status: 400 }
      )
    }

    const content = await file.text()

    // Si pas de mapping fourni, retourner les headers + suggestion
    if (!mappingJson) {
      const { headers, rows } = parseCSV(content)
      const suggestedMapping = suggestColumnMapping(headers)

      return NextResponse.json({
        success: true,
        data: {
          headers,
          suggested_mapping: suggestedMapping,
          preview_rows: rows.slice(0, 5),
          total_rows: rows.length,
        },
      })
    }

    // Avec mapping, lancer l'import
    let mapping: ColumnMapping
    try {
      mapping = JSON.parse(mappingJson)
    } catch {
      return NextResponse.json(
        { success: false, error: { message: 'Mapping JSON invalide' } },
        { status: 400 }
      )
    }

    const result = await importContacts(content, mapping, contactType, file.name)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error('Import contacts error', error as Error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
