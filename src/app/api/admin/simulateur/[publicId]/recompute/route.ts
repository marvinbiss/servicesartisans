/**
 * Admin API — Recalcul d'une estimation avec le bareme_version stocké.
 * POST /api/admin/simulateur/:publicId/recompute
 * Permet de vérifier que le résultat est reconstruit à l'identique (<30s).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { runSimulation } from '@/lib/simulateur/engine'
import type {
  Situation,
  Projet,
  Budget,
  GesteId,
  Anciennete,
  CategorieAnah,
  EquipementActuel,
  SautsDpe,
} from '@/lib/simulateur/types'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const auth = await requirePermission('simulateur', 'read')
  if (!auth.success || !auth.admin) return auth.error!

  const { publicId } = await params
  if (!/^EST-\d{4}-\d{2}-\d{2}-[a-z0-9]{6,12}$/.test(publicId)) {
    return NextResponse.json(
      { success: false, error: 'Format public_id invalide' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('simulateur_estimations')
      .select('*')
      .eq('public_id', publicId)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Estimation introuvable' },
        { status: 404 }
      )
    }

    const situation: Situation = {
      typeLogement: data.type_logement,
      residencePrincipale: data.residence_principale,
      anciennete: data.anciennete as Anciennete,
      surface: data.surface_m2,
      codePostal: data.code_postal,
      zone: data.zone_climatique,
      idf: data.idf,
      foyer: data.foyer_taille,
      rfr: data.rfr,
      categorie: data.categorie_anah as CategorieAnah,
    }

    const gestesIds: GesteId[] = Array.isArray(data.gestes)
      ? (data.gestes as Array<{ id: GesteId }>).map((g) => g.id)
      : []

    const projet: Projet = {
      parcours: data.parcours,
      gestes: gestesIds,
      coupDePouce: data.coup_de_pouce,
      equipementActuel: (data.equipement_actuel ?? 'autre') as EquipementActuel,
      sautsDpe: (data.sauts_dpe ?? undefined) as SautsDpe | undefined,
    }

    // Budget HT : migration 440 stocke budget_ht directement.
    // Fallback sur formule_debug pour les estimations antérieures à la migration.
    const budget: Budget = { budgetHt: 0 }
    const storedBudgetHt =
      typeof data.budget_ht === 'number'
        ? data.budget_ht
        : typeof data.budget_ht === 'string'
          ? Number(data.budget_ht)
          : null
    if (storedBudgetHt != null && Number.isFinite(storedBudgetHt) && storedBudgetHt > 0) {
      budget.budgetHt = storedBudgetHt
    } else {
      const debugBudget = Array.isArray(data.formule_debug)
        ? (data.formule_debug as Array<{ step: string; inputs?: Record<string, unknown> }>).find(
            (d) => d.step === 'calcMPRAccompagne' || d.step === 'applyEcretement'
          )
        : undefined
      if (debugBudget?.inputs) {
        const raw = debugBudget.inputs as Record<string, unknown>
        const ht = typeof raw.budgetHt === 'number' ? raw.budgetHt : undefined
        const ttc = typeof raw.budgetTTC === 'number' ? raw.budgetTTC : undefined
        if (ht) budget.budgetHt = ht
        else if (ttc) budget.budgetHt = Math.round(ttc / 1.055)
      }
    }

    const result = runSimulation({ situation, projet, budget })

    // Compare
    const match =
      Math.round(result.mprTotal) === Math.round(Number(data.mpr_total ?? 0)) &&
      Math.round(result.resteAChargeBas) === Math.round(Number(data.reste_a_charge_bas ?? 0))

    return NextResponse.json({
      success: true,
      stored: {
        mprTotal: data.mpr_total,
        ceeFourchetteBas: data.cee_fourchette_bas,
        ceeFourchetteHaut: data.cee_fourchette_haut,
        resteAChargeBas: data.reste_a_charge_bas,
        resteAChargeHaut: data.reste_a_charge_haut,
        baremeIds: data.bareme_ids,
        barometreVersion: data.barometre_version,
      },
      recomputed: result,
      match,
    })
  } catch (error) {
    logger.error('Admin simulateur recompute exception', error as Error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
