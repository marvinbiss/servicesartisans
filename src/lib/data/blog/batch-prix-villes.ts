import type { BlogArticle } from './articles'
import { villesLight } from '../france-light'

// ---------------------------------------------------------------------------
// 5 metiers les plus recherches (reduit de 10 a 5 — Helpful Content cleanup)
// Les 5 metiers retires (menuisier, macon, couvreur, carreleur, plaquiste)
// sont rediriges vers leur article prix national dans next.config.js
// ---------------------------------------------------------------------------

interface Prestation {
  nom: string
  min: number
  max: number
  unite?: string
}

interface Metier {
  slug: string
  name: string
  article: string
  plural: string
  tarifMin: number
  tarifMax: number
  unit: string
  prestations: Prestation[]
  specialites: string[]
}

const METIERS: Metier[] = [
  {
    slug: 'plombier',
    name: 'Plombier',
    article: 'un plombier',
    plural: 'plombiers',
    tarifMin: 45,
    tarifMax: 75,
    unit: '\u20AC/h',
    prestations: [
      { nom: 'D\u00E9bouchage simple', min: 90, max: 200 },
      { nom: 'R\u00E9paration fuite', min: 120, max: 350 },
      { nom: 'Remplacement chauffe-eau', min: 400, max: 1200 },
      { nom: 'Salle de bain compl\u00E8te', min: 3000, max: 8000 },
    ],
    specialites: ['d\u00E9pannage', 'installation sanitaire', 'chauffage'],
  },
  {
    slug: 'electricien',
    name: '\u00C9lectricien',
    article: 'un \u00E9lectricien',
    plural: '\u00E9lectriciens',
    tarifMin: 40,
    tarifMax: 65,
    unit: '\u20AC/h',
    prestations: [
      { nom: 'Pose prise / interrupteur', min: 80, max: 150 },
      { nom: 'Tableau \u00E9lectrique', min: 1000, max: 2500 },
      { nom: 'Mise aux normes', min: 80, max: 120, unite: '\u20AC/m\u00B2' },
      { nom: 'Installation domotique', min: 500, max: 3000 },
    ],
    specialites: ['mise aux normes', 'domotique', '\u00E9clairage'],
  },
  {
    slug: 'serrurier',
    name: 'Serrurier',
    article: 'un serrurier',
    plural: 'serruriers',
    tarifMin: 40,
    tarifMax: 70,
    unit: '\u20AC/h',
    prestations: [
      { nom: 'Ouverture de porte', min: 80, max: 150 },
      { nom: 'Serrure 3 points', min: 250, max: 850 },
      { nom: 'Blindage de porte', min: 600, max: 1200 },
      { nom: 'Double de cl\u00E9 s\u00E9curis\u00E9', min: 30, max: 120 },
    ],
    specialites: ['d\u00E9pannage urgence', 'blindage', 's\u00E9curit\u00E9'],
  },
  {
    slug: 'chauffagiste',
    name: 'Chauffagiste',
    article: 'un chauffagiste',
    plural: 'chauffagistes',
    tarifMin: 50,
    tarifMax: 80,
    unit: '\u20AC/h',
    prestations: [
      { nom: 'Entretien chaudi\u00E8re', min: 90, max: 200 },
      { nom: 'Installation PAC', min: 8000, max: 15000 },
      { nom: 'Remplacement radiateur', min: 250, max: 800 },
      { nom: 'Plancher chauffant', min: 50, max: 120, unite: '\u20AC/m\u00B2' },
    ],
    specialites: ['entretien', 'pompe \u00E0 chaleur', 'chaudi\u00E8re gaz'],
  },
  {
    slug: 'peintre-en-batiment',
    name: 'Peintre en b\u00E2timent',
    article: 'un peintre en b\u00E2timent',
    plural: 'peintres en b\u00E2timent',
    tarifMin: 25,
    tarifMax: 45,
    unit: '\u20AC/h',
    prestations: [
      { nom: 'Peinture int\u00E9rieure', min: 20, max: 40, unite: '\u20AC/m\u00B2' },
      { nom: 'Ravalement fa\u00E7ade', min: 40, max: 100, unite: '\u20AC/m\u00B2' },
      { nom: 'Papier peint', min: 15, max: 35, unite: '\u20AC/m\u00B2' },
      { nom: 'Peinture d\u00E9corative', min: 30, max: 80, unite: '\u20AC/m\u00B2' },
    ],
    specialites: ['peinture d\u00E9corative', 'ravalement', 'enduits'],
  },

]

// ---------------------------------------------------------------------------
// 10 premieres villes (reduit de 20 a 10 — Helpful Content cleanup)
// Les 10 villes retirees (rennes, reims, le-havre, saint-etienne, toulon,
// grenoble, dijon, angers, nimes, villeurbanne) sont redirigees dans next.config.js
// ---------------------------------------------------------------------------

const TOP_VILLES = villesLight.slice(0, 10)

// ---------------------------------------------------------------------------
// Donnees locales enrichies par ville
// ---------------------------------------------------------------------------

type VilleType = 'grande-metropole' | 'ville-moyenne' | 'ville-cotiere' | 'ville-montagne' | 'banlieue-parisienne'

interface CityLocalData {
  population: number
  densite: 'forte' | 'moyenne' | 'faible'
  niveauVie: number // indice 100 = moyenne nationale
  type: VilleType
  particularites: string[]
  /** Materiaux et contraintes architecturales locales */
  architecture: string
  /** Specificite climatique impactant les travaux */
  climat: string
  /** Secteurs chers vs accessibles */
  zonesCheres: string[]
  zonesAccessibles: string[]
  /** Coefficient peripherie (prix centre / prix peripherie) */
  coeffPeripherie: number
  /** Delai moyen d'intervention en jours */
  delaiMoyen: string
}

