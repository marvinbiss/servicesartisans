/**
 * Validation des query params pour les routes `/api/v1/aides/*`.
 *
 * Approche zéro-dépendance : pas de Zod côté handlers — on veut un footprint
 * minimal pour ces endpoints publics fortement cachables. Chaque validator
 * renvoie un discriminated union `{ ok: true; value }` | `{ ok: false; error }`
 * que le handler agrège avant d'émettre un 400 unique listant toutes les
 * erreurs (UX dev : une seule requête suffit à voir tout ce qui manque).
 *
 * Les enums sont alignés sur les types Ralph 12 (`@/lib/aides`) et Ralph 14
 * (`@/lib/cee`) — toute évolution là-bas casse ici via tsc (intentionnel).
 */

import type { Geste, MenageCategorie, Zone } from '@/lib/aides'
import type { ZoneClimatique } from '@/lib/cee'

const VALID_GESTES = new Set<Geste>([
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
])

const VALID_MENAGE_CAT = new Set<MenageCategorie>([
  'tres_modeste',
  'modeste',
  'intermediaire',
  'superieur',
])

const VALID_ZONES = new Set<Zone>(['idf', 'hors_idf'])

const VALID_ZONES_CLIMATIQUES = new Set<ZoneClimatique>(['H1', 'H2', 'H3'])

const VALID_TYPE_LOGEMENT = new Set<'maison_individuelle' | 'appartement'>([
  'maison_individuelle',
  'appartement',
])

export type ValidationError = { field: string; message: string }

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: ValidationError }

export function validateGeste(raw: string | null): ValidationResult<Geste> {
  if (!raw) return { ok: false, error: { field: 'geste', message: 'required' } }
  if (!VALID_GESTES.has(raw as Geste)) {
    return {
      ok: false,
      error: { field: 'geste', message: `must be one of: ${Array.from(VALID_GESTES).join(', ')}` },
    }
  }
  return { ok: true, value: raw as Geste }
}

export function validateMenageCat(raw: string | null): ValidationResult<MenageCategorie> {
  if (!raw) return { ok: false, error: { field: 'menage_categorie', message: 'required' } }
  if (!VALID_MENAGE_CAT.has(raw as MenageCategorie)) {
    return {
      ok: false,
      error: {
        field: 'menage_categorie',
        message: `must be one of: ${Array.from(VALID_MENAGE_CAT).join(', ')}`,
      },
    }
  }
  return { ok: true, value: raw as MenageCategorie }
}

export function validateZone(raw: string | null): ValidationResult<Zone> {
  if (!raw) return { ok: false, error: { field: 'zone', message: 'required (idf | hors_idf)' } }
  if (!VALID_ZONES.has(raw as Zone)) {
    return { ok: false, error: { field: 'zone', message: 'must be idf or hors_idf' } }
  }
  return { ok: true, value: raw as Zone }
}

export function validateZoneClimatique(raw: string | null): ValidationResult<ZoneClimatique> {
  if (!raw) {
    return { ok: false, error: { field: 'zone_climatique', message: 'required (H1 | H2 | H3)' } }
  }
  if (!VALID_ZONES_CLIMATIQUES.has(raw as ZoneClimatique)) {
    return { ok: false, error: { field: 'zone_climatique', message: 'must be H1, H2 or H3' } }
  }
  return { ok: true, value: raw as ZoneClimatique }
}

export function validateTypeLogement(
  raw: string | null
): ValidationResult<'maison_individuelle' | 'appartement'> {
  if (!raw) {
    return {
      ok: false,
      error: {
        field: 'type_logement',
        message: 'required (maison_individuelle | appartement)',
      },
    }
  }
  if (!VALID_TYPE_LOGEMENT.has(raw as 'maison_individuelle' | 'appartement')) {
    return {
      ok: false,
      error: {
        field: 'type_logement',
        message: 'must be maison_individuelle or appartement',
      },
    }
  }
  return { ok: true, value: raw as 'maison_individuelle' | 'appartement' }
}

export function validatePositiveInt(raw: string | null, field: string): ValidationResult<number> {
  if (!raw) return { ok: false, error: { field, message: 'required' } }
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 0) {
    return { ok: false, error: { field, message: 'must be non-negative integer' } }
  }
  return { ok: true, value: n }
}

export function validateStrictPositiveInt(
  raw: string | null,
  field: string
): ValidationResult<number> {
  if (!raw) return { ok: false, error: { field, message: 'required' } }
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) {
    return { ok: false, error: { field, message: 'must be positive integer (>= 1)' } }
  }
  return { ok: true, value: n }
}
