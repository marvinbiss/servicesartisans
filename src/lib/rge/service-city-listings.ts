/**
 * RGE service × city listings
 * ---------------------------
 * Pipeline pSEO dédié `/rge/[service]/[ville]` : liste les artisans
 * disposant d'une qualification RGE ADEME active pour un métier énergétique
 * donné dans une ville donnée.
 *
 * Contraintes :
 * - `rge_qualifications IS NOT NULL`
 * - `rge_valid_until >= CURRENT_DATE`
 * - `specialty IN SERVICE_TO_SPECIALTIES[serviceSlug]`
 * - `address_city IN getCityValues(ville)`
 *
 * Les services sont restreints à une allowlist énergétique stricte : seul un
 * artisan métier énergie/enveloppe peut légitimement afficher une qualif RGE
 * côté MaPrimeRénov'/CEE. Toute autre spécialité est rejetée en `notFound()`.
 */

import { supabase, SERVICE_TO_SPECIALTIES, IS_BUILD } from '@/lib/supabase'
import { getVilleBySlug } from '@/lib/data/france'
import { getCityValues, resolveProviderCities } from '@/lib/insee-resolver'
import { getCachedData, CACHE_TTL } from '@/lib/cache'
import { logger } from '@/lib/logger'
import { notifyFailOpen } from '@/lib/monitoring/fail-open'
import type { Provider } from '@/types'

/**
 * Allowlist des services éligibles RGE (métiers énergie + enveloppe du bâti).
 * Toute autre clé doit déclencher un notFound() côté route.
 */
export const RGE_ALLOWED_SERVICES = [
  'pompe-a-chaleur',
  'panneaux-solaires',
  'isolation-thermique',
  'chauffagiste',
  'electricien',
  'renovation-energetique',
  'menuisier',
  'couvreur',
  'plombier',
  'climaticien',
  'ramoneur',
  'zingueur',
  'facadier',
  'platrier',
  // Élargissement RGE 2026-05-02 :
  //   - borne-recharge   : qualif Qualifelec IRVE (P1/P2/P3) — quick win, slug
  //                        déjà présent dans VALID_SERVICE_SLUGS + france-light.
  //   - chauffe-eau-thermodynamique : QualiPAC module CET + BAR-TH-148.
  //   - audit-energetique : architecte CNOA + BET OPQIBI 1905/1911 — funnel
  //                         d'entrée mandataire CEE Sonergia.
  //   - ventilation       : Qualibat 4311 / 4321 + BAR-TH-125 (VMC double flux).
  //   - fenetres          : Qualibat menuiserie + BAR-EN-104 / BAR-EN-108.
  // Ces 5 services sont RGE-only (pas de hub /services/[slug]) : ils n'ajoutent
  // rien dans VALID_SERVICE_SLUGS / france-light, uniquement /rge/[s]/[v].
  'borne-recharge',
  'chauffe-eau-thermodynamique',
  'audit-energetique',
  'ventilation',
  'fenetres',
] as const

export type RgeAllowedService = (typeof RGE_ALLOWED_SERVICES)[number]

export function isRgeAllowedService(slug: string): slug is RgeAllowedService {
  return (RGE_ALLOWED_SERVICES as readonly string[]).includes(slug)
}

/**
 * Display names pour les slugs RGE-only (élargissement 2026-05-02).
 *
 * Ces slugs n'existent pas dans `france-light.services` (pas de hub
 * `/services/[slug]`) ni dans la table `services` côté DB. `getServiceBySlug`
 * renvoie donc `null` pour eux et le rendu pSEO retombe sur le slug brut.
 *
 * Cette table fournit un fallback humain pour `/rge/[service]/[ville]` et
 * `/rge/[service]/departement/[dept]` afin que le H1 / metaTitle / breadcrumb
 * affichent un libellé propre (« Chauffe-eau thermodynamique » plutôt que
 * « chauffe-eau-thermodynamique »).
 *
 * Les services RGE historiques (pompe-a-chaleur, etc.) restent résolus via
 * `getServiceBySlug` car ils existent dans france.ts.
 */
export const RGE_VIRTUAL_SERVICE_NAMES: Record<string, string> = {
  'borne-recharge': 'Borne de recharge',
  'chauffe-eau-thermodynamique': 'Chauffe-eau thermodynamique',
  'audit-energetique': 'Audit énergétique',
  ventilation: 'Ventilation (VMC)',
  fenetres: 'Fenêtres performantes',
}

