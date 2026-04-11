/**
 * Bloctel — Liste d'opposition au démarchage téléphonique
 * ============================================================
 *
 * Base légale : Article L.223-1 du Code de la consommation impose à tout
 * professionnel qui démarche des consommateurs par téléphone de vérifier
 * préalablement que leur numéro n'est PAS inscrit sur la liste Bloctel.
 *
 * **Sanction** : 75 000 € d'amende par infraction (DGCCRF, contrôles actifs).
 *
 * ------------------------------------------------------------
 * Comment Bloctel fonctionne concrètement
 * ------------------------------------------------------------
 *
 * Bloctel NE PROPOSE PAS d'API temps réel. L'organisme délivre :
 *   1. Un accès opérateur (inscription obligatoire, payante, ~1 mois
 *      de délai administratif).
 *   2. Un **fichier hebdomadaire** à télécharger depuis l'espace opérateur,
 *      contenant tous les numéros inscrits. Format : CSV, une colonne
 *      « numero » au format E.164 (+33XXXXXXXXX).
 *
 * Le workflow attendu est donc :
 *   a. L'opérateur télécharge le fichier Bloctel chaque lundi.
 *   b. On importe le fichier via {@link importBloctelFile} pour
 *      marquer `bloctel_listed=true` sur les contacts concernés.
 *   c. Tous les autres contacts actifs voient `bloctel_listed` passer
 *      à `false` (appel autorisé) et `bloctel_checked_at` mis à jour.
 *
 * ------------------------------------------------------------
 * Status actuel — Phase 1 (avril 2026)
 * ------------------------------------------------------------
 *
 * Ce module fournit UNIQUEMENT les helpers bas niveau. L'inscription
 * opérateur chez Bloctel n'est pas encore finalisée — une fois le compte
 * actif, un cron hebdomadaire sera ajouté (Phase 2) pour automatiser
 * le téléchargement et l'import.
 *
 * Jusque-là, `bloctel_listed` reste NULL sur tous les contacts, ce qui
 * bloque par défaut toute campagne voice côté `enqueueCampaignMessages`
 * (fail-close — voir src/lib/prospection/message-queue.ts).
 *
 * @see supabase/migrations/394_prospection_consent_proof.sql
 * @see docs/prospection/base-legale-canaux.md
 */

import { readFileSync } from 'fs'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

/**
 * Résultat d'un import Bloctel.
 */
export interface BloctelImportResult {
  /** Nombre total de numéros parsés depuis le fichier. */
  parsedRows: number
  /** Nombre de numéros E.164 valides conservés. */
  validPhones: number
  /** Nombre de contacts `prospection_contacts` marqués `bloctel_listed=true`. */
  flaggedContacts: number
  /** Date du check (CURRENT_DATE). */
  checkedAt: string
  /** Erreurs non bloquantes rencontrées (malformés, etc.). */
  warnings: string[]
}

/**
 * Regex E.164 stricte (utilisée aussi par la fonction
 * `prospection_normalize_phone` — migration 300).
 */
const E164_RE = /^\+[1-9][0-9]{6,14}$/

/**
 * Parse un fichier CSV Bloctel et retourne la liste des numéros E.164 valides.
 *
 * Le format officiel Bloctel est un CSV simple, une colonne « numero »
 * (parfois « Numero », parfois sans header — on est tolérant). On ne charge
 * pas de lib CSV tierce : le format est trop simple pour justifier une
 * dépendance, et Bloctel ne fait pas de quoted fields / escaping exotique.
 *
 * TODO phase 2 : si Bloctel migre vers un format plus riche (colonnes
 * additionnelles type « date_inscription »), basculer sur `csv-parse`.
 *
 * @internal Exporté pour les tests uniquement.
 */
export function parseBloctelCsv(csvContent: string): {
  phones: string[]
  warnings: string[]
} {
  const warnings: string[] = []
  const phones: string[] = []

  // Strip BOM UTF-8 (\uFEFF) en tête du fichier : les exports Bloctel Windows
  // sont parfois encodés UTF-8 with BOM, ce qui ferait échouer le parsing
  // du premier numéro (caractère invisible collé devant).
  const content = csvContent.replace(/^\uFEFF/, '')

  const lines = content.split(/\r?\n/)
  let headerSkipped = false

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim()
    if (!raw) continue

    // Détection du header : si la première ligne non vide contient des lettres,
    // c'est un header — on le saute. Sinon on suppose que les données
    // commencent dès la première ligne.
    if (!headerSkipped) {
      headerSkipped = true
      if (/[a-zA-Z]/.test(raw)) continue
    }

    // On prend la première colonne (gestion CSV minimaliste).
    const firstCol = raw.split(/[,;]/)[0].trim().replace(/^"|"$/g, '')

    // Normalisation légère : espace + tirets → rien ; 0X → +33X si français
    let cleaned = firstCol.replace(/[\s-]/g, '')
    if (/^0[1-9]\d{8}$/.test(cleaned)) {
      cleaned = '+33' + cleaned.slice(1)
    }

    if (E164_RE.test(cleaned)) {
      phones.push(cleaned)
    } else {
      warnings.push(`Ligne ${i + 1}: numéro invalide "${firstCol}"`)
    }
  }

  return { phones, warnings }
}

