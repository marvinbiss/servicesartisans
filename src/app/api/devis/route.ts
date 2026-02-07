/**
 * Devis API - ServicesArtisans
 * Handles quote request submissions
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getResendClient } from '@/lib/api/resend-client'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const getResend = () => getResendClient()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const devisSchema = z.object({
  service: z.string().min(1, 'Veuillez sélectionner un service'),
  urgency: z.string().min(1, 'Veuillez sélectionner l\'urgence'),
  description: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  nom: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Numéro de téléphone invalide'),
})

const serviceNames: Record<string, string> = {
  plombier: 'Plombier',
  electricien: 'Électricien',
  serrurier: 'Serrurier',
  chauffagiste: 'Chauffagiste',
  'peintre-en-batiment': 'Peintre en bâtiment',
  couvreur: 'Couvreur',
  menuisier: 'Menuisier',
  macon: 'Maçon',
}

const urgencyLabels: Record<string, string> = {
  urgent: 'Urgent (sous 24h)',
  semaine: 'Cette semaine',
  mois: 'Ce mois-ci',
  flexible: 'Flexible',
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    // Resolve authenticated user if present (null for anonymous submissions)
    let clientId: string | null = null
    try {
      const serverSupabase = await createServerClient()
      const { data: { user } } = await serverSupabase.auth.getUser()
      clientId = user?.id ?? null
    } catch {
      // Anonymous submission — no session cookie
    }

    // Validate input
    const validation = devisSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Store in database
    const { data: devis, error: dbError } = await supabase
      .from('devis_requests')
      .insert({
        client_id: clientId,
        service: data.service,
        urgency: data.urgency,
        description: data.description || null,
        postal_code: data.codePostal || null,
        city: data.ville || null,
        client_name: data.nom,
        client_email: data.email,
        client_phone: data.telephone,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      logger.error('Database error', dbError)
      // Continue even if DB fails - we'll still send emails
    }

    // Send confirmation email to client
    await getResend().emails.send({
      from: process.env.FROM_EMAIL || 'noreply@servicesartisans.fr',
      to: data.email,
      subject: 'Votre demande de devis - ServicesArtisans',
      html: `
        <h2>Bonjour ${data.nom},</h2>
        <p>Nous avons bien reçu votre demande de devis. Voici le récapitulatif :</p>
        <ul>
          <li><strong>Service :</strong> ${serviceNames[data.service] || data.service}</li>
          <li><strong>Urgence :</strong> ${urgencyLabels[data.urgency] || data.urgency}</li>
          ${data.ville ? `<li><strong>Ville :</strong> ${data.ville}</li>` : ''}
          ${data.description ? `<li><strong>Description :</strong> ${data.description}</li>` : ''}
        </ul>
        <p><strong>Que se passe-t-il maintenant ?</strong></p>
        <p>Nous allons transmettre votre demande aux artisans disponibles dans votre région. Vous recevrez jusqu'à 3 devis gratuits sous 24h.</p>
        <p>Cordialement,<br />L'équipe ServicesArtisans</p>
        <p style="color: #666; font-size: 12px;">
          <a href="https://servicesartisans.fr">servicesartisans.fr</a>
        </p>
      `,
    })

    // Send notification to admin
    await getResend().emails.send({
      from: process.env.FROM_EMAIL || 'noreply@servicesartisans.fr',
      to: 'contact@servicesartisans.fr',
      subject: `[Nouveau Devis] ${serviceNames[data.service] || data.service} - ${data.ville || 'France'}`,
      html: `
        <h2>Nouvelle demande de devis</h2>
        <h3>Client</h3>
        <ul>
          <li><strong>Nom :</strong> ${data.nom}</li>
          <li><strong>Email :</strong> ${data.email}</li>
          <li><strong>Téléphone :</strong> ${data.telephone}</li>
        </ul>
        <h3>Demande</h3>
        <ul>
          <li><strong>Service :</strong> ${serviceNames[data.service] || data.service}</li>
          <li><strong>Urgence :</strong> ${urgencyLabels[data.urgency] || data.urgency}</li>
          <li><strong>Ville :</strong> ${data.ville || 'Non précisé'}</li>
          <li><strong>Code postal :</strong> ${data.codePostal || 'Non précisé'}</li>
          <li><strong>Description :</strong> ${data.description || 'Non précisé'}</li>
        </ul>
        ${devis ? `<p>ID: ${devis.id}</p>` : ''}
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Demande de devis envoyée avec succès',
      id: devis?.id,
    })
  } catch (error) {
    logger.error('Devis API error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
