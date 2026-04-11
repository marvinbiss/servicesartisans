/**
 * CEE justificatifs — brique 4 mandataire CEE (loi n° 2025-594 du 30/06/2025).
 *
 * Collecte, vérification et archivage des pièces justificatives d'un dossier
 * CEE. Trois responsabilités :
 *
 *   1. Upload binaire vers Supabase Storage (bucket `cee-justificatifs`)
 *   2. Vérification EXIF (géolocalisation + horodatage) pour les photos
 *      AVANT / APRÈS travaux — obligation légale art. 13 loi 2025-594
 *   3. Append atomique d'une entrée dans `cee_dossiers.justificatifs` (JSONB)
 *      + trace dans `cee_dossier_events` (journal append-only, 6 ans)
 *
 * Source de vérité schéma : `supabase/migrations/402_cee_dossiers_schema.sql`.
 * Liste des pièces requises : `cee_operations.justificatifs_requis`
 * (migration 400).
 *
 * Règles :
 *   - Fail-closed sur upload : on n'enregistre RIEN si l'une des étapes échoue
 *   - Fail-open sur lecture (gap / liste requise) : renvoie `[]` ou struct vide
 *   - Zéro PII dans les logs (filename, taille, hash OK — pas de contenu)
 *   - TypeScript strict, aucun `any`
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { logger } from '@/lib/logger'

// -----------------------------------------------------------------------------
// Types exportés
// -----------------------------------------------------------------------------

/** Qui a déposé la pièce (traçabilité audit PNCEE). */
export type JustificatifSource = 'client' | 'artisan' | 'admin' | 'system'

/** Fichier binaire à uploader. */
export interface JustificatifFile {
  filename: string
  mimeType: string
  size: number
  bytes: ArrayBuffer | Uint8Array
}

/** Payload d'upload d'une pièce. */
export interface UploadJustificatifInput {
  dossierId: string
  code: string
  label: string
  source: JustificatifSource
  uploadedBy: string
  file: JustificatifFile
}

/**
 * Entrée enrichie stockée dans `cee_dossiers.justificatifs`.
 *
 * Super-ensemble compatible avec le shape de base documenté en migration 402
 * (code / label / storage_path / uploaded_at / verified_at / exif_geotag_verified),
 * avec en plus les métadonnées nécessaires à l'audit PNCEE :
 *   - `content_hash` → dédup naturelle + preuve d'intégrité
 *   - `size_bytes` / `mime_type` → inventaire
 *   - `exif_metadata` → preuve horodatage + géotag (loi 2025-594)
 *
 * Note : `exif_geotag_verified` est `boolean | null` ici (null = non applicable
 * pour une pièce qui ne requiert pas de géotag), là où `CeeDossierJustificatif`
 * (dossier-types.ts, non modifié) le type `boolean`. Un narrowing explicite
 * reste à faire côté lecture si le consommateur passe par ce type.
 */
export interface JustificatifEntry {
  code: string
  label: string
  storage_path: string
  uploaded_at: string
  verified_at: string | null
  uploaded_by: string
  source: JustificatifSource
  content_hash: string
  size_bytes: number
  mime_type: string
  /** `null` = pas encore vérifié, `true|false` après check EXIF. */
  exif_geotag_verified: boolean | null
  exif_metadata: {
    taken_at: string | null
    lat: number | null
    lng: number | null
    device_make: string | null
    device_model: string | null
  } | null
}

/** Résultat structuré d'un upload (fail-closed). */
export interface UploadJustificatifResult {
  ok: boolean
  entry?: JustificatifEntry
  error?: string
}

/** Raison d'échec de la vérification EXIF (machine-readable). */
export type ExifFailureReason = 'no_gps' | 'invalid_coords' | 'corrupt_exif' | 'not_an_image'

