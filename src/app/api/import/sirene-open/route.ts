/**
 * API d'import SIRENE Open Data
 * Utilise l'API gratuite sans authentification
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchByTermOpen, transformOpenResultToProvider } from '@/lib/sirene/client-open'
import { NAF_TO_SERVICE } from '@/lib/sirene/config'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

interface ImportResult {
  total_fetched: number
  total_inserted: number
  total_skipped: number
  total_errors: number
  departments_processed: string[]
  errors: string[]
}

// Metiers du batiment a rechercher avec leurs noms complets
const METIERS_BATIMENT: Record<string, string> = {
  'plombier': 'Plombier',
  'electricien': 'Électricien',
  'chauffagiste': 'Chauffagiste',
  'menuisier': 'Menuisier',
  'peintre': 'Peintre',
  'carreleur': 'Carreleur',
  'macon': 'Maçon',
  'couvreur': 'Couvreur',
  'plaquiste': 'Plaquiste',
  'serrurier': 'Serrurier',
  'isolation': 'Isolation',
  'charpentier': 'Charpentier',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const body = await request.json().catch(() => ({}))

    // Parametres
    const departments: string[] = body.departments || ['75', '92', '93', '94']
    const metiers: string[] = body.metiers || Object.keys(METIERS_BATIMENT).slice(0, 3)
    const maxPerDepartment: number = body.max_per_department || 50
    const dryRun: boolean = body.dry_run === true

    const result: ImportResult = {
      total_fetched: 0,
      total_inserted: 0,
      total_skipped: 0,
      total_errors: 0,
      departments_processed: [],
      errors: [],
    }

    // Recuperer les services existants pour le mapping
    const { data: existingServices } = await supabase
      .from('services')
      .select('id, slug')

    const serviceMap = new Map(existingServices?.map(s => [s.slug, s.id]) || [])

    // Creer les services manquants
    for (const [slug, name] of Object.entries(METIERS_BATIMENT)) {
      if (!serviceMap.has(slug)) {
        console.log(`Creating missing service: ${slug}`)
        const { data: newService, error: serviceError } = await supabase
          .from('services')
          .insert({
            name,
            slug,
            description: `Service de ${name.toLowerCase()}`,
            is_active: true,
            meta_title: `${name} - Services Artisans`,
            meta_description: `Trouvez un ${name.toLowerCase()} qualifié près de chez vous`,
          })
          .select('id')
          .single()

        if (newService && !serviceError) {
          serviceMap.set(slug, newService.id)
          console.log(`Service created: ${slug} -> ${newService.id}`)
        } else {
          console.error(`Failed to create service ${slug}:`, serviceError)
        }
      }
    }

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

    // Traiter chaque departement et metier
    for (const dept of departments) {
      console.log(`Import departement ${dept}...`)
      result.departments_processed.push(dept)

      let totalForDept = 0

      for (const metier of metiers) {
        if (totalForDept >= maxPerDepartment) break

        let page = 1
        const maxPages = 5

        while (page <= maxPages && totalForDept < maxPerDepartment) {
          try {
            const { results, hasMore } = await searchByTermOpen(metier, dept, page)

            if (results.length === 0) break

            result.total_fetched += results.length

            for (const entreprise of results) {
              if (totalForDept >= maxPerDepartment) break

              try {
                const provider = transformOpenResultToProvider(entreprise)

                if (dryRun) {
                  console.log('DRY RUN:', provider.name, provider.address_city)
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
                    address_region: provider.address_region,
                    latitude: provider.latitude,
                    longitude: provider.longitude,
                    legal_form: provider.legal_form,
                    creation_date: provider.creation_date,
                    employee_count: provider.employee_count,
                    is_verified: false,
                    is_active: true,
                    is_premium: false,
                    source: provider.source,
                    source_id: provider.source_id,
                    meta_description: `${provider.name} - Artisan ${metier} a ${provider.address_city}`,
                  })
                  .select('id')
                  .single()

                if (insertError) {
                  result.total_errors++
                  result.errors.push(`${provider.siret}: ${insertError.message}`)
                  continue
                }

                // Lier au service
                const serviceSlug = metier
                const serviceId = serviceMap.get(serviceSlug)

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
                    // Ignorer
                  }
                }

                // Lier a la location
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
                    // Ignorer
                  }
                }

                result.total_inserted++
                totalForDept++

              } catch (err) {
                result.total_errors++
                result.errors.push(String(err))
              }
            }

            if (!hasMore) break
            page++

            // Pause entre les pages
            await new Promise(resolve => setTimeout(resolve, 1000))

          } catch (err) {
            result.errors.push(`Dept ${dept} metier ${metier}: ${String(err)}`)
            break
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: dryRun ? 'Simulation terminee' : 'Import termine',
      result,
    })

  } catch (error) {
    console.error('Import SIRENE Open error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API Import SIRENE Open Data (sans authentification)',
    instructions: {
      method: 'POST',
      body: {
        departments: 'Liste des departements (defaut: IDF)',
        metiers: 'Liste des metiers a rechercher',
        max_per_department: 'Nombre max par departement (defaut: 50)',
        dry_run: 'true pour simuler',
      },
    },
    metiers_disponibles: Object.keys(METIERS_BATIMENT),
  })
}
