/**
 * Deep Sections HowTo Overlays — Sprint G Ahrefs 2026-05-03.
 *
 * Mapping externe `section.id → HowTo steps` pour les sections décisionnelles
 * ("comment choisir", "comment vérifier", "comment dimensionner"). Externalisé
 * du registry `DEEP_SECTIONS` pour deux raisons :
 *
 *   1. Séparation des préoccupations : la donnée éditoriale (body[]) reste
 *      simple, le Schema enrichi vit dans un module dédié.
 *   2. Évolution indépendante : on peut ajouter des HowTo overlays sans
 *      modifier la shape des sections, et un test garantit que chaque overlay
 *      cible une section qui existe vraiment dans `DEEP_SECTIONS` ou
 *      `RGE_ONLY_DEEP_SECTIONS` (drift check).
 *
 * Schema émis : Schema.org HowTo. Bing + DDG + Yandex affichent encore les
 * rich snippets HowTo step-by-step. Google AI Overviews exploite la structure
 * step pour les réponses procédurales générées.
 *
 * Convention :
 *   - `name` : ≤ 80 chars, action verbale concise
 *   - `text` : 100-500 chars, instruction concrète et complète
 *   - 3 à 6 steps par overlay (plus = bruit, moins = pas un vrai HowTo)
 *
 * Le module est leaf (zéro import) — peut être importé partout sans cycle.
 */

export type HowToStep = {
  name: string
  text: string
}

export type HowToOverlay = {
  /** Titre HowTo (≤ 100 chars) — utilisé pour Schema.org HowTo.name. */
  name: string
  /** Description HowTo (≤ 200 chars) — Schema.org HowTo.description. */
  description: string
  /** ISO 8601 duration optionnelle (ex. "PT30M" = 30 min). */
  totalTime?: string
  /** Étapes ordonnées (3 à 6). */
  steps: ReadonlyArray<HowToStep>
}

