'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { dispatchLead } from './dispatch'

const leadSchema = z.object({
  providerId: z.string().min(1),
  serviceName: z.string().min(1),
  name: z.string().min(1, 'Votre nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(
    /^(?:\+33|0)[1-9](?:[0-9]{8})$/,
    'Numero de telephone invalide'
  ),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  description: z.string().min(20, 'Description trop courte (min 20 caracteres)'),
  urgency: z.enum(['normal', 'urgent', 'flexible']).default('normal'),
})

export type LeadFormState = {
  success: boolean
  error?: string
}

export async function submitLead(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const raw = {
    providerId: formData.get('providerId'),
    serviceName: formData.get('serviceName'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: String(formData.get('phone') || '').replace(/\s/g, ''),
    postalCode: formData.get('postalCode') || undefined,
    city: formData.get('city') || undefined,
    description: formData.get('description'),
    urgency: formData.get('urgency') || 'normal',
  }

  const validation = leadSchema.safeParse(raw)
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return { success: false, error: firstError?.message || 'Donnees invalides' }
  }

  const data = validation.data

  try {
    const supabase = await createClient()

    // Resolve authenticated user (null if anonymous submission)
    const { data: { user } } = await supabase.auth.getUser()

    // Map urgency to DB enum
    const urgencyMap: Record<string, string> = {
      urgent: 'urgent',
      normal: 'normal',
      flexible: 'normal',
    }

    const { data: inserted, error } = await supabase.from('devis_requests').insert({
      client_id: user?.id ?? null,
      service_name: data.serviceName,
      postal_code: data.postalCode || '',
      city: data.city || null,
      description: data.description,
      urgency: urgencyMap[data.urgency] || 'normal',
      status: 'pending',
      client_name: data.name,
      client_email: data.email,
      client_phone: data.phone,
    }).select('id').single()

    if (error || !inserted) {
      console.error('Lead insert error:', error)
      return { success: false, error: 'Erreur lors de l\'envoi. Reessayez.' }
    }

    // Dispatch lead to one eligible artisan (fire-and-forget, non-blocking)
    dispatchLead(inserted.id, data.serviceName, data.city).catch((err) =>
      console.error('Dispatch failed (non-blocking):', err)
    )

    return { success: true }
  } catch (err) {
    console.error('Lead action error:', err)
    return { success: false, error: 'Erreur serveur. Reessayez.' }
  }
}
