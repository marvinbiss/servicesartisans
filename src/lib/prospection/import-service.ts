/**
 * Contact Import Service - Prospection
 * Import CSV/Excel avec validation, normalisation et déduplication
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import type {
  ContactType,
  ContactSource,
  ProspectionContactInsert,
  ImportResult,
  ImportError,
  ImportDuplicate,
  ColumnMapping,
} from '@/types/prospection'

// Champs valides pour le mapping (exported for validation)
export const VALID_FIELDS: (keyof ProspectionContactInsert)[] = [
  'contact_type', 'company_name', 'contact_name', 'email', 'phone',
  'address', 'postal_code', 'city', 'department', 'region',
  'commune_code', 'population',
]

/**
 * Parser un fichier CSV en lignes
 */
export function parseCSV(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return { headers: [], rows: [] }

  // Détecter le séparateur (virgule, point-virgule, tab)
  const firstLine = lines[0]
  const separator = firstLine.includes(';') ? ';'
    : firstLine.includes('\t') ? '\t'
    : ','

  const headers = parseCsvLine(firstLine, separator).map(h => h.trim())
  const rows = lines.slice(1).map(line => {
    const values = parseCsvLine(line, separator)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = (values[i] || '').trim()
    })
    return row
  })

  return { headers, rows }
}

/**
 * Parser une ligne CSV (gestion des guillemets)
 */
function parseCsvLine(line: string, separator: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === separator && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)

  return result.map(v => v.replace(/^"|"$/g, '').trim())
}

/**
 * Suggestion automatique de mapping des colonnes
 */
export function suggestColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  const lowerHeaders = headers.map(h => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))

  const fieldPatterns: Partial<Record<keyof ProspectionContactInsert, string[]>> = {
    contact_name: ['nom', 'name', 'contact', 'prenom', 'firstname', 'lastname', 'nom_contact', 'raison_sociale'],
    company_name: ['entreprise', 'company', 'societe', 'raison_sociale', 'denomination', 'enseigne'],
    email: ['email', 'mail', 'courriel', 'e-mail', 'adresse_email'],
    phone: ['telephone', 'phone', 'tel', 'portable', 'mobile', 'numero'],
    address: ['adresse', 'address', 'rue', 'voie', 'adresse_postale'],
    postal_code: ['code_postal', 'cp', 'postal_code', 'zip', 'code postal'],
    city: ['ville', 'city', 'commune', 'localite'],
    department: ['departement', 'department', 'dept', 'dep'],
    region: ['region'],
    commune_code: ['code_insee', 'insee', 'code_commune'],
    contact_type: ['type', 'contact_type', 'categorie'],
    population: ['population', 'habitants'],
  }

  for (const [field, patterns] of Object.entries(fieldPatterns)) {
    for (let i = 0; i < lowerHeaders.length; i++) {
      if (patterns.some(p => lowerHeaders[i].includes(p)) && !Object.values(mapping).includes(field as keyof ProspectionContactInsert)) {
        mapping[headers[i]] = field as keyof ProspectionContactInsert
        break
      }
    }
  }

  // Les colonnes non mappées → null
  for (const h of headers) {
    if (!(h in mapping)) {
      mapping[h] = null
    }
  }

  return mapping
}

/**
 * Valider et transformer les lignes importées
 */
export function validateRows(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  contactType: ContactType,
  sourceFile: string
): {
  valid: ProspectionContactInsert[]
  errors: ImportError[]
} {
  const valid: ProspectionContactInsert[] = []
  const errors: ImportError[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2 // +2 car header = ligne 1

    const contact: ProspectionContactInsert = {
      contact_type: contactType,
      source: 'import' as ContactSource,
      source_file: sourceFile,
      source_row: rowNum,
    }

    let hasContactInfo = false

    for (const [csvCol, field] of Object.entries(mapping)) {
      if (!field || !row[csvCol]) continue

      const value = row[csvCol].trim()
      if (!value) continue

      switch (field) {
        case 'email': {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            errors.push({ row: rowNum, field: 'email', message: `Email invalide: ${value}` })
          } else {
            contact.email = value.toLowerCase()
            hasContactInfo = true
          }
          break
        }
        case 'phone': {
          contact.phone = value
          hasContactInfo = true
          break
        }
        case 'population': {
          const pop = parseInt(value.replace(/\s/g, ''), 10)
          if (!isNaN(pop)) contact.population = pop
          break
        }
        case 'contact_type': {
          const validTypes: ContactType[] = ['artisan', 'client', 'mairie']
          const lower = value.toLowerCase()
          if (validTypes.includes(lower as ContactType)) {
            contact.contact_type = lower as ContactType
          }
          break
        }
        default:
          (contact as unknown as Record<string, unknown>)[field] = value
      }
    }

    if (!hasContactInfo) {
      errors.push({ row: rowNum, field: 'email/phone', message: 'Ni email ni téléphone fourni' })
      continue
    }

    valid.push(contact)
  }

  return { valid, errors }
}

/**
 * Vérifier les doublons contre la base existante
 */