/** Résultat brut de l'analyse EXIF (sans effet de bord). */
export interface ExifGeotagResult {
  hasGeotag: boolean
  lat: number | null
  lng: number | null
  takenAt: string | null
  deviceMake: string | null
  deviceModel: string | null
  reason?: ExifFailureReason
}

/** Entrée d'une liste `justificatifs_requis` (migration 400). */
export interface JustificatifRequis {
  code: string
  label: string
  obligatoire: boolean
}

/** Écart entre pièces uploadées et requises pour un dossier. */
export interface JustificatifsGap {
  uploaded: string[]
  requis: string[]
  missing: string[]
  complete: boolean
}

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------

/**
 * FALLBACK CACHE — codes de pièce nécessitant une preuve EXIF.
 *
 * La source de vérité runtime est désormais `cee_operations.justificatifs_requis[*].exif_geotag`
 * (migration 400), lue dynamiquement par `isGeotagRequiredForCode`. Ce Set ne
 * sert que de filet de secours pour :
 *   - les tests qui ne passent pas `operationCode`
 *   - le code legacy qui appelle `uploadJustificatif` sans connaître le code
 *     FOS (dev local, migration path)
 *
 * Un code custom seedé par migration avec `exif_geotag: true` sera correctement
 * reconnu via la lookup dynamique même s'il n'apparaît pas ici. À l'inverse,
 * un code listé ici force le check EXIF (fail-closed préféré à fail-open
 * pour une contrainte légale — loi 2025-594 art. 13).
 *
 * Depuis la migration 407, les fiches actives utilisent deux codes distincts
 * (`photos_avant_travaux` / `photos_apres_travaux`). L'alias legacy
 * `photos_horodatees_geolocalisees_avant_apres` (seed migration 400) est
 * conservé pour les dossiers antérieurs à 407.
 */
export const GEOTAG_REQUIRED_CODES: ReadonlySet<string> = new Set([
  // Codes en production depuis migration 407 (collecte en deux étapes)
  'photos_avant_travaux',
  'photos_apres_travaux',
  // Alias legacy — dossiers antérieurs à migration 407, conservé pour
  // compatibilité ascendante. À retirer quand aucun dossier actif ne
  // l'utilise plus.
  'photos_horodatees_geolocalisees_avant_apres',
])

/**
 * Normalise un code de justificatif pour le lookup fail-closed. Une typo de
 * casse côté caller (`Photos_Avant_Travaux` vs `photos_avant_travaux`) ne
 * doit PAS produire un fail-open silencieux sur une contrainte EXIF légale.
 */
function normalizeCode(code: string): string {
  return code.toLowerCase()
}

/** Bucket Supabase Storage dédié aux justificatifs CEE. */
export const CEE_JUSTIFICATIFS_BUCKET = 'cee-justificatifs'

/**
 * Liste des MIME types acceptés. JPEG / PNG / HEIC pour les photos avec EXIF,
 * PDF pour les pièces signées, WebP toléré. Les autres types → refus.
 */
export const ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
])

/** Taille max d'un justificatif : 25 Mo (photo HDR + marge). */
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

// -----------------------------------------------------------------------------
// Helpers internes
// -----------------------------------------------------------------------------

/** Convertit un buffer en `Uint8Array` sans copie inutile. */
function toUint8Array(bytes: ArrayBuffer | Uint8Array): Uint8Array {
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
}

/** Hash SHA-256 hexadécimal du contenu binaire. */
function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

/** Valide des coordonnées GPS (bornes WGS84). */
function areValidCoords(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

/**
 * Signature JPEG minimale (FFD8FF). On ne fait pas confiance au MIME type
 * côté client — on vérifie les magic bytes avant toute tentative EXIF.
 */
function looksLikeJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
}

/** Signature PNG (89 50 4E 47 0D 0A 1A 0A). */
function looksLikePng(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  )
}

