import type { BlogArticle } from './articles'
import { villesLight } from '../france-light'

// ---------------------------------------------------------------------------
// 10 métiers les plus recherchés avec données tarifaires
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
  {
    slug: 'menuisier',
    name: 'Menuisier',
    article: 'un menuisier',
    plural: 'menuisiers',
    tarifMin: 35,
    tarifMax: 60,
    unit: '\u20AC/h',
    prestations: [
      { nom: 'Porte int\u00E9rieure (fourni-pos\u00E9)', min: 200, max: 600 },
      { nom: 'Placard sur mesure', min: 800, max: 3000 },
      { nom: 'Fen\u00EAtre bois (fourni-pos\u00E9)', min: 400, max: 1200 },
      { nom: 'Escalier sur mesure', min: 2000, max: 8000 },
    ],
    specialites: ['sur-mesure', 'fen\u00EAtres', 'agencement'],
  },
  {
    slug: 'macon',
    name: 'Ma\u00E7on',
    article: 'un ma\u00E7on',
    plural: 'ma\u00E7ons',
    tarifMin: 40,
    tarifMax: 70,
    unit: '\u20AC/h',
    prestations: [
      { nom: 'Mur en parpaings', min: 80, max: 150, unite: '\u20AC/m\u00B2' },
      { nom: 'Fondations', min: 100, max: 200, unite: '\u20AC/ml' },
      { nom: 'Terrasse b\u00E9ton', min: 50, max: 120, unite: '\u20AC/m\u00B2' },
      { nom: 'Ouverture dans mur porteur', min: 1500, max: 5000 },
    ],
    specialites: ['gros \u0153uvre', 'extension', 'ma\u00E7onnerie g\u00E9n\u00E9rale'],
  },
  {
    slug: 'couvreur',
    name: 'Couvreur',
    article: 'un couvreur',
    plural: 'couvreurs',
    tarifMin: 40,
    tarifMax: 65,
    unit: '\u20AC/h',
    prestations: [
      { nom: 'R\u00E9fection toiture', min: 80, max: 200, unite: '\u20AC/m\u00B2' },
      { nom: 'Nettoyage toiture', min: 15, max: 30, unite: '\u20AC/m\u00B2' },
      { nom: 'R\u00E9paration fuite toiture', min: 300, max: 900 },
      { nom: 'Installation velux', min: 500, max: 1500 },
    ],
    specialites: ['toiture ardoise', 'toiture tuile', 'zinguerie'],
  },
  {
    slug: 'carreleur',
    name: 'Carreleur',
    article: 'un carreleur',
    plural: 'carreleurs',
    tarifMin: 30,
    tarifMax: 55,
    unit: '\u20AC/h',
    prestations: [
      { nom: 'Pose carrelage sol', min: 30, max: 80, unite: '\u20AC/m\u00B2' },
      { nom: 'Fa\u00EFence murale', min: 35, max: 90, unite: '\u20AC/m\u00B2' },
      { nom: 'Salle de bain compl\u00E8te', min: 50, max: 120, unite: '\u20AC/m\u00B2' },
      { nom: 'Mosa\u00EFque', min: 70, max: 150, unite: '\u20AC/m\u00B2' },
    ],
    specialites: ['carrelage grand format', 'mosa\u00EFque', 'fa\u00EFence'],
  },
  {
    slug: 'plaquiste',
    name: 'Plaquiste',
    article: 'un plaquiste',
    plural: 'plaquistes',
    tarifMin: 30,
    tarifMax: 50,
    unit: '\u20AC/h',
    prestations: [
      { nom: 'Cloison placo', min: 35, max: 65, unite: '\u20AC/m\u00B2' },
      { nom: 'Faux-plafond', min: 40, max: 80, unite: '\u20AC/m\u00B2' },
      { nom: 'Doublage isolation', min: 30, max: 60, unite: '\u20AC/m\u00B2' },
      { nom: 'Bandes et joints', min: 8, max: 15, unite: '\u20AC/ml' },
    ],
    specialites: ['cloison', 'isolation', 'faux-plafond'],
  },
]

