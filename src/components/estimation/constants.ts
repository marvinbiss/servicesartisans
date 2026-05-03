// ---------------------------------------------------------------------------
// Quick prompts par metier
// ---------------------------------------------------------------------------

// Pivot full RGE 2026-05-03 : serrurier/carreleur/vitrier/cuisiniste retirés
// (commodity hors RGE — slugs catalog 21).
export const quickPrompts: Record<string, string[]> = {
  plombier: [
    "J'ai une fuite d'eau",
    'Refaire ma salle de bain',
    'Chauffe-eau en panne',
    'WC suspendu à installer',
  ],
  electricien: [
    'Tableau qui disjoncte',
    'Mise aux normes',
    'Ajouter des prises',
    'Installer une borne de recharge',
  ],
  chauffagiste: [
    'Chaudière en panne',
    'Installer un radiateur',
    'Entretien chaudière',
    'Pompe à chaleur',
  ],
  couvreur: ['Fuite toiture', 'Rénovation toiture', 'Nettoyage toiture', 'Gouttières'],
  peintre: [
    'Peindre un appartement',
    'Ravalement de façade',
    'Repeindre une pièce',
    'Traitement humidité murs',
  ],
  menuisier: ['Porte sur mesure', 'Placard intégré', 'Escalier bois', 'Fenêtres à changer'],
  macon: ['Extension maison', 'Mur de clôture', 'Terrasse béton', 'Ouverture mur porteur'],
  'pompe-a-chaleur': [
    'Installation pompe à chaleur',
    'Remplacement chaudière par PAC',
    'Entretien PAC annuel',
    'Devis PAC air-eau',
  ],
  'isolation-thermique': [
    'Isolation des combles',
    'Isolation extérieure (ITE)',
    'Isolation murs intérieurs',
    'Devis isolation maison',
  ],
}

export const defaultPrompts = [
  'Estimer mon projet',
  'Demander un devis',
  'Besoin urgent',
  'Question sur les prix',
]

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

export const GREETING_STORAGE_KEY = 'sa_estimation_greeting_dismissed'
export const RETURN_VISITOR_KEY = 'sa_estimation_visited'
export const CONVERSATION_STORAGE_KEY = 'sa_estimation_conversation'

// ---------------------------------------------------------------------------
// Prix d'appel réalistes par métier (min €) pour le teaser
// ---------------------------------------------------------------------------

// Pivot full RGE 2026-05-03 : serrurier/carreleur/vitrier/cuisiniste retirés.
export const priceTeasers: Record<string, string> = {
  plombier: 'Fuite d’eau : à partir de 80€',
  electricien: 'Panne électrique : à partir de 70€',
  chauffagiste: 'Entretien chaudière : à partir de 90€',
  couvreur: 'Réparation toiture : à partir de 150€',
  peintre: 'Peinture pièce : à partir de 25€/m²',
  menuisier: 'Porte sur mesure : à partir de 200€',
  macon: 'Mur de clôture : à partir de 100€/ml',
  climaticien: 'Installation clim : à partir de 800€',
  'pompe-a-chaleur': 'PAC air-eau : à partir de 10 000€',
  'isolation-thermique': 'Isolation combles : à partir de 20€/m²',
}

// ---------------------------------------------------------------------------
// Lead form trigger keywords
// ---------------------------------------------------------------------------

export const LEAD_TRIGGER_KEYWORDS = [
  'mise en relation',
  'rappel',
  'mettre en contact',
  'contacter un',
  'souhaitez-vous',
]
