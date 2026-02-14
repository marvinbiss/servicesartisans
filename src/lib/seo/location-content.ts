/**
 * Generates UNIQUE SEO content for each service+location combination.
 *
 * Combines service-specific data (trade-content.ts) with location-specific
 * data (france.ts) to produce substantially different body text for every
 * page, eliminating the doorway-pages risk of near-identical content.
 */

import type { Ville } from '@/lib/data/france'
import { getTradeContent } from '@/lib/data/trade-content'

// ---------------------------------------------------------------------------
// Regional pricing multipliers
// ---------------------------------------------------------------------------

const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'Île-de-France': 1.25,
  "Provence-Alpes-Côte d'Azur": 1.10,
  'Auvergne-Rhône-Alpes': 1.10,
  'Hauts-de-France': 0.95,
  'Grand Est': 0.95,
}

function getRegionalMultiplier(region: string): number {
  return REGIONAL_MULTIPLIERS[region] ?? 1.0
}

function getRegionalLabel(region: string): string {
  const m = getRegionalMultiplier(region)
  if (m >= 1.20) return 'nettement supérieurs à la moyenne nationale'
  if (m >= 1.05) return 'légèrement supérieurs à la moyenne nationale'
  if (m <= 0.95) return 'légèrement inférieurs à la moyenne nationale'
  return 'proches de la moyenne nationale'
}

// ---------------------------------------------------------------------------
// Seasonal / contextual tips per service
// ---------------------------------------------------------------------------

interface SeasonalTips {
  coastal: string
  mountain: string
  urban: string
  rural: string
  default: string
}

const SEASONAL_TIPS: Record<string, SeasonalTips> = {
  plombier: {
    coastal:
      "En zone littorale, les canalisations sont davantage exposées à la corrosion saline. Un entretien préventif annuel est recommandé pour éviter les fuites liées à l'usure accélérée des tuyauteries.",
    mountain:
      "En zone de montagne, les risques de gel des canalisations sont accrus en hiver. Pensez à isoler vos tuyaux extérieurs et à purger le circuit avant les premières gelées.",
    urban:
      "Dans les immeubles anciens du centre-ville, les colonnes montantes en plomb ou en fonte peuvent nécessiter un remplacement. Renseignez-vous auprès de votre copropriété sur l'état des canalisations communes.",
    rural:
      "En zone rurale, les installations d'assainissement individuel (fosse septique) doivent être contrôlées par le SPANC tous les 4 ans. Un plombier qualifié peut assurer la vidange et l'entretien.",
    default:
      "Avant l'hiver, faites contrôler votre chauffe-eau et vos radiateurs pour garantir un fonctionnement optimal pendant la saison froide.",
  },
  electricien: {
    coastal:
      "Le climat salin du littoral accélère l'oxydation des contacts électriques extérieurs. Privilégiez des boîtiers étanches IP65 et un contrôle régulier des installations exposées.",
    mountain:
      "Les coupures de courant sont plus fréquentes en montagne en période de neige. L'installation d'un groupe électrogène ou d'un onduleur peut sécuriser votre alimentation.",
    urban:
      "Dans les logements anciens du centre-ville, la mise aux normes NF C 15-100 est souvent indispensable. Un diagnostic électrique est obligatoire pour la vente ou la location.",
    rural:
      "En zone rurale, les branchements aériens sont plus exposés aux intempéries. Envisagez un parafoudre pour protéger vos équipements électroniques.",
    default:
      "Faites vérifier votre tableau électrique tous les 10 ans pour garantir la conformité et la sécurité de votre installation.",
  },
  serrurier: {
    coastal:
      "L'air marin accélère la corrosion des serrures et des cylindres. Privilégiez des serrures en acier inoxydable ou traitées anticorrosion pour les portes exposées.",
    mountain:
      "Les variations de température en montagne peuvent provoquer des dilatations du bâti qui grippent les serrures. Un entretien annuel avec lubrification est conseillé.",
    urban:
      "En centre-ville, les tentatives de cambriolage sont plus fréquentes. Investissez dans une serrure certifiée A2P** minimum et un cylindre haute sécurité pour votre porte d'entrée.",
    rural:
      "En zone pavillonnaire, pensez à sécuriser l'ensemble des accès : porte d'entrée, porte de garage, portail et fenêtres accessibles du rez-de-chaussée.",
    default:
      "Changez votre cylindre de serrure en cas de perte de clé ou après l'emménagement dans un nouveau logement, même si la serrure fonctionne correctement.",
  },
  chauffagiste: {
    coastal:
      "Le climat doux du littoral rend la pompe à chaleur air-eau particulièrement performante, avec un COP optimal grâce aux températures hivernales modérées.",
    mountain:
      "En altitude, les températures hivernales basses réduisent le rendement des pompes à chaleur air-eau. Une chaudière gaz à condensation ou un système hybride est souvent plus adapté.",
    urban:
      "En copropriété, le remplacement de la chaudière collective par des solutions individuelles performantes nécessite un vote en assemblée générale et un audit énergétique préalable.",
    rural:
      "En zone rurale non raccordée au gaz de ville, les alternatives sont le fioul (en voie de suppression), la pompe à chaleur, le poêle à granulés ou la chaudière bois.",
    default:
      "Planifiez l'entretien obligatoire de votre chaudière en septembre-octobre, avant le début de la saison de chauffe, pour éviter les pannes en plein hiver.",
  },
  'peintre-en-batiment': {
    coastal:
      "Les façades en bord de mer subissent une usure accélérée due aux embruns salins. Un ravalement avec une peinture spéciale façade marine est recommandé tous les 8 à 10 ans.",
    mountain:
      "En montagne, les écarts de température importants imposent l'utilisation de peintures extérieures élastiques capables de résister aux cycles gel-dégel répétés.",
    urban:
      "En centre-ville, le ravalement de façade est souvent obligatoire tous les 10 ans (arrêté municipal). Renseignez-vous en mairie sur les délais et les couleurs autorisées.",
    rural:
      "Pour les maisons de campagne, les peintures à la chaux ou aux silicates sont idéales : elles laissent respirer les murs anciens en pierre et offrent un rendu authentique.",
    default:
      "Prévoyez vos travaux de peinture extérieure au printemps ou en début d'automne, quand les températures sont comprises entre 10 et 25 °C pour un séchage optimal.",
  },
  menuisier: {
    coastal:
      "En bord de mer, le bois extérieur (volets, portes, fenêtres) nécessite un traitement spécifique contre les embruns. L'aluminium ou le PVC sont des alternatives durables pour les menuiseries exposées.",
    mountain:
      "En montagne, le triple vitrage est recommandé pour les fenêtres exposées au nord et en altitude. Le surcoût est rentabilisé par les économies de chauffage en 5 à 8 ans.",
    urban:
      "En appartement, le remplacement des fenêtres nécessite souvent l'accord de la copropriété si l'aspect extérieur est modifié. Vérifiez le règlement de copropriété avant les travaux.",
    rural:
      "Pour les maisons anciennes en zone rurale, un menuisier spécialisé en rénovation du patrimoine saura restaurer les huisseries d'époque tout en améliorant l'isolation.",
    default:
      "Vérifiez l'état des joints de vos fenêtres chaque année. Des joints usés peuvent augmenter votre facture de chauffage de 10 à 15 %.",
  },
  carreleur: {
    coastal:
      "Pour les terrasses en bord de mer, privilégiez un carrelage classement R11 antidérapant et résistant au gel, posé sur un support avec étanchéité renforcée contre les remontées salines.",
    mountain:
      "En montagne, le carrelage extérieur doit impérativement être classé antigel (norme NF EN ISO 10545-12). La pose sur plots est recommandée pour faciliter le drainage.",
    urban:
      "Dans les appartements anciens, le carreleur devra souvent réaliser un ragréage important pour compenser les irrégularités des planchers d'époque.",
    rural:
      "Pour les maisons de caractère, le carrelage en terre cuite ou les tomettes artisanales apportent un cachet authentique tout en offrant une excellente inertie thermique.",
    default:
      "Après la pose, attendez au moins 24 heures avant de marcher sur le carrelage et 7 jours avant de solliciter fortement le sol (meubles lourds).",
  },
  couvreur: {
    coastal:
      "En zone littorale, les toitures sont soumises aux vents forts et aux embruns. Un contrôle annuel de la fixation des tuiles et de l'étanchéité des faîtages est indispensable.",
    mountain:
      "En montagne, le poids de la neige impose un dimensionnement renforcé de la charpente. Vérifiez que votre couvreur connaît les charges de neige de votre zone (norme NF EN 1991-1-3).",
    urban:
      "En centre-ville, les toitures en zinc sont fréquentes et nécessitent un couvreur-zingueur spécialisé pour les réparations et l'entretien des noues et chéneaux.",
    rural:
      "Pour les maisons rurales avec une grande surface de toiture, profitez d'une réfection pour installer des panneaux solaires : le couvreur peut coordonner les deux chantiers.",
    default:
      "Faites inspecter votre toiture après chaque tempête et au moins une fois tous les 5 ans pour détecter les tuiles cassées ou déplacées avant que les infiltrations ne causent des dégâts.",
  },
  macon: {
    coastal:
      "En bord de mer, le béton armé est soumis à la corrosion des armatures par les chlorures. Exigez un béton de classe d'exposition XS (milieu marin) pour toute construction exposée.",
    mountain:
      "En montagne, les fondations doivent être plus profondes (hors gel) et le béton doit résister aux cycles gel-dégel. La classe d'exposition XF est requise pour les éléments extérieurs.",
    urban:
      "En milieu urbain dense, les travaux de maçonnerie en mitoyenneté nécessitent un constat d'huissier préalable et le respect des règles de voisinage (horaires, accès, propreté).",
    rural:
      "Pour les constructions en zone rurale, renseignez-vous sur les règles du PLU (Plan Local d'Urbanisme) : hauteur maximale, emprise au sol et matériaux autorisés varient selon les communes.",
    default:
      "Ne planifiez pas de travaux de maçonnerie en période de gel (température < 5 °C) : le mortier et le béton ne prennent pas correctement et la solidité de l'ouvrage est compromise.",
  },
  jardinier: {
    coastal:
      "En zone littorale, privilégiez des plantes résistantes aux embruns et au vent : tamaris, laurier-rose, agapanthe, graminées ornementales. Un jardinier-paysagiste local saura composer un jardin adapté.",
    mountain:
      "En montagne, la saison de jardinage est plus courte. Choisissez des plantes rustiques résistantes au gel (-15 à -25 °C) et planifiez les plantations entre mai et septembre.",
    urban:
      "En ville, les jardins de petite superficie et les terrasses gagnent à être aménagés par un paysagiste qui optimisera l'espace avec des plantes en bacs, des treillages et du mobilier adapté.",
    rural:
      "Pour les grands terrains, un contrat d'entretien annuel avec tonte bimensuelle, taille des haies et entretien des massifs est la solution la plus économique à long terme.",
    default:
      "Adaptez votre calendrier de jardinage à votre zone climatique : les dates de taille, de plantation et de semis varient significativement entre le nord et le sud de la France.",
  },
  vitrier: {
    coastal:
      "En front de mer, les vitrages doivent résister aux projections salines et aux vents forts. Optez pour du double vitrage feuilleté avec un intercalaire warm-edge pour une isolation optimale.",
    mountain:
      "En altitude, le triple vitrage est justifié pour les grandes baies vitrées exposées au nord. Le surcoût de 40 à 60 % est compensé par les économies de chauffage.",
    urban:
      "En centre-ville, le double vitrage acoustique (vitrage asymétrique 10/16/4) réduit le bruit extérieur de 35 à 40 dB, un confort appréciable en bordure de rue passante.",
    rural:
      "Pour les maisons isolées, les vitrages retardateurs d'effraction (classés P2A à P5A) renforcent la sécurité sans nécessiter de volets roulants ou de barreaux.",
    default:
      "Vérifiez l'état de vos joints de vitrage chaque année. Un joint défaillant provoque des infiltrations d'air et d'eau qui dégradent le cadre et réduisent l'isolation.",
  },
  climaticien: {
    coastal:
      "Le climat méditerranéen impose une climatisation performante de mai à septembre. En bord de mer, l'unité extérieure doit être protégée de la corrosion saline avec un traitement anticorrosion spécifique.",
    mountain:
      "En montagne, la climatisation réversible (pompe à chaleur air-air) est idéale : elle rafraîchit en été et chauffe efficacement en mi-saison, réduisant la facture énergétique globale.",
    urban:
      "En copropriété, l'installation d'une unité extérieure de climatisation nécessite l'accord de l'assemblée générale. Le bruit de l'appareil doit respecter les normes de voisinage.",
    rural:
      "Pour les grandes maisons, un système gainable avec régulation par zone permet de climatiser chaque pièce indépendamment, optimisant le confort et la consommation.",
    default:
      "Faites entretenir votre climatisation chaque année au printemps, avant la saison chaude. Un filtre encrassé augmente la consommation de 5 à 15 % et dégrade la qualité de l'air.",
  },
  cuisiniste: {
    coastal:
      "En bord de mer, l'humidité ambiante peut affecter les meubles de cuisine en bois massif. Optez pour des façades en stratifié haute pression ou en laqué, plus résistantes à l'humidité.",
    mountain:
      "Dans les chalets et maisons de montagne, une cuisine en bois massif (chêne, noyer) s'harmonise avec l'architecture locale. Un cuisiniste artisan local maîtrise ces finitions traditionnelles.",
    urban:
      "En appartement, l'optimisation de l'espace est primordiale. Un cuisiniste expérimenté peut concevoir une cuisine fonctionnelle même dans moins de 6 m² grâce au mobilier sur mesure.",
    rural:
      "Pour les grandes cuisines de maison, l'îlot central est un atout majeur. Prévoyez au minimum 90 cm de passage autour de l'îlot pour une circulation confortable.",
    default:
      "Prenez le temps de comparer au moins 3 devis de cuisinistes différents. Les écarts de prix pour des prestations similaires peuvent atteindre 30 à 50 %.",
  },
  solier: {
    coastal:
      "En zone littorale humide, les sols PVC et vinyle sont particulièrement adaptés grâce à leur étanchéité naturelle. Évitez le parquet massif dans les pièces exposées à l'humidité marine.",
    mountain:
      "En montagne, le parquet massif en chêne ou en châtaignier apporte chaleur et authenticité. Associé à un chauffage au sol, le parquet contrecollé offre le meilleur compromis.",
    urban:
      "En appartement, l'isolation phonique du sol est essentielle pour le confort des voisins. Exigez une sous-couche acoustique conforme à la réglementation (ΔLw ≥ 17 dB).",
    rural:
      "Pour les maisons anciennes avec des planchers irréguliers, un ragréage soigné est indispensable avant la pose. Le solier évaluera la planéité et proposera la solution adaptée.",
    default:
      "Laissez le revêtement de sol s'acclimater 48 heures dans la pièce avant la pose, à température ambiante, pour éviter les retraits ou dilatations après installation.",
  },
  nettoyage: {
    coastal:
      "En bord de mer, le nettoyage des vitres et des façades doit être plus fréquent en raison des dépôts de sel marin. Un contrat trimestriel de nettoyage extérieur préserve l'aspect du bâtiment.",
    mountain:
      "Après la saison d'hiver, un nettoyage complet des extérieurs (façade, terrasse, gouttières) est recommandé pour éliminer les résidus de sel de déneigement et les mousses.",
    urban:
      "En copropriété, le nettoyage des parties communes (hall, escaliers, local poubelles) est un poste important du budget. Un appel d'offres annuel permet d'obtenir les meilleurs tarifs.",
    rural:
      "Pour les grandes propriétés, le nettoyage de fin de chantier après des travaux de rénovation nécessite une entreprise équipée : aspirateur industriel, autolaveuse, nettoyeur haute pression.",
    default:
      "Pour un résultat professionnel, demandez toujours un devis après visite sur site. Le prix au m² varie selon l'état des lieux et le type de nettoyage requis.",
  },
}

