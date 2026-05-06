import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { getToken } from '@/lib/sirene/client'
import { SIRENE_CONFIG } from '@/lib/sirene/config'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

// Force dynamic rendering — cron lit request.headers (cron-secret) à chaque appel.
export const dynamic = 'force-dynamic'

/**
 * Cron: Vérifie les SIRET en DB via l'API INSEE SIRENE.
 * Désactive les providers dont l'établissement est radié (fermé).
 * Exécution recommandée : hebdomadaire.
 *
 * Batch de 100 SIRET par appel (limite INSEE: q= max ~80 termes).
 * Le cron traite jusqu'à 1000 providers par exécution pour rester sous les 60s.
 *
 * Hardening SLA-99.9 (2026-05-06) :
 *   - Lease 30 min anti-double-run (workload lourd, sync ADEME/SIRENE)
 *   - Wall-clock 50s : on stoppe avant kill Vercel et on désactive ce qu'on a
 *     déjà détecté (radieIds accumulés)
 *   - Per-batch try/catch déjà présent (pas de régression)
 *   - Release du lease en finally
 */

const BATCH_SIZE = 80 // nombre de SIRET par requête INSEE (limite pratique)
const MAX_PROVIDERS_PER_RUN = 1000

export const maxDuration = 60

// SLA-99.9 : wall-clock 50s + lease 30min (synchro ADEME/SIRENE = lourd).
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_check_radiees'
const LEASE_TTL_SECONDS = 30 * 60

export const GET = withCronCheckIn('cron-check-radiees', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const startedAt = Date.now()
  const stats = { checked: 0, radiees: 0, errors: 0, skipped: 0 }

  // SLA-99.9 : lease avec abort 5s.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const result = await supabase
      .rpc('acquire_cron_lease', {
        p_name: LEASE_NAME,
        p_ttl_seconds: LEASE_TTL_SECONDS,
      })
      .abortSignal(leaseController.signal)
    acquired = result.data as boolean | null
    leaseErr = result.error
  } catch (err) {
    leaseErr = { message: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseErr) {
    logger.error('check-radiees: lease error', leaseErr, { lease: LEASE_NAME })
    return NextResponse.json({ error: 'lease_error' }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('check-radiees: skipped (lease already held)', { lease: LEASE_NAME })
    return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
  }

  try {
    // Récupérer les providers actifs avec un SIRET valide (14 chiffres)
    // On prend les plus anciennement vérifiés en premier (colonne updated_at)
    const { data: providers, error: fetchError } = await supabase
      .from('providers')
      .select('id, siret, name')
      .eq('is_active', true)
      .not('siret', 'is', null)
      .order('updated_at', { ascending: true })
      .limit(MAX_PROVIDERS_PER_RUN)

    if (fetchError || !providers) {
      logger.error('check-radiees: failed to fetch providers', fetchError)
      return NextResponse.json({ error: 'Échec de la récupération en base' }, { status: 500 })
    }

    // Filtrer les SIRET valides (14 chiffres)
    const validProviders = providers.filter((p) => p.siret && /^\d{14}$/.test(p.siret))
    logger.info(`check-radiees: ${validProviders.length} providers à vérifier`)

    if (validProviders.length === 0) {
      return NextResponse.json({ message: 'Aucun provider à vérifier', stats })
    }

    const token = await getToken()
    const radieIds: string[] = []
    let capReached = false

    // Traiter par batch
    for (let i = 0; i < validProviders.length; i += BATCH_SIZE) {
      // SLA-99.9 : wall-clock guard (1 batch = 1 fetch INSEE + 2.2s sleep ≈ 3-5s).
      if (Date.now() - startedAt > MAX_RUNTIME_MS) {
        capReached = true
        stats.skipped += validProviders.length - i
        logger.warn('check-radiees: wall-clock cap reached, stopping batch loop', {
          processed: i,
          remaining: validProviders.length - i,
        })
        break
      }

      const batch = validProviders.slice(i, i + BATCH_SIZE)
      const sirets = batch.map((p) => p.siret as string)

      try {
        // Requête INSEE: chercher ces SIRET
        const query = sirets.map((s) => `siret:${s}`).join(' OR ')
        const url = new URL(`${SIRENE_CONFIG.baseUrl}/siret`)
        url.searchParams.set('q', query)
        url.searchParams.set('nombre', BATCH_SIZE.toString())
        url.searchParams.set('champs', 'siret,periodesEtablissement')

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })

        if (response.status === 429) {
          logger.warn('check-radiees: rate limited, stopping early')
          stats.skipped += validProviders.length - i
          break
        }

        if (response.status === 404) {
          // Aucun résultat — tous les SIRET de ce batch sont inconnus ou radiés
          for (const p of batch) {
            radieIds.push(p.id)
            logger.info(`check-radiees: SIRET introuvable ${p.siret} (${p.name})`)
          }
          stats.checked += batch.length
          continue
        }

        if (!response.ok) {
          const errText = await response.text()
          logger.error(`check-radiees: INSEE error ${response.status}`, { body: errText })
          stats.errors += batch.length
          continue
        }

        const data = await response.json()
        const etablissements = data.etablissements || []

        // Créer un map siret -> état
        const etatMap = new Map<string, string>()
        for (const etab of etablissements) {
          const periode = etab.periodesEtablissement?.[0]
          const etat = periode?.etatAdministratifEtablissement || 'A'
          etatMap.set(etab.siret, etat)
        }

        // Vérifier chaque provider du batch
        for (const p of batch) {
          const etat = etatMap.get(p.siret as string)
          if (!etat) {
            // SIRET pas dans la réponse = introuvable
            radieIds.push(p.id)
            logger.info(`check-radiees: SIRET absent de la réponse ${p.siret} (${p.name})`)
          } else if (etat === 'F') {
            // F = Fermé (radié)
            radieIds.push(p.id)
            logger.info(`check-radiees: RADIÉE ${p.siret} (${p.name})`)
          }
          stats.checked++
        }
      } catch (batchErr) {
        // SLA-99.9 : per-batch try/catch — l'échec d'un batch ne casse pas le run.
        logger.error('check-radiees: batch error', batchErr)
        stats.errors += batch.length
      }

      // Pause entre les batchs pour respecter le rate limit (30 req/min).
      // SLA-99.9 : on ne sleep que si on a encore du budget wall-clock.
      if (i + BATCH_SIZE < validProviders.length) {
        if (Date.now() - startedAt + 2200 > MAX_RUNTIME_MS) {
          capReached = true
          stats.skipped += validProviders.length - (i + BATCH_SIZE)
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 2200))
      }
    }

    // Désactiver les providers radiés (best-effort, même si cap reached).
    if (radieIds.length > 0) {
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .in('id', radieIds)

      if (updateError) {
        logger.error('check-radiees: failed to deactivate providers', updateError)
        return NextResponse.json({ error: 'Échec de la mise à jour', stats }, { status: 500 })
      }

      stats.radiees = radieIds.length
      logger.info(`check-radiees: ${radieIds.length} providers désactivés`)
    }

    logger.info('check-radiees: terminé', { ...stats, cap_reached: capReached })
    return NextResponse.json({
      success: true,
      stats,
      cap_reached: capReached,
      duration_ms: Date.now() - startedAt,
    })
  } catch (err) {
    logger.error('check-radiees: fatal error', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  } finally {
    // SLA-99.9 : release best-effort.
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})
