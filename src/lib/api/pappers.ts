/**
 * API Pappers - Données légales et financières des entreprises
 * Documentation: https://www.pappers.fr/api
 *
 * Enrichissement des fiches artisans avec :
 * - Infos financières (CA, résultat)
 * - Dirigeants
 * - Procédures collectives
 * - Annonces légales
 */

const PAPPERS_API_KEY = process.env.PAPPERS_API_KEY

interface Dirigeant {
  nom: string
  prenom: string
  fonction: string
  dateNaissance?: string
  nationalite?: string
}

interface InfosFinancieres {
  annee: number
  chiffreAffaires: number | null
  resultat: number | null
  effectif: string | null
}

export interface EntrepriseComplete {
  // Identifiants
  siren: string
  siret: string

  // Informations générales
  nom: string
  nomCommercial: string | null
  formeJuridique: string
  formeJuridiqueCode: string
  dateCreation: string
  dateCreationFormate: string

  // Activité
  codeNAF: string
  libelleNAF: string
  domaine: string

  // Adresse
  siege: {
    adresse: string
    codePostal: string
    ville: string
    pays: string
    latitude?: number
    longitude?: number
  }

  // Dirigeants
  dirigeants: Dirigeant[]

  // Financier
  capital: number | null
  capitalFormate: string | null
  finances: InfosFinancieres[]
  dernierCA: number | null
  dernierResultat: number | null

  // Effectif
  effectif: string | null
  trancheEffectif: string | null

  // État
  actif: boolean
  radiee: boolean
  dateRadiation?: string

  // Procédures
  procedureCollective: boolean
  procedureEnCours: string | null

  // Badges de confiance
  badges: {
    entrepriseSaine: boolean
    plusDe5Ans: boolean
    caSuperieur100k: boolean
    dirigeantIdentifie: boolean
  }
}

export interface RechercheResultat {
  siren: string
  siret: string
  nom: string
  codePostal: string
  ville: string
  codeNAF: string
  libelleNAF: string
  actif: boolean
}

// ============================================
// RECHERCHE ENTREPRISE PAR SIRET
// ============================================

/**
 * Récupère les informations complètes d'une entreprise par SIRET
 */
export async function getEntrepriseParSiret(siret: string): Promise<EntrepriseComplete | null> {
  if (!PAPPERS_API_KEY) {
    console.warn('PAPPERS_API_KEY non configurée')
    return null
  }

  // Nettoyer le SIRET
  const siretClean = siret.replace(/\s/g, '')
  if (siretClean.length !== 14) {
    console.error('SIRET invalide:', siret)
    return null
  }

  try {
    const response = await fetch(
      `https://api.pappers.fr/v2/entreprise?siret=${siretClean}&api_token=${PAPPERS_API_KEY}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 86400 } // Cache 24h
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Entreprise non trouvée:', siret)
        return null
      }
      throw new Error(`Pappers API error: ${response.status}`)
    }

    const data = await response.json()
    return transformerDonneesPappers(data)
  } catch (error) {
    console.error('Erreur Pappers:', error)
    return null
  }
}

/**
 * Récupère les informations par SIREN
 */
export async function getEntrepriseParSiren(siren: string): Promise<EntrepriseComplete | null> {
  if (!PAPPERS_API_KEY) return null

  const sirenClean = siren.replace(/\s/g, '')
  if (sirenClean.length !== 9) {
    console.error('SIREN invalide:', siren)
    return null
  }

  try {
    const response = await fetch(
      `https://api.pappers.fr/v2/entreprise?siren=${sirenClean}&api_token=${PAPPERS_API_KEY}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 86400 }
      }
    )

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Pappers API error: ${response.status}`)
    }

    const data = await response.json()
    return transformerDonneesPappers(data)
  } catch (error) {
    console.error('Erreur Pappers:', error)
    return null
  }
}

// ============================================
// RECHERCHE PAR NOM
// ============================================

/**
 * Recherche des entreprises par nom et/ou code postal
 */
export async function rechercherEntreprises(
  query: string,
  options?: {
    codePostal?: string
    codeNAF?: string
    formeJuridique?: string
    limit?: number
  }
): Promise<RechercheResultat[]> {
  if (!PAPPERS_API_KEY) return []

  try {
    const params = new URLSearchParams({
      q: query,
      api_token: PAPPERS_API_KEY,
      par_page: String(options?.limit || 10)
    })

    if (options?.codePostal) {
      params.append('code_postal', options.codePostal)
    }
    if (options?.codeNAF) {
      params.append('code_naf', options.codeNAF)
    }
    if (options?.formeJuridique) {
      params.append('forme_juridique', options.formeJuridique)
    }

    const response = await fetch(
      `https://api.pappers.fr/v2/recherche?${params.toString()}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) {
      throw new Error(`Pappers search error: ${response.status}`)
    }

    const data = await response.json()

    return (data.resultats || []).map((r: any) => ({
      siren: r.siren,
      siret: r.siege?.siret || r.siren + '00000',
      nom: r.nom_entreprise,
      codePostal: r.siege?.code_postal || '',
      ville: r.siege?.ville || '',
      codeNAF: r.code_naf || '',
      libelleNAF: r.libelle_code_naf || '',
      actif: !r.entreprise_cessee
    }))
  } catch (error) {
    console.error('Erreur recherche Pappers:', error)
    return []
  }
}

