/**
 * Batch 3 : Images additionnelles par service (5-7 par metier)
 * Source : Unsplash (licence gratuite, usage commercial autorise)
 *
 * 15 metiers couverts — IDs uniques, zero doublon avec images.ts / batch1 / batch2
 */

// Batch 3: Additional service images (5-7 per trade)
export const serviceImagePool_batch3: Record<string, { src: string; alt: string }[]> = {
  desinsectisation: [
    {
      src: 'photo-35J2ODtMdPU',
      alt: 'Technicien antiparasitaire pulverisant un insecticide dans un bureau',
    },
    { src: 'photo-2clbyjF7FCg', alt: 'Professionnel de la desinsectisation traitant un interieur' },
    {
      src: 'photo-MPI00FHFKH4',
      alt: 'Exterminateur en tenue de protection pulverisant du pesticide',
    },
    {
      src: 'photo-r_9acX8AORw',
      alt: 'Agent de desinfection en combinaison de protection appliquant un traitement',
    },
    {
      src: 'photo-HTOx8Q93R_A',
      alt: 'Equipe de desinsectisation en combinaison intervenant dans des locaux professionnels',
    },
    {
      src: 'photo-RkG7wp75b48',
      alt: "Techniciens en equipement de protection lors d'une intervention antiparasitaire",
    },
  ],

  diagnostiqueur: [
    {
      src: 'photo-dqlfsrC8s8Q',
      alt: 'Diagnostiqueur immobilier controlant la securite sur un chantier',
    },
    {
      src: 'photo-_oy5VYpFe5Y',
      alt: "Combles avec isolation et poutres lors d'un diagnostic energetique",
    },
    { src: 'photo-Pn3U4KBZt_0', alt: 'Grenier inspecte avec materiau isolant visible' },
    { src: 'photo-oXGlh4Dc-Do', alt: 'Interieur de combles avec isolation thermique et charpente' },
    {
      src: 'photo-DWrDpN8i2Fc',
      alt: 'Maison a ossature bois isolee pour diagnostic de performance energetique',
    },
    {
      src: 'photo-CFe3yzlfitY',
      alt: 'Structure de maison avec isolation polyurethane pour diagnostic thermique',
    },
  ],

  etancheiste: [
    {
      src: 'photo-fYD54gVXFGM',
      alt: 'Ouvrier du batiment travaillant sur une toiture avec des outils',
    },
    { src: 'photo-v6R8mMEzrRA', alt: 'Maison avec toiture metallique etanche et terrasse' },
    { src: 'photo-IfXxkrdq9z4', alt: "Batiment avec toit en metal assurant l'etancheite" },
    {
      src: 'photo-bPmklJlrcvc',
      alt: "Construction avec toiture metallique garantissant l'etancheite",
    },
    { src: 'photo-ZzZouwiQWV0', alt: 'Gros plan sur une gouttiere etanche fixee a un toit' },
    {
      src: 'photo-sEjMrYwLSC4',
      alt: "Gouttiere avec ecoulement d'eau de pluie assurant l'evacuation",
    },
  ],

  ferronnier: [
    { src: 'photo-0Ue1iCz32KM', alt: 'Forgeron travaillant sur une piece de metal chaud' },
    {
      src: 'photo-gPRvTP0sZ2M',
      alt: 'Artisan forgeron martelant le fer sur une enclume dans son atelier',
    },
    { src: 'photo-C3qd79sRuVE', alt: 'Ferronnier faconnant une piece de metal avec un marteau' },
    { src: 'photo-N5HLzhX73n4', alt: 'Portail en fer forge orne avec details decoratifs' },
    {
      src: 'photo-OlUKIjLQmSM',
      alt: 'Belle maison derriere une cloture en fer forge et mur de pierre',
    },
    { src: 'photo-0AC10N1nJqo', alt: 'Gros plan sur une cloture en fer forge avec motifs ouvrage' },
    { src: 'photo-VQ26KkqTIZM', alt: 'Cloture en fer forge brun avec elements decoratifs' },
  ],

  geometre: [
    {
      src: 'photo-Z4Ib6codBgY',
      alt: 'Theodolite de geometre pour mesurer les angles sur un chantier',
    },
    { src: 'photo-zSrksQgp4W0', alt: 'Appareil de mesure topographique sur trepied dans un champ' },
    { src: 'photo-K6JzHiV4aq8', alt: 'Geometre consultant un appareil de mesure sur le terrain' },
    {
      src: 'photo-jaOUTIEYMRk',
      alt: 'Technicien inspectant des installations avec une tablette numerique',
    },
    {
      src: 'photo-IB0VA6VdqBw',
      alt: 'Chantier de construction avec echafaudage et mesures en cours',
    },
  ],

  metallier: [
    {
      src: 'photo-EvLFiUYJAvg',
      alt: 'Soudeurs travaillant sur une piece metallique avec des etincelles',
    },
    {
      src: 'photo-hR7Dgk60Qks',
      alt: 'Metallier soudant une piece dans un atelier avec equipement de protection',
    },
    { src: 'photo-ymJNSGAQ0rw', alt: "Soudeur au travail creant des etincelles dans l'obscurite" },
    {
      src: 'photo-LnOOWZk5cE8',
      alt: "Metallier soudant avec projection d'etincelles dans son atelier",
    },
    { src: 'photo-6Ips_2SI-qE', alt: 'Ouvrier soudant une piece metallique dans une usine' },
    {
      src: 'photo-LOh6K4MzXQg',
      alt: 'Artisan metallier travaillant le metal chaud sur une enclume',
    },
  ],

  miroitier: [
    {
      src: 'photo-yb9b2wbhxG4',
      alt: 'Salle de bain moderne avec double vasque et grand miroir mural',
    },
    { src: 'photo-GV1DKrRJ-To', alt: 'Miroir de salle de bain avec lavabo et design contemporain' },
    { src: 'photo-CgVhCq321LY', alt: 'Salle de bain avec doubles vasques et large miroir' },
    { src: 'photo-bLFzefNDGpo', alt: 'Fenetre a quatre panneaux avec vitrage et cadre' },
    { src: 'photo-ci-8qFgnAUE', alt: 'Rambarde en metal et verre avec reflets dans un interieur' },
    {
      src: 'photo-CyZgTVKEQrU',
      alt: 'Vue a travers des portes vitrees avec reflets et transparence',
    },
    { src: 'photo-G_uM6dzJUI4', alt: 'Reflets de lumiere sur une vitre et un miroir interieur' },
  ],

  nettoyage: [
    {
      src: 'photo--dc38HdQR1M',
      alt: 'Agent de nettoyage professionnel avec gants nettoyant un sol',
    },
    { src: 'photo-eSS3DgceQME', alt: 'Femme de menage passant la serpillere sur un sol' },
    {
      src: 'photo-se0AL0ioWyI',
      alt: 'Professionnelle du nettoyage avec gants jaunes et pulverisateur',
    },
    {
      src: 'photo-QJRBApyid4I',
      alt: 'Nettoyeuse professionnelle lavant des vitres avec raclette et detergent',
    },
    { src: 'photo-gSWoU4hWNc0', alt: 'Personne utilisant un aspirateur pour nettoyer un sol' },
    { src: 'photo-uRtGzGl1n6U', alt: "Nettoyage professionnel d'un tapis avec un aspirateur" },
    {
      src: 'photo-5m5418Ng6t8',
      alt: "Agent d'entretien avec equipement de nettoyage professionnel",
    },
  ],

  'panneaux-solaires': [
    {
      src: 'photo-L9LrBpNY5sw',
      alt: 'Technicien en tenue de protection installant des panneaux solaires sur un toit',
    },
    {
      src: 'photo-v_sEYveN2nY',
      alt: 'Ouvrier installant des panneaux photovoltaiques sur une toiture',
    },
    {
      src: 'photo-YSgUo-Dtlyw',
      alt: 'Installation de panneaux solaires sur un toit par un technicien',
    },
    {
      src: 'photo-rMilgVMrMlQ',
      alt: 'Installation de panneaux solaires avec outils et equipement de protection',
    },
    { src: 'photo-S2Jxs3DXpyA', alt: 'Installateur portant un panneau solaire devant une maison' },
    {
      src: 'photo-z3JcNfA7xbg',
      alt: 'Installateur souriant avec tournevis posant des panneaux solaires',
    },
    { src: 'photo-XGAZzyLzn18', alt: 'Panneau solaire sous un ciel bleu lumineux' },
  ],

  'pompe-a-chaleur': [
    {
      src: 'photo-JUAVCUMY008',
      alt: 'Quatre unites exterieures de climatisation sur un mur de batiment',
    },
    { src: 'photo-1KNFO2dpoiM', alt: 'Unite exterieure de pompe a chaleur fixee sur un mur' },
    { src: 'photo-Q4f_0gKTMEk', alt: 'Unite exterieure de climatisation en noir et blanc' },
    {
      src: 'photo-czqpP2Rrjd4',
      alt: 'Panneaux solaires et installation energetique sur terrain vert',
    },
    {
      src: 'photo-VC-m6ULjJ6Y',
      alt: "Installation de panneaux photovoltaiques pour production d'energie verte",
    },
    {
      src: 'photo-8gHwhr7zzV0',
      alt: 'Panneau solaire avec ciel bleu representant les energies renouvelables',
    },
  ],

  ramoneur: [
    { src: 'photo-mk9kC-klh5o', alt: "Fumee s'echappant d'une cheminee sur le toit d'une maison" },
    { src: 'photo-xioDTHPZBkk', alt: 'Cheminee en briques sur un toit sous un ciel nuageux' },
    { src: 'photo-Ns0pypXdqZc', alt: "Cheminee fumante sur le toit d'une habitation" },
    { src: 'photo-8LcBcHMih9w', alt: "Fumee sortant d'une cheminee en haut d'un batiment" },
    { src: 'photo-8_XCuah3WXY', alt: 'Maison avec cheminee en briques apparentes' },
    { src: 'photo-D-KyoOIZtmM', alt: 'Poele a bois dans un salon moderne et chaleureux' },
    {
      src: 'photo-f_6yPIgDxxs',
      alt: 'Salon avec cheminee allumee creant une ambiance chaleureuse',
    },
  ],

  'renovation-energetique': [
    { src: 'photo-W375t_HvjCc', alt: 'Maison en cours de renovation avec echafaudage' },
    {
      src: 'photo-rxfWPJUUClo',
      alt: "Chantier de renovation energetique avec echafaudage autour d'une maison",
    },
    { src: 'photo-u1KG_wZTnkg', alt: "Batiment en renovation avec structure d'echafaudage" },
    { src: 'photo-p7xziuUi0vA', alt: 'Maison en construction avec echafaudage sur le toit' },
    { src: 'photo-2LIlU2RLNxQ', alt: 'Maison avec schema energetique representant la performance' },
    { src: 'photo-_TR3XfBFqIc', alt: "Toiture en tuiles pour renovation thermique d'un batiment" },
  ],

  solier: [
    { src: 'photo-hJ9CpmQovy0', alt: 'Revetement de sol avec motifs colores et fer forge' },
    { src: 'photo-UachrYFna04', alt: 'Escalier avec rambardes et revetement de sol soigne' },
    {
      src: 'photo-HZlL2DzjtX0',
      alt: "Cage d'escalier ancienne avec sol en carrelage et balustrades",
    },
    { src: 'photo-q70JuFG0ktU', alt: 'Batiment ancien avec escalier et revetement de sol ouvrage' },
    { src: 'photo-xMjYa-9AjEs', alt: 'Escalier en bois avec rambarde ornee et revetement au sol' },
    { src: 'photo-pvV3mldScPE', alt: "Reflet d'un batiment dans une surface vitree au sol" },
  ],

  storiste: [
    { src: 'photo-QPiF1X3FF9s', alt: 'Lumiere du soleil filtrant a travers des stores venitiens' },
    {
      src: 'photo-RAdJsQhjVKU',
      alt: 'Facade de batiment moderne avec fenetres et volets repetitifs',
    },
    { src: 'photo-wVpGiYdSApc', alt: 'Facade chaleureuse avec fenetres et volets exterieurs' },
    { src: 'photo-Ab13_tHnZFU', alt: 'Fenetre avec volets en bois sur un batiment traditionnel' },
    { src: 'photo-3Thh_SQPRc0', alt: 'Batiment orange avec volets bleus et fenetre' },
    { src: 'photo-03KYh2cTlRM', alt: 'Maison blanche avec volets verts et porte assortie' },
    { src: 'photo-lHUXYpiajYE', alt: 'Ancien batiment avec fenetre rouge et volets traditionnels' },
  ],

  zingueur: [
    { src: 'photo-6QYiR0utkvA', alt: "Gouttiere en zinc fixee sur le flanc d'un batiment" },
    {
      src: 'photo-PfAojVTLV2w',
      alt: "Photo en noir et blanc de fumee sortant d'une cheminee en zinc",
    },
    {
      src: 'photo-WBrqXwx8mcA',
      alt: 'Gros plan sur des tuiles de toiture en terre cuite avec couverture zinc',
    },
    {
      src: 'photo-aozTRYPsuaY',
      alt: 'Detail de couverture en tuiles sur un toit avec elements en zinc',
    },
    { src: 'photo-Ng4xt7m9bDA', alt: 'Tuiles de toiture brunes vues en gros plan' },
    {
      src: 'photo-LRLZoGT_ZA4',
      alt: 'Tuiles anciennes sur un batiment traditionnel avec zinguerie',
    },
  ],
}
