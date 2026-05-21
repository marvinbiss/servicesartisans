/**
 * GraphQL resolvers — Pillar 2 RGE-OS.
 *
 * Chaque resolver wrappe une lib existante :
 *   - rgeLookup / rgeSearch : Supabase admin queries (cohérent avec
 *     /api/v1/rge/{lookup,search})
 *   - mprBareme  : computeMprAmount(EligibilityInput) — Ralph 12
 *   - ceeBareme  : computeCEEAmount(CalculCEEInput)   — Ralph 14
 *   - cumulRules : CUMUL_RULES_2026 (Ralph 14)
 *
 * Les resolvers retournent des objets plats. La projection des
 * selection sets se fait dans l'executor (`projectSelection`).
 */

import { createAdminClient } from '@/lib/supabase/admin'
import {
  computeMprAmount,
  type Geste as MprGeste,
  type Zone as MprZone,
  type MenageCategorie,
} from '@/lib/aides'
import {
  computeCEEAmount,
  CUMUL_RULES_2026,
  type Geste as CeeGeste,
  type ZoneClimatique,
  type CalculCEEInput,
} from '@/lib/cee'

export type ResolverContext = {
  ip: string
}

export type Resolver = (args: Record<string, unknown>, ctx: ResolverContext) => Promise<unknown>

const ALL_MPR_GESTES: ReadonlyArray<MprGeste> = [
  'pac_air_eau',
  'pac_geothermique',
  'pac_air_air',
  'chauffe_eau_thermo',
  'isolation_combles',
  'isolation_ite',
  'isolation_planchers_bas',
  'vmc_double_flux',
  'chaudiere_biomasse',
  'audit_energetique',
]

const ALL_MENAGE_CATS: ReadonlyArray<MenageCategorie> = [
  'tres_modeste',
  'modeste',
  'intermediaire',
  'superieur',
]

const ALL_MPR_ZONES: ReadonlyArray<MprZone> = ['idf', 'hors_idf']

const ALL_CEE_ZONES: ReadonlyArray<ZoneClimatique> = ['H1', 'H2', 'H3']