// ============================================
// VERIFICATION SANTE ENTREPRISE
// ============================================

/**
 * Vérifie rapidement si une entreprise est "saine"
 * (active, pas de procédure collective, existence > 1 an)
 */
export async function verifierSanteEntreprise(siret: string): Promise<{
  saine: boolean
  raisons: string[]
  score: number // 0-100
}> {
  const entreprise = await getEntrepriseParSiret(siret)

  if (!entreprise) {
    return {
      saine: false,
      raisons: ['Entreprise non trouvée'],
      score: 0
    }
  }

  const raisons: string[] = []
  let score = 100

  // Vérifier si active
  if (!entreprise.actif || entreprise.radiee) {
    raisons.push('Entreprise inactive ou radiée')
    score -= 100
  }

  // Vérifier les procédures collectives
  if (entreprise.procedureCollective) {
    raisons.push(`Procédure en cours: ${entreprise.procedureEnCours}`)
    score -= 50
  }

  // Vérifier l'ancienneté (moins de 1 an = risque)
  const dateCreation = new Date(entreprise.dateCreation)
  const anciennete = (Date.now() - dateCreation.getTime()) / (1000 * 60 * 60 * 24 * 365)
  if (anciennete < 1) {
    raisons.push('Entreprise créée il y a moins d\'un an')
    score -= 20
  }

  // Vérifier le CA (si disponible)
  if (entreprise.dernierCA !== null && entreprise.dernierCA < 10000) {
    raisons.push('Chiffre d\'affaires très faible')
    score -= 10
  }

  // Vérifier le résultat négatif
  if (entreprise.dernierResultat !== null && entreprise.dernierResultat < 0) {
    raisons.push('Résultat déficitaire')
    score -= 15
  }

  return {
    saine: score >= 70,
    raisons: raisons.length > 0 ? raisons : ['Aucun problème détecté'],
    score: Math.max(0, score)
  }
}

// ============================================
// TRANSFORMATION DONNEES
// ============================================

