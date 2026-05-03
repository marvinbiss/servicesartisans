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
 *   - Photovoltaïque (Bloc 2) : "panneaux photovoltaiques" (8.1K), "panneaux solaires
 *     autoconsommation" (3.4K), "kit photovoltaique 3 kwc / 6 kwc" (cumul 5K)
 *
 * Bloc 2 garde uniquement panneaux-solaires : `chauffe-eau-thermodynamique` et
 * `audit-energetique` sont RGE-only (allowlist `RGE_ALLOWED_SERVICES`) et n'ont
 * pas de hub `/services/[slug]` — leurs deep sections vivent dans le registry
 * `RGE_ONLY_DEEP_SECTIONS` ci-dessous et sont wirées sur `/rge/[service]`
 * (Bloc 6 — 2026-05-03).
 *
 * Bloc 6 ajoute 4 services RGE-only : CET (BAR-TH-148, ~3K vol/mois),
 * audit-energetique (OPQIBI 1905, ~9K), ventilation (BAR-TH-125 VMC double flux,
 * ~6K), fenetres (BAR-EN-104, ~12K). Total ajouté ~30K vol/mois.
 *
 * Bloc 7 ajoute borne-recharge (Qualifelec IRVE P1/P2/P3, ~7K vol/mois cumulé :
 * "borne de recharge maison" 4K + "borne recharge voiture électrique" 2K + "prix
 * borne recharge" 1K). Quick win 5e RGE-only.
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
  'panneaux-solaires': [
    {
      id: 'panneaux-photovoltaiques-autoconsommation',
      h2: 'Panneaux photovoltaïques en autoconsommation : prix et rentabilité',
      body: [
        "L'autoconsommation photovoltaïque consiste à consommer directement l'électricité produite par vos panneaux solaires. Une installation de 3 kWc (10 panneaux, 18 m²) produit 3 200 à 4 200 kWh/an selon la région — couvre 30 à 50 % de la consommation moyenne d'un foyer (5 000 kWh/an). Le surplus non consommé est revendu à EDF Obligation d'Achat à un tarif garanti 20 ans (~10 c€/kWh révisé trimestriellement par la CRE).",
        "Comptez 7 000 à 10 000 € pose comprise pour 3 kWc, 12 000 à 16 000 € pour 6 kWc, 16 000 à 22 000 € pour 9 kWc (limite particulier). Le prix inclut les modules monocristallins 400-500 Wc, l'onduleur (string ou micro-onduleurs), la structure de fixation, le coffret AC/DC, le compteur Linky bidirectionnel et le raccordement Enedis (1 200 à 1 800 € selon configuration).",
        "Aides 2026 : prime à l'autoconsommation Enedis versée sur 5 ans (1 140 € pour 3 kWc, 1 950 € pour 6 kWc, 2 700 € pour 9 kWc), TVA réduite à 10 % jusqu'à 9 kWc et 5,5 % depuis le 1er octobre 2025 sur les installations résidentielles, exonération d'impôt sur la revente du surplus jusqu'à 3 kWc. Conditions : artisan RGE QualiPV ou QualiSol obligatoire, attestation Consuel pré-raccordement, déclaration préalable en mairie.",
      ],
    },
    {
      id: 'photovoltaique-3kwc-6kwc-9kwc',
      h2: 'Quelle puissance de panneaux solaires : 3, 6 ou 9 kWc',
      body: [
        'Le dimensionnement dépend de votre consommation annuelle. Une installation 3 kWc (8-10 panneaux, 18 m² de toiture) convient à un couple ou une famille avec faible consommation (< 4 500 kWh/an, sans clim ni PAC). Production 3 200-4 200 kWh/an, autoconsommation 30-40 %, retour sur investissement 9-13 ans. Choix le plus prudent et le plus rentable au m² installé.',
        "Une installation 6 kWc (16-18 panneaux, 32 m² de toiture) cible une famille avec consommation moyenne (5 000-7 000 kWh/an) ou avec une PAC air/eau. Production 6 500-8 500 kWh/an, autoconsommation 35-45 % avec pilotage des usages (lave-vaisselle, ballon ECS programmés en heures solaires). ROI 8-11 ans grâce au bonus prime à l'autoconsommation.",
        '9 kWc (24-30 panneaux, 50 m²) est le maximum sans changer de régime fiscal/contractuel. Cible : grande maison + PAC + véhicule électrique + piscine. Production 9 500-12 500 kWh/an. Au-delà de 9 kWc, vous basculez en régime professionnel (TVA 20 %, prime supprimée, contrat tarif F en injection totale) — rarement rentable pour un particulier sans réelle consommation industrielle.',
      ],
    },
  ],
  'borne-recharge': [
    {
      id: 'borne-recharge-maison-prix-puissance',
      h2: 'Borne de recharge à la maison : prix, puissance et installation',
      body: [
        "L'installation d'une borne de recharge (wallbox) à domicile est devenue le standard pour propriétaires de véhicule électrique : recharge complète en 4 à 8 heures vs 24 à 30 heures sur prise domestique standard, et division par 2 de l'usure de la batterie grâce au courant continu maîtrisé. Trois puissances dominent : 3,7 kW (monophasé, recharge lente nocturne), 7,4 kW (monophasé renforcé, le plus vendu en maison individuelle) et 11/22 kW (triphasé, nécessite abonnement Enedis triphasé).",
        "Comptez 1 200 à 2 500 € TTC pose comprise pour une wallbox 7,4 kW dans une maison individuelle. Le prix inclut la borne (600 à 1 200 € selon marque et fonctions : Schneider EVlink, Hager Witty, Wallbox Pulsar Plus, Legrand Green'Up Premium), la pose par un électricien IRVE (300 à 600 €), le câble dédié 6 mm² entre tableau et borne, le disjoncteur différentiel type A/F 30 mA et le délesteur si abonnement < 9 kVA.",
        "Aides 2026 cumulables : crédit d'impôt installation borne 75 % du montant TTC plafonné à 500 € par borne (300 € pour bornes pilotables uniquement), prime ADVENIR 600 € en copropriété, TVA réduite à 5,5 % pour la pose et 20 % pour le matériel. Conditions strictes : artisan IRVE Qualifelec P1 (mention spécifique recharge véhicule électrique) actif au moment de la signature du devis. Sans IRVE : aucune aide, garantie constructeur souvent annulée.",
      ],
    },
    {
      id: 'borne-recharge-irve-niveau-p1-p2-p3',
      h2: 'Qualification IRVE niveau 1, 2 ou 3 : laquelle vous concerne',
      body: [
        "L'arrêté du 12 janvier 2017 impose qu'à partir de toute borne de recharge dépassant 3,7 kW, l'installation soit confiée à un électricien titulaire de la mention IRVE (Infrastructures de Recharge pour Véhicules Électriques). Trois niveaux structurent la qualification, délivrée par Qualifelec ou AFNOR Certification après formation de 21 heures et examen pratique.",
        "IRVE P1 (basique) couvre les bornes ≤ 22 kW non communicantes en maison individuelle ou petit professionnel. C'est le niveau requis pour 95 % des installations résidentielles. IRVE P2 (avancé) ajoute les bornes communicantes pilotables à distance (supervision, modulation de charge, badge RFID) en habitat collectif et tertiaire. IRVE P3 (expert) traite les stations de recharge rapide ≥ 50 kW en courant continu (sites publics, autoroutes) — formation de 35 heures + module DC obligatoire.",
        "Pour vérifier la qualification d'un installateur, demandez son numéro Qualifelec ou AFNOR et croisez sur le site france-renov.gouv.fr ou directement annuaire-rge.ademe.fr. Tout devis doit mentionner explicitement « IRVE P1 » (ou supérieur) avec le numéro et la date d'expiration. Sans cette mention vérifiable, refuser le devis : aucune aide ne sera versée et l'assurance habitation peut refuser de couvrir un sinistre lié à une installation non conforme NF C 15-100 amendement A5.",
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
 * RGE-only deep sections — métiers énergie qui n'ont PAS de hub `/services/[slug]`
 * (absents de `CANONICAL_SERVICE_SLUGS_SET`). Wirés uniquement sur `/rge/[service]`.
 *
 * Cf. `RGE_ALLOWED_SERVICES` dans `src/lib/rge/service-city-listings.ts` pour
 * la liste complète des services RGE-only.
 */
const RGE_ONLY_DEEP_SECTIONS: Record<string, readonly TradeDeepSection[]> = {
  'chauffe-eau-thermodynamique': [
    {
      id: 'cet-prix-cop-aides',
      h2: 'Chauffe-eau thermodynamique : prix, COP et aides 2026',
      body: [
        "Le chauffe-eau thermodynamique (CET) capte les calories de l'air ambiant ou de l'air extérieur via une mini pompe à chaleur intégrée pour produire l'eau chaude sanitaire. Il consomme 3 à 4 fois moins d'électricité qu'un cumulus électrique classique : COP moyen 2,5 à 3,5 selon la technologie et la zone climatique. Pour un foyer de 4 personnes, l'économie annuelle vs cumulus standard est de 200 à 350 € sur la facture EDF.",
        "Comptez 2 500 à 4 500 € pose comprise pour un CET 200 à 270 litres (foyer 3-5 personnes). Le prix inclut le ballon (1 500 à 2 800 €), la pompe à chaleur intégrée, le raccordement hydraulique et électrique, et la dépose du cumulus existant. Les modèles split (unité PAC séparée du ballon) coûtent 3 500 à 5 500 € mais offrent un COP supérieur (3,5 à 4) car ils captent l'air extérieur.",
        "Aides 2026 cumulables sur le CET : MaPrimeRénov' jusqu'à 1 200 € (revenus très modestes), prime CEE BAR-TH-148 jusqu'à 250 à 600 € selon délégataire, TVA réduite à 5,5 %, Éco-PTZ. Conditions strictes : artisan RGE QualiPAC module CET actif, COP ≥ 2,5 mesuré selon norme EN 16147, ballon ≥ 150 litres pour MaPrimeRénov'. Le CET est éligible MaPrimeRénov' Sérénité dans un bouquet rénovation globale.",
      ],
    },
    {
      id: 'cet-air-ambiant-vs-air-exterieur',
      h2: 'CET sur air ambiant ou air extérieur : comment choisir',
      body: [
        "Le CET sur air ambiant capte la chaleur d'une pièce non chauffée et bien ventilée (volume ≥ 20 m³ exigé) — typiquement garage, cellier, buanderie. Installation simple, prix bas (2 500 à 3 500 €), COP modéré 2,3 à 2,8 car la pièce se refroidit en hiver. Inadapté si le local fait moins de 20 m³ ou s'il est intégré au volume chauffé (refroidirait la maison).",
        "Le CET sur air extérieur (split ou monobloc avec gaines) capte la chaleur de l'air extérieur via une unité dédiée ou des gaines isolées traversant le mur. COP supérieur 3 à 4 stable toute l'année car l'air extérieur reste plus chaud que la pièce non chauffée en hiver. Coût plus élevé (3 500 à 5 500 €) mais ROI 6-9 ans grâce aux aides + économies réelles.",
        "Critère de décision : si vous disposez d'un local non chauffé ≥ 20 m³ bien ventilé (garage, sous-sol), le CET air ambiant suffit (le moins cher). Si vous habitez en région froide (zone climatique H1), si le local est trop petit ou si vous voulez la performance maximale, optez pour le CET sur air extérieur (split avec unité PAC dehors).",
      ],
    },
  ],
  'audit-energetique': [
    {
      id: 'audit-energetique-obligation-vente-dpe',
      h2: 'Audit énergétique réglementaire : obligation vente DPE F, G, E',
      body: [
        "L'audit énergétique réglementaire est obligatoire à la vente d'un logement dont le DPE est classé F ou G depuis le 1er avril 2023, et étendu aux DPE classés E depuis le 1er janvier 2025. À compter du 1er janvier 2034, l'obligation s'élargira aux logements classés D. Sans audit annexé au compromis, l'acquéreur peut demander la nullité de la vente ou une diminution du prix devant le juge.",
        "L'audit doit être réalisé par un auditeur RGE qualifié OPQIBI 1905 (BET thermique) ou Qualibat 8731 (étude énergétique enveloppe + équipements), ou par un architecte inscrit au CNOA habilité audit. Il dresse l'état énergétique du logement et propose 2 scénarios chiffrés de travaux pour atteindre la classe B (passoire vers performant) en passant par la classe E ou D — mention des coûts, des aides mobilisables et du gain DPE.",
        "Validité de l'audit : 5 ans. Il est valable pour toute mutation pendant cette durée, ce qui le rend également utile pour bénéficier de MaPrimeRénov' Parcours Accompagné (rénovation d'ampleur) qui exige un audit en amont du projet. Délai de réalisation : 3 à 6 semaines (visite sur site + rédaction). Il est annexé au DPE et remis au notaire.",
      ],
    },
    {
      id: 'audit-energetique-prix-aides-2026',
      h2: 'Audit énergétique : prix et aides MaPrimeRénov en 2026',
      body: [
        "Comptez 800 à 1 800 € pour un audit énergétique réglementaire en maison individuelle (selon la surface et la complexité). Pour un appartement, le tarif est de 500 à 1 200 €. Les copropriétés relèvent d'un dispositif distinct (audit énergétique global de copropriété, AEG) facturé 4 000 à 12 000 € selon la taille de l'immeuble et financé via MaPrimeRénov' Copropriétés.",
        "Aides 2026 sur l'audit énergétique individuel : MaPrimeRénov' Audit jusqu'à 500 € pour les revenus très modestes, 400 € pour les modestes, 300 € pour les intermédiaires, 0 € pour les revenus supérieurs. Cumulable avec la prime CEE Audit (montant variable, 100 à 250 € selon délégataire). L'audit est aussi pris en charge à 100 % dans le cadre d'une demande de MaPrimeRénov' Parcours Accompagné.",
        "Distinction importante : l'audit énergétique réglementaire (vente DPE F/G/E) est différent du DPE lui-même. Le DPE coûte 100 à 250 € et reste obligatoire à la vente et à la location de tout logement (validité 10 ans). L'audit énergétique va plus loin : il propose des scénarios de travaux chiffrés. Les deux sont annexés au compromis si le logement est en F, G ou E.",
      ],
    },
  ],
  ventilation: [
    {
      id: 'vmc-double-flux-bar-th-125',
      h2: 'VMC double flux : performance et aide CEE BAR-TH-125',
      body: [
        "La VMC double flux récupère 70 à 90 % des calories de l'air extrait pour préchauffer l'air neuf entrant via un échangeur thermique. Elle réduit les déperditions par renouvellement d'air de 15 à 20 % sur la facture de chauffage d'un logement bien isolé. Indispensable en rénovation BBC ou maison passive, où la ventilation représente jusqu'à 25 % des pertes thermiques résiduelles.",
        "Comptez 4 000 à 8 000 € pose comprise pour une VMC double flux dans une maison individuelle de 100-150 m². Le prix inclut le caisson échangeur (1 500 à 3 500 €), le réseau de gaines isolées en faux plafond ou comble, les bouches d'extraction et d'insufflation dans chaque pièce, le filtre F7/G4 et la mise en service avec mesures de débit. Les modèles haut rendement (≥ 85 %) sont éligibles aux aides.",
        "Aides 2026 cumulables : MaPrimeRénov' jusqu'à 4 000 € (revenus très modestes), prime CEE BAR-TH-125 jusqu'à 800 à 1 500 € selon délégataire et zone climatique, Éco-PTZ jusqu'à 50 000 €, TVA à 5,5 %. Conditions : artisan RGE Qualibat 4311 (réseaux aérauliques) ou QualiPAC ventilation, rendement de l'échangeur ≥ 85 %, étude de dimensionnement préalable obligatoire (NF DTU 68.3).",
      ],
    },
    {
      id: 'vmc-simple-flux-vs-double-flux',
      h2: 'VMC simple flux hygroréglable vs double flux : choisir',
      body: [
        "La VMC simple flux extrait l'air vicié des pièces humides (cuisine, WC, salle de bain) sans préchauffer l'air entrant. Hygroréglable de type B, elle module les débits selon l'humidité ambiante : 200 à 600 € l'équipement seul, 800 à 1 500 € pose comprise. Solution la plus économique pour respecter la réglementation ventilation des logements (arrêté du 24 mars 1982 modifié).",
        "La VMC double flux préchauffe l'air entrant via les calories de l'air extrait — gain énergétique réel de 15 à 20 % sur la facture chauffage. Coût 4 à 6 fois supérieur (4 000 à 8 000 € posés). Rentabilité conditionnée à un logement bien isolé (BBC ou rénovation lourde) : si l'enveloppe fuit, l'investissement double flux ne sera jamais amorti par les économies générées.",
        "Critère de décision : VMC simple flux hygroréglable si vous voulez juste respecter la réglementation et gérer l'humidité (rénovation classique sans isolation lourde). VMC double flux si vous engagez une rénovation BBC/passive (isolation murs + combles + fenêtres triple vitrage) — c'est seulement dans ce cas que l'investissement est amorti en 8 à 12 ans grâce aux économies de chauffage.",
      ],
    },
  ],
  fenetres: [
    {
      id: 'remplacement-fenetres-uw-vitrage',
      h2: 'Remplacement de fenêtres : Uw, vitrage et matériau',
      body: [
        "La performance thermique d'une fenêtre est mesurée par le coefficient Uw (W/m².K) — plus il est faible, mieux la fenêtre isole. Les fenêtres standard d'avant 2000 affichent Uw 3 à 5, alors que les modèles 2026 atteignent Uw 0,8 à 1,3 grâce au double vitrage à isolation renforcée (4/16/4 argon, lame d'argon 16 mm) ou au triple vitrage (Uw 0,7 à 1,0). Pour bénéficier des aides MaPrimeRénov' et CEE, le seuil exigé est Uw ≤ 1,3.",
        "Comptez 500 à 1 200 € par fenêtre standard (1,5 m²) pose comprise selon le matériau, le type de vitrage et la difficulté de pose (rénovation sur dormant existant ou dépose totale + nouveau dormant). Pour 10 fenêtres remplacées dans une maison de 100 m², le budget total est de 5 000 à 12 000 €. Privilégier la dépose totale en rénovation lourde — la pose sur dormant ancien réduit l'efficacité thermique de 15 à 25 %.",
        "Aides 2026 cumulables sur le remplacement de fenêtres : MaPrimeRénov' jusqu'à 100 € par fenêtre (revenus très modestes), prime CEE BAR-EN-104 jusqu'à 80 à 120 € par fenêtre selon délégataire et zone climatique, Éco-PTZ jusqu'à 30 000 € pour un bouquet incluant fenêtres, TVA à 5,5 %. Conditions : artisan RGE Qualibat menuiserie (5111 ou 5112), Uw ≤ 1,3 et facteur solaire Sw ≥ 0,30, dépose totale en cas de remplacement non simple.",
      ],
    },
    {
      id: 'fenetre-pvc-alu-bois',
      h2: 'Fenêtre PVC, aluminium ou bois : prix et performance',
      body: [
        'Le PVC est le matériau le plus vendu en rénovation (60 % du marché) : performance thermique excellente (Uw 1,1 à 1,3 standard), prix accessible (300 à 700 € HT par fenêtre 1,5 m²), entretien quasi nul. Inconvénients : palette de couleurs limitée (blanc dominant), aspect industriel parfois mal perçu en bâti ancien, durée de vie 25-30 ans (vs 50+ pour le bois).',
        "L'aluminium offre les profilés les plus fins (clarté maximale, baies coulissantes XXL) et une grande variété de teintes (RAL au choix). Coût supérieur 600 à 1 500 € HT par fenêtre. Performance thermique correcte uniquement avec rupture de pont thermique (Uw 1,3 à 1,5). Idéal pour architecture contemporaine, baies coulissantes ≥ 2,5 m, immeubles. Évitez en zone froide H1 sans rupture de pont thermique premium.",
        "Le bois est le plus performant thermiquement (Uw 0,9 à 1,2 standard), le plus durable (50+ ans avec entretien) et le plus écologique (matériau biosourcé renouvelable). Coût élevé 800 à 1 800 € HT par fenêtre, entretien tous les 5-10 ans (lasure ou peinture). Souvent obligatoire en zone ABF (Architecte des Bâtiments de France) pour respect du patrimoine. Bonus MaPrimeRénov' biosourcé dans certaines régions.",
      ],
    },
  ],
} as const

/**
 * Returns the deep sections for a trade slug, or empty array if none defined.
 * Looks up both canonical (`/services/[slug]`) and RGE-only (`/rge/[service]`)
 * registries — wired-in callers don't need to know which bucket they hit.
 * Safe to call for any slug — never throws.
 */
export function getDeepSections(slug: string): readonly TradeDeepSection[] {
  return DEEP_SECTIONS[slug] ?? RGE_ONLY_DEEP_SECTIONS[slug] ?? []
}

/**
 * List of canonical trade slugs (intersection avec `CANONICAL_SERVICE_SLUGS_SET`).
 * Utilisé par le test drift SSoT — ne contient PAS les RGE-only slugs.
 */
export function getDeepSectionsTradeSlugs(): readonly string[] {
  return Object.keys(DEEP_SECTIONS)
}

/**
 * List of RGE-only trade slugs (sous-ensemble de `RGE_ALLOWED_SERVICES`).
 * Utilisé par le test drift RGE — ne contient PAS les canonical slugs.
 */
export function getRgeOnlyDeepSectionsSlugs(): readonly string[] {
  return Object.keys(RGE_ONLY_DEEP_SECTIONS)
}
