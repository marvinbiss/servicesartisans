/**
 * Virtual triples store — Pillar 1 RGE-OS.
 *
 * Génère les triples RDF on-demand depuis la table Supabase `providers`,
 * sans pré-matérialisation. Pour chaque provider RGE actif :
 *   - <iri> rdf:type sa:RgeProvider
 *   - <iri> sa:siret "..."
 *   - <iri> rdfs:label "..."
 *   - <iri> sa:ville "..."
 *   - <iri> sa:departement "..."
 *   - <iri> sa:hasQualification <qiri> (× N)
 *   - <qiri> rdf:type sa:RgeQualification
 *   - <qiri> sa:qualifCode "..."
 *   - <qiri> sa:qualifLibelle "..."
 *   - <qiri> sa:validUntil "YYYY-MM-DD"
 *
 * Stratégie d'exécution :
 *   1. Recherche le pattern le plus sélectif (subject IRI direct OU
 *      object littéral siret OU subject + sa:siret literal).
 *   2. Si selectivity ~1 → lookup direct par PK.
 *   3. Sinon scan paginé `providers WHERE rge_qualifications IS NOT NULL`.
 *   4. Joint en mémoire (hash join) les patterns restants.
 *
 * Cap dur : `MAX_BINDINGS = 1000` (au-delà, on tronque + flag `truncated`).
 */

import { createAdminClient } from '@/lib/supabase/admin'

import type { Binding, SparqlTerm, TriplePattern } from './_query-builder-types'

import { SA_NS, PROVIDER_IRI_BASE, QUALIF_IRI_BASE } from './_query-builder-types'

const MAX_BINDINGS = 1000
const PROVIDER_SCAN_PAGE = 200

export type MatchResult = {
  bindings: Binding[]
  truncated: boolean
}

type ProviderRow = {
  siret: string | null
  name: string | null
  address_city: string | null
  address_department: string | null
  rge_qualifications: unknown
}

type VirtualTriple = {
  subject: SparqlTerm
  predicate: SparqlTerm
  object: SparqlTerm
}

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label'

function iri(value: string): SparqlTerm {
  return { type: 'iri', value }
}

function lit(value: string): SparqlTerm {
  return { type: 'literal', value }
}

function providerIri(siret: string): string {
  return `${PROVIDER_IRI_BASE}${siret}`
}

function qualifIri(siret: string, idx: number): string {
  return `${QUALIF_IRI_BASE}${siret}-${idx}`
}

function safeQualifications(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return []
  return value.filter((q): q is Record<string, unknown> => q !== null && typeof q === 'object')
}

/**
 * Génère le set complet de triples virtuels pour un provider.
 */
function generateTriplesForProvider(row: ProviderRow): VirtualTriple[] {
  const siret = row.siret
  if (!siret) return []
  const pIri = iri(providerIri(siret))
  const triples: VirtualTriple[] = [
    { subject: pIri, predicate: iri(RDF_TYPE), object: iri(`${SA_NS}RgeProvider`) },
    { subject: pIri, predicate: iri(`${SA_NS}siret`), object: lit(siret) },
  ]
  if (row.name) {
    triples.push({ subject: pIri, predicate: iri(RDFS_LABEL), object: lit(row.name) })
  }
  if (row.address_city) {
    triples.push({
      subject: pIri,
      predicate: iri(`${SA_NS}ville`),
      object: lit(row.address_city),
    })
  }
  if (row.address_department) {
    triples.push({
      subject: pIri,
      predicate: iri(`${SA_NS}departement`),
      object: lit(row.address_department),
    })
  }
  const quals = safeQualifications(row.rge_qualifications)
  for (let idx = 0; idx < quals.length; idx++) {
    const q = quals[idx]
    if (!q) continue
    const qIri = iri(qualifIri(siret, idx))
    triples.push({
      subject: pIri,
      predicate: iri(`${SA_NS}hasQualification`),
      object: qIri,
    })
    triples.push({
      subject: qIri,
      predicate: iri(RDF_TYPE),
      object: iri(`${SA_NS}RgeQualification`),
    })
    if (typeof q.code === 'string') {
      triples.push({
        subject: qIri,
        predicate: iri(`${SA_NS}qualifCode`),
        object: lit(q.code),
      })
    }
    const lib = typeof q.libelle === 'string' ? q.libelle : typeof q.nom === 'string' ? q.nom : null
    if (lib) {
      triples.push({
        subject: qIri,
        predicate: iri(`${SA_NS}qualifLibelle`),
        object: lit(lib),
      })
    }
    if (typeof q.date_fin === 'string') {
      triples.push({
        subject: qIri,
        predicate: iri(`${SA_NS}validUntil`),
        object: lit(q.date_fin),
      })
    }
  }
  return triples
}