/** Vraie image exploitable pour EXIF (JPEG/PNG/HEIC détecté par `ftyp`). */
function looksLikeImage(bytes: Uint8Array): boolean {
  if (looksLikeJpeg(bytes) || looksLikePng(bytes)) return true
  // HEIC : magic `ftypheic` / `ftypheix` au début du box ISOBMFF
  if (bytes.length >= 12) {
    const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7])
    if (ftyp === 'ftyp') {
      const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11])
      if (brand.startsWith('hei') || brand.startsWith('mif')) return true
    }
  }
  return false
}

// -----------------------------------------------------------------------------
// verifyExifGeotag
// -----------------------------------------------------------------------------

/**
 * Shape minimal attendu de la sortie `exifr.parse()`.
 * On n'importe pas le type depuis `exifr` pour éviter un import synchrone
 * du module (chargé en lazy via `import()`), et parce que le type officiel
 * est large (Date | number | string sur certains champs).
 */
interface ExifrOutput {
  latitude?: number | null
  longitude?: number | null
  GPSLatitude?: number | null
  GPSLongitude?: number | null
  GPSLatitudeRef?: string | null
  GPSLongitudeRef?: string | null
  DateTimeOriginal?: Date | string | null
  CreateDate?: Date | string | null
  Make?: string | null
  Model?: string | null
}

/**
 * Vérifie la présence d'un géotag EXIF valide dans une image.
 *
 * Ne signale `hasGeotag: true` que si latitude ET longitude sont présentes,
 * finies et dans les bornes WGS84. Les photos sans EXIF, sans GPS ou avec
 * coordonnées hors bornes sont rejetées avec un `reason` machine-readable.
 *
 * Lazy-load de `exifr` : le module n'est chargé que si les magic bytes
 * ressemblent bien à une image, pour ne pas imposer la dépendance côté
 * client si l'upload est bloqué en amont.
 */
export async function verifyExifGeotag(
  fileBytes: ArrayBuffer | Uint8Array
): Promise<ExifGeotagResult> {
  const bytes = toUint8Array(fileBytes)

  if (!looksLikeImage(bytes)) {
    return {
      hasGeotag: false,
      lat: null,
      lng: null,
      takenAt: null,
      deviceMake: null,
      deviceModel: null,
      reason: 'not_an_image',
    }
  }

  let exif: ExifrOutput | null = null
  try {
    // Lazy import — évite d'inclure exifr dans le bundle si la fonction
    // n'est jamais appelée (ex. tests qui mockent uploadJustificatif).
    const mod = (await import('exifr')) as {
      parse: (
        input: ArrayBuffer | Uint8Array | Buffer,
        opts?: Record<string, unknown>
      ) => Promise<ExifrOutput | null>
    }
    exif = await mod.parse(bytes, {
      gps: true,
      pick: [
        'latitude',
        'longitude',
        'GPSLatitude',
        'GPSLongitude',
        'GPSLatitudeRef',
        'GPSLongitudeRef',
        'DateTimeOriginal',
        'CreateDate',
        'Make',
        'Model',
      ],
    })
  } catch (err) {
    logger.warn('verifyExifGeotag: parse error', {
      action: 'cee-justificatif-exif',
      error: err instanceof Error ? err.message : 'unknown',
    })
    return {
      hasGeotag: false,
      lat: null,
      lng: null,
      takenAt: null,
      deviceMake: null,
      deviceModel: null,
      reason: 'corrupt_exif',
    }
  }

  if (!exif) {
    return {
      hasGeotag: false,
      lat: null,
      lng: null,
      takenAt: null,
      deviceMake: null,
      deviceModel: null,
      reason: 'no_gps',
    }
  }

  // exifr expose `latitude`/`longitude` déjà convertis (DMS → DD) quand
  // `gps:true`. Les champs bruts `GPSLatitude`/`GPSLongitude` servent de
  // fallback si une version ancienne est utilisée.
  const lat =
    typeof exif.latitude === 'number'
      ? exif.latitude
      : typeof exif.GPSLatitude === 'number'
        ? exif.GPSLatitude
        : null
  const lng =
    typeof exif.longitude === 'number'
      ? exif.longitude
      : typeof exif.GPSLongitude === 'number'
        ? exif.GPSLongitude
        : null

  const takenAtRaw = exif.DateTimeOriginal ?? exif.CreateDate ?? null
  let takenAt: string | null = null
  if (takenAtRaw instanceof Date && !Number.isNaN(takenAtRaw.getTime())) {
    takenAt = takenAtRaw.toISOString()
  } else if (typeof takenAtRaw === 'string' && takenAtRaw.length > 0) {
    const parsed = new Date(takenAtRaw)
    takenAt = Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
  }

  const deviceMake = typeof exif.Make === 'string' ? exif.Make : null
  const deviceModel = typeof exif.Model === 'string' ? exif.Model : null

  if (lat === null || lng === null) {
    return {
      hasGeotag: false,
      lat: null,
      lng: null,
      takenAt,
      deviceMake,
      deviceModel,
      reason: 'no_gps',
    }
  }

  if (!areValidCoords(lat, lng)) {
    return {
      hasGeotag: false,
      lat: null,
      lng: null,
      takenAt,
      deviceMake,
      deviceModel,
      reason: 'invalid_coords',
    }
  }

  return {
    hasGeotag: true,
    lat,
    lng,
    takenAt,
    deviceMake,
    deviceModel,
  }
}