/**
 * Renvoie le libellé humain à afficher pour un slug RGE. Préfère le `name`
 * issu de `getServiceBySlug` (DB ou static france.ts), sinon retombe sur
 * `RGE_VIRTUAL_SERVICE_NAMES`, sinon retourne le slug brut.
 *
 * Pure helper — utilisable en metadata generation et rendu SSR.
 */
export function resolveRgeServiceDisplayName(
  slug: string,
  fromDbOrStatic: string | null | undefined
): string {
  if (fromDbOrStatic && fromDbOrStatic.length > 0) return fromDbOrStatic
  return RGE_VIRTUAL_SERVICE_NAMES[slug] ?? slug
}

/**
 * Mapping service énergétique → qualification RGE de référence (marque + organisme).
 * Utilisé pour personnaliser l'intro SEO de la page avec le bon label "QualiPAC",
 * "QualiSol", etc. Fallback générique "RGE" pour les services moins typés.
 */
export const RGE_QUALIFICATION_LABELS: Record<
  string,
  { label: string; organisme: string; specifics: string }
> = {
  'pompe-a-chaleur': {
    label: 'QualiPAC',
    organisme: 'Qualit\u2019EnR',
    specifics: 'installation de pompes \u00e0 chaleur (a\u00e9rothermique et g\u00e9othermique)',
  },
  'panneaux-solaires': {
    label: 'QualiPV / QualiSol',
    organisme: 'Qualit\u2019EnR',
    specifics: 'panneaux photovolta\u00efques et solaires thermiques',
  },
  chauffagiste: {
    label: 'QualiBois / Chauffage +',
    organisme: 'Qualibat / Qualit\u2019EnR',
    specifics: 'syst\u00e8mes de chauffage performants (bois, gaz condensation, hybrides)',
  },
  'isolation-thermique': {
    label: 'Qualibat RGE',
    organisme: 'Qualibat',
    specifics:
      'isolation thermique par l\u2019int\u00e9rieur (ITI) et par l\u2019ext\u00e9rieur (ITE)',
  },
  'renovation-energetique': {
    label: 'RGE \u00e9co-artisan',
    organisme: 'Qualibat / Qualifelec',
    specifics:
      'r\u00e9novation \u00e9nerg\u00e9tique globale et accompagnement MaPrimeR\u00e9nov\u2019',
  },
  electricien: {
    label: 'Qualifelec RGE',
    organisme: 'Qualifelec',
    specifics: 'bornes de recharge, photovolta\u00efque et solutions \u00e9lectriques performantes',
  },
  menuisier: {
    label: 'Qualibat RGE menuiserie',
    organisme: 'Qualibat',
    specifics: 'remplacement de fen\u00eatres, portes et menuiseries performantes',
  },
  couvreur: {
    label: 'Qualibat RGE couverture',
    organisme: 'Qualibat',
    specifics: 'isolation de toiture et couverture \u00e9co-performante',
  },
  zingueur: {
    label: 'Qualibat RGE couverture',
    organisme: 'Qualibat',
    specifics: 'isolation de toiture, zinguerie et couverture performante',
  },
  facadier: {
    label: 'Qualibat RGE ITE',
    organisme: 'Qualibat',
    specifics: 'isolation thermique par l\u2019ext\u00e9rieur (ITE) et ravalement performant',
  },
  platrier: {
    label: 'Qualibat RGE ITI',
    organisme: 'Qualibat',
    specifics: 'isolation thermique par l\u2019int\u00e9rieur (ITI) et cloisons isolantes',
  },
  plombier: {
    label: 'Chauffage +',
    organisme: 'Qualibat / Qualit\u2019EnR',
    specifics: 'chauffe-eau thermodynamiques et solutions ECS performantes',
  },
  climaticien: {
    label: 'QualiPAC',
    organisme: 'Qualit\u2019EnR',
    specifics: 'climatisation r\u00e9versible et pompes \u00e0 chaleur air/air',
  },
  ramoneur: {
    label: 'QualiBois Entretien',
    organisme: 'Qualit\u2019EnR',
    specifics: 'entretien d\u2019appareils de chauffage bois et ramonage certifi\u00e9',
  },
  'borne-recharge': {
    label: 'Qualifelec IRVE',
    organisme: 'Qualifelec',
    specifics:
      'installation de bornes de recharge pour v\u00e9hicules \u00e9lectriques (niveaux P1, P2, P3)',
  },
  'chauffe-eau-thermodynamique': {
    label: 'QualiPAC module CET',
    organisme: 'Qualit\u2019EnR',
    specifics:
      'installation de chauffe-eau thermodynamiques (CET) \u00e9ligibles MaPrimeR\u00e9nov\u2019 et CEE BAR-TH-148',
  },
  'audit-energetique': {
    label: 'OPQIBI 1905/1911 / Architecte CNOA',
    organisme: 'OPQIBI / CNOA',
    specifics:
      'audit \u00e9nerg\u00e9tique r\u00e9glementaire (DPE projet\u00e9, sc\u00e9narios r\u00e9novation d\u2019ampleur)',
  },
  ventilation: {
    label: 'Qualibat RGE ventilation',
    organisme: 'Qualibat',
    specifics: 'VMC simple flux hygror\u00e9glable et double flux haute performance (BAR-TH-125)',
  },
  fenetres: {
    label: 'Qualibat RGE menuiserie',
    organisme: 'Qualibat',
    specifics:
      'remplacement de fen\u00eatres et baies isolantes \u00e9ligibles MaPrimeR\u00e9nov\u2019 (BAR-EN-104 / BAR-EN-108)',
  },
}