function termEquals(a: SparqlTerm, b: SparqlTerm): boolean {
  if (a.type !== b.type) return false
  if (a.type === 'var' && b.type === 'var') return a.name === b.name
  if (a.type === 'iri' && b.type === 'iri') return a.value === b.value
  if (a.type === 'literal' && b.type === 'literal') {
    return (
      a.value === b.value &&
      (a.datatype ?? '') === (b.datatype ?? '') &&
      (a.lang ?? '') === (b.lang ?? '')
    )
  }
  return false
}

/**
 * Unify a pattern term against a concrete triple term, threading the current
 * binding environment. Returns the (possibly extended) binding, or null on
 * mismatch.
 */
function unifyTerm(
  patternTerm: SparqlTerm,
  concrete: SparqlTerm,
  binding: Binding
): Binding | null {
  if (patternTerm.type === 'var') {
    const existing = binding[patternTerm.name]
    if (existing) {
      return termEquals(existing, concrete) ? binding : null
    }
    return { ...binding, [patternTerm.name]: concrete }
  }
  return termEquals(patternTerm, concrete) ? binding : null
}

function unifyTriple(
  pattern: TriplePattern,
  triple: VirtualTriple,
  binding: Binding
): Binding | null {
  const b1 = unifyTerm(pattern.subject, triple.subject, binding)
  if (!b1) return null
  const b2 = unifyTerm(pattern.predicate, triple.predicate, b1)
  if (!b2) return null
  return unifyTerm(pattern.object, triple.object, b2)
}

/**
 * Extract the SIRET if a pattern set constraints subject to a fixed provider
 * IRI or carries a constant `sa:siret "..."` literal — single most selective
 * pattern in v0.1.
 */
function extractSiretHint(patterns: TriplePattern[]): string | null {
  for (const p of patterns) {
    if (p.subject.type === 'iri' && p.subject.value.startsWith(PROVIDER_IRI_BASE)) {
      const siret = p.subject.value.slice(PROVIDER_IRI_BASE.length)
      if (/^\d{14}$/.test(siret)) return siret
    }
    if (
      p.predicate.type === 'iri' &&
      p.predicate.value === `${SA_NS}siret` &&
      p.object.type === 'literal' &&
      /^\d{14}$/.test(p.object.value)
    ) {
      return p.object.value
    }
  }
  return null
}

/**
 * Forme structurelle minimale du client Supabase utilisée par ce module.
 * On reste volontairement permissif (chaque méthode renvoie `unknown` builder)
 * pour permettre l'injection d'un mock simple en test sans réimplémenter le
 * builder PostgREST complet. Les appels concrets sont awaités → erreurs
 * remontent via `.error.message`.
 */
export type SupabaseLike = {
  from: (table: string) => SupabaseQueryBuilder
}

type SupabaseRowResult = { data: ProviderRow[] | null; error: { message: string } | null }

interface SupabaseQueryBuilder extends PromiseLike<SupabaseRowResult> {
  select: (cols: string) => SupabaseQueryBuilder
  eq: (col: string, val: unknown) => SupabaseQueryBuilder
  not: (col: string, op: string, val: unknown) => SupabaseQueryBuilder
  limit: (n: number) => SupabaseQueryBuilder
  range: (from: number, to: number) => SupabaseQueryBuilder
}