const HOWTO_OVERLAYS: Record<string, HowToOverlay> = {
  'pompe-a-chaleur-air-eau-vs-air-air': {
    name: 'Comment choisir entre PAC air/eau et PAC air/air',
    description:
      'Comparez chauffage central vs splits, aides mobilisables et économies pour décider quelle PAC installer en remplacement.',
    totalTime: 'PT30M',
    steps: [
      {
        name: 'Identifier votre besoin de chauffage',
        text: "Vérifiez votre installation actuelle. Si vous avez déjà des radiateurs ou un plancher chauffant, la PAC air/eau remplace votre chaudière. Si vous chauffez déjà à l'électrique direct sans circuit central, la PAC air/air via splits muraux est plus simple. Notez aussi votre besoin d'eau chaude sanitaire (ECS) : seule la PAC air/eau la produit.",
      },
      {
        name: 'Comparer les aides 2026 cumulables',
        text: "PAC air/eau : MaPrimeRénov' jusqu'à 5 000 € + prime CEE BAR-TH-104 jusqu'à 4 000 € + Éco-PTZ + TVA 5,5 %. PAC air/air : seulement prime CEE BAR-TH-129 (80 à 200 €) et TVA 5,5 % sur la pose. Pas de MaPrimeRénov'. L'écart d'aides est massif (≈9 000 € en faveur de la PAC air/eau pour les revenus modestes).",
      },
      {
        name: 'Choisir selon ROI et confort cible',
        text: "PAC air/eau si remplacement chaudière + ECS + aides massives = ROI 7-12 ans. PAC air/air si vous voulez juste rafraîchir l'été et chauffer en mi-saison. Évitez de mixer les deux dans le même logement, le bilan énergétique devient incohérent. Demandez systématiquement un devis à un artisan RGE QualiPAC actif.",
      },
    ],
  },
  'choisir-isolant-thermique': {
    name: 'Comment choisir un isolant thermique adapté',
    description:
      "Comparez laines minérales, biosourcés et synthétiques selon performance, budget, écologie et zone d'application.",
    totalTime: 'PT45M',
    steps: [
      {
        name: 'Identifier la zone à isoler',
        text: 'Combles perdus = laine soufflée (verre ou roche), R ≥ 7 m².K/W exigé. Murs ITE = polystyrène expansé ou laine de roche. Sols et plafonds bas = polyuréthane PU pour faible épaisseur. Cloisons acoustiques = laine de roche (incombustible + phonique). La zone détermine 80 % du choix.',
      },
      {
        name: 'Comparer la performance R par épaisseur',
        text: 'Polyuréthane PU = R 3,7 en 9 cm (le plus performant). Laine minérale = R 3,7 en 16 cm (le plus économique). Fibre de bois = R 3,7 en 17 cm + déphasage 8-12 h (confort été). Calculez R pour votre épaisseur disponible avant tout choix : un isolant moins performant mais épais peut surpasser un bon isolant trop fin.',
      },
      {
        name: 'Vérifier la certification ACERMI obligatoire',
        text: "Pour bénéficier des aides MaPrimeRénov' et CEE, l'isolant doit être certifié ACERMI (Association pour la Certification des Matériaux Isolants). La fiche technique doit afficher le numéro ACERMI et le R certifié. Sans certification : aucune aide, et l'assurance peut refuser de couvrir un sinistre lié à la performance annoncée.",
      },
      {
        name: 'Arbitrer écologie vs budget',
        text: "Budget serré + performance pure = laines minérales (rapport perf/prix imbattable). Sensibilité écologique + confort été = biosourcés (ouate de cellulose, fibre de bois) — bonus MaPrimeRénov' biosourcé dans certaines régions. Faible épaisseur disponible = polyuréthane PU (synthétique, performant en finesse mais impact environnemental élevé).",
      },
    ],
  },
  'cet-air-ambiant-vs-air-exterieur': {
    name: 'Comment choisir entre CET sur air ambiant et air extérieur',
    description:
      'Évaluez votre local, votre zone climatique et votre budget pour décider quelle technologie de chauffe-eau thermodynamique installer.',
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Auditer votre local non chauffé',
        text: "Mesurez le volume du local pressenti (garage, sous-sol, cellier). Le CET sur air ambiant exige un volume ≥ 20 m³ bien ventilé. Si le local fait moins de 20 m³ ou s'il est intégré au volume chauffé (refroidirait la maison), passez directement au CET sur air extérieur.",
      },
      {
        name: 'Évaluer votre zone climatique',
        text: "En zone H1 (climat froid : Nord, Est, Massif Central), le CET air ambiant perd en performance car le local non chauffé descend bas en hiver. COP descend à 2,3 vs 3+ pour CET air extérieur. En zone H2 ou H3 (Ouest, Sud, Méditerranée), l'écart se réduit et le CET ambiant reste rentable.",
      },
      {
        name: 'Choisir selon ROI et installation',
        text: 'CET air ambiant = 2 500 à 3 500 € posé, simple, bon ROI en H2/H3. CET air extérieur (split ou monobloc avec gaines) = 3 500 à 5 500 € posé, COP supérieur 3 à 4, ROI 6-9 ans grâce aux aides + économies. Toujours installation par artisan RGE QualiPAC module CET pour ouvrir droit aux aides.',
      },
    ],
  },
  'vmc-simple-flux-vs-double-flux': {
    name: 'Comment choisir entre VMC simple flux et double flux',
    description:
      "Évaluez l'isolation de votre logement et votre projet pour décider quel type de VMC installer.",
    totalTime: 'PT25M',
    steps: [
      {
        name: "Évaluer le niveau d'isolation actuel",
        text: 'VMC double flux rentable uniquement si le logement est bien isolé (BBC, rénovation lourde avec murs + combles + fenêtres traités). Sinon, les pertes par les parois fuites annulent les gains de récupération de chaleur. VMC simple flux hygroréglable suffit pour respecter la réglementation de base.',
      },
      {
        name: 'Calculer le ROI sur la facture chauffage',
        text: "VMC double flux récupère 70 à 90 % des calories de l'air extrait, gain réel 15-20 % sur facture chauffage en logement bien isolé. Coût 4-8 k€ posée vs 800-1 500 € VMC simple flux. ROI 8-12 ans seulement si l'enveloppe est efficace, sinon non amorti.",
      },
      {
        name: 'Choisir selon le projet global',
        text: "Rénovation BBC ou maison passive = VMC double flux indispensable (artisan RGE Qualibat 4311 + aides MaPrimeRénov' jusqu'à 4 000 € + CEE BAR-TH-125 jusqu'à 1 500 €). Rénovation classique sans isolation lourde = VMC simple flux hygroréglable type B suffit. Étude dimensionnement NF DTU 68.3 obligatoire dans les 2 cas.",
      },
    ],
  },
  'fenetre-pvc-alu-bois': {
    name: 'Comment choisir entre fenêtre PVC, aluminium et bois',
    description:
      'Comparez performance thermique, prix, durée de vie et contraintes ABF pour choisir le matériau adapté à votre rénovation.',
    totalTime: 'PT30M',
    steps: [
      {
        name: 'Vérifier les contraintes urbanistiques',
        text: 'En zone ABF (Architecte des Bâtiments de France), monument historique ou secteur sauvegardé, le matériau peut être imposé : généralement bois ou aluminium teinté, jamais PVC blanc. Vérifiez en mairie avant tout choix. En zone libre, vous arbitrez librement entre les 3 matériaux.',
      },
      {
        name: 'Comparer la performance thermique Uw',
        text: "PVC = Uw 1,1 à 1,3 (excellent), bois = Uw 0,9 à 1,2 (le plus performant), aluminium avec rupture de pont thermique = Uw 1,3 à 1,5 (correct). Sans rupture de pont thermique, l'aluminium descend à Uw 2-3 (à proscrire). Pour les aides, Uw ≤ 1,3 obligatoire.",
      },
      {
        name: 'Évaluer durée de vie et entretien',
        text: 'Bois = 50+ ans avec entretien (lasure ou peinture tous les 5-10 ans). PVC = 25-30 ans, entretien quasi nul mais vieillit moins bien esthétiquement. Aluminium = 50+ ans sans entretien, profilés fins idéaux pour baies coulissantes XXL. Le coût total de possession sur 30 ans rapproche le bois du PVC malgré le surcoût initial.',
      },
      {
        name: 'Arbitrer prix vs esthétique',
        text: "PVC = 300-700 € HT par fenêtre (le plus accessible). Aluminium = 600-1 500 € HT (esthétique contemporaine, baies XXL). Bois = 800-1 800 € HT (haut de gamme + bonus MaPrimeRénov' biosourcé selon région). Demandez systématiquement un devis à un artisan RGE Qualibat 5111 ou 5112 pour ouvrir droit aux aides.",
      },
    ],
  },
  'borne-recharge-irve-niveau-p1-p2-p3': {
    name: 'Comment vérifier la qualification IRVE de votre installateur',
    description:
      "Identifiez le niveau IRVE adapté à votre projet et vérifiez la qualification réelle de l'artisan avant signature.",
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Identifier le niveau IRVE adapté',
        text: 'IRVE P1 = bornes ≤ 22 kW non communicantes en maison individuelle (95 % des cas résidentiels). IRVE P2 = bornes communicantes pilotables à distance en habitat collectif/tertiaire. IRVE P3 = stations de recharge rapide ≥ 50 kW DC (sites publics, autoroutes). Pour une wallbox 7,4 kW à la maison, P1 suffit.',
      },
      {
        name: 'Demander le numéro Qualifelec ou AFNOR',
        text: "Tout devis doit mentionner explicitement « IRVE P1 » (ou supérieur) avec le numéro Qualifelec ou AFNOR Certification + la date d'expiration. Sans cette mention vérifiable, refusez le devis : aucune aide ne sera versée et l'assurance habitation peut refuser de couvrir un sinistre.",
      },
      {
        name: 'Croiser sur les annuaires officiels',
        text: 'Vérifiez le numéro de qualification sur france-renov.gouv.fr ou directement annuaire-rge.ademe.fr. La validité doit être active au moment de la signature du devis (pas au moment des travaux). Si la qualification a expiré entre devis et travaux, les aides sautent — exigez une nouvelle attestation à jour avant le démarrage du chantier.',
      },
    ],
  },
} as const

/**
 * Returns the HowTo overlay for a section id, or null if no overlay defined.
 * Safe to call for any section id — never throws.
 */
export function getHowToOverlay(sectionId: string): HowToOverlay | null {
  return HOWTO_OVERLAYS[sectionId] ?? null
}

/**
 * List of section ids that have a HowTo overlay. Used for tests (drift check
 * vs DEEP_SECTIONS / RGE_ONLY_DEEP_SECTIONS).
 */
export function getHowToOverlaySectionIds(): readonly string[] {
  return Object.keys(HOWTO_OVERLAYS)
}