export interface RgeServiceCityListing {
  providers: Provider[]
  count: number
}

/**
 * Sprint 2 Phase E 2026-05-04 — filtre opt-in catégorie décret 2014-812.
 *
 * Pour les services RGE-only où SERVICE_TO_SPECIALTIES retourne une union
 * large de specialties (ex: `audit-energetique` inclut `geometre` qui couvre
 * 88% des cat 17 mais aussi des géomètres-experts pure délimitation), on
 * applique un filtre additionnel `rge_categories_decret @> [N]` pour ne
 * remonter QUE les providers ayant explicitement la catégorie pertinente.
 *
 * Ce filtre est opt-in : les services historiques (PAC, isolation, etc.)
 * gardent le comportement legacy (specialty-based seulement) car leur
 * specialty est déjà discriminante.
 *
 * Source : décret n°2014-812 article 1er I (17 catégories), cf. migration 404.
 *
 * - 17 = Rénovation globale + Mon Accompagnateur Rénov' + Audit énergétique
 *   (BET OPQIBI 1905/1911, architectes CNOA, géomètres-experts mention rénov)
 */
const RGE_DECRET_FILTER: Partial<Record<RgeAllowedService, number>> = {
  'audit-energetique': 17,
}

/**
 * Récupère les artisans RGE actifs pour un couple (service, ville).
 * - pagination 50 par défaut
 * - cache via getCachedData (CACHE_TTL.artisans = 1h)
 * - fail-safe : retourne liste vide sur erreur (la page passe en noindex)
 */
