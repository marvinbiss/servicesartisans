/**
 * Shared types + constants for the SPARQL endpoint (parser, store, serializer).
 *
 * Centralisé ici pour éviter les cycles d'import et garder un seul lieu où le
 * vocabulaire IRIs SA-RGE est défini.
 */

export type SparqlVariable = { type: 'var'; name: string }
export type SparqlIri = { type: 'iri'; value: string }
export type SparqlLiteral = {
  type: 'literal'
  value: string
  datatype?: string
  lang?: string
}
export type SparqlTerm = SparqlVariable | SparqlIri | SparqlLiteral

export type TriplePattern = {
  subject: SparqlTerm
  predicate: SparqlTerm
  object: SparqlTerm
}

export type Binding = Record<string, SparqlTerm>

export const SA_NS = 'https://servicesartisans.fr/ontology/rge#'
export const PROVIDER_IRI_BASE = 'https://servicesartisans.fr/r/p/'
export const QUALIF_IRI_BASE = 'https://servicesartisans.fr/r/q/'
