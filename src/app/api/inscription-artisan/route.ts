/**
 * Artisan Registration API - ServicesArtisans
 * Handles artisan registration applications
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createClient } from '@supabase/supabase-js'
import { getResendClient } from '@/lib/api/resend-client'
import { z } from 'zod'
import { escapeHtml } from '@/lib/utils/html'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const getResend = () => getResendClient()

const artisanSchema = z.object({
  // Step 1 - Company
  entreprise: z.string().min(2, 'Le nom d\'entreprise est requis'),
  siret: z.string().min(14, 'SIRET invalide').max(17),
  metier: z.string().min(1, 'Le m\u00e9tier est requis'),
  autreMetier: z.string().optional(),
  // Step 2 - Contact
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le pr\u00e9nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'T\u00e9l\u00e9phone invalide'),
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
        { error: 'Donn\u00e9es invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data
    const metierFinal = data.metier === 'Autre' ? data.autreMetier : data.metier

    // Store in database
    const { error: dbError } = await supabase
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

    // Escape user-provided variables for HTML
    const safePrenom = escapeHtml(data.prenom)
    const safeNom = escapeHtml(data.nom)
    const safeEntreprise = escapeHtml(data.entreprise)
    const safeSiret = escapeHtml(data.siret)
    const safeMetier = escapeHtml(metierFinal || '')
    const safeVille = escapeHtml(data.ville)
    const safeRayon = escapeHtml(data.rayonIntervention)
    const safeEmail = escapeHtml(data.email)
    const safeTelephone = escapeHtml(data.telephone)
    const safeAdresse = escapeHtml(data.adresse)
    const safeCodePostal = escapeHtml(data.codePostal)
    const safeDescription = data.description ? escapeHtml(data.description) : ''
    const safeExperience = data.experience ? escapeHtml(data.experience) : ''
    const safeCertifications = data.certifications ? escapeHtml(data.certifications) : ''

    // Send confirmation email to artisan
    await getResend().emails.send({
      from: process.env.FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
      to: data.email,
      subject: 'Votre inscription sur ServicesArtisans - Confirmation',
      html: `
        <h2>Bonjour ${safePrenom} ${safeNom},</h2>
        <p>Nous avons bien re\u00e7u votre demande d'inscription en tant qu'artisan sur ServicesArtisans.</p>
        <p><strong>R\u00e9capitulatif de votre inscription :</strong></p>
        <ul>
          <li><strong>Entreprise :</strong> ${safeEntreprise}</li>
          <li><strong>SIRET :</strong> ${safeSiret}</li>
          <li><strong>M\u00e9tier :</strong> ${safeMetier}</li>
          <li><strong>Zone d'intervention :</strong> ${safeVille} (${safeRayon} km)</li>
        </ul>
        <p>Notre \u00e9quipe va v\u00e9rifier vos informations et vous recevrez une r\u00e9ponse sous 24-48 heures.</p>
        <p>\u00c0 bient\u00f4t sur ServicesArtisans !</p>
        <hr />
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
          contact@servicesartisans.fr<br>
          <a href="https://servicesartisans.fr/confidentialite" style="color: #999;">Politique de confidentialit\u00e9</a>
        </p>
      `,
      text: `Bonjour ${data.prenom} ${data.nom},\n\nNous avons bien re\u00e7u votre demande d'inscription en tant qu'artisan sur ServicesArtisans.\n\nR\u00e9capitulatif de votre inscription :\nEntreprise : ${data.entreprise}\nSIRET : ${data.siret}\nM\u00e9tier : ${metierFinal}\nZone d'intervention : ${data.ville} (${data.rayonIntervention} km)\n\nNotre \u00e9quipe va v\u00e9rifier vos informations et vous recevrez une r\u00e9ponse sous 24-48 heures.\n\n\u00c0 bient\u00f4t sur ServicesArtisans !\n\nServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr\nPolitique de confidentialit\u00e9 : https://servicesartisans.fr/confidentialite`,
    })

    // Send notification to admin
    await getResend().emails.send({
      from: process.env.FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
      to: 'artisans@servicesartisans.fr',
      subject: `[Nouvelle inscription] ${data.entreprise} - ${metierFinal}`,
      html: `
        <h2>Nouvelle demande d'inscription artisan</h2>
        <h3>Entreprise</h3>
        <ul>
          <li><strong>Nom :</strong> ${safeEntreprise}</li>
          <li><strong>SIRET :</strong> ${safeSiret}</li>
          <li><strong>M\u00e9tier :</strong> ${safeMetier}</li>
        </ul>
        <h3>Contact</h3>
        <ul>
          <li><strong>Nom :</strong> ${safePrenom} ${safeNom}</li>
          <li><strong>Email :</strong> ${safeEmail}</li>
          <li><strong>T\u00e9l\u00e9phone :</strong> ${safeTelephone}</li>
        </ul>
        <h3>Localisation</h3>
        <ul>
          <li><strong>Adresse :</strong> ${safeAdresse}</li>
          <li><strong>Ville :</strong> ${safeCodePostal} ${safeVille}</li>
          <li><strong>Rayon d'intervention :</strong> ${safeRayon} km</li>
        </ul>
        ${safeDescription ? `<h3>Description</h3><p>${safeDescription}</p>` : ''}
        ${safeExperience ? `<p><strong>Exp\u00e9rience :</strong> ${safeExperience}</p>` : ''}
        ${safeCertifications ? `<p><strong>Certifications :</strong> ${safeCertifications}</p>` : ''}
        <hr />
        <p><a href="https://servicesartisans.fr/admin">Acc\u00e9der au dashboard admin</a></p>
      `,
      text: `Nouvelle demande d'inscription artisan\n\nEntreprise\nNom : ${data.entreprise}\nSIRET : ${data.siret}\nM\u00e9tier : ${metierFinal}\n\nContact\nNom : ${data.prenom} ${data.nom}\nEmail : ${data.email}\nT\u00e9l\u00e9phone : ${data.telephone}\n\nLocalisation\nAdresse : ${data.adresse}\nVille : ${data.codePostal} ${data.ville}\nRayon d'intervention : ${data.rayonIntervention} km${data.description ? `\n\nDescription : ${data.description}` : ''}${data.experience ? `\nExp\u00e9rience : ${data.experience}` : ''}${data.certifications ? `\nCertifications : ${data.certifications}` : ''}\n\nAcc\u00e9der au dashboard : https://servicesartisans.fr/admin`,
    })

    return NextResponse.json({
      success: true,
      message: 'Inscription enregistr\u00e9e avec succ\u00e8s',
    })
  } catch (error) {
    logger.error('Artisan registration API error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
