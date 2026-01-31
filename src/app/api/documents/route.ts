/**
 * Documents API - ServicesArtisans
 * Upload, generate, and manage documents
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import {
  generateDocumentHTML,
  generateDocumentNumber,
  calculateTotals,
  defaultTerms,
  type DocumentData,
  type DocumentType,
} from '@/lib/documents/pdf-generator'

// Lazy initialize to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/documents - List user's documents
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const bookingId = searchParams.get('bookingId')
    const type = searchParams.get('type')

    if (!userId && !bookingId) {
      return NextResponse.json(
        { error: 'userId or bookingId required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('owner_id', userId)
    }
    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ documents: data })
  } catch (error) {
    logger.error('Documents GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Generate or upload document
export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { action, userId, bookingId, type, data } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      )
    }

    // Generate PDF document
    if (action === 'generate') {
      const documentType = type as DocumentType
      const documentNumber = generateDocumentNumber(documentType, userId)

      // Get artisan info
      const { data: artisan } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!artisan) {
        return NextResponse.json(
          { error: 'Artisan not found' },
          { status: 404 }
        )
      }

      // Build document data
      const { items, recipient, notes, validDays } = data

      const totals = calculateTotals(items)

      const documentData: DocumentData = {
        type: documentType,
        number: documentNumber,
        date: new Date(),
        validUntil: documentType === 'quote'
          ? new Date(Date.now() + (validDays || 30) * 24 * 60 * 60 * 1000)
          : undefined,
        dueDate: documentType === 'invoice'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : undefined,
        sender: {
          name: artisan.full_name || 'Artisan',
          company: artisan.company_name,
          address: artisan.address || '',
          city: artisan.city || '',
          postalCode: artisan.postal_code || '',
          phone: artisan.phone,
          email: artisan.email,
          siret: artisan.siret,
          tva: artisan.tva_number,
          logo: artisan.logo_url,
        },
        recipient: {
          name: recipient.name,
          company: recipient.company,
          address: recipient.address,
          city: recipient.city,
          postalCode: recipient.postalCode,
          email: recipient.email,
          phone: recipient.phone,
        },
        items,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
        notes,
        terms: defaultTerms[documentType],
        paymentInfo: artisan.payment_info,
      }

      // Generate HTML
      const html = generateDocumentHTML(documentData)

      // Store document record
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          owner_id: userId,
          booking_id: bookingId,
          type: documentType,
          name: `${documentType === 'invoice' ? 'Facture' : documentType === 'quote' ? 'Devis' : 'Document'} ${documentNumber}`,
          file_url: '', // Will be updated after PDF generation
          metadata: {
            documentNumber,
            recipient: recipient.name,
            total: totals.total,
            html, // Store HTML for regeneration
          },
        })
        .select()
        .single()

      if (docError) throw docError

      return NextResponse.json({
        success: true,
        document: doc,
        html, // Return HTML for client-side PDF generation
        documentNumber,
      })
    }

    // Upload existing document
    if (action === 'upload') {
      const { name, fileUrl, fileSize, mimeType, description, isPublic } = data

      const { data: doc, error } = await supabase
        .from('documents')
        .insert({
          owner_id: userId,
          booking_id: bookingId,
          type: type || 'other',
          name,
          description,
          file_url: fileUrl,
          file_size: fileSize,
          mime_type: mimeType,
          is_public: isPublic || false,
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        document: doc,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    logger.error('Documents POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents - Delete document
export async function DELETE(request: Request) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!documentId || !userId) {
      return NextResponse.json(
        { error: 'id and userId required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: doc } = await supabase
      .from('documents')
      .select('owner_id, file_url')
      .eq('id', documentId)
      .single()

    if (!doc || doc.owner_id !== userId) {
      return NextResponse.json(
        { error: 'Document not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) throw error

    // TODO: Delete file from storage

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Documents DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
