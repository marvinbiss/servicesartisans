import type { MCPToolDefinition, MCPToolHandler } from '../types'

/**
 * Tool: get_bareme_mpr
 *
 * Retourne le montant MaPrimeRénov' pour un geste + catégorie de ménage.
 *
 * v0 stub — retourne `{ amount: null, source: 'pending_v0.2' }` et
 * redirige vers le calculator déterministe `/api/v1/aides/mpr-bareme`.
 * Sera relié à `src/lib/aides/**` (Ralph 12, en parallèle) dans un
 * sprint follow-up. Cette tool est expose dès v0 pour que les clients
 * MCP puissent commencer à câbler leur UX sans attendre l'implémentation
 * complète.
 */
export const GESTES = [
  'pac_air_eau',
  'pac_geothermique',
  'pac_air_air',
  'chauffe_eau_thermo',
  'isolation_combles',
  'isolation_ite',
  'isolation_planchers_bas',
  'vmc_double_flux',
  'chaudiere_biomasse',
  'audit_energetique',
] as const

export const MENAGE_CATEGORIES = ['tres_modeste', 'modeste', 'intermediaire', 'superieur'] as const

export type Geste = (typeof GESTES)[number]
export type MenageCategorie = (typeof MENAGE_CATEGORIES)[number]

export const getBaremeMprDefinition: MCPToolDefinition = {
  name: 'get_bareme_mpr',
  description:
    "Returns the MaPrimeRénov' subsidy amount for a given geste (work category) and ménage_categorie (household income tier). v0 stub: returns a pointer to the deterministic calculator; v0.2 will inline the numeric amount.",
  inputSchema: {
    type: 'object',
    properties: {
      geste: {
        type: 'string',
        enum: [...GESTES],
        description: 'Work category eligible to MaPrimeRénov 2026.',
      },
      menage_categorie: {
        type: 'string',
        enum: [...MENAGE_CATEGORIES],
        description:
          'Household income tier (bleu=tres_modeste, jaune=modeste, violet=intermediaire, rose=superieur).',
      },
      annee: {
        type: 'integer',
        minimum: 2024,
        maximum: 2030,
        default: 2026,
        description: 'Reference year for the bareme (default 2026).',
      },
    },
    required: ['geste', 'menage_categorie'],
    additionalProperties: false,
  },
}

export const getBaremeMprTool: MCPToolHandler = async (args) => {
  const geste = args.geste
  const menage = args.menage_categorie
  const annee = typeof args.annee === 'number' ? args.annee : 2026

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
  if (typeof menage !== 'string' || !(MENAGE_CATEGORIES as readonly string[]).includes(menage)) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid menage_categorie. Expected one of: ${MENAGE_CATEGORIES.join(', ')}.`,
        },
      ],
      isError: true,
    }
  }
  if (!Number.isInteger(annee) || annee < 2024 || annee > 2030) {
    return {
      content: [{ type: 'text', text: 'Invalid annee: must be an integer between 2024 and 2030.' }],
      isError: true,
    }
  }

  const result = {
    geste,
    menage_categorie: menage,
    annee,
    amount: null,
    source: 'pending_v0.2',
    message:
      'MCP v0.1 returns a pointer. Use the deterministic calculator at /api/v1/aides/mpr-bareme (Ralph 12). v0.2 will inline the numeric amount from the same SSoT.',
    canonical_url: `https://servicesartisans.fr/api/v1/aides/mpr-bareme?geste=${encodeURIComponent(
      geste
    )}&menage=${encodeURIComponent(menage)}&annee=${annee}`,
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  }
}