// -----------------------------------------------------------------------------
// uploadJustificatif
// -----------------------------------------------------------------------------

/**
 * Upload une pièce justificative, vérifie sa conformité EXIF (si requise
 * pour le code), puis append l'entrée dans `cee_dossiers.justificatifs`.
 *
 * Fail-closed : toute erreur (MIME invalide, taille, EXIF manquant, upload
 * storage KO, update DB KO) → rien n'est persisté, `{ ok:false, error }` est
 * retourné avec un code machine-readable.
 *
 * Path storage déterministe : `{dossierId}/{code}/{hash8}_{filename}`.
 * Conséquence : un même contenu uploadé deux fois retombe sur le même path
 * → dédup naturelle (upsert:false en première intention, fallback sur lookup
 * si collision).
 */
export async function uploadJustificatif(
  supabase: SupabaseClient,
  input: UploadJustificatifInput
): Promise<UploadJustificatifResult> {
  // -- 1. Validations rapides ------------------------------------------------
  if (!input.dossierId || !input.code || !input.label) {
    return { ok: false, error: 'invalid_input' }
  }
  if (!input.file || !input.file.filename || !input.file.bytes) {
    return { ok: false, error: 'invalid_file' }
  }
  if (!ALLOWED_MIME_TYPES.has(input.file.mimeType)) {
    return { ok: false, error: 'mime_type_rejected' }
  }
  const bytes = toUint8Array(input.file.bytes)
  if (bytes.byteLength === 0) {
    return { ok: false, error: 'empty_file' }
  }
  if (bytes.byteLength > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: 'file_too_large' }
  }

  // -- 2. Hash + path déterministe -------------------------------------------
  const hash = sha256Hex(bytes)
  // Defense-in-depth : la regex `[^\w.\-]+` laisse passer `..` (deux points
  // consécutifs restent valides). On neutralise explicitement toute séquence
  // de 2+ points pour empêcher tout résidu de path traversal.
  const sanitizedFilename = input.file.filename.replace(/[^\w.-]+/g, '_').replace(/\.{2,}/g, '_')
  const objectPath = `${input.dossierId}/${input.code}/${hash.slice(0, 8)}_${sanitizedFilename}`

  // -- 3. Dédup + lecture du code FOS du dossier (pour lookup EXIF dynamique).
  //    Si une entrée existe déjà pour ce dossier avec ce hash, on court-circuite.
  const dossierRead = await readDossierForUpload(supabase, input.dossierId, hash)
  if (dossierRead.existing) {
    return { ok: true, entry: dossierRead.existing }
  }

  // -- 4. Vérification EXIF pour les photos réglementaires -------------------
  let exifGeotagVerified: boolean | null = null
  let exifMetadata: JustificatifEntry['exif_metadata'] = null

  const geotagRequired = await isGeotagRequiredForCode(
    supabase,
    dossierRead.operationCode,
    input.code
  )
  if (geotagRequired) {
    const exif = await verifyExifGeotag(bytes)
    if (!exif.hasGeotag) {
      logger.warn('uploadJustificatif: EXIF geotag rejected', {
        action: 'cee-justificatif-upload',
        dossier_id: input.dossierId,
        code: input.code,
        reason: exif.reason ?? 'unknown',
      })
      return { ok: false, error: 'exif_geotag_missing' }
    }
    exifGeotagVerified = true
    exifMetadata = {
      taken_at: exif.takenAt,
      lat: exif.lat,
      lng: exif.lng,
      device_make: exif.deviceMake,
      device_model: exif.deviceModel,
    }
  }

  // -- 5. Upload storage -----------------------------------------------------
  const uploadRes = await supabase.storage
    .from(CEE_JUSTIFICATIFS_BUCKET)
    .upload(objectPath, bytes, {
      contentType: input.file.mimeType,
      upsert: false,
    })

  if (uploadRes.error) {
    // Tolère une collision si le même objet existe déjà (même hash/path) :
    // on considère que c'est le même contenu et on continue.
    const msg = uploadRes.error.message ?? ''
    const isDuplicate = /already exists|duplicate/i.test(msg)
    if (!isDuplicate) {
      logger.error('uploadJustificatif: storage upload failed', uploadRes.error, {
        action: 'cee-justificatif-upload',
        dossier_id: input.dossierId,
        code: input.code,
        size_bytes: bytes.byteLength,
      })
      return { ok: false, error: 'storage_upload_failed' }
    }
  }

  // -- 6. Construction de l'entrée JSONB -------------------------------------
  const entry: JustificatifEntry = {
    code: input.code,
    label: input.label,
    storage_path: `${CEE_JUSTIFICATIFS_BUCKET}://${objectPath}`,
    uploaded_at: new Date().toISOString(),
    uploaded_by: input.uploadedBy,
    source: input.source,
    content_hash: hash,
    size_bytes: bytes.byteLength,
    mime_type: input.file.mimeType,
    verified_at: null,
    exif_geotag_verified: exifGeotagVerified,
    exif_metadata: exifMetadata,
  }

  // -- 7. Append atomique via RPC + event log ---------------------------------
  // La RPC `append_cee_justificatif` (migration 405) exécute en une seule
  // transaction :
  //   - dédup par content_hash (no-op si déjà présent)
  //   - append atomique dans cee_dossiers.justificatifs
  //   - insertion d'un événement `justificatif_uploaded` dans cee_dossier_events
  // Fallback legacy : si la RPC n'est pas disponible (dev local sans migration
  // appliquée), on retombe sur un select-then-update optimiste + insert event
  // best-effort. Documenté par un warn pour repérer les environnements en
  // retard de migration.
  const appendResult = await appendViaRpc(
    supabase,
    input.dossierId,
    entry,
    input.uploadedBy || null,
    input.source
  )

  if (appendResult === 'rpc_missing') {
    logger.warn('uploadJustificatif: RPC append_cee_justificatif indisponible, fallback legacy', {
      action: 'cee-justificatif-upload',
      dossier_id: input.dossierId,
      code: input.code,
    })
    const legacyOk = await appendJustificatifLegacy(
      supabase,
      input.dossierId,
      entry,
      input.source,
      input.uploadedBy
    )
    if (!legacyOk) {
      return { ok: false, error: 'dossier_update_failed' }
    }
    return { ok: true, entry }
  }

  if (appendResult === 'error') {
    // L'erreur est déjà loguée dans appendViaRpc.
    return { ok: false, error: 'dossier_update_failed' }
  }

  return { ok: true, entry }
}

