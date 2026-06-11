/**
 * Devis-light — numérotation. L'incrément atomique est fait en base par la
 * fonction Postgres `next_document_number(provider_id, kind)` (mig 547).
 * Ici : constantes + format + validation (testable sans DB).
 */

export const NEXT_DOCUMENT_NUMBER_RPC = 'next_document_number' as const

export type DocumentKind = 'quote' | 'invoice'

/** Format attendu : DEV-YYYY-00001 (devis) / FAC-YYYY-00001 (facture). */
export const DOCUMENT_NUMBER_RE = /^(DEV|FAC)-\d{4}-\d{5,}$/

export const isValidDocumentNumber = (value: string): boolean => DOCUMENT_NUMBER_RE.test(value)

export const documentPrefix = (kind: DocumentKind): 'DEV' | 'FAC' =>
  kind === 'invoice' ? 'FAC' : 'DEV'