const CITY_DATA: Record<string, CityLocalData> = {
  paris: {
    population: 2104000,
    densite: 'forte',
    niveauVie: 135,
    type: 'grande-metropole',
    particularites: [
      'Immeubles haussmanniens avec moulures, parquets massifs et chemin\u00E9es en marbre',
      'Cage d\u2019escalier \u00E9troite et absence fr\u00E9quente d\u2019ascenseur dans les immeubles anciens',
      'R\u00E8glementation stricte des Architectes des B\u00E2timents de France dans le centre historique',
      'Stationnement tr\u00E8s difficile augmentant les frais de d\u00E9placement',
    ],
    architecture: 'Pierre de taille, enduits pl\u00E2tre, parquets ch\u00EAne massif, fen\u00EAtres bois \u00E0 petits carreaux',
    climat: 'Climat oc\u00E9anique d\u00E9grad\u00E9 \u2014 humidit\u00E9 fr\u00E9quente causant des probl\u00E8mes de condensation et de moisissures dans les logements mal ventil\u00E9s',
    zonesCheres: ['6e arr.', '7e arr.', '8e arr.', '16e arr.'],
    zonesAccessibles: ['19e arr.', '20e arr.', '13e arr.'],
    coeffPeripherie: 0.80,
    delaiMoyen: '1 \u00E0 3 jours',
  },
  marseille: {
    population: 886000,
    densite: 'forte',
    niveauVie: 95,
    type: 'ville-cotiere',
    particularites: [
      'Exposition au mistral et aux embruns salins acc\u00E9l\u00E9rant la corrosion',
      'B\u00E2ti ancien en pierre calcaire tendre dans le centre et Le Panier',
      'Forte pr\u00E9sence de copropri\u00E9t\u00E9s d\u00E9grad\u00E9es n\u00E9cessitant des r\u00E9novations lourdes',
      'Terrain calcaire rendant les fondations et le terrassement sp\u00E9cifiques',
    ],
    architecture: 'Pierre calcaire tendre, enduits \u00E0 la chaux, toitures en tuiles canal provençales',
    climat: 'Climat m\u00E9diterran\u00E9en avec mistral violent \u2014 les toitures et fa\u00E7ades subissent une usure acc\u00E9l\u00E9r\u00E9e',
    zonesCheres: ['Prado', 'Vieux-Port', 'Bonneveine'],
    zonesAccessibles: ['Les quartiers Nord', 'La Castellane', 'Felix Pyat'],
    coeffPeripherie: 0.75,
    delaiMoyen: '2 \u00E0 5 jours',
  },
  lyon: {
    population: 519000,
    densite: 'forte',
    niveauVie: 115,
    type: 'grande-metropole',
    particularites: [
      'Quartier Renaissance du Vieux Lyon class\u00E9 UNESCO avec traboules',
      'Immeubles canuts \u00E0 la Croix-Rousse avec de tr\u00E8s hauts plafonds (4m+)',
      'Confluence entre Rh\u00F4ne et Sa\u00F4ne cr\u00E9ant des probl\u00E8mes d\u2019humidit\u00E9 en sous-sol',
      'March\u00E9 immobilier tr\u00E8s actif \u2014 forte demande en r\u00E9novation d\u2019appartements',
    ],
    architecture: 'Pierre dor\u00E9e du Beaujolais, immeubles canuts, b\u00E9ton Confluence pour le neuf',
    climat: 'Climat semi-continental avec hivers froids \u2014 forte demande en chauffage et isolation',
    zonesCheres: ['Presqu\u2019\u00EEle', 'T\u00EAte d\u2019Or', '6e arr.'],
    zonesAccessibles: ['Vaulx-en-Velin', 'V\u00E9nissieux', 'Bron'],
    coeffPeripherie: 0.82,
    delaiMoyen: '2 \u00E0 4 jours',
  },
  toulouse: {
    population: 515000,
    densite: 'moyenne',
    niveauVie: 108,
    type: 'grande-metropole',
    particularites: [
      'Ville rose : fa\u00E7ades en brique foraine n\u00E9cessitant un savoir-faire de rejointoiement sp\u00E9cifique',
      'Forte croissance d\u00E9mographique li\u00E9e \u00E0 l\u2019a\u00E9ronautique (Airbus) — beaucoup de constructions neuves',
      'Sol argileux provoquant des fissures sur les fondations en p\u00E9riode de s\u00E9cheresse',
      'Quartiers \u00E9tudiants importants avec forte rotation locative',
    ],
    architecture: 'Brique foraine rose, galets de Garonne, colombages dans le centre m\u00E9di\u00E9val',
    climat: 'Climat oc\u00E9anique alt\u00E9r\u00E9 avec \u00E9t\u00E9s chauds \u2014 climatisation de plus en plus demand\u00E9e',
    zonesCheres: ['Capitole', 'Carmes', 'Saint-Aubin'],
    zonesAccessibles: ['Le Mirail', 'Bagatelle', 'Reynerie'],
    coeffPeripherie: 0.85,
    delaiMoyen: '2 \u00E0 4 jours',
  },
  nice: {
    population: 358000,
    densite: 'forte',
    niveauVie: 120,
    type: 'ville-cotiere',
    particularites: [
      'Architecture Belle \u00C9poque et Art D\u00E9co sur la Promenade des Anglais',
      'Contraintes sismiques (zone 4) imposant des normes de construction sp\u00E9cifiques',
      'Air salin provoquant une corrosion acc\u00E9l\u00E9r\u00E9e des menuiseries m\u00E9talliques',
      'Collines et pentes fortes compliquant l\u2019acc\u00E8s aux chantiers (Cimiez, Mont Boron)',
    ],
    architecture: 'Enduits color\u00E9s \u00E0 l\u2019italienne, trompe-l\u2019\u0153il, volets persiennés, toits plats et terrasses',
    climat: 'Climat m\u00E9diterran\u00E9en doux \u2014 peu de besoins en chauffage mais forte demande en climatisation et protection solaire',
    zonesCheres: ['Promenade des Anglais', 'Cimiez', 'Mont Boron'],
    zonesAccessibles: ['L\u2019Ariane', 'Les Moulins', 'Saint-Roch'],
    coeffPeripherie: 0.78,
    delaiMoyen: '2 \u00E0 5 jours',
  },
  nantes: {
    population: 328000,
    densite: 'moyenne',
    niveauVie: 108,
    type: 'grande-metropole',
    particularites: [
      'Patrimoine XVIIIe si\u00E8cle avec tuffeau et ardoise \u2014 mat\u00E9riaux nobles mais co\u00FBteux',
      'Humidit\u00E9 atlantique marquée n\u00E9cessitant une ventilation et une \u00E9tanch\u00E9it\u00E9 renforc\u00E9es',
      '\u00CEle de Nantes en pleine transformation urbaine \u2014 nombreux chantiers neufs',
      'March\u00E9 artisan dynamique avec des d\u00E9lais d\u2019attente mod\u00E9r\u00E9s',
    ],
    architecture: 'Tuffeau blanc, couverture ardoise, colombages dans le centre historique',
    climat: 'Climat oc\u00E9anique humide \u2014 probl\u00E8mes r\u00E9currents d\u2019humidit\u00E9 et de remont\u00E9es capillaires',
    zonesCheres: ['Centre-ville', 'Proc\u00E9', 'Monselet'],
    zonesAccessibles: ['Doulon', 'Malakoff', 'Dervalli\u00E8res'],
    coeffPeripherie: 0.85,
    delaiMoyen: '3 \u00E0 5 jours',
  },
  strasbourg: {
    population: 294000,
    densite: 'moyenne',
    niveauVie: 105,
    type: 'grande-metropole',
    particularites: [
      'Maisons \u00E0 colombages class\u00E9es UNESCO dans la Grande \u00CEle et la Petite France',
      'Proximit\u00E9 de l\u2019Allemagne \u2014 certains artisans proposent des mat\u00E9riaux et normes germaniques',
      'Hivers rigoureux avec gel fr\u00E9quent impactant la plomberie ext\u00E9rieure',
      'R\u00E9glementation thermique renforc\u00E9e (zone H1b) \u2014 isolation exigeante',
    ],
    architecture: 'Colombages, gr\u00E8s rose des Vosges, toitures pentues en tuiles plates',
    climat: 'Climat semi-continental froid \u2014 hivers rigoureux exigeant une isolation performante et un chauffage efficace',
    zonesCheres: ['Grande \u00CEle', 'Orangerie', 'Conseil des XV'],
    zonesAccessibles: ['Hautepierre', 'Cronenbourg', 'Meinau'],
    coeffPeripherie: 0.83,
    delaiMoyen: '3 \u00E0 6 jours',
  },
  montpellier: {
    population: 310000,
    densite: 'moyenne',
    niveauVie: 100,
    type: 'ville-cotiere',
    particularites: [
      'Centre historique m\u00E9di\u00E9val (\u00C9cusson) avec rues tr\u00E8s \u00E9troites compliquant l\u2019acc\u00E8s chantier',
      'Croissance d\u00E9mographique parmi les plus fortes de France \u2014 forte tension sur les artisans',
      'Quartiers neufs (Antigone, Port-Marianne) avec b\u00E2ti r\u00E9cent n\u00E9cessitant peu de r\u00E9novation',
      'Risque d\u2019inondation dans certains quartiers bas (c\u00E9venoles)',
    ],
    architecture: 'Pierre blonde, enduits \u00E0 la chaux, volets battants, b\u00E9ton n\u00E9o-classique \u00E0 Antigone',
    climat: 'Climat m\u00E9diterran\u00E9en avec \u00E9pisodes c\u00E9venols violents \u2014 \u00E9tanch\u00E9it\u00E9 et drainage essentiels',
    zonesCheres: ['\u00C9cusson', 'Antigone', 'Les Aubes'],
    zonesAccessibles: ['Mosson', 'La Paillade', 'Celleneuve'],
    coeffPeripherie: 0.82,
    delaiMoyen: '3 \u00E0 6 jours',
  },
  bordeaux: {
    population: 268000,
    densite: 'moyenne',
    niveauVie: 112,
    type: 'grande-metropole',
    particularites: [
      'Fa\u00E7ades en pierre calcaire blonde class\u00E9es UNESCO \u2014 ravalement soumis \u00E0 autorisation ABF',
      'Immeubles XVIIIe avec planchers bois, chemin\u00E9es et moulures \u00E0 restaurer',
      'Rive droite (Bastide) en pleine r\u00E9habilitation \u2014 march\u00E9 porteur',
      'Proximit\u00E9 de l\u2019oc\u00E9an apportant de l\u2019humidit\u00E9',
    ],
    architecture: 'Pierre calcaire blonde, toitures en tuiles canal et ardoise, ferronneries XVIIIe',
    climat: 'Climat oc\u00E9anique doux et humide \u2014 probl\u00E8mes fr\u00E9quents de salpêtre et remont\u00E9es capillaires',
    zonesCheres: ['Triangle d\u2019Or', 'Chartrons', 'Saint-Pierre'],
    zonesAccessibles: ['Bacalan', 'Bastide', 'Saint-Michel'],
    coeffPeripherie: 0.83,
    delaiMoyen: '2 \u00E0 5 jours',
  },
  lille: {
    population: 238000,
    densite: 'forte',
    niveauVie: 100,
    type: 'grande-metropole',
    particularites: [
      'Architecture flamande en briques rouges \u2014 rejointoiement et ravalement sp\u00E9cifiques',
      'Rang\u00E9es de maisons mitoyennes (courées) avec probl\u00E8mes d\u2019isolation et d\u2019humidit\u00E9',
      'Humidit\u00E9 permanente du Nord \u2014 ventilation et \u00E9tanch\u00E9it\u00E9 prioritaires',
      'March\u00E9 locatif \u00E9tudiant dynamique (200 000+ \u00E9tudiants dans la m\u00E9tropole)',
    ],
    architecture: 'Brique rouge flamande, pierres blanches en encadrement, toitures ardoise \u00E0 forte pente',
    climat: 'Climat oc\u00E9anique humide et frais \u2014 chauffage indispensable 8 mois sur 12, probl\u00E8mes d\u2019humidit\u00E9 chroniques',
    zonesCheres: ['Vieux-Lille', 'R\u00E9publique', 'Solférino'],
    zonesAccessibles: ['Fives', 'Moulins', 'Bois-Blancs'],
    coeffPeripherie: 0.82,
    delaiMoyen: '2 \u00E0 5 jours',
  },
}