export async function checkDuplicates(
  contacts: ProspectionContactInsert[]
): Promise<{
  unique: ProspectionContactInsert[]
  duplicates: ImportDuplicate[]
}> {
  const supabase = createAdminClient()
  const unique: ProspectionContactInsert[] = []
  const duplicates: ImportDuplicate[] = []

  // Récupérer tous les emails et téléphones existants
  const emails = contacts.filter(c => c.email).map(c => c.email!.toLowerCase())
  const phones = contacts.filter(c => c.phone).map(c => c.phone!)

  let existingByEmail: Record<string, string> = {}
  let existingByPhone: Record<string, string> = {}

  if (emails.length > 0) {
    const { data } = await supabase
      .from('prospection_contacts')
      .select('id, email_canonical')
      .in('email_canonical', emails)
      .eq('is_active', true)

    if (data) {
      existingByEmail = Object.fromEntries(
        data.map(d => [d.email_canonical, d.id])
      )
    }
  }

  if (phones.length > 0) {
    // On ne peut pas normaliser côté client, on récupère tous les phone_e164
    const { data } = await supabase
      .from('prospection_contacts')
      .select('id, phone_e164, phone')
      .eq('is_active', true)
      .not('phone_e164', 'is', null)

    if (data) {
      existingByPhone = Object.fromEntries(
        data.map(d => [d.phone_e164, d.id])
      )
    }
  }

  // Vérifier chaque contact
  const seenEmails = new Set<string>()
  const seenPhones = new Set<string>()

  for (const contact of contacts) {
    const email = contact.email?.toLowerCase()
    const phone = contact.phone

    let isDuplicate = false

    if (email && existingByEmail[email]) {
      duplicates.push({
        row: contact.source_row || 0,
        existing_id: existingByEmail[email],
        match_field: 'email',
        match_value: email,
      })
      isDuplicate = true
    }

    if (!isDuplicate && email && seenEmails.has(email)) {
      isDuplicate = true
    }

    if (!isDuplicate && phone && Object.keys(existingByPhone).length > 0) {
      // Vérification approximative (le trigger normalisera)
      for (const [e164, id] of Object.entries(existingByPhone)) {
        if (e164 && phone.replace(/\D/g, '').endsWith(e164.replace(/\D/g, '').slice(-9))) {
          duplicates.push({
            row: contact.source_row || 0,
            existing_id: id,
            match_field: 'phone',
            match_value: phone,
          })
          isDuplicate = true
          break
        }
      }
    }

    if (!isDuplicate) {
      if (email) seenEmails.add(email)
      if (phone) seenPhones.add(phone)
      unique.push(contact)
    }
  }

  return { unique, duplicates }
}

/**
 * Insérer les contacts en base par batch
 */
export async function bulkInsertContacts(
  contacts: ProspectionContactInsert[]
): Promise<{ inserted: number; failed: number }> {
  const supabase = createAdminClient()
  let inserted = 0
  let failed = 0
  const batchSize = 500

  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize)
    const { error } = await supabase
      .from('prospection_contacts')
      .insert(batch)

    if (error) {
      logger.error('Bulk insert error', { error: error.message, offset: i })
      failed += batch.length
    } else {
      inserted += batch.length
    }
  }

  return { inserted, failed }
}

/**
 * Pipeline complet d'import
 */
export async function importContacts(
  csvContent: string,
  mapping: ColumnMapping,
  contactType: ContactType,
  sourceFile: string
): Promise<ImportResult> {
  // 1. Parser le CSV
  const { rows } = parseCSV(csvContent)

  // 2. Valider
  const { valid, errors } = validateRows(rows, mapping, contactType, sourceFile)

  // 3. Dédupliquer
  const { unique, duplicates } = await checkDuplicates(valid)

  // 4. Insérer
  const { inserted, failed } = await bulkInsertContacts(unique)

  return {
    total_rows: rows.length,
    valid: valid.length,
    duplicates: duplicates.length,
    errors: errors.length + failed,
    imported: inserted,
    error_details: errors,
    duplicate_details: duplicates,
  }
}

/**
 * Synchroniser les artisans existants de la base vers prospection_contacts
 */
export async function syncArtisansFromDatabase(
  filters?: { department?: string; service?: string }
): Promise<{ synced: number; skipped: number }> {
  const supabase = createAdminClient()

  // Construire la requête
  let query = supabase
    .from('providers')
    .select('id, name, email, phone, address_street, address_city, address_postal_code, address_department, address_region, siret')
    .eq('is_active', true)

  if (filters?.department) {
    query = query.eq('address_department', filters.department)
  }

  const { data: providers, error } = await query

  if (error || !providers) {
    logger.error('Failed to load providers', { error: error?.message })
    return { synced: 0, skipped: 0 }
  }

  let synced = 0
  let skipped = 0

  for (const provider of providers) {
    // Vérifier si déjà importé
    const { data: existing } = await supabase
      .from('prospection_contacts')
      .select('id')
      .eq('artisan_id', provider.id)
      .eq('is_active', true)
      .limit(1)

    if (existing && existing.length > 0) {
      skipped++
      continue
    }

    const contact: ProspectionContactInsert = {
      contact_type: 'artisan',
      company_name: provider.name,
      contact_name: provider.name,
      email: provider.email,
      phone: provider.phone,
      address: provider.address_street,
      postal_code: provider.address_postal_code,
      city: provider.address_city,
      department: provider.address_department,
      region: provider.address_region,
      artisan_id: provider.id,
      source: 'database',
    }

    const { error: insertError } = await supabase
      .from('prospection_contacts')
      .insert(contact)

    if (insertError) {
      logger.warn('Failed to sync provider', { id: provider.id, error: insertError.message })
      skipped++
    } else {
      synced++
    }
  }

  return { synced, skipped }
}