/**
 * Importe un fichier Bloctel depuis le filesystem et met à jour la table
 * `prospection_contacts` : SET `bloctel_listed=true` pour les numéros
 * présents dans le fichier, SET `bloctel_checked_at=CURRENT_DATE` pour tous
 * les numéros parsés (y compris les non-matchs — on sait qu'on a vérifié).
 *
 * **Fail-close** : si le parsing retourne 0 numéros valides, on refuse
 * l'import (probable erreur de format/fichier vide — on ne veut pas marquer
 * toute la base comme « vérifiée » par erreur).
 *
 * @param csvPath Chemin absolu vers le fichier CSV Bloctel téléchargé
 * @returns Statistiques de l'import
 */
export async function importBloctelFile(csvPath: string): Promise<BloctelImportResult> {
  const supabase = createAdminClient()
  const checkedAt = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  logger.info('Bloctel: début import', { csvPath })

  // 1. Lecture + parsing
  let csvContent: string
  try {
    csvContent = readFileSync(csvPath, 'utf-8')
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    throw new Error(`Bloctel: lecture fichier impossible (${csvPath}): ${msg}`)
  }

  const { phones, warnings } = parseBloctelCsv(csvContent)
  const parsedRows = csvContent.split(/\r?\n/).filter((l) => l.trim()).length

  if (phones.length === 0) {
    throw new Error(
      `Bloctel: aucun numéro E.164 valide extrait de ${csvPath}. ` +
        `Import refusé (fail-close pour éviter de marquer la base comme "vérifiée" ` +
        `avec un fichier vide/corrompu).`
    )
  }

  logger.info('Bloctel: CSV parsé', {
    parsedRows,
    validPhones: phones.length,
    warnings: warnings.length,
  })

  // 2. Marquer les numéros listés : UPDATE en chunks pour éviter les payloads
  //    trop gros sur PostgREST (~1M de numéros Bloctel attendus).
  const CHUNK = 1_000
  let flagged = 0

  for (let i = 0; i < phones.length; i += CHUNK) {
    const chunk = phones.slice(i, i + CHUNK)
    const { data, error } = await supabase
      .from('prospection_contacts')
      .update({
        bloctel_listed: true,
        bloctel_checked_at: checkedAt,
      })
      .in('phone_e164', chunk)
      .select('id')

    if (error) {
      logger.error('Bloctel: échec update chunk', {
        offset: i,
        size: chunk.length,
        error: error.message,
      })
      // On continue les autres chunks — un échec partiel vaut mieux qu'un
      // rollback total qui laisserait la base sans update du tout.
      continue
    }
    flagged += data?.length || 0
  }

  logger.info('Bloctel: contacts marqués bloctel_listed=true', { flagged })

  return {
    parsedRows,
    validPhones: phones.length,
    flaggedContacts: flagged,
    checkedAt,
    warnings,
  }
}

/**
 * Marque une liste de contacts comme vérifiés et ABSENTS de Bloctel
 * (donc appelables). À utiliser après un import pour les numéros de la base
 * qui n'étaient pas dans le fichier Bloctel — on sait qu'on les a vérifiés,
 * ils ne sont pas inscrits, on peut les appeler.
 *
 * **Usage type** :
 * ```ts
 * const result = await importBloctelFile('/tmp/bloctel-2026-04-14.csv')
 * // Puis pour les contacts restants (non listés Bloctel, à marquer "clean") :
 * const { data } = await supabase
 *   .from('prospection_contacts')
 *   .select('id')
 *   .is('bloctel_listed', null)
 *   .not('phone_e164', 'is', null)
 * await markAsBloctelClean(data.map(c => c.id))
 * ```
 *
 * @param contactIds UUIDs des contacts vérifiés absents de Bloctel
 */
export async function markAsBloctelClean(contactIds: string[]): Promise<{ updated: number }> {
  if (contactIds.length === 0) {
    return { updated: 0 }
  }

  const supabase = createAdminClient()
  const checkedAt = new Date().toISOString().slice(0, 10)
  const CHUNK = 1_000
  let updated = 0

  for (let i = 0; i < contactIds.length; i += CHUNK) {
    const chunk = contactIds.slice(i, i + CHUNK)
    const { data, error } = await supabase
      .from('prospection_contacts')
      .update({
        bloctel_listed: false,
        bloctel_checked_at: checkedAt,
      })
      .in('id', chunk)
      .select('id')

    if (error) {
      logger.error('Bloctel: échec markAsBloctelClean chunk', {
        offset: i,
        size: chunk.length,
        error: error.message,
      })
      continue
    }
    updated += data?.length || 0
  }

  logger.info('Bloctel: contacts marqués clean (appelables)', { updated })
  return { updated }
}
