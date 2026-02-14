/**
 * Artisan Registration API - ServicesArtisans
 * Handles artisan registration applications
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createClient } from '@supabase/supabase-js'
import { getResendClient } from '@/lib/api/resend-client'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const getResend = () => getResendClient()

const artisanSchema = z.object({
  // Step 1 - Company
  entreprise: z.string().min(2, 'Le nom d\'entreprise est requis'),
  siret: z.string().min(14, 'SIRET invalide').max(17),
  metier: z.string().min(1, 'Le métier est requis'),
  autreMetier: z.string().optional(),
  // Step 2 - Contact
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Téléphone invalide'),
  // Step 3 - Location
  adresse: z.string().min(5, 'L\'adresse est requise'),
  codePostal: z.string().min(5, 'Code postal invalide'),
  ville: z.string().min(2, 'La ville est requise'),
  rayonIntervention: z.string(),
  // Step 4 - Description
  description: z.string().optional(),
  experience: z.string().optional(),
  certifications: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = artisanSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Donnees invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data
    const metierFinal = data.metier === 'Autre' ? data.autreMetier : data.metier

    // Store in database
    const { error: dbError } = await getSupabase()
      .from('artisan_applications')
      .insert({
        entreprise: data.entreprise,
        siret: data.siret.replace(/\s/g, ''),
        metier: metierFinal,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        adresse: data.adresse,
        code_postal: data.codePostal,
        ville: data.ville,
        rayon_intervention: parseInt(data.rayonIntervention),
        description: data.description || null,
        experience: data.experience || null,
        certifications: data.certifications || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

    if (dbError) {
      logger.error('Database error', dbError)
      // Continue even if DB fails - we'll send email notification
    }

    // Send both emails in parallel (neither should crash the signup)
    const emailResults = await Promise.allSettled([
      getResend().emails.send({
        from: process.env.FROM_EMAIL || 'noreply@servicesartisans.fr',
        to: data.email,
        subject: 'Votre inscription sur ServicesArtisans - Confirmation',
        html: `
          <h2>Bonjour ${data.prenom} ${data.nom},</h2>
          <p>Nous avons bien reçu votre demande d'inscription en tant qu'artisan sur ServicesArtisans.</p>
          <p><strong>Récapitulatif de votre inscription :</strong></p>
          <ul>
            <li><strong>Entreprise :</strong> ${data.entreprise}</li>
            <li><strong>SIRET :</strong> ${data.siret}</li>
            <li><strong>Métier :</strong> ${metierFinal}</li>
            <li><strong>Zone d'intervention :</strong> ${data.ville} (${data.rayonIntervention} km)</li>
          </ul>
          <p>Notre équipe va vérifier vos informations et vous recevrez une réponse sous 24-48 heures.</p>
          <p>À bientôt sur ServicesArtisans !</p>
          <hr />
          <p style="color: #666; font-size: 12px;">
            <a href="https://servicesartisans.fr">servicesartisans.fr</a>
          </p>
        `,
      }),
      getResend().emails.send({
        from: process.env.FROM_EMAIL || 'noreply@servicesartisans.fr',
        to: 'artisans@servicesartisans.fr',
        subject: `[Nouvelle inscription] ${data.entreprise} - ${metierFinal}`,
        html: `
          <h2>Nouvelle demande d'inscription artisan</h2>
          <h3>Entreprise</h3>
          <ul>
            <li><strong>Nom :</strong> ${data.entreprise}</li>
            <li><strong>SIRET :</strong> ${data.siret}</li>
            <li><strong>Métier :</strong> ${metierFinal}</li>
          </ul>
          <h3>Contact</h3>
          <ul>
            <li><strong>Nom :</strong> ${data.prenom} ${data.nom}</li>
            <li><strong>Email :</strong> ${data.email}</li>
            <li><strong>Téléphone :</strong> ${data.telephone}</li>
          </ul>
          <h3>Localisation</h3>
          <ul>
            <li><strong>Adresse :</strong> ${data.adresse}</li>
            <li><strong>Ville :</strong> ${data.codePostal} ${data.ville}</li>
            <li><strong>Rayon d'intervention :</strong> ${data.rayonIntervention} km</li>
          </ul>
          ${data.description ? `<h3>Description</h3><p>${data.description}</p>` : ''}
          ${data.experience ? `<p><strong>Expérience :</strong> ${data.experience}</p>` : ''}
          ${data.certifications ? `<p><strong>Certifications :</strong> ${data.certifications}</p>` : ''}
          <hr />
          <p><a href="https://servicesartisans.fr/admin">Accéder au dashboard admin</a></p>
        `,
      }),
    ])

    // Log any email failures
    emailResults.forEach((result, i) => {
      if (result.status === 'rejected') {
        logger.error(`Email ${i} failed:`, result.reason)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Inscription enregistrée avec succès',
    })
  } catch (error) {
    logger.error('Artisan registration API error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