// -----------------------------------------------------------------------------
// Internals : lecture / écriture du JSONB
// -----------------------------------------------------------------------------

/**
 * Lecture combinée du dossier pour l'upload :
 *   - `existing` : entrée pré-existante avec le même `content_hash` (dédup)
 *   - `operationCode` : code FOS du dossier (pour lookup dynamique EXIF)
 *
 * Fail-open : si le dossier est introuvable ou sur erreur DB, on renvoie
 * `{ existing: null, operationCode: null }` et on laisse la suite du flow
 * gérer le fallback.
 */
async function readDossierForUpload(
  supabase: SupabaseClient,
  dossierId: string,
  hash: string
): Promise<{ existing: JustificatifEntry | null; operationCode: string | null }> {
  const { data, error } = await supabase
    .from('cee_dossiers')
    .select('justificatifs, operation_code')
    .eq('id', dossierId)
    .maybeSingle()

  if (error || !data) return { existing: null, operationCode: null }

  const row = data as { justificatifs: unknown; operation_code: unknown }
  const operationCode = typeof row.operation_code === 'string' ? row.operation_code : null

  const list = row.justificatifs
  if (!Array.isArray(list)) return { existing: null, operationCode }

  for (const raw of list) {
    if (raw && typeof raw === 'object' && 'content_hash' in raw) {
      const maybe = raw as Partial<JustificatifEntry>
      if (maybe.content_hash === hash && typeof maybe.code === 'string') {
        return { existing: maybe as JustificatifEntry, operationCode }
      }
    }
  }
  return { existing: null, operationCode }
}

