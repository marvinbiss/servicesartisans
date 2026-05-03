// Batch 1: Additional service images (5-7 per trade)
// Generated for image rotation on service pages
// Source: Unsplash (licence gratuite, usage commercial autorise)
// REGLE: ZERO doublon avec images.ts
//
// Pivot full RGE 2026-05-03 : pools serrurier/carreleur/vitrier/cuisiniste
// retirés (slugs commodity hors RGE). Le pool 'jardinier' subsiste comme
// dead-letter (jamais référencé par france-light.ts post-pivot 2026-05-02
// mais conservé pour réactivation éventuelle d'un slug paysagiste BTP).

export const serviceImagePool_batch1: Record<string, { src: string; alt: string }[]> = {
  plombier: [
    { src: 'photo-hoIQtR0NoQE', alt: 'Plombier intervenant sous un evier de cuisine' },
    {
      src: 'photo-PU9Z6n761bc',
      alt: 'Jeune plombier reparant une canalisation avec une cle a molette',
    },
    {
      src: 'photo-pfyRJmmnBnE',
      alt: 'Plombier professionnel travaillant sur un raccord de tuyauterie',
    },
    { src: 'photo-9lB7XaYKers', alt: 'Plombier reparant une installation avec ses outils' },
    { src: 'photo-6dCFBWET48s', alt: 'Plombier intervenant sur un evier de cuisine' },
    { src: 'photo-Z6GxeYUzG_s', alt: 'Chauffe-eau electrique mural dans une salle de bain' },
  ],

  electricien: [
    {
      src: 'photo-PkHf7BUWbtk',
      alt: 'Electricien testant un tableau electrique avec un multimetre',
    },
    { src: 'photo-CcfJ7ZMlNgk', alt: 'Electricien cablant des prises electriques' },
    {
      src: 'photo-ZGY5Pp8Xxaw',
      alt: 'Technicien en equipement de securite travaillant sur un poteau electrique',
    },
    {
      src: 'photo-_l7NuMJEf7g',
      alt: 'Deux electriciens en gilets de securite travaillant sur un equipement electrique',
    },
    {
      src: 'photo-9kYa--GkBPs',
      alt: 'Technicien avec casque et gilet de securite intervenant sur une machine',
    },
    { src: 'photo-o2I4HsudmlY', alt: 'Electricien professionnel en gilet orange et casque bleu' },
  ],

  chauffagiste: [
    { src: 'photo-l4MSGX319CE', alt: 'Radiateur a huile gris pour le chauffage domestique' },
    { src: 'photo-2nsQWyPU6tw', alt: 'Chaufferie avec tuyaux et jauges de pression' },
    { src: 'photo-mAwE-fqgDXc', alt: 'Thermostat mural blanc affichant la temperature' },
    { src: 'photo-RFAHj4tI37Y', alt: 'Thermostat Nest intelligent affichant la temperature' },
    { src: 'photo-fSLI8RdCdyk', alt: 'Thermostat blanc et gris pour le controle du chauffage' },
    { src: 'photo-ssmpe_q2n_E', alt: 'Thermostat de chauffage mural regle a la bonne temperature' },
  ],

  'peintre-en-batiment': [
    {
      src: 'photo-57ldq9age5U',
      alt: 'Peintre en batiment appliquant de la peinture au rouleau sur un mur',
    },
    { src: 'photo-54MpIUI9nlQ', alt: 'Artisan peignant un mur interieur au rouleau' },
    { src: 'photo-1BnCBIJxXzI', alt: 'Ouvrier peintre travaillant sur un mur avec un rouleau' },
    { src: 'photo-ZHlyRT5u0bM', alt: 'Personne utilisant un rouleau pour peindre un mur' },
    { src: 'photo-P_i41yCuEPo', alt: 'Peintre appliquant de la peinture au pinceau sur un mur' },
  ],

  menuisier: [
    { src: 'photo-T74EPKu8NKI', alt: 'Menuisier experimente travaillant le bois dans son atelier' },
    {
      src: 'photo-uoAjjPGw_BI',
      alt: 'Artisan menuisier utilisant une machine a bois dans son atelier',
    },
    {
      src: 'photo-ps3cAZGdFI8',
      alt: 'Menuisier decoupant des planches de bois a la scie circulaire',
    },
    {
      src: 'photo-dhFpe7CTI5Y',
      alt: 'Artisan utilisant une scie circulaire pour decouper du bois',
    },
    { src: 'photo-kRKNt2nbBLM', alt: 'Menuisier sciant une piece de bois avec precision' },
    {
      src: 'photo-aaqaIB2dsyo',
      alt: 'Artisan dans un atelier de menuiserie entouré de ses outils',
    },
    { src: 'photo-9VnL4pK7EO0', alt: 'Menuisiere fabriquant un meuble dans son atelier' },
  ],

  couvreur: [
    { src: 'photo-_TR3XfBFqIc', alt: 'Maison avec toiture en tuiles en terre cuite' },
    { src: 'photo-aozTRYPsuaY', alt: 'Gros plan sur des tuiles de toit en terre cuite' },
    { src: 'photo-LRLZoGT_ZA4', alt: 'Tuiles anciennes sur un batiment traditionnel' },
    { src: 'photo-WBrqXwx8mcA', alt: 'Gros plan sur des tuiles en terre cuite patinees' },
    {
      src: 'photo-nzZF9iPlcyM',
      alt: 'Ouvrier en gilet de securite pres d une echelle sur un chantier',
    },
    { src: 'photo-GXITWKvgm-k', alt: 'Couvreur avec un marteau travaillant sur un toit' },
  ],

  macon: [
    {
      src: 'photo-pULN4Ji3EDA',
      alt: 'Macon enduisant un mur en beton sur un chantier de construction',
    },
    { src: 'photo-bRC0o9MUTh8', alt: 'Ouvriers du batiment construisant sur un echafaudage' },
    { src: 'photo-PFr50OBMowU', alt: 'Echelle en bois contre un mur en beton sur un chantier' },
    {
      src: 'photo-y4aUBTWgzgQ',
      alt: 'Ouvriers du batiment en equipement de securite sur un chantier',
    },
    { src: 'photo-B9Wf319_-ZQ', alt: 'Ouvrier sur une echelle pres d une fenetre sur un chantier' },
    { src: 'photo-oHly4Tu-vQ4', alt: 'Mur en pierres naturelles apparentes brun et gris' },
  ],

  jardinier: [
    { src: 'photo-6bVCs93aNnA', alt: 'Jardinier professionnel installant un systeme d arrosage' },
    { src: 'photo-Vu1GaaPWyTI', alt: 'Jardinier experimenté tondant une pelouse verte' },
    { src: 'photo-B3yix9NT-PQ', alt: 'Jardinier taillant une haie avec une tailleuse electrique' },
    { src: 'photo-xn23k0tCxCs', alt: 'Vue aerienne d un jardinier travaillant dans un jardin' },
    { src: 'photo-lTr3FXFIaN0', alt: 'Vue aerienne d un homme entretenant son jardin' },
    { src: 'photo-IcivHlHMpTM', alt: 'Jardinier creusant la terre avec une pelle' },
    { src: 'photo-ySsIhq0wzyA', alt: 'Homme taillant une haie avec une tronconneuse' },
  ],

  climaticien: [
    { src: 'photo-JUAVCUMY008', alt: 'Quatre unites exterieures de climatisation installees' },
    {
      src: 'photo-3iLFQj2bXq0',
      alt: 'Personne utilisant une telecommande devant un climatiseur mural',
    },
    { src: 'photo-1KNFO2dpoiM', alt: 'Unite de climatisation murale installee sur un batiment' },
    {
      src: 'photo-A2s88COmrPI',
      alt: 'Technicien verifiant la temperature avec un appareil de mesure',
    },
    { src: 'photo-PWxMg0Dwkks', alt: 'Reseau de tuyaux isoles pour un systeme de climatisation' },
  ],

  'salle-de-bain': [
    { src: 'photo-GqlosWVi5zo', alt: 'Meuble de salle de bain moderne avec vasque en marbre' },
    { src: 'photo-rT0zaQn2r5o', alt: 'Salle de bain renovee avec meuble en bois bleu' },
    {
      src: 'photo-UpJr4WwpIs4',
      alt: 'Douche a l italienne moderne dans une salle de bain renovee',
    },
    { src: 'photo-JUdaVudt_Ok', alt: 'Grande salle de bain avec douche a l italienne spacieuse' },
    { src: 'photo-XrUnkoHm4Uw', alt: 'Salle de bain avec baignoire et douche moderne' },
    { src: 'photo-EctrGV2TKBY', alt: 'Salle de bain avec douche a l italienne pres d un lavabo' },
  ],
}