async function fetchProviderBySiret(supabase: SupabaseLike, siret: string): Promise<ProviderRow[]> {
  const res = await supabase
    .from('providers')
    .select('siret, name, address_city, address_department, rge_qualifications')
    .eq('siret', siret)
    .eq('is_active', true)
    .eq('noindex', false)
    .limit(1)
  if (res.error) {
    throw new Error(`Database error: ${res.error.message}`)
  }
  return res.data ?? []
}

async function fetchProvidersPage(
  supabase: SupabaseLike,
  from: number,
  to: number
): Promise<ProviderRow[]> {
  const res = await supabase
    .from('providers')
    .select('siret, name, address_city, address_department, rge_qualifications')
    .eq('is_active', true)
    .eq('noindex', false)
    .not('rge_qualifications', 'is', null)
    .range(from, to)
  if (res.error) {
    throw new Error(`Database error: ${res.error.message}`)
  }
  return res.data ?? []
}

/**
 * Hash-join itératif : pour chaque pattern, on étend la liste de bindings
 * existants en unifiant contre les triples virtuels concrets.
 */
function joinPatterns(patterns: TriplePattern[], triples: VirtualTriple[]): Binding[] {
  let current: Binding[] = [{}]
  for (const pattern of patterns) {
    const next: Binding[] = []
    for (const binding of current) {
      for (const triple of triples) {
        const merged = unifyTriple(pattern, triple, binding)
        if (merged) next.push(merged)
      }
      if (next.length >= MAX_BINDINGS) break
    }
    current = next
    if (current.length === 0) return []
  }
  return current
}

/**
 * Match les patterns contre le store virtuel.
 *
 * Si `clientOverride` est fourni, l'utilise au lieu de `createAdminClient()`
 * (tests unitaires).
 */
export async function matchPatterns(
  patterns: TriplePattern[],
  limit: number,
  offset: number,
  clientOverride?: SupabaseLike
): Promise<MatchResult> {
  const supabase = clientOverride ?? (createAdminClient() as unknown as SupabaseLike)
  const effectiveLimit = Math.min(limit, MAX_BINDINGS)
  const collected: Binding[] = []
  let truncated = false
  let skipped = 0

  const siretHint = extractSiretHint(patterns)

  if (siretHint) {
    const rows = await fetchProviderBySiret(supabase, siretHint)
    for (const row of rows) {
      const triples = generateTriplesForProvider(row)
      const bindings = joinPatterns(patterns, triples)
      for (const b of bindings) {
        if (skipped < offset) {
          skipped++
          continue
        }
        if (collected.length >= effectiveLimit) {
          truncated = true
          break
        }
        collected.push(b)
      }
      if (collected.length >= effectiveLimit) break
    }
    return { bindings: collected, truncated }
  }

  // Generic scan path
  let page = 0
  // Reasonable scan ceiling : 5 pages × 200 = 1000 rows scanned per query
  // before we stop to keep p95 latency under 2s on Supabase.
  const MAX_PAGES = 5
  while (page < MAX_PAGES) {
    const from = page * PROVIDER_SCAN_PAGE
    const to = from + PROVIDER_SCAN_PAGE - 1
    const rows = await fetchProvidersPage(supabase, from, to)
    if (rows.length === 0) break
    for (const row of rows) {
      const triples = generateTriplesForProvider(row)
      const bindings = joinPatterns(patterns, triples)
      for (const b of bindings) {
        if (skipped < offset) {
          skipped++
          continue
        }
        if (collected.length >= effectiveLimit) {
          truncated = true
          break
        }
        collected.push(b)
      }
      if (collected.length >= effectiveLimit) break
    }
    if (collected.length >= effectiveLimit) break
    if (rows.length < PROVIDER_SCAN_PAGE) break
    page++
  }
  return { bindings: collected, truncated }
}

export const TRIPLES_STORE_LIMITS = {
  MAX_BINDINGS,
  PROVIDER_SCAN_PAGE,
} as const

// Re-export for tests that don't import from query-builder.
export { generateTriplesForProvider, joinPatterns, extractSiretHint }