export async function getRgeProvidersByServiceAndCity(
  serviceSlug: string,
  villeSlug: string,
  { limit = 50, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<RgeServiceCityListing> {
  if (IS_BUILD) return { providers: [], count: 1 } // fail-open: keep pages indexed during build

  if (!isRgeAllowedService(serviceSlug)) {
    return { providers: [], count: 0 }
  }

  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return { providers: [], count: 0 }

  const ville = getVilleBySlug(villeSlug)
  if (!ville) return { providers: [], count: 0 }

  const cityValues = getCityValues(ville.name, ville.departementCode)
  const today = new Date().toISOString().slice(0, 10)
  // Sprint 2 Phase E : filtre catégorie décret opt-in (cf. RGE_DECRET_FILTER).
  const decretCategory = isRgeAllowedService(serviceSlug)
    ? RGE_DECRET_FILTER[serviceSlug]
    : undefined

  // Cache version v2 quand filtre décret actif → invalide les anciennes
  // entrées qui ne contenaient pas la coupe par catégorie.
  const cacheVersion = decretCategory !== undefined ? ':v2' : ''
  const cacheKey = `rge:svc-city:${serviceSlug}:${villeSlug}:${limit}:${offset}${cacheVersion}`

  return getCachedData<RgeServiceCityListing>(
    cacheKey,
    async () => {
      try {
        let query = supabase
          .from('providers')
          .select(
            [
              'id',
              'stable_id',
              'name',
              'slug',
              'specialty',
              'address_street',
              'address_postal_code',
              'address_city',
              'address_region',
              'is_verified',
              'is_active',
              'noindex',
              'rating_average',
              'review_count',
              'phone',
              'siret',
              'latitude',
              'longitude',
              'user_id',
              'created_at',
              'updated_at',
              'rge_qualifications',
              'rge_valid_until',
              'rge_organismes',
              'rge_source_url',
            ].join(','),
            { count: 'exact' }
          )
          .in('specialty', specialties)
          .in('address_city', cityValues)
          .eq('is_active', true)
          .not('rge_qualifications', 'is', null)
          .gte('rge_valid_until', today)

        if (decretCategory !== undefined) {
          query = query.contains('rge_categories_decret', [decretCategory])
        }

        const { data, error, count } = await query
          .order('phone', { ascending: false, nullsFirst: false })
          .order('is_verified', { ascending: false })
          .order('name')
          .range(offset, offset + limit - 1)

        if (error) throw error

        // Cast aligné avec resolveProviderCities (lightweight row shape)
        const providers = resolveProviderCities(
          (data || []) as unknown as Array<{
            address_city?: string | null
            address_region?: string | null
          }>
        ) as unknown as Provider[]

        return { providers, count: count ?? providers.length }
      } catch (err) {
        notifyFailOpen('rge-list-by-service-city', err, {
          key: `${serviceSlug}:${villeSlug}`,
        })
        return { providers: [], count: 0 }
      }
    },
    CACHE_TTL.artisans, // 1h
    { skipNull: true }
  )
}

/**
 * Récupère les artisans RGE actifs pour un couple (service, département).
 * Filtrage par `address_department` (CODE INSEE 2-3 chars : "75", "69", "2A").
 * Le seeding sirene stocke `codePostalEtablissement.substring(0,2)` → code,
 * pas un nom. Passer un nom ("Paris") renvoie 0 silencieusement et noindex
 * massivement les pages /rge — bug confirmé 2026-05-05.
 * - pagination 50 par défaut
 * - cache via getCachedData (CACHE_TTL.artisans = 1h)
 * - fail-safe : retourne liste vide sur erreur (la page passe en noindex)
 */
export async function getRgeProvidersByServiceAndDepartement(
  serviceSlug: string,
  departementCode: string,
  { limit = 50, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<RgeServiceCityListing> {
  if (IS_BUILD) return { providers: [], count: 1 } // fail-open: keep pages indexed during build

  if (!isRgeAllowedService(serviceSlug)) {
    return { providers: [], count: 0 }
  }

  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return { providers: [], count: 0 }

  const today = new Date().toISOString().slice(0, 10)
  // Sprint 2 Phase E : filtre catégorie décret opt-in (cf. RGE_DECRET_FILTER).
  const decretCategory = isRgeAllowedService(serviceSlug)
    ? RGE_DECRET_FILTER[serviceSlug]
    : undefined
  const cacheVersion = decretCategory !== undefined ? ':v2' : ''
  // encodeURIComponent prevents segment ambiguity in cache keys (accents,
  // hyphens, theoretical colons) — see security audit MED finding.
  const cacheKey = `rge:svc-dept:${serviceSlug}:${encodeURIComponent(departementCode)}:${limit}:${offset}${cacheVersion}`

  return getCachedData<RgeServiceCityListing>(
    cacheKey,
    async () => {
      try {
        let query = supabase
          .from('providers')
          .select(
            [
              'id',
              'stable_id',
              'name',
              'slug',
              'specialty',
              'address_street',
              'address_postal_code',
              'address_city',
              'address_region',
              'is_verified',
              'is_active',
              'noindex',
              'rating_average',
              'review_count',
              'phone',
              'siret',
              'latitude',
              'longitude',
              'user_id',
              'created_at',
              'updated_at',
              'rge_qualifications',
              'rge_valid_until',
              'rge_organismes',
              'rge_source_url',
            ].join(','),
            { count: 'exact' }
          )
          .in('specialty', specialties)
          .eq('address_department', departementCode)
          .eq('is_active', true)
          .not('rge_qualifications', 'is', null)
          .gte('rge_valid_until', today)

        if (decretCategory !== undefined) {
          query = query.contains('rge_categories_decret', [decretCategory])
        }

        const { data, error, count } = await query
          .order('phone', { ascending: false, nullsFirst: false })
          .order('is_verified', { ascending: false })
          .order('name')
          .range(offset, offset + limit - 1)

        if (error) throw error

        const providers = resolveProviderCities(
          (data || []) as unknown as Array<{
            address_city?: string | null
            address_region?: string | null
          }>
        ) as unknown as Provider[]

        return { providers, count: count ?? providers.length }
      } catch (err) {
        notifyFailOpen('rge-list-by-service-dept', err, {
          key: `${serviceSlug}:${departementCode}`,
        })
        return { providers: [], count: 0 }
      }
    },
    CACHE_TTL.artisans,
    { skipNull: true }
  )
}

/**
 * RGE count (service × ville) — variante stricte pour la stratégie 410.
 *
 * Contrairement à `getRgeProvidersByServiceAndCity` qui fail-open silencieux
 * (retourne count=0 en cas d'erreur DB), cette variante renvoie un
 * discriminant explicite : `ok=true` si le count a pu être établi (y compris
 * 0 légitime), `ok=false` si une erreur transitoire s'est produite.
 *
 * Usage côté page : si `ok=false` → ne pas notFound(), fallback indexable.
 *
 * Pendant le build (IS_BUILD), retourne `{ ok: true, count: 1 }` pour rester
 * aligné avec la politique fail-open générale (évite de 404 toutes les pages
 * pré-rendues au build sans DB).
 */
export async function getRgeCountByServiceAndCityStrict(
  serviceSlug: string,
  villeSlug: string
): Promise<{ ok: true; count: number } | { ok: false }> {
  if (IS_BUILD) return { ok: true, count: 1 }

  if (!isRgeAllowedService(serviceSlug)) return { ok: true, count: 0 }

  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return { ok: true, count: 0 }

  const ville = getVilleBySlug(villeSlug)
  if (!ville) return { ok: true, count: 0 }

  const cityValues = getCityValues(ville.name, ville.departementCode)
  const today = new Date().toISOString().slice(0, 10)
  // Sprint 2 Phase E : filtre catégorie décret opt-in (cf. RGE_DECRET_FILTER).
  const decretCategory = isRgeAllowedService(serviceSlug)
    ? RGE_DECRET_FILTER[serviceSlug]
    : undefined

  try {
    let query = supabase
      .from('providers')
      .select('id', { count: 'exact', head: true })
      .in('specialty', specialties)
      .in('address_city', cityValues)
      .eq('is_active', true)
      .not('rge_qualifications', 'is', null)
      .gte('rge_valid_until', today)

    if (decretCategory !== undefined) {
      query = query.contains('rge_categories_decret', [decretCategory])
    }

    const { count, error } = await query

    if (error) throw error
    return { ok: true, count: count ?? 0 }
  } catch (err) {
    logger.warn(
      `[getRgeCountByServiceAndCityStrict] transient error for ${serviceSlug}/${villeSlug}`,
      { error: err instanceof Error ? err.message : err }
    )
    return { ok: false }
  }
}

/**
 * Variante stricte pour le couple (service, département).
 * Même sémantique que `getRgeCountByServiceAndCityStrict`.
 * `departementCode` = CODE INSEE 2-3 chars ('75', '69', '2A'), aligné DB.
 */
export async function getRgeCountByServiceAndDepartementStrict(
  serviceSlug: string,
  departementCode: string
): Promise<{ ok: true; count: number } | { ok: false }> {
  if (IS_BUILD) return { ok: true, count: 1 }

  if (!isRgeAllowedService(serviceSlug)) return { ok: true, count: 0 }

  const specialties = SERVICE_TO_SPECIALTIES[serviceSlug]
  if (!specialties || specialties.length === 0) return { ok: true, count: 0 }

  const today = new Date().toISOString().slice(0, 10)
  // Sprint 2 Phase E : filtre catégorie décret opt-in (cf. RGE_DECRET_FILTER).
  const decretCategory = isRgeAllowedService(serviceSlug)
    ? RGE_DECRET_FILTER[serviceSlug]
    : undefined

  try {
    let query = supabase
      .from('providers')
      .select('id', { count: 'exact', head: true })
      .in('specialty', specialties)
      .eq('address_department', departementCode)
      .eq('is_active', true)
      .not('rge_qualifications', 'is', null)
      .gte('rge_valid_until', today)

    if (decretCategory !== undefined) {
      query = query.contains('rge_categories_decret', [decretCategory])
    }

    const { count, error } = await query

    if (error) throw error
    return { ok: true, count: count ?? 0 }
  } catch (err) {
    logger.warn(
      `[getRgeCountByServiceAndDepartementStrict] transient error for ${serviceSlug}/${departementCode}`,
      { error: err instanceof Error ? err.message : err }
    )
    return { ok: false }
  }
}
