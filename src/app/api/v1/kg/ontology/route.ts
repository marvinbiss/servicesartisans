/**
 * GET /api/v1/kg/ontology — SA-RGE OWL ontology (pillar 1 RGE-OS).
 *
 * Retourne l'ontologie SA-RGE en Turtle (`text/turtle`) ou JSON-LD
 * (`application/ld+json`) selon l'`Accept` header. Cache CDN 24h car le
 * contenu est statique.
 *
 * Namespace canonical : `https://servicesartisans.fr/ontology/rge#` (prefix
 * `sa:`). Toutes les IRIs RGE servies par `/api/v1/kg/sparql` utilisent ce
 * vocabulaire, ce qui rend l'endpoint federable dans le LOD cloud
 * (Wikidata, DBpedia, data.gouv-bench).
 *
 * License : CC-BY 4.0.
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const revalidate = 86_400

const TURTLE = `@prefix sa: <https://servicesartisans.fr/ontology/rge#> .
@prefix schema: <https://schema.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://servicesartisans.fr/ontology/rge> a owl:Ontology ;
  dcterms:title "SA-RGE Ontology v0.1" ;
  dcterms:description "Vocabulary for French RGE (Reconnu Garant de l'Environnement) providers and qualifications." ;
  dcterms:license <https://creativecommons.org/licenses/by/4.0/> ;
  dcterms:creator "ServicesArtisans" ;
  owl:versionInfo "0.1" .

sa:RgeProvider a owl:Class ;
  rdfs:subClassOf schema:Organization ;
  rdfs:label "RGE Provider"@en, "Artisan RGE"@fr ;
  rdfs:comment "An artisan or organisation holding at least one active RGE qualification."@en .

sa:RgeQualification a owl:Class ;
  rdfs:label "RGE Qualification"@en, "Qualification RGE"@fr ;
  rdfs:comment "A single RGE certificate (Qualibat, Qualifelec, Qualit'EnR, etc.)."@en .

sa:hasQualification a owl:ObjectProperty ;
  rdfs:domain sa:RgeProvider ;
  rdfs:range sa:RgeQualification ;
  rdfs:label "hasQualification"@en .

sa:qualifCode a owl:DatatypeProperty ;
  rdfs:domain sa:RgeQualification ;
  rdfs:range xsd:string ;
  rdfs:label "qualification code"@en ;
  rdfs:comment "Official RGE code (e.g. '5911', '7131', 'IRVE-1')."@en .

sa:qualifLibelle a owl:DatatypeProperty ;
  rdfs:domain sa:RgeQualification ;
  rdfs:range xsd:string ;
  rdfs:label "qualification label"@en .

sa:validUntil a owl:DatatypeProperty ;
  rdfs:domain sa:RgeQualification ;
  rdfs:range xsd:date ;
  rdfs:label "valid until"@en ;
  rdfs:comment "End-of-validity date of the qualification (ISO 8601)."@en .

sa:siret a owl:DatatypeProperty ;
  rdfs:domain sa:RgeProvider ;
  rdfs:range xsd:string ;
  rdfs:label "SIRET"@en ;
  rdfs:comment "14-digit French SIRET identifier."@en .

sa:ville a owl:DatatypeProperty ;
  rdfs:domain sa:RgeProvider ;
  rdfs:range xsd:string ;
  rdfs:label "city"@en, "ville"@fr .

sa:departement a owl:DatatypeProperty ;
  rdfs:domain sa:RgeProvider ;
  rdfs:range xsd:string ;
  rdfs:label "department"@en, "departement"@fr ;
  rdfs:comment "INSEE department code (e.g. '75', '69', '2A', '974')."@en .

sa:Aide a owl:Class ;
  rdfs:label "Renovation aid"@en, "Aide a la renovation"@fr ;
  rdfs:comment "A French renovation aid (MaPrimeRenov, CEE, Eco-PTZ, local aids)."@en .

sa:Geste a owl:Class ;
  rdfs:label "Renovation gesture"@en, "Geste de renovation"@fr ;
  rdfs:comment "A renovation work item (PAC, ITE, attic insulation, etc.)."@en .
`

const JSONLD = {
  '@context': {
    sa: 'https://servicesartisans.fr/ontology/rge#',
    schema: 'https://schema.org/',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    owl: 'http://www.w3.org/2002/07/owl#',
    dcterms: 'http://purl.org/dc/terms/',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
  },
  '@graph': [
    {
      '@id': 'https://servicesartisans.fr/ontology/rge',
      '@type': 'owl:Ontology',
      'dcterms:title': 'SA-RGE Ontology v0.1',
      'dcterms:license': { '@id': 'https://creativecommons.org/licenses/by/4.0/' },
      'dcterms:creator': 'ServicesArtisans',
      'owl:versionInfo': '0.1',
      'rdfs:isDefinedBy': {
        '@id': 'https://servicesartisans.fr/api/v1/kg/sparql',
      },
    },
    {
      '@id': 'sa:RgeProvider',
      '@type': 'owl:Class',
      'rdfs:subClassOf': { '@id': 'schema:Organization' },
      'rdfs:label': [
        { '@value': 'RGE Provider', '@language': 'en' },
        { '@value': 'Artisan RGE', '@language': 'fr' },
      ],
    },
    {
      '@id': 'sa:RgeQualification',
      '@type': 'owl:Class',
      'rdfs:label': [
        { '@value': 'RGE Qualification', '@language': 'en' },
        { '@value': 'Qualification RGE', '@language': 'fr' },
      ],
    },
    {
      '@id': 'sa:hasQualification',
      '@type': 'owl:ObjectProperty',
      'rdfs:domain': { '@id': 'sa:RgeProvider' },
      'rdfs:range': { '@id': 'sa:RgeQualification' },
    },
    {
      '@id': 'sa:qualifCode',
      '@type': 'owl:DatatypeProperty',
      'rdfs:domain': { '@id': 'sa:RgeQualification' },
      'rdfs:range': { '@id': 'xsd:string' },
    },
    {
      '@id': 'sa:qualifLibelle',
      '@type': 'owl:DatatypeProperty',
      'rdfs:domain': { '@id': 'sa:RgeQualification' },
      'rdfs:range': { '@id': 'xsd:string' },
    },
    {
      '@id': 'sa:validUntil',
      '@type': 'owl:DatatypeProperty',
      'rdfs:domain': { '@id': 'sa:RgeQualification' },
      'rdfs:range': { '@id': 'xsd:date' },
    },
    {
      '@id': 'sa:siret',
      '@type': 'owl:DatatypeProperty',
      'rdfs:domain': { '@id': 'sa:RgeProvider' },
      'rdfs:range': { '@id': 'xsd:string' },
    },
    {
      '@id': 'sa:ville',
      '@type': 'owl:DatatypeProperty',
      'rdfs:domain': { '@id': 'sa:RgeProvider' },
      'rdfs:range': { '@id': 'xsd:string' },
    },
    {
      '@id': 'sa:departement',
      '@type': 'owl:DatatypeProperty',
      'rdfs:domain': { '@id': 'sa:RgeProvider' },
      'rdfs:range': { '@id': 'xsd:string' },
    },
  ],
}

function negotiate(accept: string): 'turtle' | 'jsonld' {
  if (accept.includes('text/turtle') || accept.includes('application/x-turtle')) {
    return 'turtle'
  }
  return 'jsonld'
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const accept = req.headers.get('accept') ?? ''
    const fmt = negotiate(accept)
    if (fmt === 'turtle') {
      return new NextResponse(TURTLE, {
        status: 200,
        headers: {
          'Content-Type': 'text/turtle; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'X-License': 'CC-BY-4.0',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
    return NextResponse.json(JSONLD, {
      status: 200,
      headers: {
        'Content-Type': 'application/ld+json; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-License': 'CC-BY-4.0',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    logger.error('[api/v1/kg/ontology] GET failed', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}
