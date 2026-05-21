import type { MCPToolDefinition, MCPToolHandler } from '../types'
import { GESTES } from './get-bareme-mpr'

/**
 * Tool: get_aides_for_geste
 *
 * Liste les aides financières cumulables pour un geste de rénovation
 * énergétique : MaPrimeRénov', CEE, éco-PTZ, TVA 5,5%, aides régionales,
 * etc. Pour v0, on retourne une liste statique heuristique par geste,
 * basée sur la matrice publique des cumuls (cf. france-renov.gouv.fr,
 * art. 18 du décret n° 2020-26 modifié, et SSoT `src/lib/aides/**`
 * Ralph 12).
 *
 * v0.2 délèguera au calculator déterministe + filtrera par ZRR / DOM /
 * ANAH selon le contexte ménage.
 */
export const getAidesForGesteDefinition: MCPToolDefinition = {
  name: 'get_aides_for_geste',
  description:
    'Returns the list of cumulable financial aids (MaPrimeRénov, CEE, éco-PTZ, TVA 5,5%, regional bonuses) eligible for a given renovation geste. v0 returns a static heuristic mapping; v0.2 will plug into the deterministic aides calculator.',
  inputSchema: {
    type: 'object',
    properties: {
      geste: {
        type: 'string',
        enum: [...GESTES],
        description: 'Work category eligible to French renovation aids.',
      },
    },
    required: ['geste'],
    additionalProperties: false,
  },
}

type Aide = {
  code: string
  label: string
  type: 'subvention' | 'prime' | 'pret' | 'fiscal'
  cumulable: boolean
  source: string
}