// ---------------------------------------------------------------------------
// Coefficient regional de prix
// ---------------------------------------------------------------------------

type VilleLight = (typeof villesLight)[number]

function getCoefficient(ville: VilleLight): number {
  if (ville.region === '\u00CEle-de-France') return 1.3
  if (ville.region === 'Provence-Alpes-C\u00F4te d\'Azur') return 1.2
  const grandes = ['lyon', 'toulouse', 'bordeaux', 'nantes', 'montpellier', 'lille', 'strasbourg']
  if (grandes.includes(ville.slug)) return 1.15
  return 1.0
}

// ---------------------------------------------------------------------------
// Simple hash pour varier le contenu
// ---------------------------------------------------------------------------

function simpleHash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// ---------------------------------------------------------------------------
// Helpers prix
// ---------------------------------------------------------------------------

function adj(value: number, coeff: number): number {
  return Math.round(value * coeff)
}

function range(min: number, max: number, coeff: number): string {
  return `${adj(min, coeff)} \u2013 ${adj(max, coeff)} \u20AC`
}

function getCityData(slug: string): CityLocalData {
  return CITY_DATA[slug] || {
    population: 150000,
    densite: 'moyenne' as const,
    niveauVie: 100,
    type: 'ville-moyenne' as VilleType,
    particularites: ['Ville dynamique avec un march\u00E9 artisan actif'],
    architecture: 'B\u00E2ti vari\u00E9 m\u00EAlant constructions anciennes et r\u00E9centes',
    climat: 'Climat temp\u00E9r\u00E9 n\u00E9cessitant une bonne isolation',
    zonesCheres: ['Centre-ville'],
    zonesAccessibles: ['P\u00E9riph\u00E9rie'],
    coeffPeripherie: 0.85,
    delaiMoyen: '3 \u00E0 7 jours',
  }
}

// ---------------------------------------------------------------------------
// Templates de phrases d'intro (5 variantes)
// ---------------------------------------------------------------------------

const INTROS: ((m: Metier, v: VilleLight, coeff: number, cd: CityLocalData) => string)[] = [
  (m, v, _c, cd) =>
    `Vous cherchez ${m.article} \u00E0 ${v.name} et souhaitez conna\u00EEtre les tarifs pratiqu\u00E9s en 2026 ? Avec ${cd.population > 300000 ? 'plus de ' + (cd.population / 1000).toFixed(0) + ' 000 habitants' : 'ses ' + (cd.population / 1000).toFixed(0) + ' 000 habitants'}, ${v.name} pr\u00E9sente un march\u00E9 artisan \u00E0 densit\u00E9 **${cd.densite}**, o\u00F9 les prix des ${m.plural} d\u00E9pendent de la nature des travaux, de l\u2019urgence et du quartier. ${cd.particularites[0]}. Trouvez un [${m.name} \u00E0 ${v.name}](/services/${m.slug}/${v.slug}) et obtenez un devis gratuit.`,
  (m, v, c, cd) =>
    `\u00C0 ${v.name}, le tarif horaire moyen d'${m.article} se situe entre **${adj(m.tarifMin, c)} et ${adj(m.tarifMax, c)} ${m.unit}** en 2026. ${cd.architecture} : voil\u00E0 le b\u00E2ti typique de ${v.name} qui conditionne les interventions des ${m.plural}. Le niveau de vie local (indice ${cd.niveauVie}/100) et la densit\u00E9 d\u2019artisans influencent directement les prix. D\u00E9couvrez notre [annuaire de ${m.plural} \u00E0 ${v.name}](/services/${m.slug}/${v.slug}).`,
  (m, v, _c, cd) =>
    `Combien co\u00FBte ${m.article} \u00E0 ${v.name} en 2026 ? C'est la question que se posent les habitants du ${v.departement} (${v.departementCode}). ${cd.climat}. Ces sp\u00E9cificit\u00E9s locales impactent directement le co\u00FBt des prestations. Ce guide d\u00E9taille les tarifs r\u00E9els, quartier par quartier. Comparez les [${m.plural} disponibles \u00E0 ${v.name}](/services/${m.slug}/${v.slug}).`,
  (m, v, c, cd) =>
    `Les tarifs des ${m.plural} \u00E0 ${v.name} en 2026 oscillent entre **${adj(m.tarifMin, c)} et ${adj(m.tarifMax, c)} ${m.unit}**. Situ\u00E9e en ${v.region}, ${v.name} b\u00E9n\u00E9ficie de prix ${c > 1.1 ? 'sup\u00E9rieurs de ' + Math.round((c - 1) * 100) + ' %' : 'proches'} de la moyenne nationale. \u00C0 noter : les tarifs en centre-ville (${cd.zonesCheres[0]}) sont environ ${Math.round((1 - cd.coeffPeripherie) * 100)} % plus \u00E9lev\u00E9s qu\u2019en p\u00E9riph\u00E9rie. Consultez les [${m.plural} \u00E0 ${v.name}](/services/${m.slug}/${v.slug}).`,
  (m, v, _c, cd) =>
    `Avant de faire appel \u00E0 ${m.article} \u00E0 ${v.name}, il est essentiel de comprendre les sp\u00E9cificit\u00E9s locales. ${cd.particularites[1] || cd.particularites[0]}. Le d\u00E9lai moyen pour obtenir un rendez-vous est de **${cd.delaiMoyen}** selon la saison. Ce guide 2026 vous donne tous les prix, du d\u00E9pannage rapide aux gros travaux. Trouvez un professionnel sur notre [page ${m.plural} ${v.name}](/services/${m.slug}/${v.slug}).`,
]

