/**
 * CEE catalogue — public data access layer for the 19 seed operations.
 *
 * Source de vérité : table `cee_operations` (migration 382, seed 383).
 * Ces helpers sont utilisés côté pages publiques (/cee, /cee/[op], /cee/[op]/[ville])
 * pour rendre le catalogue d'opérations standardisées CEE découvrable en SEO.
 *
 * Règles :
 *  - Cache L1+L2 6h via getCachedData (évite de taper la DB sur chaque ISR hit)
 *  - Fail-open strict : IS_BUILD → [] / null, erreur DB → [] / null
 *  - Secteur résidentiel uniquement (seul périmètre mandataire CEE à ce stade)
 *  - TypeScript strict, zéro `any`
 */

import { supabase, IS_BUILD } from '@/lib/supabase'
import { getCachedData } from '@/lib/cache'
import { logger } from '@/lib/logger'

const CACHE_TTL_6H = 6 * 60 * 60

/**
 * Domaines CEE résidentiels — aligné sur le CHECK constraint de la migration 382.
 * Toute évolution du CHECK doit être répercutée ici.
 */
export type CeeDomaine =
  | 'enveloppe'
  | 'chauffage'
  | 'ecs'
  | 'ventilation'
  | 'services'
  | 'eclairage'
  | 'autre'

/**
 * Shape publique d'une opération CEE, miroir partiel de la table `cee_operations`.
 * Seuls les champs utiles au rendu public y figurent (on évite d'exposer
 * forfait_base_kwhc, justificatifs_requis, etc. qui sont des data compliance).
 */
export interface CeeOperation {
  code: string
  nom: string
  description: string | null
  secteur: 'residentiel'
  domaine: CeeDomaine
  sous_domaine: string | null
  services_slugs: string[]
  rge_qualifications_requises: string[]
  rge_meta_domaines: string[]
  precarite_eligible: boolean
  classique_eligible: boolean
  unite_mesure: string | null
  coup_de_pouce: boolean
  coup_de_pouce_charte: string | null
  url_fiche_officielle: string | null
  is_active: boolean
}

const CEE_SELECT = [
  'code',
  'nom',
  'description',
  'secteur',
  'domaine',
  'sous_domaine',
  'services_slugs',
  'rge_qualifications_requises',
  'rge_meta_domaines',
  'precarite_eligible',
  'classique_eligible',
  'unite_mesure',
  'coup_de_pouce',
  'coup_de_pouce_charte',
  'url_fiche_officielle',
  'is_active',
].join(',')

/**
 * Valide un code opération CEE (format `XXX-XX-999`).
 * Accepte BAR-EN-101, BAR-TH-129, BAR-SE-104, etc.
 */
export function isValidCeeOperationCode(code: string): boolean {
  return /^[A-Z]{2,3}-[A-Z]{2}-\d{3}$/.test(code)
}

/**
 * Ordre d'affichage des domaines sur le hub /cee — suit la logique d'un
 * parcours rénovation énergétique (enveloppe avant chauffage, services à la fin).
 */
export const CEE_DOMAINE_ORDER: CeeDomaine[] = [
  'enveloppe',
  'chauffage',
  'ecs',
  'ventilation',
  'services',
  'eclairage',
  'autre',
]

export const CEE_DOMAINE_LABELS: Record<CeeDomaine, { label: string; tagline: string }> = {
  enveloppe: {
    label: 'Isolation & enveloppe',
    tagline: 'Combles, murs, planchers, menuiseries — la brique n°1 des économies d\u2019énergie.',
  },
  chauffage: {
    label: 'Chauffage performant',
    tagline: 'Pompes à chaleur, chaudières biomasse, systèmes hybrides bas-carbone.',
  },
  ecs: {
    label: 'Eau chaude sanitaire',
    tagline: 'Chauffe-eau thermodynamiques et solutions ECS économes en énergie.',
  },
  ventilation: {
    label: 'Ventilation',
    tagline: 'VMC simple flux hygroréglable et double flux à récupération de chaleur.',
  },
  services: {
    label: 'Régulation & pilotage',
    tagline: 'Sondes, programmation, pilotage connecté — le petit investissement à fort ROI.',
  },
  eclairage: {
    label: 'Éclairage performant',
    tagline: 'Éclairage LED et systèmes à haute efficacité énergétique.',
  },
  autre: {
    label: 'Autres opérations',
    tagline: 'Opérations standardisées non rattachées aux familles principales.',
  },
}

/**
 * Retourne l'intégralité des opérations CEE résidentielles actives, triées
 * alphabétiquement par code. Cache 6h, fail-open [].
 */
export async function getCeeOperations(): Promise<CeeOperation[]> {
  if (IS_BUILD) return []

  return getCachedData<CeeOperation[]>(
    'cee:catalogue:all:v1',
    async () => {
      try {
        const { data, error } = await supabase
          .from('cee_operations')
          .select(CEE_SELECT)
          .eq('is_active', true)
          .eq('secteur', 'residentiel')
          .order('code', { ascending: true })

        if (error) throw error
        return (data || []) as unknown as CeeOperation[]
      } catch (err) {
        logger.error('[getCeeOperations] FAILED', {
          error: err instanceof Error ? err.message : err,
        })
        return []
      }
    },
    CACHE_TTL_6H,
    { skipNull: true },
  )
}

/**
 * Retourne une opération par son code, ou null si inexistante / DB down.
 * Cache 6h, fail-open null.
 */
export async function getCeeOperationByCode(code: string): Promise<CeeOperation | null> {
  if (IS_BUILD) return null
  if (!isValidCeeOperationCode(code)) return null

  return getCachedData<CeeOperation | null>(
    `cee:catalogue:code:${code}:v1`,
    async () => {
      try {
        const { data, error } = await supabase
          .from('cee_operations')
          .select(CEE_SELECT)
          .eq('is_active', true)
          .eq('secteur', 'residentiel')
          .eq('code', code)
          .maybeSingle()

        if (error) throw error
        return (data as unknown as CeeOperation) || null
      } catch (err) {
        logger.error(`[getCeeOperationByCode] FAILED for ${code}`, {
          error: err instanceof Error ? err.message : err,
        })
        return null
      }
    },
    CACHE_TTL_6H,
    { skipNull: true },
  )
}

/**
 * Groupe les opérations par domaine pour affichage en sections sur le hub /cee.
 * L'ordre des domaines suit `CEE_DOMAINE_ORDER`, l'ordre intra-domaine suit le code.
 * Fail-open {}.
 */
export async function getCeeOperationsByDomaine(): Promise<Record<CeeDomaine, CeeOperation[]>> {
  const operations = await getCeeOperations()
  const grouped: Record<CeeDomaine, CeeOperation[]> = {
    enveloppe: [],
    chauffage: [],
    ecs: [],
    ventilation: [],
    services: [],
    eclairage: [],
    autre: [],
  }
  for (const op of operations) {
    const domaine = (grouped[op.domaine] ? op.domaine : 'autre') as CeeDomaine
    grouped[domaine].push(op)
  }
  return grouped
}