const AIDES_BY_GESTE: Record<string, ReadonlyArray<Aide>> = {
  pac_air_eau: [
    {
      code: 'MPR',
      label: 'MaPrimeRénov 2026',
      type: 'subvention',
      cumulable: true,
      source: 'france-renov.gouv.fr',
    },
    {
      code: 'CEE',
      label: 'Coup de pouce chauffage CEE',
      type: 'prime',
      cumulable: true,
      source: 'CEE — fiche BAR-TH-171',
    },
    {
      code: 'ECO_PTZ',
      label: 'Éco-prêt à taux zéro',
      type: 'pret',
      cumulable: true,
      source: 'service-public.fr/particuliers/F19905',
    },
    {
      code: 'TVA_55',
      label: 'TVA 5,5% travaux',
      type: 'fiscal',
      cumulable: true,
      source: 'BOFIP TVA-LIQ-30-20-90-10',
    },
  ],
  pac_geothermique: [
    {
      code: 'MPR',
      label: 'MaPrimeRénov 2026',
      type: 'subvention',
      cumulable: true,
      source: 'france-renov.gouv.fr',
    },
    {
      code: 'CEE',
      label: 'Coup de pouce chauffage CEE',
      type: 'prime',
      cumulable: true,
      source: 'CEE — fiche BAR-TH-104',
    },
    {
      code: 'ECO_PTZ',
      label: 'Éco-prêt à taux zéro',
      type: 'pret',
      cumulable: true,
      source: 'service-public.fr/particuliers/F19905',
    },
    {
      code: 'TVA_55',
      label: 'TVA 5,5% travaux',
      type: 'fiscal',
      cumulable: true,
      source: 'BOFIP TVA-LIQ-30-20-90-10',
    },
  ],
  pac_air_air: [
    {
      code: 'CEE',
      label: 'CEE classique (hors coup de pouce)',
      type: 'prime',
      cumulable: true,
      source: 'CEE — fiche BAR-TH-129',
    },
    {
      code: 'TVA_10',
      label: 'TVA 10% travaux',
      type: 'fiscal',
      cumulable: true,
      source: 'BOFIP TVA-LIQ-30-20-90-10',
    },
  ],
  chauffe_eau_thermo: [
    {
      code: 'MPR',
      label: 'MaPrimeRénov 2026',
      type: 'subvention',
      cumulable: true,
      source: 'france-renov.gouv.fr',
    },
    {
      code: 'CEE',
      label: 'CEE chauffe-eau thermodynamique',
      type: 'prime',
      cumulable: true,
      source: 'CEE — fiche BAR-TH-148',
    },
    {
      code: 'TVA_55',
      label: 'TVA 5,5% travaux',
      type: 'fiscal',
      cumulable: true,
      source: 'BOFIP TVA-LIQ-30-20-90-10',
    },
  ],
  isolation_combles: [
    {
      code: 'MPR',
      label: 'MaPrimeRénov 2026',
      type: 'subvention',
      cumulable: true,
      source: 'france-renov.gouv.fr',
    },
    {
      code: 'CEE',
      label: 'Coup de pouce isolation CEE',
      type: 'prime',
      cumulable: true,
      source: 'CEE — fiche BAR-EN-101',
    },
    {
      code: 'ECO_PTZ',
      label: 'Éco-prêt à taux zéro',
      type: 'pret',
      cumulable: true,
      source: 'service-public.fr/particuliers/F19905',
    },
    {
      code: 'TVA_55',
      label: 'TVA 5,5% travaux',
      type: 'fiscal',
      cumulable: true,
      source: 'BOFIP TVA-LIQ-30-20-90-10',
    },
  ],
  isolation_ite: [
    {
      code: 'MPR',
      label: 'MaPrimeRénov 2026',
      type: 'subvention',
      cumulable: true,
      source: 'france-renov.gouv.fr',
    },
    {
      code: 'CEE',
      label: "CEE isolation des murs par l'extérieur",
      type: 'prime',
      cumulable: true,
      source: 'CEE — fiche BAR-EN-102',
    },
    {
      code: 'ECO_PTZ',
      label: 'Éco-prêt à taux zéro',
      type: 'pret',
      cumulable: true,
      source: 'service-public.fr/particuliers/F19905',
    },
    {
      code: 'TVA_55',
      label: 'TVA 5,5% travaux',
      type: 'fiscal',
      cumulable: true,
      source: 'BOFIP TVA-LIQ-30-20-90-10',
    },
  ],
  isolation_planchers_bas: [
    {
      code: 'MPR',
      label: 'MaPrimeRénov 2026',
      type: 'subvention',
      cumulable: true,
      source: 'france-renov.gouv.fr',
    },
    {
      code: 'CEE',
      label: 'CEE isolation planchers bas',
      type: 'prime',
      cumulable: true,
      source: 'CEE — fiche BAR-EN-103',
    },
    {
      code: 'ECO_PTZ',
      label: 'Éco-prêt à taux zéro',
      type: 'pret',
      cumulable: true,
      source: 'service-public.fr/particuliers/F19905',
    },
    {
      code: 'TVA_55',
      label: 'TVA 5,5% travaux',
      type: 'fiscal',
      cumulable: true,
      source: 'BOFIP TVA-LIQ-30-20-90-10',
    },
  ],
  vmc_double_flux: [
    {
      code: 'MPR',
      label: 'MaPrimeRénov 2026',
      type: 'subvention',
      cumulable: true,
      source: 'france-renov.gouv.fr',
    },
    {
      code: 'CEE',
      label: 'CEE VMC double flux',
      type: 'prime',
      cumulable: true,
      source: 'CEE — fiche BAR-TH-125',
    },
    {
      code: 'TVA_55',
      label: 'TVA 5,5% travaux',
      type: 'fiscal',
      cumulable: true,
      source: 'BOFIP TVA-LIQ-30-20-90-10',
    },
  ],
  chaudiere_biomasse: [
    {
      code: 'MPR',
      label: 'MaPrimeRénov 2026',
      type: 'subvention',
      cumulable: true,
      source: 'france-renov.gouv.fr',
    },
    {
      code: 'CEE',
      label: 'Coup de pouce chauffage CEE biomasse',
      type: 'prime',
      cumulable: true,
      source: 'CEE — fiche BAR-TH-113',
    },
    {
      code: 'ECO_PTZ',
      label: 'Éco-prêt à taux zéro',
      type: 'pret',
      cumulable: true,
      source: 'service-public.fr/particuliers/F19905',
    },
    {
      code: 'TVA_55',
      label: 'TVA 5,5% travaux',
      type: 'fiscal',
      cumulable: true,
      source: 'BOFIP TVA-LIQ-30-20-90-10',
    },
  ],
  audit_energetique: [
    {
      code: 'MPR',
      label: "MaPrimeRénov' audit énergétique",
      type: 'subvention',
      cumulable: true,
      source: 'france-renov.gouv.fr',
    },
  ],
}

export const getAidesForGesteTool: MCPToolHandler = async (args) => {
  const geste = args.geste
  if (typeof geste !== 'string' || !(GESTES as readonly string[]).includes(geste)) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid geste. Expected one of: ${GESTES.join(', ')}.`,
        },
      ],
      isError: true,
    }
  }

  const aides = AIDES_BY_GESTE[geste] ?? []
  const result = {
    geste,
    aides,
    note: 'MCP v0.1 returns a static heuristic mapping. v0.2 will filter dynamically by ménage, ZRR, DOM, ANAH, and regional schemes via the deterministic aides calculator.',
    source: 'france-renov.gouv.fr + CEE fiches BAR + BOFIP TVA-LIQ',
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  }
}
