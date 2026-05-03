/**
 * Trade Deep Sections — H2 SEO blocks targeting high-volume KW variants.
 *
 * Source : Ahrefs Phase 0 audit 2026-05-03 (`docs/audit-ahrefs-2026-05-03/E_site/
 * STRIKING_DISTANCE_PLAN.md`). Pour chaque trade pillar, on expose 2-4 blocs H2
 * dédiés à un variant à fort volume search non capturé par la FAQ collapsible :
 *
 *   - PAC : "pompe à chaleur air eau" (11K), "pompe à chaleur géothermique" (3.6K),
 *     "PAC hybride" (1.4K)
 *   - Isolation : "isolation par l'extérieur" (13K), "isolant thermique" (8.2K),
 *     "isolation des combles" (6.1K)
 *
 * Convention :
 *   - `id` : ancre HTML stable, format kebab-case
 *   - `h2` : titre H2 SEO-optimisé (≤ 70 chars), terme search exact
 *   - `body` : 2-4 paragraphes, 400-800 chars chacun, ton expert YMYL
 *
 * Le module est leaf (zéro import) — peut être importé partout sans cycle.
 */

export type TradeDeepSection = {
  id: string
  h2: string
  body: string[]
}

const DEEP_SECTIONS: Record<string, readonly TradeDeepSection[]> = {
  'pompe-a-chaleur': [
    {
      id: 'pompe-a-chaleur-air-eau',
      h2: 'Pompe à chaleur air/eau : fonctionnement, prix et aides',
      body: [
        "La pompe à chaleur air/eau capte les calories de l'air extérieur (même à -15 °C pour les modèles récents) et les restitue à l'eau du circuit de chauffage central. Elle alimente radiateurs, plancher chauffant et eau chaude sanitaire avec un coefficient de performance (COP) moyen de 3,5 à 4,5 — pour 1 kWh d'électricité consommé, elle produit 3,5 à 4,5 kWh de chaleur. C'est la solution n°1 pour remplacer une chaudière fioul ou gaz dans une maison individuelle bien isolée.",
        "Comptez 10 000 à 18 000 € pose comprise pour une PAC air/eau de 8 à 14 kW (maison 100-150 m²). Ce prix inclut l'unité extérieure (4 000 à 8 000 €), l'unité intérieure (2 000 à 4 000 €), la main-d'œuvre du chauffagiste QualiPAC (2 000 à 4 000 €) et les éléments hydrauliques (vase d'expansion, ballon tampon, vannes 3 voies).",
        "Aides 2026 mobilisables : MaPrimeRénov' jusqu'à 5 000 € (revenus très modestes), prime CEE BAR-TH-104 (2 500 à 4 000 €), Éco-PTZ (jusqu'à 50 000 €), TVA réduite à 5,5 %. Conditions strictes : installation par un artisan RGE QualiPAC actif au moment de la signature du devis, COP ≥ 3,4 et ETAS ≥ 126 % pour les aides publiques.",
      ],
    },
    {
      id: 'pompe-a-chaleur-air-eau-vs-air-air',
      h2: 'PAC air/eau ou PAC air/air : comment choisir',
      body: [
        "La PAC air/eau chauffe le circuit hydraulique (radiateurs ou plancher) et produit l'eau chaude sanitaire. Elle est éligible à toutes les aides (MaPrimeRénov', CEE, Éco-PTZ, TVA 5,5 %). Coût élevé (10 000 à 18 000 €) mais retour sur investissement de 7 à 12 ans grâce aux aides cumulées et aux économies de chauffage (40 à 70 % vs fioul/gaz).",
        "La PAC air/air souffle de l'air chaud ou froid via des splits muraux. C'est une climatisation réversible. Coût plus faible (3 000 à 8 000 € pour 2-3 splits) mais elle ne produit pas l'eau chaude sanitaire et n'ouvre droit qu'à la prime CEE BAR-TH-129 (montant modeste, 80 à 200 €). Pas éligible MaPrimeRénov'.",
        "Critère de décision : si vous remplacez une chaudière, prenez la PAC air/eau (chauffage central + ECS, aides massives). Si vous voulez juste rafraîchir l'été et chauffer en mi-saison, la PAC air/air suffit. Évitez de mixer les deux dans le même logement, le bilan énergétique devient incohérent.",
      ],
    },
    {
      id: 'pompe-a-chaleur-geothermique',
      h2: 'Pompe à chaleur géothermique : performance maximale',
      body: [
        "La PAC géothermique capte les calories du sol via un capteur enterré (horizontal sur 1,2 m de profondeur, ou vertical jusqu'à 100 m via forage). Le sol restant à température stable (10-12 °C toute l'année), le COP atteint 4 à 5 même en plein hiver — c'est la PAC la plus performante du marché.",
        'Coût total 15 000 à 25 000 € pose comprise. Le surcoût vs PAC air/eau (5 000 à 10 000 €) vient du forage géothermique (8 000 à 15 000 € selon profondeur et nature du sol). Le retour sur investissement reste compétitif sur 12-15 ans grâce aux économies (-50 à -70 % vs énergie fossile).',
        "Conditions : terrain disponible (capteur horizontal nécessite 1,5 à 2 fois la surface chauffée) ou autorisation forage en mairie (capteur vertical). Qualification RGE QualiPAC + Qualiforage obligatoire. Aides identiques à la PAC air/eau (MaPrimeRénov' jusqu'à 5 000 €, CEE BAR-TH-104, Éco-PTZ, TVA 5,5 %).",
      ],
    },
  ],
  'isolation-thermique': [
    {
      id: 'isolation-par-exterieur-ite',
      h2: "Isolation par l'extérieur (ITE) : la solution thermique radicale",
      body: [
        "L'isolation thermique par l'extérieur (ITE) consiste à envelopper le bâti d'un manteau isolant (10 à 20 cm) recouvert d'un enduit de finition ou d'un bardage. Elle supprime 100 % des ponts thermiques, préserve la surface habitable intérieure et inclut un ravalement de façade. Performance thermique gagnée : 60 à 80 % de réduction des déperditions par les murs.",
        "Comptez 100 à 200 €/m² de façade pose comprise. Pour une maison de 100 m² au sol avec 120 m² de façade exposée, le budget total est de 12 000 à 24 000 €. Ce coût inclut la pose de l'isolant (polystyrène expansé, laine de roche ou fibre de bois), les profilés d'angle, le treillis de renfort, l'enduit de finition et les fixations mécaniques.",
        "Aides 2026 cumulables : MaPrimeRénov' jusqu'à 75 €/m² (revenus très modestes), prime CEE BAR-EN-103 jusqu'à 25 €/m², Éco-PTZ (jusqu'à 50 000 €), TVA à 5,5 %. Conditions : artisan RGE Qualibat 7141 ou 7144 actif, résistance thermique R ≥ 3,7 m².K/W, isolant certifié ACERMI. L'ITE est obligatoirement déclarée en mairie (déclaration préalable de travaux) — délai 1 à 2 mois.",
      ],
    },
    {
      id: 'isolation-interieur-iti',
      h2: "Isolation par l'intérieur (ITI) : alternative économique",
      body: [
        "L'ITI est posée côté intérieur des murs périphériques sous forme de doublage (placo + isolant) ou contre-cloison maçonnée. Plus rapide à poser et 2 à 3 fois moins chère que l'ITE (30 à 70 €/m² vs 100 à 200 €/m²), elle réduit cependant la surface habitable de 3 à 5 % et ne traite pas les ponts thermiques en jonction des planchers.",
        "Préférée en rénovation lorsque la façade ne peut pas être modifiée (copropriété sans accord ABF, monument historique, façade en pierre apparente à conserver). Pour une maison de 100 m² avec 90 m² de murs périphériques traités, le budget est de 2 700 à 6 300 €. L'isolant courant est la laine de verre (R ≥ 3,7 m².K/W exigé pour les aides), parfois la ouate de cellulose ou la fibre de bois.",
        "Aides 2026 : MaPrimeRénov' jusqu'à 25 €/m² (revenus très modestes), prime CEE BAR-EN-102 jusqu'à 15 €/m², Éco-PTZ. Le gain énergétique est de 30 à 50 % sur les murs (vs 60 à 80 % pour l'ITE) — le retour sur investissement reste rapide grâce au coût de chantier faible (5 à 8 ans).",
      ],
    },
    {
      id: 'choisir-isolant-thermique',
      h2: 'Quel isolant thermique choisir : laine, ouate, polyuréthane',
      body: [
        "Trois familles d'isolants dominent le marché. Les laines minérales (laine de verre, laine de roche) offrent le meilleur rapport performance/prix : R ≥ 7 m².K/W pour 30 à 40 cm soufflés en combles, prix au m² imbattable, certification ACERMI standard. La laine de roche se distingue par sa résistance au feu (incombustible classe A1) et ses bonnes performances acoustiques.",
        "Les isolants biosourcés (ouate de cellulose, fibre de bois, chanvre) montent en puissance pour leur déphasage thermique élevé (8 à 12 h vs 4 à 6 h pour les laines minérales) — ils protègent du chaud en été. Coût supérieur de 20 à 40 % mais éligibles à un bonus MaPrimeRénov' biosourcé dans certaines régions (Bretagne, Nouvelle-Aquitaine).",
        'Les isolants synthétiques (polyuréthane PU, polystyrène expansé PSE et extrudé XPS) offrent la meilleure performance à épaisseur égale (R = 3,7 en 9 cm de PU vs 16 cm de laine). Privilégiés pour les sols, plafonds bas et façades à faible épaisseur disponible. Inconvénients : impact environnemental élevé, sensibilité au feu (sauf PU certifié), certification ACERMI obligatoire pour les aides.',
      ],
    },
  ],
} as const

/**
 * Returns the deep sections for a trade slug, or empty array if none defined.
 * Safe to call for any slug — never throws.
 */
export function getDeepSections(slug: string): readonly TradeDeepSection[] {
  return DEEP_SECTIONS[slug] ?? []
}

/**
 * List of trade slugs that have deep sections defined. Used for tests.
 */
export function getDeepSectionsTradeSlugs(): readonly string[] {
  return Object.keys(DEEP_SECTIONS)
}
