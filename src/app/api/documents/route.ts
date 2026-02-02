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
import { z } from 'zod'

// GET query params schema
const documentsGetSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  bookingId: z.string().uuid().optional().nullable(),
  type: z.enum(['invoice', 'quote', 'receipt', 'other']).optional().nullable(),
}).refine(data => data.userId || data.bookingId, {
  message: 'userId or bookingId required',
})

// POST request schema for generate action
const documentItemSchema = z.object({
  description: z.string().max(500),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100).optional(),
})

const recipientSchema = z.object({
  name: z.string().max(200),
  company: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
})

const generateDocumentSchema = z.object({
  action: z.literal('generate'),
  userId: z.string().uuid(),
  bookingId: z.string().uuid().optional().nullable(),
  type: z.enum(['invoice', 'quote', 'receipt']),
  data: z.object({
    items: z.array(documentItemSchema).min(1),
    recipient: recipientSchema,
    notes: z.string().max(1000).optional(),
    validDays: z.number().int().positive().max(365).optional(),
  }),
})

const uploadDocumentSchema = z.object({
  action: z.literal('upload'),
  userId: z.string().uuid(),
  bookingId: z.string().uuid().optional().nullable(),
  type: z.enum(['invoice', 'quote', 'receipt', 'other']).optional(),
  data: z.object({
    name: z.string().max(200),
    fileUrl: z.string().url(),
    fileSize: z.number().int().positive().optional(),
    mimeType: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
  }),
})

const documentsPostSchema = z.discriminatedUnion('action', [
  generateDocumentSchema,
  uploadDocumentSchema,
])

// DELETE query params schema
const documentsDeleteSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
})

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
    const queryParams = {
      userId: searchParams.get('userId'),
      bookingId: searchParams.get('bookingId'),
      type: searchParams.get('type'),
    }
    const result = documentsGetSchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { userId, bookingId, type } = result.data

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
    const result = documentsPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { action, userId, bookingId, type, data } = result.data

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
          email: recipient.email || '',
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
    const queryParams = {
      id: searchParams.get('id'),
      userId: searchParams.get('userId'),
    }
    const result = documentsDeleteSchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { id: documentId, userId } = result.data

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

    // Delete file from storage if exists
    if (doc.file_url) {
      try {
        // Extract bucket and path from URL
        const urlParts = doc.file_url.split('/storage/v1/object/public/')
        if (urlParts.length === 2) {
          const [bucket, ...pathParts] = urlParts[1].split('/')
          const filePath = pathParts.join('/')
          if (bucket && filePath) {
            await supabase.storage.from(bucket).remove([filePath])
          }
        }
      } catch (storageError) {
        // Log but don't fail the delete operation
        logger.warn('Failed to delete file from storage', { documentId, error: storageError })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Documents DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