// ---------------------------------------------------------------------------
// Templates "Specificites locales" par type de ville (5 variantes)
// ---------------------------------------------------------------------------

function localSpecificities(m: Metier, v: VilleLight, cd: CityLocalData): string {
  const parts: string[] = [`## Sp\u00E9cificit\u00E9s des travaux de ${m.specialites[0]} \u00E0 ${v.name}`, '']

  // Paragraphe contextuel selon le type de ville
  switch (cd.type) {
    case 'grande-metropole':
      parts.push(
        `${v.name} est une grande m\u00E9tropole o\u00F9 la demande en ${m.plural} est soutenue toute l\u2019ann\u00E9e. La forte densit\u00E9 urbaine implique des contraintes d\u2019acc\u00E8s aux chantiers (stationnement, \u00E9tages sans ascenseur, ruelles \u00E9troites) qui peuvent majorer le devis de 10 \u00E0 20 %. En contrepartie, la concurrence entre professionnels est vive, ce qui tire les prix vers le bas pour les interventions courantes.`,
      )
      break
    case 'ville-cotiere':
      parts.push(
        `${v.name}, ville c\u00F4ti\u00E8re, expose les b\u00E2timents \u00E0 des contraintes sp\u00E9cifiques : air salin, humidit\u00E9, vent. Pour les ${m.plural}, cela signifie l\u2019utilisation de mat\u00E9riaux r\u00E9sistants \u00E0 la corrosion (inox, aluminium marin, peintures anticorrosion). Les devis int\u00E8grent g\u00E9n\u00E9ralement un surco\u00FBt de 5 \u00E0 15 % pour ces mat\u00E9riaux adapt\u00E9s au littoral.`,
      )
      break
    case 'ville-montagne':
      parts.push(
        `Situ\u00E9e en zone de montagne, ${v.name} impose aux ${m.plural} des contraintes li\u00E9es \u00E0 l\u2019altitude et au climat rigoureux. L\u2019isolation thermique renforc\u00E9e est syst\u00E9matiquement recommand\u00E9e, et les travaux ext\u00E9rieurs sont limit\u00E9s aux mois de mars \u00E0 novembre. Les normes parasismiques en vigueur (zone 4) peuvent ajouter 10 \u00E0 25 % au co\u00FBt des travaux structurels.`,
      )
      break
    case 'banlieue-parisienne':
      parts.push(
        `${v.name}, en agglom\u00E9ration m\u00E9tropolitaine, b\u00E9n\u00E9ficie d\u2019un acc\u00E8s au même vivier d\u2019artisans que la ville-centre, souvent \u00E0 des tarifs l\u00E9g\u00E8rement inf\u00E9rieurs (5 \u00E0 10 % de moins). Le parc immobilier m\u00EAlant HLM des ann\u00E9es 60-70 et constructions r\u00E9centes cr\u00E9e une demande diversifi\u00E9e pour les ${m.plural} : de la r\u00E9novation lourde au petit d\u00E9pannage.`,
      )
      break
    default: // ville-moyenne
      parts.push(
        `Ville moyenne dynamique, ${v.name} offre un march\u00E9 artisan \u00E9quilibr\u00E9 : les ${m.plural} y sont moins sollicit\u00E9s qu\u2019en grande m\u00E9tropole, ce qui se traduit par des d\u00E9lais d\u2019intervention raisonnables et des tarifs mod\u00E9r\u00E9s. Le patrimoine local n\u00E9cessite cependant un savoir-faire sp\u00E9cifique, notamment pour les b\u00E2timents class\u00E9s du centre historique.`,
      )
      break
  }

  parts.push('')

  // Bullet points des particularites locales
  parts.push('**Ce qui rend les travaux uniques \u00E0 ' + v.name + ' :**')
  parts.push('')
  for (const p of cd.particularites) {
    parts.push(`- ${p}`)
  }

  parts.push('')
  parts.push(`**Mat\u00E9riaux et architecture locale** : ${cd.architecture}. Les ${m.plural} intervenant \u00E0 ${v.name} doivent ma\u00EEtriser ces sp\u00E9cificit\u00E9s pour garantir un r\u00E9sultat conforme aux r\u00E8gles d\u2019urbanisme locales.`)

  return parts.join('\n')
}

// ---------------------------------------------------------------------------
// Section "Quartiers et zones tarifaires" (3 templates)
// ---------------------------------------------------------------------------

