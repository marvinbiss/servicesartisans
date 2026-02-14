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
import { dispatchLead } from '@/app/actions/dispatch'
import { escapeHtml } from '@/lib/utils/html'

export const dynamic = 'force-dynamic'

const getResend = () => getResendClient()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const devisSchema = z.object({
  service: z.string().min(1, 'Veuillez sélectionner un service'),
  urgency: z.string().min(1, 'Veuillez sélectionner l\'urgence'),
  budget: z.string().optional(),
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
  carreleur: 'Carreleur',
  jardinier: 'Jardinier-paysagiste',
  vitrier: 'Vitrier',
  climaticien: 'Climaticien',
  cuisiniste: 'Cuisiniste',
  solier: 'Solier-moquettiste',
  nettoyage: 'Nettoyage professionnel',
}

const urgencyLabels: Record<string, string> = {
  urgent: 'Urgent (sous 24h)',
  semaine: 'Cette semaine',
  mois: 'Ce mois-ci',
  flexible: 'Flexible',
}

const budgetRanges: Record<string, { min: number | null; max: number | null }> = {
  'moins-500': { min: null, max: 500 },
  '500-2000': { min: 500, max: 2000 },
  '2000-5000': { min: 2000, max: 5000 },
  'plus-5000': { min: 5000, max: null },
  'ne-sais-pas': { min: null, max: null },
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
      // Anonymous submission \u2014 no session cookie
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

    // Parse budget range
    const budget = data.budget ? budgetRanges[data.budget] : null

    // Split name into first/last
    const nameParts = data.nom.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

    // Store in leads table
    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert({
        client_user_id: clientId,
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.telephone,
        description: data.description || null,
        budget_min: budget?.min ?? null,
        budget_max: budget?.max ?? null,
        timeline: data.urgency,
        project_city: data.ville || null,
        project_postal_code: data.codePostal || null,
        status: 'new',
        source: 'devis_form',
      })
      .select()
      .single()

    if (dbError) {
      logger.error('Database error', dbError)
      // Continue even if DB fails - we'll still send emails
    }

    // Dispatch to eligible artisans (fire-and-forget, non-blocking)
    if (lead) {
      const urgencyMap: Record<string, string> = {
        urgent: 'urgent',
        semaine: 'normal',
        mois: 'normal',
        flexible: 'flexible',
      }
      dispatchLead(lead.id, {
        serviceName: serviceNames[data.service] || data.service,
        city: data.ville,
        postalCode: data.codePostal,
        urgency: urgencyMap[data.urgency] || 'normal',
        sourceTable: 'leads',
      }).catch((err) => console.error('Dispatch failed (non-blocking):', err))
    }

    // Escape user-provided variables for HTML
    const safeNom = escapeHtml(data.nom)
    const safeVille = data.ville ? escapeHtml(data.ville) : ''
    const safeDescription = data.description ? escapeHtml(data.description) : ''
    const safeServiceName = escapeHtml(serviceNames[data.service] || data.service)
    const safeUrgencyLabel = escapeHtml(urgencyLabels[data.urgency] || data.urgency)

    // Send confirmation email to client
    await getResend().emails.send({
      from: process.env.FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
      to: data.email,
      subject: 'Votre demande de devis - ServicesArtisans',
      html: `
        <h2>Bonjour ${safeNom},</h2>
        <p>Nous avons bien re\u00e7u votre demande de devis. Voici le r\u00e9capitulatif :</p>
        <ul>
          <li><strong>Service :</strong> ${safeServiceName}</li>
          <li><strong>D\u00e9lai :</strong> ${safeUrgencyLabel}</li>
          ${safeVille ? `<li><strong>Ville :</strong> ${safeVille}</li>` : ''}
          ${safeDescription ? `<li><strong>Description :</strong> ${safeDescription}</li>` : ''}
        </ul>
        <p><strong>Que se passe-t-il maintenant ?</strong></p>
        <p>Nous allons transmettre votre demande aux artisans disponibles dans votre r\u00e9gion. Vous recevrez jusqu\u2019\u00e0 3 devis gratuits sous 24h.</p>
        <p>Cordialement,<br />L\u2019\u00e9quipe ServicesArtisans</p>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
          contact@servicesartisans.fr<br>
          <a href="https://servicesartisans.fr/confidentialite" style="color: #999;">Politique de confidentialit\u00e9</a>
        </p>
      `,
      text: `Bonjour ${data.nom},\n\nNous avons bien re\u00e7u votre demande de devis. Voici le r\u00e9capitulatif :\n\nService : ${serviceNames[data.service] || data.service}\nD\u00e9lai : ${urgencyLabels[data.urgency] || data.urgency}${data.ville ? `\nVille : ${data.ville}` : ''}${data.description ? `\nDescription : ${data.description}` : ''}\n\nQue se passe-t-il maintenant ?\nNous allons transmettre votre demande aux artisans disponibles dans votre r\u00e9gion. Vous recevrez jusqu'\u00e0 3 devis gratuits sous 24h.\n\nCordialement,\nL'\u00e9quipe ServicesArtisans\n\nServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr\nPolitique de confidentialit\u00e9 : https://servicesartisans.fr/confidentialite`,
    })

    // Escape user-provided variables for admin notification
    const safeEmail = escapeHtml(data.email)
    const safeTelephone = escapeHtml(data.telephone)
    const safeCodePostal = data.codePostal ? escapeHtml(data.codePostal) : ''
    const safeBudget = data.budget ? escapeHtml(data.budget) : ''

    // Send notification to admin
    await getResend().emails.send({
      from: process.env.FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
      to: 'contact@servicesartisans.fr',
      subject: `[Nouveau Devis] ${serviceNames[data.service] || data.service} - ${data.ville || 'France'}`,
      html: `
        <h2>Nouvelle demande de devis</h2>
        <h3>Client</h3>
        <ul>
          <li><strong>Nom :</strong> ${safeNom}</li>
          <li><strong>Email :</strong> ${safeEmail}</li>
          <li><strong>T\u00e9l\u00e9phone :</strong> ${safeTelephone}</li>
        </ul>
        <h3>Demande</h3>
        <ul>
          <li><strong>Service :</strong> ${safeServiceName}</li>
          <li><strong>D\u00e9lai :</strong> ${safeUrgencyLabel}</li>
          <li><strong>Ville :</strong> ${safeVille || 'Non pr\u00e9cis\u00e9'}</li>
          <li><strong>Code postal :</strong> ${safeCodePostal || 'Non pr\u00e9cis\u00e9'}</li>
          <li><strong>Budget :</strong> ${safeBudget || 'Non pr\u00e9cis\u00e9'}</li>
          <li><strong>Description :</strong> ${safeDescription || 'Non pr\u00e9cis\u00e9'}</li>
        </ul>
        ${lead ? `<p>ID: ${escapeHtml(lead.id)}</p>` : ''}
      `,
      text: `Nouvelle demande de devis\n\nClient\nNom : ${data.nom}\nEmail : ${data.email}\nT\u00e9l\u00e9phone : ${data.telephone}\n\nDemande\nService : ${serviceNames[data.service] || data.service}\nD\u00e9lai : ${urgencyLabels[data.urgency] || data.urgency}\nVille : ${data.ville || 'Non pr\u00e9cis\u00e9'}\nCode postal : ${data.codePostal || 'Non pr\u00e9cis\u00e9'}\nBudget : ${data.budget || 'Non pr\u00e9cis\u00e9'}\nDescription : ${data.description || 'Non pr\u00e9cis\u00e9'}${lead ? `\nID: ${lead.id}` : ''}`,
    })

    return NextResponse.json({
      success: true,
      message: 'Demande de devis envoyée avec succès',
      id: lead?.id,
    })
  } catch (error) {
    logger.error('Devis API error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