// ---------------------------------------------------------------------------
// 20 premières villes (les plus peuplées de villesLight)
// ---------------------------------------------------------------------------

const TOP_VILLES = villesLight.slice(0, 20)

// ---------------------------------------------------------------------------
// Coefficient régional de prix
// ---------------------------------------------------------------------------

type VilleLight = (typeof villesLight)[number]

function getCoefficient(ville: VilleLight): number {
  // Paris & petite couronne
  if (ville.region === '\u00CEle-de-France') return 1.3
  // PACA — Nice, Toulon, Aix, Marseille
  if (ville.region === 'Provence-Alpes-C\u00F4te d\'Azur') return 1.2
  // Grandes métropoles >300k
  const grandes = ['lyon', 'toulouse', 'bordeaux', 'nantes', 'montpellier', 'lille', 'strasbourg']
  if (grandes.includes(ville.slug)) return 1.15
  // Reste
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

// ---------------------------------------------------------------------------
// Templates de phrases d'intro (5 variantes)
// ---------------------------------------------------------------------------

const INTROS: ((m: Metier, v: VilleLight, coeff: number) => string)[] = [
  (m, v, _c) =>
    `Vous cherchez ${m.article} \u00E0 ${v.name} et souhaitez conna\u00EEtre les tarifs pratiqu\u00E9s en 2026 ? Les prix des ${m.plural} varient selon la nature des travaux, l'urgence de l'intervention et la localisation dans ${v.departement}. Trouvez un [${m.name} \u00E0 ${v.name}](/services/${m.slug}/${v.slug}) et obtenez un devis gratuit en 2 minutes.`,
  (m, v, c) =>
    `\u00C0 ${v.name}, le tarif horaire moyen d'${m.article} se situe entre **${adj(m.tarifMin, c)} et ${adj(m.tarifMax, c)} ${m.unit}** en 2026. Ces prix d\u00E9pendent de la complexit\u00E9 du chantier, des mat\u00E9riaux utilis\u00E9s et des sp\u00E9cificit\u00E9s locales de ${v.region}. D\u00E9couvrez notre [annuaire de ${m.plural} \u00E0 ${v.name}](/services/${m.slug}/${v.slug}) pour comparer les professionnels.`,
  (m, v, _c) =>
    `Combien co\u00FBte ${m.article} \u00E0 ${v.name} ? C'est la question que se posent de nombreux habitants du ${v.departement} avant d'engager des travaux. Ce guide d\u00E9taille les tarifs 2026 des ${m.plural} dans votre ville, prestation par prestation. Comparez les [${m.plural} disponibles \u00E0 ${v.name}](/services/${m.slug}/${v.slug}).`,
  (m, v, c) =>
    `Les tarifs des ${m.plural} \u00E0 ${v.name} en 2026 oscillent entre **${adj(m.tarifMin, c)} et ${adj(m.tarifMax, c)} ${m.unit}** selon la prestation demand\u00E9e. ${v.name}, situ\u00E9e en ${v.region}, pr\u00E9sente des prix ${c > 1.1 ? 'l\u00E9g\u00E8rement sup\u00E9rieurs' : 'proches'} de la moyenne nationale. Consultez les [${m.plural} \u00E0 ${v.name}](/services/${m.slug}/${v.slug}).`,
  (m, v, _c) =>
    `Avant de faire appel \u00E0 ${m.article} \u00E0 ${v.name}, il est essentiel de comprendre la grille tarifaire en vigueur dans le ${v.departement}. Ce guide 2026 vous donne tous les prix, du d\u00E9pannage rapide aux gros travaux. Trouvez un professionnel sur notre [page ${m.plural} ${v.name}](/services/${m.slug}/${v.slug}).`,
]

// ---------------------------------------------------------------------------
// Templates de paragraphes "Pourquoi les prix varient"
// ---------------------------------------------------------------------------

function whyPricesVary(m: Metier, v: VilleLight, coeff: number): string {
  const reasons: string[] = []

  if (coeff >= 1.3) {
    reasons.push(`**Co\u00FBt de la vie \u00E9lev\u00E9** : en ${v.region}, les charges des artisans (loyer, assurances, d\u00E9placements) sont nettement sup\u00E9rieures \u00E0 la moyenne nationale, ce qui se r\u00E9percute sur les tarifs.`)
  } else if (coeff >= 1.15) {
    reasons.push(`**M\u00E9tropole dynamique** : ${v.name} conna\u00EEt une forte demande en travaux li\u00E9e \u00E0 sa croissance d\u00E9mographique, ce qui tire les prix des ${m.plural} l\u00E9g\u00E8rement au-dessus de la moyenne.`)
  } else {
    reasons.push(`**Tarifs mod\u00E9r\u00E9s** : ${v.name} b\u00E9n\u00E9ficie de prix de main-d'\u0153uvre inf\u00E9rieurs aux grandes m\u00E9tropoles, ce qui rend les travaux plus accessibles dans le ${v.departement}.`)
  }

  reasons.push(`**Nature du chantier** : un d\u00E9pannage d'urgence co\u00FBtera toujours plus cher qu'une intervention planifi\u00E9e. Les ${m.plural} \u00E0 ${v.name} appliquent g\u00E9n\u00E9ralement un suppl\u00E9ment de 30 \u00E0 50 % pour les urgences.`)
  reasons.push(`**Exp\u00E9rience et qualifications** : un ${m.name.toLowerCase()} certifi\u00E9 RGE ou poss\u00E9dant des qualifications sp\u00E9cifiques en ${m.specialites[0]} facturera davantage, mais garantit un travail aux normes.`)
  reasons.push(`**Acc\u00E8s au chantier** : dans les quartiers anciens de ${v.name}${v.quartiers.length > 0 ? ` (${v.quartiers[0]}, ${v.quartiers[1] || v.quartiers[0]})` : ''}, la difficult\u00E9 d'acc\u00E8s ou le stationnement peuvent majorer le devis.`)

  return reasons.map((r) => `- ${r}`).join('\n')
}

// ---------------------------------------------------------------------------
// Aides disponibles
// ---------------------------------------------------------------------------

function aidesSection(m: Metier, v: VilleLight): string | null {
  const eligible = ['chauffagiste', 'plombier', 'electricien', 'couvreur', 'plaquiste']
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
// FAQ
// ---------------------------------------------------------------------------

function generateFaq(m: Metier, v: VilleLight, coeff: number): { question: string; answer: string }[] {
  const faqs = [
    {
      question: `Quel est le tarif horaire d'${m.article} \u00E0 ${v.name} ?`,
      answer: `Le tarif horaire d'${m.article} \u00E0 ${v.name} se situe entre ${adj(m.tarifMin, coeff)} et ${adj(m.tarifMax, coeff)} ${m.unit} en 2026. Ce tarif varie selon l'exp\u00E9rience du professionnel, la complexit\u00E9 de l'intervention et les conditions d'acc\u00E8s au chantier.`,
    },
    {
      question: `Comment trouver ${m.article} pas cher \u00E0 ${v.name} ?`,
      answer: `Pour trouver ${m.article} au meilleur prix \u00E0 ${v.name}, comparez au moins 3 devis, \u00E9vitez les interventions d'urgence (sauf n\u00E9cessit\u00E9), planifiez vos travaux en basse saison et consultez notre annuaire de ${m.plural} dans le ${v.departement}.`,
    },
    {
      question: `Combien co\u00FBte ${m.prestations[0].nom.toLowerCase()} \u00E0 ${v.name} ?`,
      answer: `Le prix pour ${m.prestations[0].nom.toLowerCase()} \u00E0 ${v.name} varie de ${adj(m.prestations[0].min, coeff)} \u00E0 ${adj(m.prestations[0].max, coeff)} \u20AC${m.prestations[0].unite ? ` (${m.prestations[0].unite})` : ''} en 2026, fournitures comprises selon les cas.`,
    },
    {
      question: `Un ${m.name.toLowerCase()} \u00E0 ${v.name} se d\u00E9place-t-il gratuitement ?`,
      answer: `Cela d\u00E9pend du professionnel. Certains ${m.plural} \u00E0 ${v.name} incluent le d\u00E9placement dans leur devis, d'autres facturent entre 20 et 50 \u20AC. Demandez toujours la confirmation avant l'intervention.`,
    },
    {
      question: `Faut-il un devis avant de faire appel \u00E0 ${m.article} \u00E0 ${v.name} ?`,
      answer: `Oui, un devis \u00E9crit est obligatoire d\u00E8s que le montant d\u00E9passe 150 \u20AC (article L111-3 du Code de la consommation). Pour les urgences, le ${m.name.toLowerCase()} doit tout de m\u00EAme vous informer du tarif avant intervention.`,
    },
  ]

  // On retourne 4 FAQ en utilisant le hash pour varier
  const hash = simpleHash(`${m.slug}-${v.slug}`)
  const start = hash % 2 // 0 ou 1
  return faqs.slice(start, start + 4)
}

// ---------------------------------------------------------------------------
// keyTakeaways
// ---------------------------------------------------------------------------

function generateTakeaways(m: Metier, v: VilleLight, coeff: number): string[] {
  return [
    `Tarif horaire ${m.name.toLowerCase()} \u00E0 ${v.name} : ${adj(m.tarifMin, coeff)} \u2013 ${adj(m.tarifMax, coeff)} ${m.unit} en 2026.`,
    `Les prix des ${m.plural} \u00E0 ${v.name} sont ${coeff > 1.1 ? `environ ${Math.round((coeff - 1) * 100)} % au-dessus de` : 'proches de'} la moyenne nationale.`,
    `Comparez toujours au moins 3 devis de ${m.plural} dans le ${v.departement}.`,
    `${m.prestations[0].nom} : ${range(m.prestations[0].min, m.prestations[0].max, coeff)}${m.prestations[0].unite ? ` (${m.prestations[0].unite})` : ''}.`,
  ]
}

// ---------------------------------------------------------------------------
// Générateur principal
// ---------------------------------------------------------------------------

function generateArticle(metier: Metier, ville: VilleLight): BlogArticle {
  const coeff = getCoefficient(ville)
  const slug = `prix-${metier.slug}-${ville.slug}-2026`
  const hash = simpleHash(slug)
  const introFn = INTROS[hash % INTROS.length]

  // -- Tableau tarif horaire --
  const tarifTable = [
    `## Tarifs ${metier.name} \u00E0 ${ville.name}`,
    '',
    `:::budget`,
    `| Poste | Tarif 2026 \u00E0 ${ville.name} |`,
    `| Tarif horaire | ${adj(metier.tarifMin, coeff)} \u2013 ${adj(metier.tarifMax, coeff)} ${metier.unit} |`,
    `| D\u00E9placement | 20 \u2013 ${coeff >= 1.2 ? '60' : '45'} \u20AC |`,
    `| Majoration urgence / nuit | +30 \u00E0 50 % |`,
    `| Devis | Gratuit (chez la plupart des ${metier.plural}) |`,
    `:::`,
  ].join('\n')

  // -- Tableau prestations --
  const presTable = [
    `## Prix des prestations \u00E0 ${ville.name}`,
    '',
    `:::budget`,
    `| Prestation | Prix 2026 \u00E0 ${ville.name} |`,
    ...metier.prestations.map(
      (p) => `| ${p.nom} | ${adj(p.min, coeff)} \u2013 ${adj(p.max, coeff)} \u20AC${p.unite ? ` (${p.unite})` : ''} |`
    ),
    `:::`,
    '',
    `*Prix indicatifs TTC, fournitures comprises selon les prestations. Un devis personnalis\u00E9 reste indispensable.*`,
  ].join('\n')

  // -- Variations --
  const variationsSection = [
    `## Pourquoi les prix varient \u00E0 ${ville.name}`,
    '',
    whyPricesVary(metier, ville, coeff),
  ].join('\n')

  // -- Aides --
  const aides = aidesSection(metier, ville)

  // -- CTA --
  const ctaSection = [
    `## Trouver ${metier.article} \u00E0 ${ville.name}`,
    '',
    `Pour obtenir le meilleur rapport qualit\u00E9-prix, nous vous recommandons de :`,
    `1. **Comparer 3 devis** de ${metier.plural} \u00E0 ${ville.name}`,
    `2. **V\u00E9rifier les avis** et qualifications (RGE, Qualibat) du professionnel`,
    `3. **Demander un devis d\u00E9taill\u00E9** poste par poste, mat\u00E9riaux inclus`,
    '',
    `Consultez notre [annuaire de ${metier.plural} \u00E0 ${ville.name}](/services/${metier.slug}/${ville.slug}) pour trouver un professionnel qualifi\u00E9 pr\u00E8s de chez vous et demander un devis gratuit.`,
  ].join('\n')

  // -- Takeaway --
  const takeaway = [
    `:::takeaway`,
    `**\u00C0 retenir** : le tarif horaire d'${metier.article} \u00E0 ${ville.name} se situe entre **${adj(metier.tarifMin, coeff)} et ${adj(metier.tarifMax, coeff)} ${metier.unit}** en 2026. Comparez plusieurs devis et privil\u00E9giez les artisans certifi\u00E9s pour un travail de qualit\u00E9.`,
    `:::`,
  ].join('\n')

  // -- Assemblage du content array --
  const content: string[] = [
    introFn(metier, ville, coeff),
    tarifTable,
    presTable,
    variationsSection,
  ]

  if (aides) {
    content.push(`## Aides disponibles dans le ${ville.departement}`)
    content.push(aides)
  }

  content.push(ctaSection)
  content.push(takeaway)

  // -- Meta SEO --
  let metaTitle = `Prix ${metier.name} ${ville.name} 2026 \u2014 Tarifs et Devis Gratuit`
  if (metaTitle.length > 60) {
    metaTitle = `Prix ${metier.name} ${ville.name} 2026 \u2014 Tarifs`
    if (metaTitle.length > 60) {
      metaTitle = `Prix ${metier.name} ${ville.name} 2026`
    }
  }

  let metaDescription = `Tarifs ${metier.name.toLowerCase()} \u00E0 ${ville.name} en 2026 : ${adj(metier.tarifMin, coeff)}\u2013${adj(metier.tarifMax, coeff)} ${metier.unit}. Comparez les prix et obtenez un devis gratuit en 2 min.`
  if (metaDescription.length > 155) {
    metaDescription = `Prix ${metier.name.toLowerCase()} ${ville.name} 2026 : ${adj(metier.tarifMin, coeff)}\u2013${adj(metier.tarifMax, coeff)} ${metier.unit}. Devis gratuit.`
  }

  return {
    title: `Prix ${metier.name} \u00E0 ${ville.name} en 2026 : tarifs et devis`,
    excerpt: `D\u00E9couvrez les tarifs des ${metier.plural} \u00E0 ${ville.name} en 2026. Prix horaire de ${adj(metier.tarifMin, coeff)} \u00E0 ${adj(metier.tarifMax, coeff)} ${metier.unit}, prix des prestations courantes et conseils pour obtenir le meilleur devis.`,
    content,
    image: `/images/blog/prix-${metier.slug}-${ville.slug}.webp`,
    author: "L'\u00E9quipe ServicesArtisans",
    date: '2026-04-03',
    readTime: '6 min',
    category: 'Tarifs',
    tags: [metier.name, ville.name, 'Tarifs', `Prix ${metier.name.toLowerCase()}`, ville.departement],
    metaTitle,
    metaDescription,
    keyTakeaways: generateTakeaways(metier, ville, coeff),
    faq: generateFaq(metier, ville, coeff),
  }
}

// ---------------------------------------------------------------------------
// Export : 200 articles (10 métiers x 20 villes)
// ---------------------------------------------------------------------------

export const prixVillesArticles: Record<string, BlogArticle> = {}

for (const metier of METIERS) {
  for (const ville of TOP_VILLES) {
    const slug = `prix-${metier.slug}-${ville.slug}-2026`
    prixVillesArticles[slug] = generateArticle(metier, ville)
  }
}