function quartiersSection(m: Metier, v: VilleLight, coeff: number, cd: CityLocalData): string {
  const hash = simpleHash(`q-${m.slug}-${v.slug}`)
  const variant = hash % 3

  const prixCentre = adj(m.tarifMin, coeff)
  const prixCentreMax = adj(m.tarifMax, coeff)
  const prixPeriph = adj(m.tarifMin, coeff * cd.coeffPeripherie)
  const prixPeriphMax = adj(m.tarifMax, coeff * cd.coeffPeripherie)

  const parts: string[] = [`## Zones tarifaires \u00E0 ${v.name} : centre-ville vs p\u00E9riph\u00E9rie`, '']

  // Tableau comparatif centre vs peripherie
  parts.push(':::budget')
  parts.push(`| Zone | Tarif horaire ${m.name} | Frais de d\u00E9placement |`)
  parts.push(`| Centre (${cd.zonesCheres.slice(0, 2).join(', ')}) | ${prixCentre} \u2013 ${prixCentreMax} ${m.unit} | ${coeff >= 1.2 ? '40 \u2013 60' : '25 \u2013 45'} \u20AC |`)
  parts.push(`| P\u00E9riph\u00E9rie (${cd.zonesAccessibles.slice(0, 2).join(', ')}) | ${prixPeriph} \u2013 ${prixPeriphMax} ${m.unit} | ${coeff >= 1.2 ? '30 \u2013 50' : '20 \u2013 35'} \u20AC |`)
  parts.push(`| Urgence (nuit / weekend) | +30 \u00E0 50 % | +50 % d\u00E9placement |`)
  parts.push(':::')
  parts.push('')

  if (variant === 0) {
    parts.push(`Les quartiers les plus chers pour un ${m.name.toLowerCase()} \u00E0 ${v.name} sont **${cd.zonesCheres.join(', ')}**, o\u00F9 la forte demande et la difficult\u00E9 d\u2019acc\u00E8s (stationnement, immeubles anciens) tirent les prix vers le haut. \u00C0 l\u2019inverse, les secteurs de **${cd.zonesAccessibles.join(', ')}** offrent des tarifs environ ${Math.round((1 - cd.coeffPeripherie) * 100)} % inf\u00E9rieurs, tout en b\u00E9n\u00E9ficiant de professionnels tout aussi qualifi\u00E9s.`)
  } else if (variant === 1) {
    parts.push(`${v.name} pr\u00E9sente un \u00E9cart tarifaire notable entre le centre et la p\u00E9riph\u00E9rie. Un ${m.name.toLowerCase()} intervenant dans les quartiers centraux (${cd.zonesCheres[0]}, ${cd.zonesCheres[1] || cd.zonesCheres[0]}) facture en moyenne ${Math.round((1 - cd.coeffPeripherie) * 100)} % de plus qu\u2019en zone p\u00E9riurbaine. Cet \u00E9cart s\u2019explique par les co\u00FBts de stationnement, la dur\u00E9e de d\u00E9placement en centre dense et la complexit\u00E9 des b\u00E2timents anciens.`)
  } else {
    parts.push(`Pour optimiser votre budget ${m.name.toLowerCase()} \u00E0 ${v.name}, sachez que les artisans bas\u00E9s en p\u00E9riph\u00E9rie (${cd.zonesAccessibles[0]}, ${cd.zonesAccessibles[1] || cd.zonesAccessibles[0]}) proposent souvent des tarifs plus comp\u00E9titifs. Toutefois, un artisan du centre conna\u00EEtra mieux les sp\u00E9cificit\u00E9s du b\u00E2ti ancien de ${v.name} \u2014 un avantage non n\u00E9gligeable pour des travaux de r\u00E9novation dans l\u2019${cd.zonesCheres[0] || 'hypercentre'}.`)
  }

  // Mention quartiers specifiques de la ville
  if (v.quartiers.length > 3) {
    parts.push('')
    parts.push(`Les principaux quartiers desservis par les ${m.plural} \u00E0 ${v.name} : ${v.quartiers.slice(0, 6).join(', ')}${v.quartiers.length > 6 ? ' et ' + (v.quartiers.length - 6) + ' autres secteurs' : ''}.`)
  }

  return parts.join('\n')
}

// ---------------------------------------------------------------------------
// Section "Conseils locaux" (4 templates)
// ---------------------------------------------------------------------------

function conseilsLocaux(m: Metier, v: VilleLight, cd: CityLocalData): string {
  const hash = simpleHash(`c-${m.slug}-${v.slug}`)
  const variant = hash % 4

  const parts: string[] = [`## Conseils pour trouver un bon ${m.name.toLowerCase()} \u00E0 ${v.name}`, '']

  // Conseil specifique au climat/architecture
  const climatConseil = cd.climat.includes('humide') || cd.climat.includes('pluv')
    ? `\u00C0 ${v.name}, l\u2019humidit\u00E9 ambiante rend les probl\u00E8mes d\u2019\u00E9tanch\u00E9it\u00E9 et de ventilation fr\u00E9quents. Privil\u00E9giez un ${m.name.toLowerCase()} ayant l\u2019exp\u00E9rience du b\u00E2ti local.`
    : cd.climat.includes('froid') || cd.climat.includes('continental')
    ? `Les hivers rigoureux de ${v.name} rendent l\u2019isolation et le chauffage prioritaires. Choisissez un ${m.name.toLowerCase()} certifi\u00E9 RGE pour b\u00E9n\u00E9ficier des aides \u00E0 la r\u00E9novation \u00E9nerg\u00E9tique.`
    : cd.climat.includes('m\u00E9diterran\u00E9en')
    ? `Le climat m\u00E9diterran\u00E9en de ${v.name} impose des mat\u00E9riaux r\u00E9sistants au soleil et \u00E0 la chaleur. Un ${m.name.toLowerCase()} local conna\u00EEtra les solutions adapt\u00E9es.`
    : `Le climat de ${v.name} influence le choix des mat\u00E9riaux et techniques. Faites appel \u00E0 un ${m.name.toLowerCase()} qui conna\u00EEt les sp\u00E9cificit\u00E9s locales.`

  if (variant === 0) {
    parts.push(`1. **V\u00E9rifiez les certifications** : \u00E0 ${v.name}, demandez syst\u00E9matiquement la carte professionnelle, l\u2019assurance d\u00E9cennale et les labels (RGE, Qualibat). Les ${m.plural} certifi\u00E9s sont r\u00E9f\u00E9renc\u00E9s sur notre [annuaire ${v.name}](/services/${m.slug}/${v.slug}).`)
    parts.push(`2. **Comparez 3 devis minimum** : le d\u00E9lai moyen pour obtenir un devis \u00E0 ${v.name} est de ${cd.delaiMoyen}. Anticipez vos travaux pour ne pas \u00EAtre en urgence.`)
    parts.push(`3. **Tenez compte du quartier** : un ${m.name.toLowerCase()} bas\u00E9 dans votre secteur (${v.quartiers[0]}, ${v.quartiers[1] || v.quartiers[0]}) limitera les frais de d\u00E9placement.`)
    parts.push(`4. **${climatConseil}**`)
  } else if (variant === 1) {
    parts.push(`**Saison id\u00E9ale pour vos travaux** : \u00E0 ${v.name}, la p\u00E9riode la moins charg\u00E9e pour les ${m.plural} se situe g\u00E9n\u00E9ralement entre janvier et mars. Vous b\u00E9n\u00E9ficierez de d\u00E9lais plus courts et parfois de tarifs pr\u00E9f\u00E9rentiels.`)
    parts.push('')
    parts.push(`**Attention aux arnaques** : ${v.name}, comme toute grande ville, n\u2019est pas \u00E9pargn\u00E9e par les ${m.plural} peu scrupuleux. M\u00E9fiez-vous des d\u00E9marchages t\u00E9l\u00E9phoniques et des tarifs anormalement bas. Un ${m.name.toLowerCase()} s\u00E9rieux accepte toujours d\u2019\u00E9tablir un devis \u00E9crit avant intervention.`)
    parts.push('')
    parts.push(climatConseil)
  } else if (variant === 2) {
    parts.push(`- **Bouche-\u00E0-oreille local** : demandez \u00E0 vos voisins de ${v.quartiers[0]} ou ${v.quartiers[1] || v.quartiers[0]} leurs recommandations de ${m.plural}. Les artisans locaux ont une r\u00E9putation \u00E0 d\u00E9fendre.`)
    parts.push(`- **Groupez vos travaux** : si plusieurs interventions sont n\u00E9cessaires, les ${m.plural} \u00E0 ${v.name} proposent souvent des tarifs d\u00E9gressifs pour les chantiers group\u00E9s.`)
    parts.push(`- **V\u00E9rifiez la garantie d\u00E9cennale** : ${cd.architecture.split(',')[0]} \u2014 ce type de b\u00E2ti \u00E0 ${v.name} n\u00E9cessite des interventions garanties.`)
    parts.push(`- ${climatConseil}`)
  } else {
    parts.push(`${v.name} compte un nombre ${cd.densite === 'forte' ? '\u00E9lev\u00E9' : cd.densite === 'moyenne' ? 'correct' : 'limit\u00E9'} de ${m.plural} qualifi\u00E9s. ${cd.densite === 'forte' ? 'La concurrence joue en votre faveur : n\u2019h\u00E9sitez pas \u00E0 n\u00E9gocier.' : cd.densite === 'faible' ? 'Les d\u00E9lais d\u2019attente peuvent \u00EAtre longs : anticipez vos travaux.' : 'Les d\u00E9lais restent raisonnables si vous planifiez \u00E0 l\u2019avance.'}`)
    parts.push('')
    parts.push(`**Notre conseil** : consultez les [avis clients sur les ${m.plural} \u00E0 ${v.name}](/services/${m.slug}/${v.slug}) pour identifier les professionnels les mieux not\u00E9s dans votre quartier. ${climatConseil}`)
  }

  return parts.join('\n')
}

