/**
 * Batch 3 : Images additionnelles par service (5-7 par metier)
 * Source : Unsplash (licence gratuite, usage commercial autorise)
 *
 * 15 metiers couverts — IDs uniques, zero doublon avec images.ts / batch1 / batch2
 */

// Batch 3: Additional service images (5-7 per trade)
export const serviceImagePool_batch3: Record<string, { src: string; alt: string }[]> = {
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