/**
 * Détermine si un code de justificatif nécessite une preuve EXIF (géotag +
 * horodatage) pour une opération CEE donnée.
 *
 * Source de vérité : `cee_operations.justificatifs_requis[*].exif_geotag`
 * (JSONB, migration 400). Si la lookup est disponible, elle prime sur le
 * fallback hardcodé `GEOTAG_REQUIRED_CODES`.
 *
 * Fail-CLOSED strict : si la lookup échoue (erreur DB, dossier introuvable),
 * on renvoie `true` pour respecter la contrainte légale (loi 2025-594 art. 13).
 * Mieux rejeter un upload légitime que laisser passer une photo sans géotag
 * sur une fiche réglementée.
 *
 * Fallback cache : si `operationCode` est `null` (code legacy, test sans
 * contexte dossier), on retombe sur `GEOTAG_REQUIRED_CODES`.
 */
export async function isGeotagRequiredForCode(
  supabase: SupabaseClient,
  operationCode: string | null,
  justificatifCode: string
): Promise<boolean> {
  if (!justificatifCode) return false
  const normalized = normalizeCode(justificatifCode)
  if (!operationCode) {
    return GEOTAG_REQUIRED_CODES.has(normalized)
  }

  const { data, error } = await supabase
    .from('cee_operations')
    .select('justificatifs_requis')
    .eq('code', operationCode)
    .maybeSingle()

  if (error) {
    logger.warn('isGeotagRequiredForCode: DB error, fail-closed (geotag requis)', {
      action: 'cee-justificatif-geotag-lookup',
      operation_code: operationCode,
      justificatif_code: justificatifCode,
      error: error.message,
    })
    return true
  }

  if (!data) {
    return GEOTAG_REQUIRED_CODES.has(normalized)
  }

  const raw = (data as { justificatifs_requis: unknown }).justificatifs_requis
  if (!Array.isArray(raw)) {
    return GEOTAG_REQUIRED_CODES.has(normalized)
  }

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    if (typeof rec.code !== 'string') continue
    if (normalizeCode(rec.code) !== normalized) continue
    return rec.exif_geotag === true
  }

  return GEOTAG_REQUIRED_CODES.has(normalized)
}