// ---------------------------------------------------------------------------
// Pourquoi les prix varient (enrichi)
// ---------------------------------------------------------------------------

function whyPricesVary(m: Metier, v: VilleLight, coeff: number, cd: CityLocalData): string {
  const reasons: string[] = []

  if (coeff >= 1.3) {
    reasons.push(`**Co\u00FBt de la vie \u00E9lev\u00E9** : en ${v.region}, les charges des artisans (loyer, assurances, d\u00E9placements) sont nettement sup\u00E9rieures \u00E0 la moyenne nationale. L\u2019indice de niveau de vie \u00E0 ${v.name} est de ${cd.niveauVie}/100.`)
  } else if (coeff >= 1.15) {
    reasons.push(`**M\u00E9tropole dynamique** : ${v.name} conna\u00EEt une forte demande li\u00E9e \u00E0 sa croissance. L\u2019indice de niveau de vie local (${cd.niveauVie}/100) impacte les tarifs des ${m.plural}.`)
  } else {
    reasons.push(`**Tarifs mod\u00E9r\u00E9s** : ${v.name} (indice de vie ${cd.niveauVie}/100) b\u00E9n\u00E9ficie de prix de main-d'\u0153uvre inf\u00E9rieurs aux grandes m\u00E9tropoles, rendant les travaux plus accessibles.`)
  }

  reasons.push(`**Densit\u00E9 d\u2019artisans ${cd.densite}** : ${cd.densite === 'forte' ? 'la forte concurrence entre ' + m.plural + ' permet de n\u00E9gocier les prix' : cd.densite === 'moyenne' ? 'le nombre de ' + m.plural + ' disponibles reste \u00E9quilibr\u00E9 par rapport \u00E0 la demande' : 'le nombre limit\u00E9 de ' + m.plural + ' peut entra\u00EEner des d\u00E9lais et surco\u00FBts'}.`)
  reasons.push(`**Architecture locale** : ${cd.architecture}. Les ${m.plural} \u00E0 ${v.name} doivent adapter leurs techniques \u00E0 ce b\u00E2ti sp\u00E9cifique.`)
  reasons.push(`**Nature du chantier** : un d\u00E9pannage d'urgence co\u00FBtera toujours plus cher qu'une intervention planifi\u00E9e. Les ${m.plural} \u00E0 ${v.name} appliquent g\u00E9n\u00E9ralement un suppl\u00E9ment de 30 \u00E0 50 % pour les urgences.`)
  reasons.push(`**Exp\u00E9rience et qualifications** : un ${m.name.toLowerCase()} certifi\u00E9 RGE ou sp\u00E9cialiste en ${m.specialites[0]} facturera davantage, mais garantit un travail aux normes.`)
  reasons.push(`**Acc\u00E8s au chantier** : dans les quartiers anciens de ${v.name}${v.quartiers.length > 0 ? ` (${v.quartiers[0]}, ${v.quartiers[1] || v.quartiers[0]})` : ''}, la difficult\u00E9 d'acc\u00E8s ou le stationnement peuvent majorer le devis de 10 \u00E0 20 %.`)

  return reasons.map((r) => `- ${r}`).join('\n')
}

// ---------------------------------------------------------------------------
// Aides disponibles
// ---------------------------------------------------------------------------