function transformerDonneesPappers(data: any): EntrepriseComplete {
  const siege = data.siege || {}
  const dirigeants = (data.representants || []).map((r: any) => ({
    nom: r.nom || '',
    prenom: r.prenom || '',
    fonction: r.qualite || '',
    dateNaissance: r.date_de_naissance,
    nationalite: r.nationalite
  }))

  const finances: InfosFinancieres[] = (data.finances || []).map((f: any) => ({
    annee: f.annee,
    chiffreAffaires: f.chiffre_affaires,
    resultat: f.resultat,
    effectif: f.effectif
  }))

  const dernierBilan = finances[0] || {}
  const dateCreation = new Date(data.date_creation || Date.now())
  const ancienneteAnnees = Math.floor(
    (Date.now() - dateCreation.getTime()) / (1000 * 60 * 60 * 24 * 365)
  )

  // Calcul des badges
  const badges = {
    entrepriseSaine: !data.entreprise_cessee && !data.procedure_collective_en_cours,
    plusDe5Ans: ancienneteAnnees >= 5,
    caSuperieur100k: (dernierBilan.chiffreAffaires || 0) >= 100000,
    dirigeantIdentifie: dirigeants.length > 0
  }

  return {
    siren: data.siren || '',
    siret: siege.siret || data.siren + '00000',

    nom: data.nom_entreprise || '',
    nomCommercial: data.nom_commercial,
    formeJuridique: data.forme_juridique || '',
    formeJuridiqueCode: data.categorie_juridique || '',
    dateCreation: data.date_creation || '',
    dateCreationFormate: data.date_creation
      ? new Date(data.date_creation).toLocaleDateString('fr-FR')
      : '',

    codeNAF: data.code_naf || '',
    libelleNAF: data.libelle_code_naf || '',
    domaine: data.domaine_activite || '',

    siege: {
      adresse: siege.adresse_ligne_1 || '',
      codePostal: siege.code_postal || '',
      ville: siege.ville || '',
      pays: siege.pays || 'France',
      latitude: siege.latitude,
      longitude: siege.longitude
    },

    dirigeants,
    finances,

    capital: data.capital,
    capitalFormate: data.capital
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.capital)
      : null,
    dernierCA: dernierBilan.chiffreAffaires ?? null,
    dernierResultat: dernierBilan.resultat ?? null,

    effectif: data.effectif,
    trancheEffectif: data.tranche_effectif,

    actif: !data.entreprise_cessee,
    radiee: !!data.entreprise_cessee,
    dateRadiation: data.date_cessation,

    procedureCollective: !!data.procedure_collective_en_cours,
    procedureEnCours: data.procedure_collective_en_cours,

    badges
  }
}

// ============================================
// FORMATAGE
// ============================================

/**
 * Formate un montant en euros
 */
export function formaterMontant(montant: number | null): string {
  if (montant === null) return 'N/C'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(montant)
}

/**
 * Formate l'ancienneté
 */
export function formaterAnciennete(dateCreation: string): string {
  const date = new Date(dateCreation)
  const annees = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365))

  if (annees < 1) return 'Moins d\'un an'
  if (annees === 1) return '1 an'
  return `${annees} ans`
}

/**
 * Obtient le badge de confiance approprié
 */
export function getBadgeConfiance(entreprise: EntrepriseComplete): {
  niveau: 'gold' | 'silver' | 'bronze' | 'none'
  label: string
  description: string
} {
  const { badges } = entreprise

  if (badges.entrepriseSaine && badges.plusDe5Ans && badges.caSuperieur100k) {
    return {
      niveau: 'gold',
      label: 'Entreprise établie',
      description: 'Plus de 5 ans d\'activité, CA > 100k€, aucun problème'
    }
  }

  if (badges.entrepriseSaine && badges.plusDe5Ans) {
    return {
      niveau: 'silver',
      label: 'Entreprise confirmée',
      description: 'Plus de 5 ans d\'activité, situation saine'
    }
  }

  if (badges.entrepriseSaine) {
    return {
      niveau: 'bronze',
      label: 'Entreprise vérifiée',
      description: 'Situation légale conforme'
    }
  }

  return {
    niveau: 'none',
    label: 'Non vérifié',
    description: 'Informations insuffisantes'
  }
}
