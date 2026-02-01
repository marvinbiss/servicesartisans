/**
 * API d'import SIRENE
 * Importe les artisans du batiment depuis l'API INSEE
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { searchEtablissements, transformToProvider } from '@/lib/sirene/client'
import { NAF_CODES_PRIORITAIRES, NAF_TO_SERVICE } from '@/lib/sirene/config'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

interface ImportResult {
  total_fetched: number
  total_inserted: number
  total_skipped: number
  total_errors: number
  departments_processed: string[]
  errors: string[]
}

// Liste des departements francais
const DEPARTEMENTS = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '21',
  '22', '23', '24', '25', '26', '27', '28', '29', '2A', '2B',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
  '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '90', '91', '92', '93', '94', '95', '971', '972', '973', '974', '976'
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verifier l'authentification admin (optionnel pour securiser)
    const { data: { user } } = await supabase.auth.getUser()
    // Pour l'instant on permet sans auth pour le test initial

    const body = await request.json().catch(() => ({}))

    // Parametres
    const nafCodes: string[] = body.naf_codes || NAF_CODES_PRIORITAIRES
    const departments: string[] = body.departments || ['75', '92', '93', '94'] // IDF par defaut
    const maxPerDepartment: number = body.max_per_department || 100
    const dryRun: boolean = body.dry_run || false

    const result: ImportResult = {
      total_fetched: 0,
      total_inserted: 0,
      total_skipped: 0,
      total_errors: 0,
      departments_processed: [],
      errors: [],
    }

    // Recuperer les services existants pour le mapping
    const { data: services } = await supabase
      .from('services')
      .select('id, slug')

    const serviceMap = new Map(services?.map(s => [s.slug, s.id]) || [])

    // Recuperer les locations existantes pour le mapping
    const { data: locations } = await supabase
      .from('locations')
      .select('id, postal_code')

    const locationMap = new Map<string, string>()
    locations?.forEach(l => {
      if (l.postal_code) {
        locationMap.set(l.postal_code, l.id)
      }
    })

    // Traiter chaque departement
    for (const dept of departments) {
      logger.info('Import departement', { dept })
      result.departments_processed.push(dept)

      let page = 0
      let totalForDept = 0

      while (totalForDept < maxPerDepartment) {
        try {
          const { etablissements, total, hasMore } = await searchEtablissements(
            nafCodes,
            dept,
            page
          )

          if (etablissements.length === 0) break

          result.total_fetched += etablissements.length

          // Transformer et inserer
          for (const etab of etablissements) {
            if (totalForDept >= maxPerDepartment) break

            try {
              const provider = transformToProvider(etab)

              if (dryRun) {
                logger.debug('DRY RUN', { name: provider.name, city: provider.address_city })
                result.total_inserted++
                totalForDept++
                continue
              }

              // Verifier si existe deja
              const { data: existing } = await supabase
                .from('providers')
                .select('id')
                .eq('siret', provider.siret)
                .single()

              if (existing) {
                result.total_skipped++
                continue
              }

              // Inserer le provider
              const { data: inserted, error: insertError } = await supabase
                .from('providers')
                .insert({
                  name: provider.name,
                  slug: provider.slug,
                  siret: provider.siret,
                  siren: provider.siren,
                  address_street: provider.address_street,
                  address_city: provider.address_city,
                  address_postal_code: provider.address_postal_code,
                  address_department: provider.address_department,
                  legal_form: provider.legal_form,
                  creation_date: provider.creation_date,
                  employee_count: provider.employee_count,
                  is_verified: false,
                  is_active: true,
                  is_premium: false,
                  source: 'sirene',
                  source_id: provider.siret,
                  meta_description: `${provider.name} - Artisan a ${provider.address_city}`,
                })
                .select('id')
                .single()

              if (insertError) {
                result.total_errors++
                result.errors.push(`${provider.siret}: ${insertError.message}`)
                continue
              }

              // Lier au service si possible
              const nafCode = provider.naf_code?.replace('.', '')
              const serviceSlug = nafCode ? NAF_TO_SERVICE[nafCode] : null
              const serviceId = serviceSlug ? serviceMap.get(serviceSlug) : null

              if (inserted && serviceId) {
                try {
                  await supabase
                    .from('provider_services')
                    .insert({
                      provider_id: inserted.id,
                      service_id: serviceId,
                      is_primary: true,
                    })
                } catch {
                  // Ignorer les erreurs de liaison
                }
              }

              // Lier a la location si possible
              const locationId = provider.address_postal_code
                ? locationMap.get(provider.address_postal_code)
                : null

              if (inserted && locationId) {
                try {
                  await supabase
                    .from('provider_locations')
                    .insert({
                      provider_id: inserted.id,
                      location_id: locationId,
                      is_primary: true,
                      radius_km: 20,
                    })
                } catch {
                  // Ignorer les erreurs de liaison
                }
              }

              result.total_inserted++
              totalForDept++

            } catch (err) {
              result.total_errors++
              result.errors.push(String(err))
            }
          }

          if (!hasMore || totalForDept >= maxPerDepartment) break
          page++

          // Pause pour respecter le rate limit
          await new Promise(resolve => setTimeout(resolve, 2100)) // ~28 req/min

        } catch (err) {
          result.errors.push(`Dept ${dept} page ${page}: ${String(err)}`)
          break
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: dryRun ? 'Simulation terminee' : 'Import termine',
      result,
    })

  } catch (error) {
    logger.error('Import SIRENE error', error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    )
  }
}

// GET pour voir le statut et les instructions
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API Import SIRENE',
    instructions: {
      method: 'POST',
      body: {
        naf_codes: 'Liste des codes NAF (optionnel, defaut: metiers prioritaires)',
        departments: 'Liste des departements (optionnel, defaut: IDF)',
        max_per_department: 'Nombre max par departement (defaut: 100)',
        dry_run: 'true pour simuler sans inserer',
      },
      example: {
        departments: ['75', '92', '93', '94'],
        max_per_department: 50,
        dry_run: false,
      },
    },
    required_env: {
      INSEE_CONSUMER_KEY: 'Cle API INSEE (obtenir sur api.insee.fr)',
      INSEE_CONSUMER_SECRET: 'Secret API INSEE',
    },
    naf_codes_available: NAF_CODES_PRIORITAIRES,
  })
}