const ALL_TYPE_LOGEMENT_INPUT: ReadonlyArray<CalculCEEInput['typeLogement']> = [
  'maison_individuelle',
  'appartement',
]

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Argument "${field}" must be a non-empty string`)
  }
  return value
}

function asInt(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error(`Argument "${field}" must be an integer`)
  }
  return value
}

function asEnum<T extends string>(value: unknown, field: string, allowed: ReadonlyArray<T>): T {
  const str = asString(value, field)
  if (!(allowed as ReadonlyArray<string>).includes(str)) {
    throw new Error(`Argument "${field}" must be one of [${allowed.join(', ')}], got "${str}"`)
  }
  return str as T
}

function readInputObject(args: Record<string, unknown>): Record<string, unknown> {
  const input = args.input
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Argument "input" must be an object')
  }
  return input as Record<string, unknown>
}

export const resolvers: Record<string, Resolver> = {
  rgeLookup: async (args) => {
    const siretRaw = asString(args.siret, 'siret')
    const siret = siretRaw.replace(/\s+/g, '')
    if (!/^\d{14}$/.test(siret)) {
      throw new Error('Argument "siret" must be 14 digits')
    }
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('providers')
      .select(
        'siret, name, address_city, address_department, rge_qualifications, is_active, noindex'
      )
      .eq('siret', siret)
      .eq('is_active', true)
      .eq('noindex', false)
      .limit(1)
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    const row = (data ?? [])[0]
    if (!row) return null
    const quals = Array.isArray(row.rge_qualifications)
      ? (row.rge_qualifications as Array<Record<string, unknown>>)
      : []
    return {
      siret: row.siret,
      nom: row.name,
      ville: row.address_city ?? null,
      departement: row.address_department ?? null,
      qualifications: quals.map((q) => ({
        code: typeof q.code === 'string' ? q.code : null,
        libelle:
          typeof q.libelle === 'string' ? q.libelle : typeof q.nom === 'string' ? q.nom : null,
        date_debut: typeof q.date_debut === 'string' ? q.date_debut : null,
        date_fin: typeof q.date_fin === 'string' ? q.date_fin : null,
      })),
    }
  },

  rgeSearch: async (args) => {
    const metier = asString(args.metier, 'metier')
    const ville = asString(args.ville, 'ville')
    let limit = 20
    if (args.limit !== undefined) {
      limit = asInt(args.limit, 'limit')
      limit = Math.min(Math.max(1, limit), 50)
    }
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('providers')
      .select('siret, name, rge_qualifications')
      .ilike('address_city', `%${ville}%`)
      .not('rge_qualifications', 'is', null)
      .eq('is_active', true)
      .eq('noindex', false)
      .limit(limit)
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    const results = (data ?? []).map((p) => ({
      siret: p.siret as string,
      nom: p.name as string,
      qualifications_count: Array.isArray(p.rge_qualifications)
        ? (p.rge_qualifications as unknown[]).length
        : 0,
    }))
    return {
      metier,
      ville,
      results,
      total: results.length,
    }
  },

  mprBareme: async (args) => {
    const input = readInputObject(args)
    const geste = asEnum(input.geste, 'input.geste', ALL_MPR_GESTES)
    const menageCategorie = asEnum(input.menageCategorie, 'input.menageCategorie', ALL_MENAGE_CATS)
    const zone = asEnum(input.zone, 'input.zone', ALL_MPR_ZONES)
    const rfr = asInt(input.rfr, 'input.rfr')
    const nbPersonnes = asInt(input.nbPersonnes, 'input.nbPersonnes')
    if (rfr < 0) throw new Error('Argument "input.rfr" must be >= 0')
    if (nbPersonnes < 1) throw new Error('Argument "input.nbPersonnes" must be >= 1')
    const result = computeMprAmount({ geste, zone, rfr, nbPersonnes })
    return {
      result: {
        eligible: result.eligible,
        amountEUR: result.eligible ? result.amountEUR : null,
        sourceRef: result.sourceRef,
        reason: result.eligible ? null : result.reason,
        notes: result.eligible ? (result.notes ?? null) : null,
      },
      input: { geste, menageCategorie, zone, rfr, nbPersonnes },
    }
  },

  ceeBareme: async (args) => {
    const input = readInputObject(args)
    const geste = asEnum(input.geste, 'input.geste', ALL_MPR_GESTES) as CeeGeste
    const zoneClimatique = asEnum(input.zoneClimatique, 'input.zoneClimatique', ALL_CEE_ZONES)
    const typeLogement = asEnum(input.typeLogement, 'input.typeLogement', ALL_TYPE_LOGEMENT_INPUT)
    const menageCategorie = asEnum(input.menageCategorie, 'input.menageCategorie', ALL_MENAGE_CATS)
    const result = computeCEEAmount({
      geste,
      zone: zoneClimatique,
      typeLogement,
      menageCategorie,
    })
    return {
      result: {
        eligible: result.eligible,
        montantTotalEur: result.eligible ? result.montantTotalEur : null,
        kwhCumacForfait: result.eligible ? result.kwhCumacForfait : null,
        kwhCumacAvecBonus: result.eligible ? result.kwhCumacAvecBonus : null,
        bonusMultiplicateur: result.eligible ? result.bonusMultiplicateur : null,
        prixUnitaireEurParMWh: result.eligible ? result.prixUnitaireEurParMWh : null,
        fiche: result.eligible ? result.fiche : null,
        reason: result.eligible ? null : result.reason,
        notes: result.eligible ? (result.notes ?? null) : null,
      },
      input: { geste, zoneClimatique, typeLogement, menageCategorie },
    }
  },

  cumulRules: async () => {
    return {
      rules: CUMUL_RULES_2026.map((r) => ({
        geste: r.geste,
        cumulableMPR: r.cumulableMPR,
        cumulableEcoPTZ: r.cumulableEcoPTZ,
        cumulableTVA55: r.cumulableTVA55,
        notes: r.notes ?? null,
      })),
    }
  },
}
