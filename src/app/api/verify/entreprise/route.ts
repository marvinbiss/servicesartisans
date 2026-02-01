import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import {
  getEntrepriseParSiret,
  getEntrepriseParSiren,
  rechercherEntreprises,
  verifierSanteEntreprise,
  getBadgeConfiance
} from '@/lib/api/pappers'

/**
 * API de vérification d'entreprise
 * Combine les données INSEE et Pappers pour une vérification complète
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action') || 'verify'

  try {
    switch (action) {
      // Vérification complète par SIRET
      case 'verify': {
        const siret = searchParams.get('siret')
        if (!siret) {
          return NextResponse.json(
            { success: false, error: 'SIRET requis' },
            { status: 400 }
          )
        }

        // Récupérer les infos Pappers
        const entreprise = await getEntrepriseParSiret(siret)

        if (!entreprise) {
          return NextResponse.json({
            success: false,
            error: 'Entreprise non trouvée',
            code: 'NOT_FOUND'
          })
        }

        // Vérifier la santé
        const sante = await verifierSanteEntreprise(siret)
        const badge = getBadgeConfiance(entreprise)

        return NextResponse.json({
          success: true,
          data: {
            entreprise,
            verification: {
              sante,
              badge
            }
          }
        })
      }

      // Vérification par SIREN
      case 'siren': {
        const siren = searchParams.get('siren')
        if (!siren) {
          return NextResponse.json(
            { success: false, error: 'SIREN requis' },
            { status: 400 }
          )
        }

        const entreprise = await getEntrepriseParSiren(siren)

        if (!entreprise) {
          return NextResponse.json({
            success: false,
            error: 'Entreprise non trouvée',
            code: 'NOT_FOUND'
          })
        }

        return NextResponse.json({
          success: true,
          data: { entreprise }
        })
      }

      // Recherche par nom
      case 'search': {
        const q = searchParams.get('q')
        if (!q || q.length < 2) {
          return NextResponse.json(
            { success: false, error: 'Requête trop courte (min 2 caractères)' },
            { status: 400 }
          )
        }

        const codePostal = searchParams.get('codePostal') || undefined
        const limit = parseInt(searchParams.get('limit') || '10')

        const resultats = await rechercherEntreprises(q, {
          codePostal,
          limit
        })

        return NextResponse.json({
          success: true,
          data: resultats
        })
      }

      // Vérification santé rapide
      case 'health': {
        const siret = searchParams.get('siret')
        if (!siret) {
          return NextResponse.json(
            { success: false, error: 'SIRET requis' },
            { status: 400 }
          )
        }

        const sante = await verifierSanteEntreprise(siret)

        return NextResponse.json({
          success: true,
          data: sante
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Action invalide' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Erreur API entreprise', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST - Enrichir un profil artisan avec les données Pappers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { siret, artisanId } = body

    if (!siret) {
      return NextResponse.json(
        { success: false, error: 'SIRET requis' },
        { status: 400 }
      )
    }

    // Récupérer les données Pappers
    const entreprise = await getEntrepriseParSiret(siret)

    if (!entreprise) {
      return NextResponse.json({
        success: false,
        error: 'Entreprise non trouvée'
      })
    }

    // Vérifier la santé
    const sante = await verifierSanteEntreprise(siret)
    const badge = getBadgeConfiance(entreprise)

    // Si un artisanId est fourni, mettre à jour le profil
    if (artisanId) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      await supabase
        .from('providers')
        .update({
          // Données vérifiées
          siret_verified: true,
          siret_verified_at: new Date().toISOString(),
          company_name: entreprise.nom,
          company_legal_form: entreprise.formeJuridique,
          company_creation_date: entreprise.dateCreation,
          company_naf_code: entreprise.codeNAF,
          company_naf_label: entreprise.libelleNAF,

          // Données Pappers enrichies
          pappers_data: {
            siren: entreprise.siren,
            dirigeants: entreprise.dirigeants,
            capital: entreprise.capital,
            effectif: entreprise.effectif,
            dernierCA: entreprise.dernierCA,
            procedureCollective: entreprise.procedureCollective,
            badges: entreprise.badges,
            santeScore: sante.score,
            badgeNiveau: badge.niveau,
            updatedAt: new Date().toISOString()
          },

          // Badge de confiance
          trust_badge: badge.niveau,

          updated_at: new Date().toISOString()
        })
        .eq('id', artisanId)
    }

    return NextResponse.json({
      success: true,
      data: {
        entreprise,
        verification: {
          sante,
          badge
        }
      }
    })
  } catch (error) {
    logger.error('Erreur enrichissement entreprise', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