function aidesSection(m: Metier, v: VilleLight): string | null {
  const eligible = ['chauffagiste', 'plombier', 'electricien']
  if (!eligible.includes(m.slug)) return null

  return [
    `Selon la nature de vos travaux, plusieurs aides sont mobilisables dans le ${v.departement} (${v.departementCode}) :`,
    '',
    `- **MaPrimeR\u00E9nov'** : jusqu'\u00E0 90 % du montant des travaux de r\u00E9novation \u00E9nerg\u00E9tique pour les m\u00E9nages modestes`,
    `- **CEE (Certificats d'\u00C9conomie d'\u00C9nergie)** : primes vers\u00E9es par les fournisseurs d'\u00E9nergie, cumulables avec MaPrimeR\u00E9nov'`,
    `- **\u00C9co-PTZ** : pr\u00EAt \u00E0 taux z\u00E9ro jusqu'\u00E0 50 000 \u20AC pour la r\u00E9novation \u00E9nerg\u00E9tique`,
    `- **TVA r\u00E9duite \u00E0 5,5 %** sur les travaux d'am\u00E9lioration \u00E9nerg\u00E9tique (logement de plus de 2 ans)`,
    `- **Aides locales** : renseignez-vous aupr\u00E8s de la mairie de ${v.name} ou du Conseil d\u00E9partemental du ${v.departement}`,
    '',
    `Pour b\u00E9n\u00E9ficier de ces aides, faites appel \u00E0 un [${m.name} RGE \u00E0 ${v.name}](/services/${m.slug}/${v.slug}).`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// FAQ localisee (5 questions dont 3 specifiques a la ville)
// ---------------------------------------------------------------------------

function generateFaq(m: Metier, v: VilleLight, coeff: number, cd: CityLocalData): { question: string; answer: string }[] {
  const allFaqs = [
    // --- 3 questions specifiques a la ville ---
    {
      question: `Combien co\u00FBte ${m.article} \u00E0 ${v.name} en 2026 ?`,
      answer: `En 2026, le tarif horaire d\u2019${m.article} \u00E0 ${v.name} (${v.departement}) se situe entre **${adj(m.tarifMin, coeff)} et ${adj(m.tarifMax, coeff)} ${m.unit}**. Ce tarif est ${coeff > 1.1 ? 'sup\u00E9rieur de ' + Math.round((coeff - 1) * 100) + ' % \u00E0' : 'proche de'} la moyenne nationale. En p\u00E9riph\u00E9rie (${cd.zonesAccessibles[0]}), comptez environ ${Math.round((1 - cd.coeffPeripherie) * 100)} % de moins. [Comparez les devis](/devis/${m.slug}/${v.slug}).`,
    },
    {
      question: `O\u00F9 trouver ${m.article} pas cher \u00E0 ${v.name} ?`,
      answer: `Pour trouver ${m.article} au meilleur prix \u00E0 ${v.name}, privil\u00E9giez les artisans bas\u00E9s en p\u00E9riph\u00E9rie (${cd.zonesAccessibles.join(', ')}) plut\u00F4t qu\u2019en centre-ville (${cd.zonesCheres[0]}). ${cd.densite === 'forte' ? 'La forte concurrence locale vous permet de n\u00E9gocier.' : 'Faites jouer la concurrence pour obtenir le meilleur rapport qualit\u00E9-prix.'} Planifiez vos travaux en basse saison (janvier-mars) et consultez notre [annuaire local](/services/${m.slug}/${v.slug}).`,
    },
    {
      question: `Quelles sont les particularit\u00E9s des travaux \u00E0 ${v.name} ?`,
      answer: `${v.name} pr\u00E9sente des sp\u00E9cificit\u00E9s qui impactent les travaux : ${cd.particularites[0].toLowerCase()}. ${cd.climat.split(' \u2014 ')[1] || cd.climat}. Le b\u00E2ti local (${cd.architecture.split(',')[0].toLowerCase()}) n\u00E9cessite un savoir-faire adapt\u00E9. Choisissez un ${m.name.toLowerCase()} connaissant bien ${v.name}.`,
    },
    // --- 2 questions generiques ---
    {
      question: `Quel est le d\u00E9lai pour un ${m.name.toLowerCase()} \u00E0 ${v.name} ?`,
      answer: `\u00C0 ${v.name}, le d\u00E9lai moyen pour obtenir un rendez-vous avec ${m.article} est de **${cd.delaiMoyen}** pour une intervention planifi\u00E9e. En urgence, la plupart des ${m.plural} interviennent sous 24 \u00E0 48h, avec un suppl\u00E9ment de 30 \u00E0 50 %. [Demandez un devis rapide](/devis/${m.slug}/${v.slug}).`,
    },
    {
      question: `Faut-il un devis avant de faire appel \u00E0 ${m.article} \u00E0 ${v.name} ?`,
      answer: `Oui, un devis \u00E9crit est obligatoire d\u00E8s que le montant d\u00E9passe 150 \u20AC (article L111-3 du Code de la consommation). \u00C0 ${v.name}, la plupart des ${m.plural} proposent le devis gratuit. V\u00E9rifiez que le devis mentionne le tarif horaire, les fournitures, le d\u00E9placement et la TVA applicable. [Consultez nos tarifs ${v.name}](/tarifs/${m.slug}/${v.slug}).`,
    },
    {
      question: `${m.prestations[0].nom} \u00E0 ${v.name} : quel budget pr\u00E9voir ?`,
      answer: `Le prix pour ${m.prestations[0].nom.toLowerCase()} \u00E0 ${v.name} varie de **${adj(m.prestations[0].min, coeff)} \u00E0 ${adj(m.prestations[0].max, coeff)} \u20AC**${m.prestations[0].unite ? ` (${m.prestations[0].unite})` : ''} en 2026. En centre-ville (${cd.zonesCheres[0]}), pr\u00E9voyez le haut de la fourchette. En p\u00E9riph\u00E9rie, les tarifs sont environ ${Math.round((1 - cd.coeffPeripherie) * 100)} % inf\u00E9rieurs.`,
    },
  ]

  // Varier la selection : 5 FAQ parmi 6, en utilisant le hash
  const hash = simpleHash(`faq-${m.slug}-${v.slug}`)
  const skip = hash % allFaqs.length
  return allFaqs.filter((_, i) => i !== skip)
}

// ---------------------------------------------------------------------------
// keyTakeaways (enrichis)
// ---------------------------------------------------------------------------

function generateTakeaways(m: Metier, v: VilleLight, coeff: number, cd: CityLocalData): string[] {
  return [
    `Tarif horaire ${m.name.toLowerCase()} \u00E0 ${v.name} : ${adj(m.tarifMin, coeff)} \u2013 ${adj(m.tarifMax, coeff)} ${m.unit} en 2026.`,
    `Les prix \u00E0 ${v.name} sont ${coeff > 1.1 ? `environ ${Math.round((coeff - 1) * 100)} % au-dessus de` : 'proches de'} la moyenne nationale (indice de vie : ${cd.niveauVie}/100).`,
    `\u00C9cart centre-ville / p\u00E9riph\u00E9rie : environ ${Math.round((1 - cd.coeffPeripherie) * 100)} % de diff\u00E9rence sur les tarifs.`,
    `${m.prestations[0].nom} : ${range(m.prestations[0].min, m.prestations[0].max, coeff)}${m.prestations[0].unite ? ` (${m.prestations[0].unite})` : ''}.`,
    `D\u00E9lai moyen d\u2019intervention \u00E0 ${v.name} : ${cd.delaiMoyen}.`,
    `Densit\u00E9 d\u2019artisans ${cd.densite} \u2014 ${cd.densite === 'forte' ? 'concurrence favorable aux clients' : cd.densite === 'moyenne' ? 'd\u00E9lais raisonnables' : 'anticiper les r\u00E9servations'}.`,
  ]
}

// ---------------------------------------------------------------------------
// Section liens internes
// ---------------------------------------------------------------------------

function liensSection(m: Metier, v: VilleLight): string {
  return [
    `## En savoir plus sur les ${m.plural} \u00E0 ${v.name}`,
    '',
    `- [Annuaire des ${m.plural} \u00E0 ${v.name}](/services/${m.slug}/${v.slug}) \u2014 trouvez un professionnel qualifi\u00E9 pr\u00E8s de chez vous`,
    `- [Tarifs d\u00E9taill\u00E9s ${m.name} ${v.name}](/tarifs/${m.slug}/${v.slug}) \u2014 grille compl\u00E8te des prix par prestation`,
    `- [Demander un devis ${m.name} \u00E0 ${v.name}](/devis/${m.slug}/${v.slug}) \u2014 recevez jusqu\u2019\u00E0 3 devis gratuits en 2 minutes`,
    `- [Guide complet des prix ${m.name} en France](/blog/prix-${m.slug}-2026) \u2014 comparatif national`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Generateur principal
// ---------------------------------------------------------------------------

function generateArticle(metier: Metier, ville: VilleLight): BlogArticle {
  const coeff = getCoefficient(ville)
  const slug = `prix-${metier.slug}-${ville.slug}-2026`
  const hash = simpleHash(slug)
  const cd = getCityData(ville.slug)
  const introFn = INTROS[hash % INTROS.length]

  // -- Tableau tarif horaire (enrichi avec centre vs peripherie) --
  const prixPeriph = adj(metier.tarifMin, coeff * cd.coeffPeripherie)
  const prixPeriphMax = adj(metier.tarifMax, coeff * cd.coeffPeripherie)

  const tarifTable = [
    `## Tarifs ${metier.name} \u00E0 ${ville.name} en 2026`,
    '',
    `:::budget`,
    `| Poste | Tarif 2026 \u00E0 ${ville.name} |`,
    `| Tarif horaire centre-ville | ${adj(metier.tarifMin, coeff)} \u2013 ${adj(metier.tarifMax, coeff)} ${metier.unit} |`,
    `| Tarif horaire p\u00E9riph\u00E9rie | ${prixPeriph} \u2013 ${prixPeriphMax} ${metier.unit} |`,
    `| D\u00E9placement | ${coeff >= 1.2 ? '30 \u2013 60' : '20 \u2013 45'} \u20AC |`,
    `| Majoration urgence / nuit | +30 \u00E0 50 % |`,
    `| Majoration weekend / f\u00E9ri\u00E9 | +50 \u00E0 100 % |`,
    `| Devis | Gratuit (chez la plupart des ${metier.plural}) |`,
    `:::`,
    '',
    `*Ces tarifs sont des moyennes constat\u00E9es \u00E0 ${ville.name} en 2026. Le prix r\u00E9el d\u00E9pend du quartier, de la complexit\u00E9 et des mat\u00E9riaux.*`,
  ].join('\n')

  // -- Tableau prestations (enrichi avec comparaison departementale) --
  const deptCoeff = coeff > 1.1 ? coeff * 0.95 : coeff * 1.02 // moyenne departementale legèrement differente
  const presTable = [
    `## Prix des prestations ${metier.name.toLowerCase()} \u00E0 ${ville.name}`,
    '',
    `:::budget`,
    `| Prestation | Prix \u00E0 ${ville.name} | Moyenne ${ville.departement} |`,
    ...metier.prestations.map(
      (p) => `| ${p.nom} | ${adj(p.min, coeff)} \u2013 ${adj(p.max, coeff)} \u20AC${p.unite ? ` (${p.unite})` : ''} | ${adj(p.min, deptCoeff)} \u2013 ${adj(p.max, deptCoeff)} \u20AC${p.unite ? ` (${p.unite})` : ''} |`
    ),
    `:::`,
    '',
    `*Prix indicatifs TTC, fournitures comprises selon les prestations. Les tarifs \u00E0 ${ville.name} sont ${coeff > deptCoeff ? 'l\u00E9g\u00E8rement sup\u00E9rieurs' : 'similaires'} \u00E0 la moyenne du ${ville.departement}. Un devis personnalis\u00E9 reste indispensable.*`,
  ].join('\n')

  // -- Variations --
  const variationsSection = [
    `## Pourquoi les prix des ${metier.plural} varient \u00E0 ${ville.name}`,
    '',
    whyPricesVary(metier, ville, coeff, cd),
  ].join('\n')

  // -- Aides --
  const aides = aidesSection(metier, ville)

  // -- CTA --
  const ctaSection = [
    `## Trouver ${metier.article} \u00E0 ${ville.name}`,
    '',
    `Pour obtenir le meilleur rapport qualit\u00E9-prix \u00E0 ${ville.name}, nous vous recommandons de :`,
    `1. **Comparer 3 devis** de ${metier.plural} \u00E0 ${ville.name} via notre [plateforme de devis gratuits](/devis/${metier.slug}/${ville.slug})`,
    `2. **V\u00E9rifier les avis** et qualifications (RGE, Qualibat) sur notre [annuaire ${ville.name}](/services/${metier.slug}/${ville.slug})`,
    `3. **Demander un devis d\u00E9taill\u00E9** poste par poste, mat\u00E9riaux inclus`,
    `4. **Privil\u00E9gier un artisan local** qui conna\u00EEt le b\u00E2ti de ${ville.name}`,
    '',
    `D\u00E9lai moyen pour obtenir un rendez-vous \u00E0 ${ville.name} : **${cd.delaiMoyen}**.`,
  ].join('\n')

  // -- Takeaway --
  const takeaway = [
    `:::takeaway`,
    `**\u00C0 retenir** : le tarif horaire d'${metier.article} \u00E0 ${ville.name} se situe entre **${adj(metier.tarifMin, coeff)} et ${adj(metier.tarifMax, coeff)} ${metier.unit}** en 2026 (${Math.round((1 - cd.coeffPeripherie) * 100)} % moins cher en p\u00E9riph\u00E9rie). ${cd.densite === 'forte' ? 'La forte concurrence locale joue en votre faveur.' : 'Anticipez vos travaux pour \u00E9viter les surco\u00FBts d\u2019urgence.'} Comparez plusieurs devis et privil\u00E9giez les artisans certifi\u00E9s.`,
    `:::`,
  ].join('\n')

  // -- Assemblage du content array --
  const content: string[] = [
    introFn(metier, ville, coeff, cd),
    tarifTable,
    presTable,
    localSpecificities(metier, ville, cd),
    quartiersSection(metier, ville, coeff, cd),
    variationsSection,
  ]

  if (aides) {
    content.push(`## Aides disponibles dans le ${ville.departement}`)
    content.push(aides)
  }

  content.push(conseilsLocaux(metier, ville, cd))
  content.push(ctaSection)
  content.push(liensSection(metier, ville))
  content.push(takeaway)

  // -- Meta SEO --
  let metaTitle = `Prix ${metier.name} ${ville.name} 2026 \u2014 Tarifs et Devis Gratuit`
  if (metaTitle.length > 60) {
    metaTitle = `Prix ${metier.name} ${ville.name} 2026 \u2014 Tarifs`
    if (metaTitle.length > 60) {
      metaTitle = `Prix ${metier.name} ${ville.name} 2026`
    }
  }

  let metaDescription = `Tarifs ${metier.name.toLowerCase()} \u00E0 ${ville.name} en 2026 : ${adj(metier.tarifMin, coeff)}\u2013${adj(metier.tarifMax, coeff)} ${metier.unit}. Prix centre-ville vs p\u00E9riph\u00E9rie, sp\u00E9cificit\u00E9s locales et devis gratuit.`
  if (metaDescription.length > 155) {
    metaDescription = `Prix ${metier.name.toLowerCase()} ${ville.name} 2026 : ${adj(metier.tarifMin, coeff)}\u2013${adj(metier.tarifMax, coeff)} ${metier.unit}. Devis gratuit, tarifs par quartier.`
  }

  return {
    title: `Prix ${metier.name} \u00E0 ${ville.name} en 2026 : tarifs, quartiers et devis`,
    excerpt: `D\u00E9couvrez les tarifs des ${metier.plural} \u00E0 ${ville.name} en 2026. Prix horaire de ${adj(metier.tarifMin, coeff)} \u00E0 ${adj(metier.tarifMax, coeff)} ${metier.unit}, \u00E9carts centre-ville/p\u00E9riph\u00E9rie, sp\u00E9cificit\u00E9s locales et conseils pour obtenir le meilleur devis.`,
    content,
    image: `/images/blog/prix-${metier.slug}-${ville.slug}.webp`,
    author: "L'\u00E9quipe ServicesArtisans",
    date: '2026-03-22',
    readTime: '8 min',
    category: 'Tarifs',
    tags: [metier.name, ville.name, 'Tarifs', `Prix ${metier.name.toLowerCase()}`, ville.departement, ville.region],
    metaTitle,
    metaDescription,
    keyTakeaways: generateTakeaways(metier, ville, coeff, cd),
    faq: generateFaq(metier, ville, coeff, cd),
  }
}

// ---------------------------------------------------------------------------
// Export : 50 articles (5 metiers x 10 villes) — reduced from 200 for Helpful Content
// ---------------------------------------------------------------------------

export const prixVillesArticles: Record<string, BlogArticle> = {}

for (const metier of METIERS) {
  for (const ville of TOP_VILLES) {
    const slug = `prix-${metier.slug}-${ville.slug}-2026`
    prixVillesArticles[slug] = generateArticle(metier, ville)
  }
}