/**
 * Résultat de l'appel RPC `append_cee_justificatif`.
 *   - `ok`          → append réussi (ou no-op dédup)
 *   - `rpc_missing` → la fonction n'existe pas côté DB (dev local)
 *   - `error`       → erreur métier ou technique (déjà loguée)
 */
type AppendRpcResult = 'ok' | 'rpc_missing' | 'error'

/**
 * Appelle la RPC Postgres atomique `append_cee_justificatif` (migration 405).
 *
 * La RPC s'occupe en une seule transaction de :
 *   - dédup par content_hash,
 *   - append `justificatifs = justificatifs || entry`,
 *   - insertion d'un événement `justificatif_uploaded` dans `cee_dossier_events`.
 *
 * Détection du fallback : si la RPC n'est pas installée (`PGRST202` /
 * message "not found" / "does not exist"), on retourne `rpc_missing` pour
 * laisser l'appelant retomber sur le chemin legacy.
 */
async function appendViaRpc(
  supabase: SupabaseClient,
  dossierId: string,
  entry: JustificatifEntry,
  actorId: string | null,
  actorType: JustificatifSource
): Promise<AppendRpcResult> {
  const { error } = await supabase.rpc('append_cee_justificatif', {
    p_dossier_id: dossierId,
    p_entry: entry as unknown as Record<string, unknown>,
    p_actor_id: actorId,
    p_actor_type: actorType,
  })

  if (!error) return 'ok'

  // PostgREST renvoie `PGRST202` (code) / message "Could not find the function"
  // lorsque la fonction RPC n'est pas exposée au schéma `public`. On reconnaît
  // aussi "does not exist" (direct PG error) pour les cas SDK alternatifs.
  const code = (error as { code?: string }).code ?? ''
  const msg = error.message ?? ''
  const isMissing = code === 'PGRST202' || /could not find the function|does not exist/i.test(msg)

  if (isMissing) return 'rpc_missing'

  logger.error('uploadJustificatif: RPC append_cee_justificatif failed', error, {
    action: 'cee-justificatif-append',
    dossier_id: dossierId,
    code: entry.code,
  })
  return 'error'
}

/**
 * Fallback legacy : select-then-update optimiste sur `updated_at`, suivi
 * d'un insert best-effort dans `cee_dossier_events`. À n'utiliser que
 * lorsque la RPC `append_cee_justificatif` (migration 405) n'est pas
 * installée — cas dev local. Conserve la sémantique de la brique 4
 * avant la convergence sur la RPC atomique.
 */
async function appendJustificatifLegacy(
  supabase: SupabaseClient,
  dossierId: string,
  entry: JustificatifEntry,
  source: JustificatifSource,
  uploadedBy: string
): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: current, error: readErr } = await supabase
      .from('cee_dossiers')
      .select('justificatifs, updated_at')
      .eq('id', dossierId)
      .maybeSingle()

    if (readErr || !current) return false

    const row = current as { justificatifs: unknown; updated_at: string }
    const previous: unknown[] = Array.isArray(row.justificatifs) ? row.justificatifs : []
    const nextList = [...previous, entry]

    const { data: updated, error: updErr } = await supabase
      .from('cee_dossiers')
      .update({ justificatifs: nextList })
      .eq('id', dossierId)
      .eq('updated_at', row.updated_at)
      .select('id')
      .maybeSingle()

    if (!updErr && updated) {
      // Event log best-effort — la RPC le ferait en transaction, ici c'est
      // un insert séparé, non rollbackable si ça échoue.
      const { error: eventError } = await supabase.from('cee_dossier_events').insert({
        dossier_id: dossierId,
        event_type: 'justificatif_uploaded',
        actor_type: source,
        actor_id: uploadedBy || null,
        payload: {
          code: entry.code,
          label: entry.label,
          content_hash: entry.content_hash,
          size_bytes: entry.size_bytes,
          mime_type: entry.mime_type,
          exif_geotag_verified: entry.exif_geotag_verified,
        },
      })
      if (eventError) {
        logger.warn('appendJustificatifLegacy: event log insert failed (non-fatal)', {
          action: 'cee-justificatif-append',
          dossier_id: dossierId,
          code: entry.code,
          error: eventError.message,
        })
      }
      return true
    }

    if (updErr) {
      logger.warn('appendJustificatifLegacy: update error', {
        action: 'cee-justificatif-append',
        dossier_id: dossierId,
        attempt,
        error: updErr.message,
      })
      return false
    }
    // updated = null → collision optimiste, on retry
  }
  return false
}

