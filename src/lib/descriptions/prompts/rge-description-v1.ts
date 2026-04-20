/**
 * Prompt builder for RGE artisan description generation (v1.0).
 *
 * Pure function: no API call, no I/O. Returns the full prompt string
 * to be sent to Haiku 4.5 (bulk) or Sonnet 4.6 (rescue).
 *
 * Grounding contract: the LLM may ONLY restate facts present in
 * ProviderContext. Anything else = hallucination = rejected by validator.
 *
 * See docs/descriptions-pipeline/SPEC-V1.md sections 1.4 and 3 for the
 * rubric and the grounding / YMYL constraints this prompt enforces.
 */

export const PROMPT_VERSION = 'rge-description-v1.1'

/**
 * Optional INSEE-sourced E-E-A-T signals surfaced when available
 * (see migration 459 + scripts/enrich-providers-insee.ts). Absent =
 * pipeline falls back to v1.0 behaviour with no extra facts cited.
 */
export type InseeContext = {
  date_creation: string | null
  age_years: number | null
  tranche_effectif_label: string | null
  activite_principale_naf: string | null
  etat_administratif: string | null
  nombre_etablissements: number | null
  liste_rge_codes_count: number | null
}

export type ProviderContext = {
  name: string
  slug: string
  address_city: string
  address_region: string
  specialty: string
  rge_qualifications: string[]
  rge_valid_until: string
  claimed_at: string | null
  ademe_categories: string[]
  ademe_meta_domains: string[]
  baseline_text: string | null
  insee?: InseeContext | null
}

const formatList = (items: string[]): string => {
  const clean = items.map((s) => s.trim()).filter((s) => s.length > 0)
  if (clean.length === 0) return '(none provided)'
  return clean.map((s) => `- ${s}`).join('\n')
}

const formatClaim = (claimed_at: string | null): string => {
  if (!claimed_at) {
    return 'Profile NOT claimed by the artisan. Do not address the reader as the artisan. Describe the business in third person only.'
  }
  return `Profile claimed by the artisan on ${claimed_at}. You may reference publicly listed information only.`
}

const formatInseeContext = (insee: InseeContext | null | undefined): string => {
  if (!insee) return '(not available)'
  const lines: string[] = []
  if (insee.date_creation) {
    const age = insee.age_years !== null ? ` (≈ ${insee.age_years} ans d'ancienneté)` : ''
    lines.push(`- Date de création officielle : ${insee.date_creation}${age}`)
  }
  if (insee.tranche_effectif_label) {
    lines.push(`- Effectif déclaré INSEE : ${insee.tranche_effectif_label}`)
  }
  if (insee.activite_principale_naf) {
    lines.push(`- Code NAF principal : ${insee.activite_principale_naf}`)
  }
  if (insee.nombre_etablissements && insee.nombre_etablissements > 1) {
    lines.push(`- Nombre d'établissements : ${insee.nombre_etablissements}`)
  }
  if (insee.liste_rge_codes_count && insee.liste_rge_codes_count > 0) {
    lines.push(
      `- ${insee.liste_rge_codes_count} qualification(s) RGE recensée(s) au registre officiel`
    )
  }
  if (insee.etat_administratif === 'A') {
    lines.push(`- Entreprise active au registre INSEE`)
  }
  return lines.length === 0 ? '(not available)' : lines.join('\n')
}

export const buildRgeDescriptionPrompt = (provider: ProviderContext): string => {
  const {
    name,
    address_city,
    address_region,
    specialty,
    rge_qualifications,
    rge_valid_until,
    claimed_at,
    ademe_categories,
    ademe_meta_domains,
    baseline_text,
    insee,
  } = provider

  return `# Role

You are a senior French local-SEO editor writing a factual, neutral business description for a directory of certified RGE (Reconnu Garant de l'Environnement) artisans in France.

# Absolute grounding rule

You write NOTHING that is not supplied in the "Provider context" section below. Forbidden inventions include (non-exhaustive):
- pricing, hourly rates, quote ranges
- years of experience, staff headcount, client references
- certifications, labels or awards NOT listed in \`rge_qualifications\`
- claims about MaPrimeRénov' amounts, CEE premium amounts, or any individualised financial aid (YMYL zero tolerance)
- subjective superlatives ("best", "leading", "trusted by thousands")
- phone numbers, email addresses, SIRET numbers
- testimonials, customer names, case studies

If a fact is missing, omit it. Never fill a gap with a plausible guess.

# Editorial constraints

- Language: French (metropolitan).
- Length: **250-350 words** (hard target; under 230 or over 380 will be rejected).
- Tone: informative, local, neutral. NOT commercial, NOT promotional.
- Perspective: third person, present tense.
- No emoji, no hashtags, no bullet lists, no markdown, no headings.
- No short fragments; full sentences only.
- Output: plain text of the description ONLY — no JSON, no markdown wrapper, no preamble, no sign-off.

# Required content (only if present in context)

1. Business identity: name, city, region.
2. Specialty / craft focus (single clear sentence).
3. RGE qualifications held, each named explicitly, with the validity end date (\`rge_valid_until\`).
4. ADEME recognised categories and meta-domains when they add specificity.
5. When the "Registre officiel INSEE" block is available, fold at least one objective signal from it into the narrative (e.g. official creation year, salaried headcount band, multi-establishment presence). This is the Experience / Authoritativeness pillar of E-E-A-T and must stay strictly factual — no superlatives, no "plus de X ans d'expérience" boilerplate, just the bare datum from the registry.
6. One closing sentence, practical, stating the local intervention area and indicating that the reader can request a quote via ServicesArtisans (the directory). Do not give a phone number or email.

# Provider context

Name: ${name}
City: ${address_city}
Region: ${address_region}
Primary specialty: ${specialty}
RGE qualifications (the ONLY certifications you may name):
${formatList(rge_qualifications)}
RGE validity end date (to cite textually): ${rge_valid_until}
ADEME categories:
${formatList(ademe_categories)}
ADEME meta-domains:
${formatList(ademe_meta_domains)}

Registre officiel INSEE / Sirene (data.gouv.fr — source of truth for Experience & Authority signals) :
${formatInseeContext(insee)}

Claim status: ${formatClaim(claimed_at)}

Prior baseline description (for reference only — DO NOT copy, rephrase fully, and discard any fact not present in the structured context above):
${baseline_text ?? '(none)'}

# Output

Return only the 250-350 word French description as plain text. No preface, no explanation, no quotes, no code block.`
}