// ---------------------------------------------------------------------------
// Deterministic "random" seed from string — for variation without randomness
// ---------------------------------------------------------------------------

function hashCode(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// ---------------------------------------------------------------------------
// City context helpers
// ---------------------------------------------------------------------------

function getCityContext(ville: Ville): 'coastal' | 'mountain' | 'urban' | 'rural' | 'default' {
  const regionLower = ville.region.toLowerCase()
  const descLower = ville.description.toLowerCase()
  const pop = parseInt(ville.population.replace(/\s/g, ''), 10) || 0

  // Coastal detection
  if (
    descLower.includes('littoral') ||
    descLower.includes('port') ||
    descLower.includes('côte') ||
    descLower.includes('mer') ||
    descLower.includes('méditerran') ||
    descLower.includes('maritime') ||
    descLower.includes('océan') ||
    descLower.includes('plage') ||
    ['Marseille', 'Nice', 'Toulon', 'Montpellier', 'Brest', 'La Rochelle', 'Cannes', 'Ajaccio', 'Bastia', 'Perpignan', 'Bayonne', 'Saint-Nazaire', 'Dunkerque', 'Calais', 'Boulogne-sur-Mer', 'Sète', 'Antibes'].includes(ville.name)
  ) {
    return 'coastal'
  }

  // Mountain detection
  if (
    descLower.includes('montagne') ||
    descLower.includes('alpes') ||
    descLower.includes('pyrénées') ||
    descLower.includes('altitude') ||
    descLower.includes('ski') ||
    regionLower.includes('alpes') ||
    ['Grenoble', 'Annecy', 'Chambéry', 'Gap', 'Briançon', 'Chamonix', 'Pau'].includes(ville.name)
  ) {
    return 'mountain'
  }

  // Urban vs rural by population
  if (pop >= 100000) return 'urban'
  if (pop < 30000) return 'rural'

  return 'default'
}

// ---------------------------------------------------------------------------
// Intro text templates — 15 varied structures to avoid repetition
// ---------------------------------------------------------------------------

function generateIntroText(
  serviceSlug: string,
  serviceName: string,
  ville: Ville,
  providerCount: number,
): string {
  const pop = ville.population
  const dep = ville.departement
  const region = ville.region
  const svcLower = serviceName.toLowerCase()
  const hash = hashCode(`${serviceSlug}-${ville.slug}`)
  const count = providerCount > 0 ? providerCount : 'les'
  const countSpace = providerCount > 0 ? providerCount + ' ' : ''

  const templates = [
    // 1 — Question directe
    `Vous recherchez un ${svcLower} qualifié à ${ville.name} ? Située dans le département ${dep} en région ${region}, ${ville.name} compte ${pop} habitants et bénéficie d'un réseau dense de professionnels du bâtiment. ServicesArtisans référence ${count} ${svcLower}s intervenant à ${ville.name} et dans ses environs, tous identifiés par leur numéro SIREN via l'API officielle du gouvernement. ${ville.description}`,

    // 2 — Ouverture par le code postal
    `À ${ville.name} (${ville.codePostal}), commune de ${pop} habitants du département ${dep}, trouver un ${svcLower} de confiance est essentiel pour vos travaux. Notre annuaire recense ${count} professionnels référencés dans votre secteur géographique, en région ${region}. Chaque ${svcLower} listé sur ServicesArtisans est identifié par son numéro SIREN, garantissant une activité déclarée et vérifiable. ${ville.description}`,

    // 3 — Ouverture par le nom de ville
    `${ville.name}, ville de ${pop} habitants dans le ${dep} (${region}), dispose de nombreux artisans qualifiés pour répondre à vos besoins en ${svcLower}. ServicesArtisans vous permet de comparer ${count} ${svcLower}s référencés à ${ville.name} (${ville.codePostal}), de consulter leurs coordonnées et de les contacter directement pour un devis gratuit. ${ville.description}`,

    // 4 — "Besoin de..."
    `Besoin d'un ${svcLower} à ${ville.name} ? Notre annuaire couvre l'ensemble du département ${dep} en ${region} et référence ${count} professionnels qualifiés dans votre commune de ${pop} habitants. Tous les artisans listés sont identifiés via l'API Sirene du gouvernement, un gage de transparence pour les habitants de ${ville.name} (${ville.codePostal}). ${ville.description}`,

    // 5 — Ouverture par les habitants
    `Les habitants de ${ville.name} (${pop} habitants, ${dep}, ${region}) peuvent compter sur ServicesArtisans pour trouver un ${svcLower} référencé et qualifié. Notre plateforme recense ${count} professionnels exerçant à ${ville.name} et dans les communes voisines du ${ville.departementCode}. Chaque profil est vérifié via le registre SIREN, vous assurant de contacter des artisans en règle. ${ville.description}`,

    // 6 — Ouverture par le département
    `${ville.name}, commune du département ${dep} en ${region}, rassemble ${pop} habitants qui peuvent avoir besoin d'un ${svcLower} pour leurs projets de construction, rénovation ou dépannage. ServicesArtisans met à votre disposition un annuaire de ${countSpace}professionnels vérifiés par SIREN, intervenant à ${ville.name} (${ville.codePostal}) et ses alentours. ${ville.description}`,

    // 7 — Ouverture par le métier
    `Le métier de ${svcLower} requiert un savoir-faire spécifique, et à ${ville.name} (${pop} habitants, ${dep}), les professionnels du secteur ne manquent pas. ServicesArtisans vous aide à identifier ${count} ${svcLower}s référencés dans votre commune et en ${region}, chacun vérifié par son numéro SIREN auprès des données officielles de l'État. ${ville.description}`,

    // 8 — Recommandation directe
    `Pour vos travaux de ${svcLower} à ${ville.name}, faites confiance aux professionnels référencés sur ServicesArtisans. Notre annuaire recense ${countSpace}artisans identifiés par SIREN dans le ${dep} (${ville.departementCode}), en région ${region}. Avec ${pop} habitants, ${ville.name} dispose d'un tissu artisanal dynamique pour répondre à toutes vos demandes. ${ville.description}`,

    // 9 — Fait sur la population
    `Avec ses ${pop} habitants, ${ville.name} est une commune du ${dep} où la demande en services de ${svcLower} reste constante tout au long de l'année. En ${region}, ServicesArtisans référence ${count} professionnels intervenant à ${ville.name} (${ville.codePostal}) et dans les communes environnantes, tous identifiés par leur numéro SIREN. ${ville.description}`,

    // 10 — Perspective travaux
    `Que ce soit pour un dépannage urgent ou un projet planifié, trouver un ${svcLower} fiable à ${ville.name} (${ville.codePostal}) est une priorité pour de nombreux habitants. ServicesArtisans répertorie ${countSpace}professionnels du ${dep} en ${region}, vérifiés via l'API Sirene du gouvernement, pour vous permettre de comparer et de choisir en toute confiance. ${ville.description}`,

    // 11 — Ancrage régional
    `En ${region}, et plus particulièrement à ${ville.name} (${pop} habitants, ${dep}), les services d'un ${svcLower} qualifié sont indispensables pour maintenir et valoriser votre habitat. Notre annuaire met en relation les habitants du ${ville.departementCode} avec ${count} professionnels référencés par SIREN, garantissant leur existence légale et leur activité déclarée. ${ville.description}`,

    // 12 — Comparaison et devis
    `Comparer les ${svcLower}s à ${ville.name} n'a jamais été aussi simple. ServicesArtisans référence ${countSpace}professionnels vérifiés dans le ${dep} (${region}), pour cette commune de ${pop} habitants. Consultez les coordonnées de chaque artisan identifié par SIREN et demandez plusieurs devis gratuits pour votre projet à ${ville.name} (${ville.codePostal}). ${ville.description}`,

    // 13 — Qualité et confiance
    `La qualité des travaux de ${svcLower} dépend avant tout du choix du professionnel. À ${ville.name}, commune de ${pop} habitants dans le ${dep} (${region}), ServicesArtisans vous propose un annuaire de ${countSpace}artisans référencés et vérifiés par leur numéro SIREN, pour vous aider à sélectionner le bon prestataire en toute sérénité. ${ville.description}`,

    // 14 — Proximité géographique
    `Trouver un ${svcLower} près de chez vous à ${ville.name} (${ville.codePostal}) est essentiel pour bénéficier d'une intervention rapide et de tarifs compétitifs. Notre annuaire couvre tout le département ${dep} en ${region} et référence ${count} professionnels prêts à intervenir dans votre commune de ${pop} habitants et ses environs. ${ville.description}`,

    // 15 — Ouverture par un conseil
    `Avant de choisir un ${svcLower} à ${ville.name}, prenez le temps de comparer les profils des ${countSpace}professionnels référencés sur ServicesArtisans. Dans le ${dep} (${region}), chaque artisan est identifié par son numéro SIREN via les données officielles du gouvernement, un critère de fiabilité essentiel pour les ${pop} habitants de ${ville.name} (${ville.codePostal}). ${ville.description}`,
  ]

  return templates[hash % templates.length]
}

// ---------------------------------------------------------------------------
// Pricing note with regional adjustment
// ---------------------------------------------------------------------------

function generatePricingNote(
  serviceSlug: string,
  serviceName: string,
  ville: Ville,
): string {
  const trade = getTradeContent(serviceSlug)
  if (!trade) return ''

  const multiplier = getRegionalMultiplier(ville.region)
  const adjustedMin = Math.round(trade.priceRange.min * multiplier)
  const adjustedMax = Math.round(trade.priceRange.max * multiplier)
  const label = getRegionalLabel(ville.region)
  const svcLower = serviceName.toLowerCase()

  return `À ${ville.name}, les tarifs d'un ${svcLower} se situent en moyenne entre ${adjustedMin} et ${adjustedMax} ${trade.priceRange.unit}, des prix ${label}. En région ${ville.region}, le coût de la vie et la densité de professionnels influencent directement les tarifs pratiqués. Nous vous recommandons de demander au moins trois devis auprès de ${svcLower}s différents à ${ville.name} (${ville.codePostal}) pour comparer les prix et les prestations avant de vous engager.`
}

// ---------------------------------------------------------------------------
// Local tips
// ---------------------------------------------------------------------------

function generateLocalTips(
  serviceSlug: string,
  serviceName: string,
  ville: Ville,
): string[] {
  const trade = getTradeContent(serviceSlug)
  const context = getCityContext(ville)
  const tips: string[] = []
  const svcLower = serviceName.toLowerCase()
  const hash = hashCode(`${serviceSlug}-${ville.slug}-tips`)

  // 1. Context-specific tip from SEASONAL_TIPS
  const seasonalForService = SEASONAL_TIPS[serviceSlug]
  if (seasonalForService) {
    tips.push(seasonalForService[context] || seasonalForService.default)
  }

  // 2. Pick 1-2 tips from trade content (deterministic selection based on hash)
  if (trade && trade.tips.length > 0) {
    const idx1 = hash % trade.tips.length
    tips.push(trade.tips[idx1])

    if (trade.tips.length > 2) {
      const idx2 = (hash + 3) % trade.tips.length
      if (idx2 !== idx1) {
        tips.push(trade.tips[idx2])
      }
    }
  }

  // 3. Regional-specific general tip
  const multiplier = getRegionalMultiplier(ville.region)
  if (multiplier >= 1.20) {
    tips.push(
      `Les tarifs des ${svcLower}s en ${ville.region} sont parmi les plus élevés de France. N'hésitez pas à élargir votre recherche aux communes limitrophes de ${ville.name} pour obtenir des devis plus compétitifs.`,
    )
  } else if (multiplier <= 0.95) {
    tips.push(
      `En ${ville.region}, les tarifs des artisans sont généralement plus accessibles qu'en Île-de-France ou sur la Côte d'Azur. Profitez-en pour comparer les devis de ${svcLower}s à ${ville.name} et choisir le meilleur rapport qualité-prix.`,
    )
  }

  return tips.slice(0, 3)
}

// ---------------------------------------------------------------------------
// Quartier text
// ---------------------------------------------------------------------------

function generateQuartierText(
  serviceName: string,
  ville: Ville,
): string {
  const svcLower = serviceName.toLowerCase()

  if (ville.quartiers.length === 0) {
    return `Nos ${svcLower}s référencés interviennent dans toute la commune de ${ville.name} ainsi que dans les villes et villages voisins du département ${ville.departement} (${ville.departementCode}). Que vous habitiez au centre-ville ou en périphérie, vous trouverez un professionnel qualifié à proximité de chez vous.`
  }

  // Show a subset of quartiers for variety (use all if <= 6, else pick based on slug hash)
  const maxQuartiers = 8
  const quartiersToShow =
    ville.quartiers.length <= maxQuartiers
      ? ville.quartiers
      : ville.quartiers.slice(0, maxQuartiers)

  const quartiersList = quartiersToShow.join(', ')
  const remaining = ville.quartiers.length - quartiersToShow.length

  let text = `Nos ${svcLower}s interviennent dans l'ensemble des quartiers de ${ville.name} : ${quartiersList}`
  if (remaining > 0) {
    text += ` et ${remaining} autres quartiers`
  }
  text += `. Quel que soit votre secteur à ${ville.name} (${ville.codePostal}), un ${svcLower} qualifié peut se déplacer rapidement chez vous pour un diagnostic ou un devis gratuit.`

  return text
}

// ---------------------------------------------------------------------------
// Conclusion / CTA — 10 varied templates
// ---------------------------------------------------------------------------

function generateConclusion(
  serviceSlug: string,
  serviceName: string,
  ville: Ville,
  providerCount: number,
): string {
  const svcLower = serviceName.toLowerCase()
  const trade = getTradeContent(serviceSlug)
  const hash = hashCode(`${serviceSlug}-${ville.slug}-cta`)
  const countSpace = providerCount > 0 ? providerCount + ' ' : ''

  const urgencyLine = trade?.emergencyInfo
    ? ` En cas d'urgence, certains ${svcLower}s de ${ville.name} proposent une intervention rapide : ${trade.averageResponseTime.toLowerCase()}.`
    : ''

  const certLine =
    trade && trade.certifications.length > 0
      ? ` Parmi les qualifications à rechercher : ${trade.certifications.slice(0, 2).join(', ')}.`
      : ''

  const templates = [
    // 1 — Appel à l'action direct
    `Ne perdez plus de temps à chercher un ${svcLower} fiable à ${ville.name}. Consultez les ${countSpace}profils référencés sur ServicesArtisans, comparez les coordonnées et contactez directement le professionnel de votre choix dans le ${ville.departement} (${ville.departementCode}).${urgencyLine}${certLine}`,

    // 2 — Simplicité de la démarche
    `ServicesArtisans simplifie votre recherche de ${svcLower} à ${ville.name} (${ville.codePostal}). Parcourez notre annuaire de ${countSpace}professionnels référencés en ${ville.region}, consultez leurs informations et demandez vos devis gratuitement.${urgencyLine}${certLine}`,

    // 3 — En quelques clics
    `Trouvez le ${svcLower} qu'il vous faut à ${ville.name} en quelques clics. Notre annuaire de ${countSpace}professionnels du ${ville.departement} vous permet de comparer et de contacter les artisans référencés par SIREN dans votre secteur.${urgencyLine}${certLine}`,

    // 4 — Confiance et transparence
    `Faites le bon choix pour vos travaux à ${ville.name} (${ville.codePostal}). Les ${countSpace}${svcLower}s référencés sur ServicesArtisans dans le ${ville.departement} sont tous identifiés par SIREN, un gage de sérieux et de transparence pour les habitants de ${ville.name}.${urgencyLine}${certLine}`,

    // 5 — Recommandation d'action
    `N'attendez plus pour lancer votre projet : consultez dès maintenant les ${countSpace}${svcLower}s disponibles à ${ville.name} et dans le ${ville.departementCode}. ServicesArtisans vous donne accès aux coordonnées de professionnels vérifiés en ${ville.region}, pour des devis rapides et sans engagement.${urgencyLine}${certLine}`,

    // 6 — Résumé des avantages
    `Annuaire vérifié, données SIREN officielles, accès gratuit : ServicesArtisans réunit toutes les conditions pour vous aider à trouver un ${svcLower} de confiance à ${ville.name} (${ville.codePostal}). Comparez les ${countSpace}professionnels du ${ville.departement} et contactez celui qui correspond à votre besoin.${urgencyLine}${certLine}`,

    // 7 — Proximité et réactivité
    `À ${ville.name}, un ${svcLower} qualifié n'est qu'à quelques clics. Parcourez les ${countSpace}profils référencés dans le ${ville.departement} (${ville.region}) sur ServicesArtisans et trouvez le professionnel idéal pour votre projet, qu'il s'agisse d'un dépannage ou de travaux planifiés.${urgencyLine}${certLine}`,

    // 8 — Gratuit et sans engagement
    `Votre recherche de ${svcLower} à ${ville.name} commence ici. Accédez gratuitement à notre annuaire de ${countSpace}professionnels du ${ville.departement}, vérifiés par leur numéro SIREN, et demandez vos devis sans engagement auprès des artisans de ${ville.name} (${ville.codePostal}).${urgencyLine}${certLine}`,

    // 9 — Question finale
    `Prêt à trouver votre ${svcLower} à ${ville.name} ? ServicesArtisans met à votre disposition ${countSpace}professionnels référencés dans le ${ville.departement} (${ville.departementCode}), en ${ville.region}. Comparez les profils, vérifiez les qualifications et lancez votre projet en toute sérénité.${urgencyLine}${certLine}`,

    // 10 — Mise en avant locale
    `Les ${countSpace}${svcLower}s de ${ville.name} référencés sur ServicesArtisans sont prêts à intervenir dans votre commune et dans tout le ${ville.departement}. Profitez d'un annuaire fiable, basé sur les données SIREN du gouvernement, pour choisir le bon professionnel en ${ville.region}.${urgencyLine}${certLine}`,
  ]

  return templates[hash % templates.length]
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export interface LocationContent {
  introText: string
  pricingNote: string
  localTips: string[]
  quartierText: string
  conclusion: string
}

export function generateLocationContent(
  serviceSlug: string,
  serviceName: string,
  ville: Ville,
  providerCount: number = 0,
): LocationContent {
  return {
    introText: generateIntroText(serviceSlug, serviceName, ville, providerCount),
    pricingNote: generatePricingNote(serviceSlug, serviceName, ville),
    localTips: generateLocalTips(serviceSlug, serviceName, ville),
    quartierText: generateQuartierText(serviceName, ville),
    conclusion: generateConclusion(serviceSlug, serviceName, ville, providerCount),
  }
}

// ---------------------------------------------------------------------------
// Quartier page content — programmatic SEO with unique building profiles
// ---------------------------------------------------------------------------

type BuildingEra = 'pre-1950' | '1950-1980' | '1980-2000' | 'post-2000' | 'haussmannien' | 'mixte'
type UrbanDensity = 'dense' | 'residentiel' | 'periurbain'

export interface QuartierProfile {
  era: BuildingEra
  eraLabel: string
  density: UrbanDensity
  densityLabel: string
  commonIssues: string[]
  topServiceSlugs: string[]
  architecturalNote: string
}

export interface QuartierContent {
  profile: QuartierProfile
  intro: string
  batimentContext: string
  servicesDemandes: string
  conseils: string
  proximite: string
  faqItems: { question: string; answer: string }[]
}

const ERAS: { key: BuildingEra; label: string }[] = [
  { key: 'pre-1950', label: 'Bâti ancien (avant 1950)' },
  { key: '1950-1980', label: 'Construction d\'après-guerre (1950–1980)' },
  { key: '1980-2000', label: 'Construction moderne (1980–2000)' },
  { key: 'post-2000', label: 'Construction récente (après 2000)' },
  { key: 'haussmannien', label: 'Architecture haussmannienne' },
  { key: 'mixte', label: 'Bâti mixte (plusieurs époques)' },
]

const DENSITIES: { key: UrbanDensity; label: string }[] = [
  { key: 'dense', label: 'Zone urbaine dense' },
  { key: 'residentiel', label: 'Quartier résidentiel' },
  { key: 'periurbain', label: 'Zone périurbaine' },
]

const SERVICE_PRIORITY: Record<BuildingEra, string[]> = {
  'pre-1950': ['plombier', 'electricien', 'macon', 'couvreur', 'peintre-en-batiment', 'menuisier', 'chauffagiste', 'serrurier', 'carreleur', 'climaticien', 'vitrier', 'terrassier', 'paysagiste', 'facade', 'domoticien'],
  '1950-1980': ['electricien', 'chauffagiste', 'plombier', 'peintre-en-batiment', 'climaticien', 'menuisier', 'carreleur', 'macon', 'couvreur', 'serrurier', 'vitrier', 'facade', 'terrassier', 'paysagiste', 'domoticien'],
  '1980-2000': ['peintre-en-batiment', 'menuisier', 'chauffagiste', 'climaticien', 'plombier', 'electricien', 'carreleur', 'serrurier', 'couvreur', 'macon', 'vitrier', 'facade', 'terrassier', 'paysagiste', 'domoticien'],
  'post-2000': ['climaticien', 'domoticien', 'serrurier', 'plombier', 'electricien', 'peintre-en-batiment', 'menuisier', 'carreleur', 'chauffagiste', 'vitrier', 'couvreur', 'macon', 'facade', 'terrassier', 'paysagiste'],
  'haussmannien': ['peintre-en-batiment', 'plombier', 'electricien', 'menuisier', 'macon', 'serrurier', 'chauffagiste', 'carreleur', 'couvreur', 'vitrier', 'climaticien', 'facade', 'terrassier', 'paysagiste', 'domoticien'],
  'mixte': ['plombier', 'electricien', 'serrurier', 'chauffagiste', 'peintre-en-batiment', 'menuisier', 'climaticien', 'carreleur', 'couvreur', 'macon', 'vitrier', 'facade', 'terrassier', 'paysagiste', 'domoticien'],
}

const ERA_ISSUES: Record<BuildingEra, string[]> = {
  'pre-1950': [
    'Canalisations en plomb ou fonte à remplacer',
    'Installation électrique non conforme aux normes NF C 15-100',
    'Isolation thermique inexistante ou dégradée',
    'Charpente et toiture nécessitant un traitement ou une réfection',
    'Humidité et remontées capillaires dans les murs',
  ],
  '1950-1980': [
    'Présence potentielle d\'amiante (dalles, flocages, canalisations)',
    'Isolation thermique très insuffisante (pas de RT à l\'époque)',
    'Chauffage collectif vieillissant (fioul ou gaz)',
    'Fenêtres simple vitrage à remplacer',
    'Colonnes montantes eau et électricité à rénover',
  ],
  '1980-2000': [
    'Menuiseries PVC première génération à remplacer',
    'Chaudière gaz arrivant en fin de vie',
    'Isolation conforme RT 1982 mais insuffisante aujourd\'hui',
    'Revêtements et finitions à rafraîchir',
    'Salle de bain et cuisine à moderniser',
  ],
  'post-2000': [
    'Entretien préventif de la VMC double flux',
    'Installation de climatisation réversible',
    'Ajout de domotique et équipements connectés',
    'Personnalisation et optimisation de l\'espace intérieur',
    'Entretien courant des équipements modernes',
  ],
  'haussmannien': [
    'Restauration de moulures, corniches et rosaces',
    'Rénovation du parquet massif (point de Hongrie, Versailles)',
    'Mise aux normes électriques sans dénaturer le cachet',
    'Restauration de cheminées en marbre et boiseries',
    'Plomberie à moderniser dans un bâti classé ou protégé',
  ],
  'mixte': [
    'Diagnostic différencié selon l\'époque de chaque bâtiment',
    'Coordination des travaux sur bâti hétérogène',
    'Choix de matériaux compatibles avec l\'existant',
    'Rénovation progressive adaptée à chaque lot',
    'Harmonisation esthétique entre ancien et moderne',
  ],
}

const ERA_ARCH_NOTES: Record<BuildingEra, string[]> = {
  'pre-1950': [
    'Murs porteurs en pierre ou brique, planchers bois, absence fréquente de fondations profondes. Ce type de bâti requiert des artisans expérimentés en rénovation du patrimoine ancien.',
    'Construction traditionnelle avec matériaux locaux et hauteurs sous plafond généreuses. L\'absence d\'isolation d\'origine rend la rénovation énergétique prioritaire.',
    'Bâti d\'avant-guerre caractérisé par des murs épais, des escaliers en pierre et des réseaux (eau, gaz, électricité) souvent d\'origine.',
  ],
  '1950-1980': [
    'Immeubles en béton armé de la reconstruction, conçus pour loger rapidement. Les matériaux de l\'époque (amiante, peintures au plomb) nécessitent un diagnostic avant travaux.',
    'Logements fonctionnels avec isolation minimale et chauffage souvent collectif. La priorité est à la performance énergétique et au confort thermique.',
    'Construction standardisée des Trente Glorieuses, avec des surfaces correctes mais des finitions et équipements aujourd\'hui obsolètes.',
  ],
  '1980-2000': [
    'Construction conforme aux premières réglementations thermiques (RT 1982/1988). Double vitrage première génération et matériaux industriels (PVC, béton cellulaire).',
    'Bâti globalement sain mais nécessitant des mises à jour esthétiques et énergétiques pour atteindre les standards actuels de confort.',
    'Logements bien conçus pour l\'époque, avec des équipements (chaudière, menuiseries) arrivant en fin de cycle de vie après 25-40 ans.',
  ],
  'post-2000': [
    'Construction aux normes RT 2000/2005/2012, avec VMC, double vitrage performant et isolation conforme. Les travaux portent essentiellement sur la personnalisation.',
    'Bâti récent et bien isolé, équipements modernes. Les interventions concernent principalement l\'aménagement intérieur et la domotique.',
    'Logements livrés aux normes actuelles avec des garanties constructeur. Les besoins se concentrent sur l\'optimisation et la décoration.',
  ],
  'haussmannien': [
    'Pierre de taille, façades ornementées, balcons en fer forgé, hauteur sous plafond de 3 mètres ou plus. Chaque intervention doit respecter le patrimoine.',
    'Parquet massif point de Hongrie, moulures au plafond, cheminées en marbre, portes à double battant. Un patrimoine qui impose des artisans qualifiés en restauration.',
    'Cage d\'escalier monumentale, balcons filants et ornements en stuc. La rénovation requiert un savoir-faire artisanal respectueux du style d\'origine.',
  ],
  'mixte': [
    'Quartier mêlant constructions de différentes époques, du XIXᵉ siècle aux résidences récentes. Chaque bâtiment nécessite une approche de rénovation adaptée.',
    'Cohabitation d\'immeubles anciens et de résidences modernes. Les artisans du secteur doivent maîtriser des techniques variées.',
    'Tissu urbain évolutif mêlant patrimoine ancien et constructions neuves. La diversité architecturale impose des diagnostics au cas par cas.',
  ],
}

// 12 intro templates — each interpolates era/density/arch info for unique content
type IntroFn = (q: string, v: string, dep: string, code: string, pop: string, era: string, arch: string, density: string) => string
const QUARTIER_INTROS: IntroFn[] = [
  (q, v, dep, code, pop, era, arch, density) =>
    `Le quartier ${q} à ${v} (${code}) se caractérise par un ${era.toLowerCase()} en ${density.toLowerCase()}. ${arch} Avec ${pop} habitants, ${v} dans le ${dep} dispose d'artisans qualifiés pour ce type de bâti.`,
  (q, v, dep, code, pop, era, arch, density) =>
    `Vous habitez ${q} à ${v} ? Ce quartier en ${density.toLowerCase()} est composé de ${era.toLowerCase()}. ${arch} Notre annuaire référence les artisans du ${dep} (${code}) qualifiés pour intervenir sur ce patrimoine, au service des ${pop} habitants.`,
  (q, v, dep, code, pop, era, arch, density) =>
    `${q}, quartier de ${v} dans le ${dep} (${code}), présente un profil immobilier de type ${era.toLowerCase()}. ${arch} En ${density.toLowerCase()}, les besoins en artisanat sont spécifiques et nos professionnels référencés connaissent les particularités de ${v} (${pop} hab.).`,
  (q, v, dep, code, pop, era, arch, density) =>
    `Dans le quartier ${q} à ${v}, le parc immobilier relève du ${era.toLowerCase()}. ${arch} En ${density.toLowerCase()} dans le ${dep} (${code}), ce secteur de ${v} (${pop} hab.) bénéficie d'artisans formés aux techniques adaptées à cette construction.`,
  (q, v, dep, code, pop, era, arch, density) =>
    `Trouver un artisan compétent à ${q} (${v}) demande de connaître le bâti local. En ${density.toLowerCase()}, le quartier est composé de ${era.toLowerCase()}. ${arch} Les ${pop} habitants de ${v} (${dep}, ${code}) peuvent compter sur des professionnels adaptés.`,
  (q, v, dep, code, pop, era, arch, density) =>
    `Le secteur de ${q} à ${v} (${dep}, ${code}) offre un cadre de ${density.toLowerCase()} marqué par du ${era.toLowerCase()}. ${arch} Pour les ${pop} habitants, notre plateforme identifie les artisans dont l'expertise correspond aux caractéristiques du quartier.`,
  (q, v, dep, code, pop, era, arch, density) =>
    `À ${q}, dans la commune de ${v} (${code}), le bâti dominant est de type ${era.toLowerCase()} en contexte de ${density.toLowerCase()}. ${arch} Le ${dep} compte de nombreux artisans dont le savoir-faire correspond aux besoins des ${pop} habitants de ${v}.`,
  (q, v, dep, code, pop, era, arch, density) =>
    `Besoin de travaux à ${q} ? Ce secteur de ${v} (${dep}, ${code}) se distingue par son ${era.toLowerCase()} en ${density.toLowerCase()}. ${arch} Comparez les artisans qualifiés parmi les professionnels desservant les ${pop} habitants de la commune.`,
  (q, v, dep, code, pop, era, arch, density) =>
    `Le quartier ${q} de ${v} (${dep}, ${code}) est un secteur en ${density.toLowerCase()} où prédomine le ${era.toLowerCase()}. ${arch} Nous référençons des artisans maîtrisant les techniques adaptées aux constructions de ce quartier pour les ${pop} habitants.`,
  (q, v, dep, code, pop, era, arch, density) =>
    `Résider à ${q} dans ${v} (${code}), c'est vivre en ${density.toLowerCase()} dans du ${era.toLowerCase()}. ${arch} Le ${dep} regorge d'artisans compétents pour ce type d'habitat. ${v} et ses ${pop} habitants sont couverts par notre réseau de professionnels.`,
  (q, v, dep, code, pop, era, arch, density) =>
    `${q} est un quartier de ${v} dans le ${dep} (${code}), en ${density.toLowerCase()}. Le parc immobilier y est marqué par du ${era.toLowerCase()}. ${arch} Pour des travaux adaptés, les ${pop} habitants de la commune peuvent compter sur nos artisans référencés.`,
  (q, v, dep, code, pop, era, arch, density) =>
    `Votre projet concerne ${q} à ${v} ? Ce secteur en ${density.toLowerCase()} du ${dep} (${code}) est caractérisé par un parc de ${era.toLowerCase()}. ${arch} Parmi les professionnels intervenant auprès des ${pop} habitants, trouvez l'artisan adapté à votre chantier.`,
]

// Building context by era — 3 templates each
const BATIMENT_CONTEXTS: Record<BuildingEra, ((q: string, v: string) => string)[]> = {
  'pre-1950': [
    (q, v) => `Dans le quartier ${q}, le bâti ancien impose des contraintes spécifiques. Les canalisations d'origine (plomb, fonte) doivent souvent être remplacées pour des raisons sanitaires. L'installation électrique, conçue pour des usages limités, nécessite une mise aux normes complète. Les artisans de ${v} spécialisés en rénovation du patrimoine ancien maîtrisent ces interventions.`,
    (q, v) => `Le quartier ${q} à ${v} abrite un patrimoine d'avant 1950 qui demande une expertise particulière. Murs porteurs en pierre, planchers bois et charpentes anciennes requièrent des artisans formés aux techniques traditionnelles. La rénovation énergétique doit préserver le caractère architectural tout en améliorant le confort.`,
    (q, v) => `À ${q}, le parc immobilier ancien présente des défis que seuls des artisans expérimentés peuvent relever. Problèmes d'humidité, réseaux vétustes, isolation inexistante : chaque chantier à ${v} nécessite un diagnostic approfondi. Nos artisans référencés connaissent les pathologies du bâti ancien et proposent des solutions durables.`,
  ],
  '1950-1980': [
    (q, v) => `Le parc immobilier du quartier ${q} à ${v} date principalement de la période 1950-1980. Ces constructions des Trente Glorieuses présentent des caractéristiques communes : béton armé, isolation minimale, et potentielle présence d'amiante. Avant tout travaux, un diagnostic est recommandé. Les artisans qualifiés de ${v} connaissent ces problématiques.`,
    (q, v) => `À ${q}, les logements construits entre 1950 et 1980 arrivent à un âge où la rénovation devient incontournable. Remplacement du chauffage vieillissant, isolation par l'extérieur et changement des fenêtres simple vitrage sont les chantiers prioritaires. Les artisans de ${v} spécialisés en rénovation énergétique vous accompagnent avec des solutions éligibles aux aides de l'État.`,
    (q, v) => `Dans le quartier ${q} à ${v}, le bâti des années 1950-1980 nécessite une attention particulière. Les colonnes montantes approchent leur fin de vie, les matériaux d'époque peuvent contenir des substances interdites, et les performances thermiques sont en dessous des standards actuels. Une rénovation globale planifiée avec des artisans compétents permet de transformer ces logements.`,
  ],
  '1980-2000': [
    (q, v) => `Le quartier ${q} à ${v} comporte un parc construit entre 1980 et 2000, marqué par les premières réglementations thermiques. Ces logements, globalement sains, arrivent à un stade où les équipements d'origine (chaudière, menuiseries, revêtements) nécessitent un remplacement. C'est l'occasion d'opter pour des solutions plus performantes avec des artisans qualifiés.`,
    (q, v) => `À ${q}, les constructions des années 1980-2000 offrent un bon compromis entre confort et coût de rénovation. Les travaux courants : rafraîchissement des peintures, remplacement de la chaudière par une pompe à chaleur, modernisation de la cuisine ou salle de bain. Les artisans de ${v} interviennent régulièrement sur ce type de bâti.`,
    (q, v) => `Dans le quartier ${q}, les logements 1980-2000 à ${v} présentent un potentiel de valorisation intéressant. En remplaçant les menuiseries vieillissantes, en optimisant le chauffage et en modernisant les espaces intérieurs, vous améliorez significativement confort et valeur de votre bien. Nos artisans proposent des devis adaptés.`,
  ],
  'post-2000': [
    (q, v) => `Le quartier ${q} à ${v} bénéficie de constructions récentes, conformes aux normes RT 2000/2005/2012. Ces logements bien isolés nécessitent essentiellement des travaux de personnalisation : climatisation réversible, domotique, aménagement sur mesure. Les artisans de ${v} spécialisés en équipements modernes sont les mieux placés.`,
    (q, v) => `À ${q}, le bâti récent de ${v} offre un excellent confort de base. Les interventions les plus demandées : personnalisation de l'intérieur (dressing, verrière), équipements connectés (thermostat intelligent, volets automatisés), entretien courant. Nos artisans référencés interviennent avec le soin exigé par ces logements modernes.`,
    (q, v) => `Dans le quartier ${q} à ${v}, les résidences post-2000 sont conçues pour le confort moderne mais peuvent gagner en fonctionnalité. Borne de recharge, panneau solaire, pergola bioclimatique : les possibilités sont nombreuses. Consultez les artisans qualifiés de ${v} pour des devis personnalisés.`,
  ],
  'haussmannien': [
    (q, v) => `Le quartier ${q} à ${v} abrite un patrimoine haussmannien d'exception exigeant des artisans maîtrisant la restauration. Parquet en point de Hongrie, moulures, cheminées en marbre : chaque élément raconte l'histoire du bâtiment. La rénovation doit préserver ce cachet tout en intégrant le confort moderne. Seuls des artisans expérimentés à ${v} peuvent relever ce défi.`,
    (q, v) => `À ${q}, les immeubles haussmanniens de ${v} constituent un patrimoine prestigieux. Leur rénovation requiert un savoir-faire spécifique : restauration de gypseries, réfection de parquets massifs, mise aux normes sans dénaturer les volumes. Les artisans spécialisés connaissent les contraintes réglementaires (ABF, PLU) et les techniques respectueuses de ce style.`,
    (q, v) => `Dans le quartier ${q} de ${v}, le style haussmannien impose ses exigences. Hauteurs sous plafond de trois mètres, façades en pierre de taille, ferronneries d'art : chaque intervention doit sublimer le patrimoine existant. Nos artisans référencés allient expertise technique et sensibilité architecturale.`,
  ],
  'mixte': [
    (q, v) => `Le quartier ${q} à ${v} présente un tissu urbain varié, mêlant constructions de différentes époques. Cette diversité implique des besoins de rénovation tout aussi variés : mise aux normes du bâti ancien, rénovation énergétique d'après-guerre, modernisation des résidences 1980-2000. Les artisans polyvalents de ${v} sont habitués à adapter leurs techniques.`,
    (q, v) => `À ${q}, la cohabitation de bâtiments anciens et récents à ${v} crée un quartier dynamique où chaque projet est unique. Que votre logement date du XXᵉ siècle ou des années 2000, les artisans locaux savent adapter leur approche. Un diagnostic précis permettra de définir les travaux prioritaires.`,
    (q, v) => `Dans le quartier ${q} de ${v}, le bâti mixte reflète l'évolution urbaine de la commune. Chaque époque apporte ses spécificités et contraintes. Les artisans intervenant dans ce secteur maîtrisent aussi bien la rénovation du bâti ancien que les techniques modernes. Notre annuaire identifie les professionnels dont le savoir-faire couvre ces besoins.`,
  ],
}

// Tips by era — 2 templates each
const ERA_TIPS: Record<BuildingEra, ((q: string, v: string) => string)[]> = {
  'pre-1950': [
    (q, v) => `Pour votre logement ancien à ${q}, privilégiez un diagnostic complet avant d'engager des travaux. Vérifiez canalisations (plomb), installation électrique et charpente. À ${v}, les artisans spécialisés en bâti ancien vous conseillent sur les priorités et les aides disponibles (MaPrimeRénov', éco-PTZ). Demandez toujours plusieurs devis.`,
    (q, v) => `Dans un bâtiment ancien à ${q}, respectez l'ordre logique : gros œuvre (toiture, murs) d'abord, puis réseaux (électricité, plomberie, chauffage), enfin finitions (peinture, sols). À ${v}, les artisans expérimentés planifient pour éviter de reprendre des travaux déjà réalisés. Cette approche vous fait gagner du temps et de l'argent.`,
  ],
  '1950-1980': [
    (q, v) => `Avant tout chantier dans un logement 1950-1980 à ${q}, faites réaliser un diagnostic amiante et un DPE. Ces documents orienteront vos travaux prioritaires. À ${v}, les artisans certifiés savent manipuler les matériaux amiantés en sécurité. La rénovation énergétique ouvre droit à des aides substantielles.`,
    (q, v) => `Pour un logement d'après-guerre à ${q}, la priorité est la performance énergétique. Isolation par l'extérieur, remplacement des fenêtres et chauffage performant peuvent diviser par deux votre facture. Les artisans RGE de ${v} vous permettent de bénéficier des aides financières. Faites un audit énergétique pour définir le plan optimal.`,
  ],
  '1980-2000': [
    (q, v) => `Dans un logement 1980-2000 à ${q}, les travaux les plus rentables : remplacement de la chaudière (pompe à chaleur ou condensation) et changement des menuiseries vieillissantes. À ${v}, ces interventions améliorent sensiblement le confort tout en réduisant les charges. Profitez-en pour moderniser la ventilation (VMC hygroréglable).`,
    (q, v) => `Votre logement des années 1980-2000 à ${q} a besoin d'une mise au goût du jour. Cuisine, salle de bain, revêtements : ces espaces se rénovent efficacement avec des artisans compétents à ${v}. Astuce : coordonnez plomberie et électricité avec la rénovation des pièces d'eau pour optimiser le budget.`,
  ],
  'post-2000': [
    (q, v) => `Votre logement récent à ${q} est aux normes mais peut gagner en confort. Pensez à la climatisation réversible, la domotique pour optimiser votre consommation, ou un aménagement sur mesure (dressing, verrière). Les artisans de ${v} spécialisés en finitions haut de gamme sauront valoriser votre intérieur.`,
    (q, v) => `Dans un logement post-2000 à ${q}, les travaux sont liés à l'évolution de vos besoins : bureau, borne de recharge, agrandissement. À ${v}, les artisans intervenant sur le bâti récent connaissent les matériaux et techniques actuels. Vérifiez les garanties constructeur encore en cours avant certains travaux.`,
  ],
  'haussmannien': [
    (q, v) => `Pour rénover un appartement haussmannien à ${q}, choisissez des artisans expérimentés en restauration. Parquet ancien, moulures, cheminées exigent un savoir-faire spécifique. À ${v}, vérifiez si votre immeuble est en secteur protégé (ABF) : certains travaux de façade nécessitent une autorisation préalable.`,
    (q, v) => `Un haussmannien à ${q} offre des volumes exceptionnels. Les artisans de ${v} peuvent moderniser électricité et plomberie de manière invisible, installer une cuisine contemporaine dans le respect des proportions, et restaurer les éléments de décor (parquet, moulures, cheminées) qui font le charme de ces logements.`,
  ],
  'mixte': [
    (q, v) => `Dans un quartier au bâti mixte comme ${q}, commencez par identifier l'époque de construction pour cibler les travaux pertinents. Un artisan polyvalent de ${v} vous orientera vers les interventions prioritaires après un état des lieux. Les techniques varient considérablement entre bâtiment ancien et résidence récente.`,
    (q, v) => `À ${q}, la diversité du bâti implique de choisir des artisans adaptés à votre situation. Que vous habitiez un immeuble ancien ou une résidence moderne à ${v}, demandez un diagnostic précis avant d'engager des travaux. Les devis doivent être établis après visite sur site pour prendre en compte les particularités de votre construction.`,
  ],
}

// 15 FAQ templates — 4 selected per page via hash
const FAQ_POOL: { q: (n: string, v: string) => string; a: (n: string, v: string, dep: string, code: string, era: string, issues: string[]) => string }[] = [
  {
    q: (n, v) => `Quels artisans interviennent à ${n}, ${v} ?`,
    a: (n, v, dep, code) => `Notre annuaire référence des artisans dans 15 corps de métier intervenant dans le quartier ${n} à ${v} (${code}) : plombiers, électriciens, serruriers, chauffagistes, peintres, menuisiers, couvreurs, maçons et plus. Tous sont identifiés à partir des données SIREN du ${dep}.`,
  },
  {
    q: (n) => `Comment obtenir un devis gratuit à ${n} ?`,
    a: (n, v) => `Sélectionnez le service souhaité, indiquez ${v} comme localisation, et décrivez votre projet. Vous recevrez jusqu'à 3 propositions d'artisans qualifiés intervenant à ${n}. Service 100% gratuit et sans engagement.`,
  },
  {
    q: (_n, v) => `Combien coûte un artisan à ${v} ?`,
    a: (_n, v, _dep, code) => `Les tarifs varient selon le corps de métier, la complexité et l'urgence. À ${v} (${code}), comptez en moyenne 50–90 €/h selon la spécialité. Demandez plusieurs devis pour comparer les prix et prestations.`,
  },
  {
    q: (n) => `Quel est le délai d'intervention moyen à ${n} ?`,
    a: (n, v) => `Pour une urgence (fuite, panne, serrure bloquée), les artisans de ${v} interviennent sous 1 à 4 heures à ${n}. Pour des travaux planifiés, comptez 1 à 3 semaines selon la disponibilité et l'ampleur du chantier.`,
  },
  {
    q: (n, v) => `Les artisans à ${n}, ${v} sont-ils vérifiés ?`,
    a: (n, v, dep) => `Les artisans référencés à ${n} (${v}) sont identifiés via les données officielles du registre SIREN. Nous vérifions l'existence légale de l'entreprise, son activité dans le ${dep}, et sa spécialité déclarée. Les avis clients complètent cette vérification.`,
  },
  {
    q: (n) => `Quels sont les travaux les plus courants à ${n} ?`,
    a: (n, v, _dep, _code, era, issues) => `À ${n} (${v}), le bâti de type ${era.toLowerCase()} génère des besoins spécifiques : ${issues.slice(0, 3).join(', ').toLowerCase()}. Les artisans locaux connaissent ces problématiques et proposent des solutions adaptées.`,
  },
  {
    q: (n, v) => `Comment choisir le bon artisan à ${n}, ${v} ?`,
    a: (n, v, _dep, _code, era) => `Pour bien choisir un artisan à ${n}, vérifiez que sa spécialité correspond à votre besoin. Le bâti de ${v} étant de type ${era.toLowerCase()}, privilégiez un professionnel expérimenté sur cette construction. Comparez au moins 3 devis, vérifiez les assurances (décennale, RC pro), et consultez les avis.`,
  },
  {
    q: () => `Les devis sont-ils vraiment gratuits et sans engagement ?`,
    a: (_n, v) => `Oui, les devis demandés via notre plateforme sont entièrement gratuits et sans engagement. Vous pouvez recevoir jusqu'à 3 propositions d'artisans de ${v}, les comparer, et choisir librement. Aucun frais caché, aucune obligation.`,
  },
  {
    q: (n) => `Un artisan peut-il intervenir en urgence à ${n} ?`,
    a: (n, v) => `Oui, plusieurs artisans de ${v} proposent des interventions d'urgence à ${n} : fuite d'eau, panne électrique, porte claquée, panne de chauffage. Service disponible 7j/7. Les tarifs d'urgence incluent un supplément pour la disponibilité immédiate.`,
  },
  {
    q: (n) => `Quelles garanties pour les travaux à ${n} ?`,
    a: (n, v) => `Les artisans professionnels à ${v} sont couverts par l'assurance décennale et la RC professionnelle. Pour les travaux à ${n}, exigez une attestation d'assurance à jour. La garantie de parfait achèvement (1 an) et la garantie biennale (2 ans) complètent votre protection.`,
  },
  {
    q: (n, v) => `Faut-il un permis pour rénover à ${n}, ${v} ?`,
    a: (n, v, dep) => `Cela dépend de la nature des travaux. À ${n} (${v}), les travaux intérieurs ne nécessitent généralement pas d'autorisation. En revanche, modification de façade, extension ou changement de destination requiert une déclaration préalable auprès de la mairie. Consultez le PLU du ${dep}.`,
  },
  {
    q: (_n, v) => `Comment comparer efficacement les artisans à ${v} ?`,
    a: (_n, v) => `Demandez au minimum 3 devis détaillés pour le même périmètre de travaux à ${v}. Vérifiez que chaque devis précise : nature des travaux, matériaux, délais, prix HT et TTC, conditions de paiement. Consultez les avis clients et vérifiez les certifications (RGE, Qualibat).`,
  },
  {
    q: (_n, v) => `Quelles aides financières pour rénover à ${v} ?`,
    a: (_n, v, dep, code) => `Les habitants de ${v} (${code}) peuvent bénéficier de : MaPrimeRénov', éco-PTZ, CEE (Certificats d'Économies d'Énergie), et parfois des aides locales du ${dep}. Pour en bénéficier, les travaux doivent être réalisés par un artisan certifié RGE. Demandez un audit énergétique.`,
  },
  {
    q: (n) => `Le bâti à ${n} nécessite-t-il des artisans spécialisés ?`,
    a: (n, v, _dep, _code, era, issues) => `Le quartier ${n} à ${v} est composé de ${era.toLowerCase()}, ce qui implique des compétences spécifiques. Les problématiques courantes (${issues.slice(0, 2).join(', ').toLowerCase()}) demandent des artisans formés. Privilégiez des professionnels expérimentés sur des chantiers similaires.`,
  },
  {
    q: () => `Comment vérifier un artisan avant de l'engager ?`,
    a: (_n, v) => `Avant d'engager un artisan à ${v} : vérifiez son inscription au registre des métiers (SIRET actif), ses assurances (décennale, RC pro), sa certification RGE si nécessaire. Demandez des références de chantiers similaires. Méfiez-vous des devis anormalement bas.`,
  },
]

// 6 proximity templates — each references era for uniqueness
const PROXIMITY_TEMPLATES: ((q: string, v: string, era: string) => string)[] = [
  (q, v, era) => `Faire appel à un artisan proche de ${q} offre des avantages concrets : temps de déplacement réduit, connaissance du ${era.toLowerCase()}, réactivité en cas d'urgence, et suivi facilité. Un professionnel de ${v} connaît les réglementations locales et les fournisseurs du secteur.`,
  (q, v, era) => `Choisir un artisan intervenant à ${q} vous garantit un service adapté au ${era.toLowerCase()} du quartier. Moins de frais de déplacement, meilleure connaissance du bâti local, délais plus courts : la proximité est un critère de qualité. Les artisans de ${v} s'engagent sur des délais réalistes.`,
  (q, v) => `Un artisan basé à ${v} et intervenant à ${q} offre une réactivité précieuse. En cas d'urgence, il peut être sur place en moins d'une heure. Sa connaissance du quartier (accès, stationnement, bâtiments) lui permet d'intervenir efficacement. La proximité facilite aussi le suivi de chantier.`,
  (q, v, era) => `La proximité d'un artisan est un atout majeur à ${q}. Un professionnel de ${v} habitué au ${era.toLowerCase()} anticipe les difficultés et connaît les bonnes pratiques locales. Le bouche-à-oreille fonctionne : un artisan local qui fait du bon travail est recommandé par vos voisins.`,
  (q, v, era) => `Privilégier un artisan local pour vos travaux à ${q}, c'est aussi soutenir l'économie de proximité. Les professionnels de ${v} investissent dans la connaissance du ${era.toLowerCase()}, travaillent avec des fournisseurs locaux et s'engagent sur la qualité. Résultat : interventions soignées et tarifs compétitifs.`,
  (q, v) => `Les artisans de ${v} intervenant à ${q} combinent expertise technique et connaissance du terrain. Ils savent quels matériaux conviennent, connaissent les contraintes d'accès et peuvent mobiliser leur réseau local (autres corps de métier, fournisseurs). Cette proximité se traduit par des chantiers mieux coordonnés.`,
]

function getQuartierProfile(ville: Ville, quartierName: string): QuartierProfile {
  const seed = Math.abs(hashCode(`${ville.slug}-${quartierName}`))
  const seed2 = Math.abs(hashCode(`density-${ville.slug}-${quartierName}`))
  const seed3 = Math.abs(hashCode(`arch-${ville.slug}-${quartierName}`))

  const era = ERAS[seed % ERAS.length]
  const density = DENSITIES[seed2 % DENSITIES.length]
  const archNotes = ERA_ARCH_NOTES[era.key]
  const archNote = archNotes[seed3 % archNotes.length]
  const issues = ERA_ISSUES[era.key]
  const topSlugs = SERVICE_PRIORITY[era.key]

  return {
    era: era.key,
    eraLabel: era.label,
    density: density.key,
    densityLabel: density.label,
    commonIssues: issues,
    topServiceSlugs: topSlugs,
    architecturalNote: archNote,
  }
}

export function generateQuartierContent(ville: Ville, quartierName: string): QuartierContent {
  const seed = Math.abs(hashCode(`${ville.slug}-${quartierName}`))
  const profile = getQuartierProfile(ville, quartierName)

  // Intro — 12 templates × era/density/arch data = unique per profile
  const introFn = QUARTIER_INTROS[seed % QUARTIER_INTROS.length]
  const intro = introFn(quartierName, ville.name, ville.departement, ville.departementCode, ville.population, profile.eraLabel, profile.architecturalNote, profile.densityLabel)

  // Building context — by era
  const ctxTemplates = BATIMENT_CONTEXTS[profile.era]
  const batimentContext = ctxTemplates[Math.abs(hashCode(`ctx-${ville.slug}-${quartierName}`)) % ctxTemplates.length](quartierName, ville.name)

  // Services pricing — top 5 for this era
  const multiplier = getRegionalMultiplier(ville.region)
  const pricingLines = profile.topServiceSlugs.slice(0, 5).map(slug => {
    const t = getTradeContent(slug)
    if (!t) return null
    const min = Math.round(t.priceRange.min * multiplier)
    const max = Math.round(t.priceRange.max * multiplier)
    return `${t.name} : ${min}–${max} ${t.priceRange.unit}`
  }).filter(Boolean)

  const servicesDemandes = `Dans le quartier ${quartierName} à ${ville.name}, les services les plus sollicités pour le ${profile.eraLabel.toLowerCase()} sont : ${pricingLines.join(' · ')}. Ces tarifs indicatifs pour la région ${ville.region} varient selon la complexité, l'urgence et les matériaux. Comparez plusieurs devis.`

  // Tips — by era
  const tipTemplates = ERA_TIPS[profile.era]
  const conseils = tipTemplates[Math.abs(hashCode(`tips-${ville.slug}-${quartierName}`)) % tipTemplates.length](quartierName, ville.name)

  // Proximity
  const proxFn = PROXIMITY_TEMPLATES[Math.abs(hashCode(`prox-${ville.slug}-${quartierName}`)) % PROXIMITY_TEMPLATES.length]
  const proximite = proxFn(quartierName, ville.name, profile.eraLabel)

  // FAQ — select 4 from pool of 15 via hash
  const faqIndices: number[] = []
  let faqSeed = Math.abs(hashCode(`faq-${ville.slug}-${quartierName}`))
  while (faqIndices.length < 4) {
    const idx = faqSeed % FAQ_POOL.length
    if (!faqIndices.includes(idx)) faqIndices.push(idx)
    faqSeed = Math.abs(hashCode(`faq${faqSeed}-${faqIndices.length}`))
  }
  const faqItems = faqIndices.map(idx => {
    const f = FAQ_POOL[idx]
    return {
      question: f.q(quartierName, ville.name),
      answer: f.a(quartierName, ville.name, ville.departement, ville.departementCode, profile.eraLabel, profile.commonIssues),
    }
  })

  return { profile, intro, batimentContext, servicesDemandes, conseils, proximite, faqItems }
}