// -----------------------------------------------------------------------------
// getJustificatifsRequisForOperation
// -----------------------------------------------------------------------------

/**
 * Relit la liste des pièces requises pour un code FOS CEE.
 * Fail-open : retourne `[]` sur erreur DB ou si la fiche est inconnue.
 *
 * Source : `cee_operations.justificatifs_requis` (JSONB, migration 400).
 */
export async function getJustificatifsRequisForOperation(
  supabase: SupabaseClient,
  operationCode: string
): Promise<JustificatifRequis[]> {
  if (!operationCode) return []

  const { data, error } = await supabase
    .from('cee_operations')
    .select('justificatifs_requis')
    .eq('code', operationCode)
    .maybeSingle()

  if (error || !data) {
    logger.warn('getJustificatifsRequisForOperation: DB error', {
      action: 'cee-justificatif-requis',
      operation_code: operationCode,
      error: error?.message ?? 'not_found',
    })
    return []
  }

  const raw = (data as { justificatifs_requis: unknown }).justificatifs_requis
  if (!Array.isArray(raw)) return []

  const result: JustificatifRequis[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const code = typeof rec.code === 'string' ? rec.code : null
    const label = typeof rec.label === 'string' ? rec.label : null
    const obligatoire = typeof rec.obligatoire === 'boolean' ? rec.obligatoire : false
    if (code && label) {
      result.push({ code, label, obligatoire })
    }
  }
  return result
}

// -----------------------------------------------------------------------------
// getJustificatifsGap
// -----------------------------------------------------------------------------

/**
 * Calcule l'écart entre pièces déjà uploadées et pièces obligatoires pour
 * un dossier. Sert le backoffice mandataire (barre de complétion) et les
 * checks avant dépose au délégataire.
 *
 * Fail-open : si le dossier ou l'opération est introuvable, renvoie une
 * structure vide avec `complete:false`.
 */
export async function getJustificatifsGap(
  supabase: SupabaseClient,
  dossierId: string
): Promise<JustificatifsGap> {
  const empty: JustificatifsGap = {
    uploaded: [],
    requis: [],
    missing: [],
    complete: false,
  }
  if (!dossierId) return empty

  const { data, error } = await supabase
    .from('cee_dossiers')
    .select('operation_code, justificatifs')
    .eq('id', dossierId)
    .maybeSingle()

  if (error || !data) return empty

  const row = data as { operation_code: string; justificatifs: unknown }
  const uploadedList = Array.isArray(row.justificatifs) ? row.justificatifs : []
  const uploadedCodes: string[] = []
  for (const raw of uploadedList) {
    if (raw && typeof raw === 'object' && 'code' in raw) {
      const code = (raw as { code: unknown }).code
      if (typeof code === 'string') uploadedCodes.push(code)
    }
  }

  const requisAll = await getJustificatifsRequisForOperation(supabase, row.operation_code)
  const requisObligatoires = requisAll.filter((r) => r.obligatoire).map((r) => r.code)

  const uploadedSet = new Set(uploadedCodes)
  const missing = requisObligatoires.filter((code) => !uploadedSet.has(code))

  return {
    uploaded: Array.from(new Set(uploadedCodes)),
    requis: requisObligatoires,
    missing,
    complete: requisObligatoires.length > 0 && missing.length === 0,
  }
}
