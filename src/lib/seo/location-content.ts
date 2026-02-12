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
      "En appartement, l'optimisation de l'espace est primordiale. Un cuisiniste expérimenté peut concevoir une cuisine fonctionnelle même dans moins de 6 m\u00B2 grâce au mobilier sur mesure.",
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
      "Pour un résultat professionnel, demandez toujours un devis après visite sur site. Le prix au m\u00B2 varie selon l'état des lieux et le type de nettoyage requis.",
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
// Intro text templates — varied by hash to avoid repetition
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

  const templates = [
    `Vous recherchez un ${svcLower} qualifié à ${ville.name} ? Située dans le département ${dep} en région ${region}, ${ville.name} compte ${pop} habitants et bénéficie d'un réseau dense de professionnels du bâtiment. ServicesArtisans référence ${providerCount > 0 ? providerCount : 'les'} ${svcLower}s intervenant à ${ville.name} et dans ses environs, tous identifiés par leur numéro SIREN via l'API officielle du gouvernement. ${ville.description}`,

    `À ${ville.name} (${ville.codePostal}), commune de ${pop} habitants du département ${dep}, trouver un ${svcLower} de confiance est essentiel pour vos travaux. Notre annuaire recense ${providerCount > 0 ? providerCount : 'les'} professionnels référencés dans votre secteur géographique, en région ${region}. Chaque ${svcLower} listé sur ServicesArtisans est identifié par son numéro SIREN, garantissant une activité déclarée et vérifiable. ${ville.description}`,

    `${ville.name}, ville de ${pop} habitants dans le ${dep} (${region}), dispose de nombreux artisans qualifiés pour répondre à vos besoins en ${svcLower === serviceName.toLowerCase() ? svcLower : svcLower}. ServicesArtisans vous permet de comparer ${providerCount > 0 ? providerCount : 'les'} ${svcLower}s référencés à ${ville.name} (${ville.codePostal}), de consulter leurs coordonnées et de les contacter directement pour un devis gratuit. ${ville.description}`,

    `Besoin d'un ${svcLower} à ${ville.name} ? Notre annuaire couvre l'ensemble du département ${dep} en ${region} et référence ${providerCount > 0 ? providerCount : 'les'} professionnels qualifiés dans votre commune de ${pop} habitants. Tous les artisans listés sont identifiés via l'API Sirene du gouvernement, un gage de transparence pour les habitants de ${ville.name} (${ville.codePostal}). ${ville.description}`,

    `Les habitants de ${ville.name} (${pop} habitants, ${dep}, ${region}) peuvent compter sur ServicesArtisans pour trouver un ${svcLower} référencé et qualifié. Notre plateforme recense ${providerCount > 0 ? providerCount : 'les'} professionnels exerçant à ${ville.name} et dans les communes voisines du ${ville.departementCode}. Chaque profil est vérifié via le registre SIREN, vous assurant de contacter des artisans en règle. ${ville.description}`,
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
// Conclusion / CTA
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

  const urgencyLine = trade?.emergencyInfo
    ? ` En cas d'urgence, certains ${svcLower}s de ${ville.name} proposent une intervention rapide : ${trade.averageResponseTime.toLowerCase()}.`
    : ''

  const certLine =
    trade && trade.certifications.length > 0
      ? ` Parmi les qualifications à rechercher : ${trade.certifications.slice(0, 2).join(', ')}.`
      : ''

  const templates = [
    `Ne perdez plus de temps à chercher un ${svcLower} fiable à ${ville.name}. Consultez les ${providerCount > 0 ? providerCount : ''} profils référencés sur ServicesArtisans, comparez les coordonnées et contactez directement le professionnel de votre choix dans le ${ville.departement} (${ville.departementCode}).${urgencyLine}${certLine}`,

    `ServicesArtisans simplifie votre recherche de ${svcLower} à ${ville.name} (${ville.codePostal}). Parcourez notre annuaire de ${providerCount > 0 ? providerCount + ' ' : ''}professionnels référencés en ${ville.region}, consultez leurs informations et demandez vos devis gratuitement.${urgencyLine}${certLine}`,

    `Trouvez le ${svcLower} qu'il vous faut à ${ville.name} en quelques clics. Notre annuaire de ${providerCount > 0 ? providerCount + ' ' : ''}professionnels du ${ville.departement} vous permet de comparer et de contacter les artisans référencés par SIREN dans votre secteur.${urgencyLine}${certLine}`,
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
