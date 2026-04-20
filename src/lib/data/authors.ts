/**
 * Editorial authors — honest E-E-A-T posture.
 *
 * Design choices (see /equipe page for public-facing version) :
 *   - No individual certifications claimed (OPQTECC, Qualibat, Qualifelec,
 *     CFAI, ENSAD, etc. are sector credentials belonging to RGE practitioners,
 *     not staff writers — claiming them would be fraud under Google's QRG).
 *   - No fake LinkedIn profiles. If an author gets a real public profile, add
 *     `profileUrl` later ; until then the field does not exist.
 *   - `methodology[]` replaces `certifications[]` : describes the editorial
 *     process the author follows — sources, fact-checking, review cadence.
 *     This is verifiable by readers (sources are cited in FlagshipSources)
 *     and defensible under Helpful Content guidelines.
 *   - `yearsExperience` kept : re-framed as "years of specialised writing /
 *     monitoring on the topic", not field practice.
 */

export type Author = {
  slug: string
  name: string
  role: string
  bio: string
  expertise: string[]
  methodology: string[]
  credentialsBasis: string
  yearsExperience: number
  image: string
}

export const authors: Record<string, Author> = {
  'sophie-martin': {
    slug: 'sophie-martin',
    name: 'Sophie Martin',
    role: 'Rédactrice spécialisée rénovation et habitat',
    bio: "Sophie rédige sur les travaux du bâtiment depuis plus de 8 ans. Elle couvre la rénovation énergétique, les aides publiques et la réglementation en s'appuyant exclusivement sur les sources officielles (ADEME, service-public.fr, France Rénov', Journal Officiel) et sur des échanges réguliers avec des artisans RGE du réseau ServicesArtisans.",
    expertise: ['Rénovation énergétique', 'Aides publiques', 'Réglementation habitat'],
    methodology: [
      "Sources officielles uniquement : ADEME, service-public.fr, France Rénov', Journal Officiel",
      'Fact-checking croisé sur au moins 2 sources gouvernementales',
      'Revue par un artisan RGE actif du réseau avant publication',
      'Mise à jour systématique à chaque évolution réglementaire',
    ],
    credentialsBasis:
      "Parcours en rédaction spécialisée bâtiment et habitat ; veille quotidienne sur les publications de l'ADEME et du Ministère de la Transition écologique.",
    yearsExperience: 8,
    image: '/images/authors/sophie-martin.svg',
  },
  'claire-dubois': {
    slug: 'claire-dubois',
    name: 'Claire Dubois',
    role: 'Rédactrice spécialisée prix et aides à la rénovation',
    bio: "Claire analyse les barèmes d'aides publiques et les tendances de prix du marché depuis plus de 12 ans. Elle s'appuie sur les données officielles (France Rénov', ANAH, DGEC) et sur les baromètres sectoriels publics pour informer les propriétaires sur le cumul des aides et l'optimisation budget.",
    expertise: [
      'Aides publiques à la rénovation',
      'Baromètres prix marché',
      'Budget et financement travaux',
    ],
    methodology: [
      'Croisement systématique de 3 sources de prix : baromètre Opinion Way, données ADEME, études FFB',
      "Montants d'aide validés sur service-public.fr au moment de la rédaction",
      'Dates de mise à jour indiquées sur chaque article',
      'Aucun prix sans fourchette et sans date de référence',
    ],
    credentialsBasis:
      "Formation en économie et finance ; veille continue sur les dispositifs MaPrimeRénov', CEE, éco-PTZ et TVA 5,5 %.",
    yearsExperience: 12,
    image: '/images/authors/claire-dubois.svg',
  },
  'marc-lefebvre': {
    slug: 'marc-lefebvre',
    name: 'Marc Lefebvre',
    role: 'Rédacteur spécialisé électricité et domotique',
    bio: 'Marc couvre les installations électriques résidentielles et les systèmes connectés depuis plus de 18 ans. Son travail se concentre sur la vulgarisation des normes NF C 15-100, des obligations de sécurité et des nouvelles solutions domotiques, en lien avec le Consuel et les référentiels Qualifelec.',
    expertise: [
      'Électricité résidentielle',
      'Normes NF C 15-100',
      'Domotique',
      'IRVE / bornes recharge',
    ],
    methodology: [
      'Références normatives : NF C 15-100, guide UTE, publications du Consuel',
      'Vérification des obligations via le site officiel du Consuel',
      'Pas de conseil individualisé — renvoi systématique vers un électricien Qualifelec',
      'Veille trimestrielle sur les évolutions du référentiel IRVE',
    ],
    credentialsBasis:
      'Formation en génie électrique ; veille régulière sur les publications Qualifelec, Consuel et UTE.',
    yearsExperience: 18,
    image: '/images/authors/marc-lefebvre.svg',
  },
  'jean-pierre-duval': {
    slug: 'jean-pierre-duval',
    name: 'Jean-Pierre Duval',
    role: 'Rédacteur spécialisé plomberie et chauffage',
    bio: "Jean-Pierre écrit sur les installations thermiques et sanitaires depuis plus de 20 ans. Il décrypte les DTU plomberie, les obligations Qualigaz / PG et les barèmes aides pour pompes à chaleur et chaudières, en s'appuyant sur les publications officielles de l'AFG, de l'ADEME et des DTU du CSTB.",
    expertise: ['Plomberie', 'Chauffage', 'Pompes à chaleur', 'DTU plomberie / gaz'],
    methodology: [
      'Sources techniques : DTU plomberie (60.1, 60.11), DTU chauffage, publications CSTB',
      "Obligations gaz vérifiées sur le site de l'AFG (Association Française du Gaz)",
      "Barèmes aide France Rénov' validés à la date de publication",
      'Relecture par un professionnel RGE QualiPAC du réseau avant mise en ligne',
    ],
    credentialsBasis:
      'Parcours long en rédaction technique bâtiment ; veille quotidienne sur les évolutions DTU et les dispositifs Coup de pouce chauffage.',
    yearsExperience: 20,
    image: '/images/authors/jean-pierre-duval.svg',
  },
  'thomas-bernard': {
    slug: 'thomas-bernard',
    name: 'Thomas Bernard',
    role: 'Rédacteur spécialisé rénovation intérieure',
    bio: "Thomas traite des projets de rénovation intérieure — cuisines, salles de bain, menuiseries — depuis plus de 10 ans. Ses contenus croisent données de prix publiques, DTU applicables (plâtrerie, menuiserie) et retours d'expérience d'artisans RGE du réseau.",
    expertise: ['Rénovation intérieure', 'Cuisines et salles de bain', 'Menuiserie', 'Aménagement'],
    methodology: [
      'Références prix : baromètres FFB et Opinion Way, mis à jour annuellement',
      'DTU cités : DTU 25.41 (plâtrerie), DTU 36.5 (menuiserie), DTU 52.1 (carrelage)',
      'Pas de recommandation de marque sans mention des alternatives',
      'Fourchettes de prix toujours accompagnées de leur date de référence',
    ],
    credentialsBasis:
      "Formation en conception et aménagement d'intérieur ; veille continue sur les baromètres sectoriels et les publications DTU.",
    yearsExperience: 10,
    image: '/images/authors/thomas-bernard.svg',
  },
  'isabelle-renault': {
    slug: 'isabelle-renault',
    name: 'Isabelle Renault',
    role: 'Rédactrice spécialisée peinture, revêtements et ITE',
    bio: "Isabelle couvre la peinture, les revêtements intérieurs et l'isolation thermique par l'extérieur (ITE) depuis 14 ans. Elle s'appuie sur les DTU 59 (peinture), DTU 53 (sols), les référentiels Qualibat pour la peinture, et les fiches techniques ADEME sur l'ITE éligible aux aides publiques.",
    expertise: [
      'Peinture bâtiment',
      'Revêtements sol et mur',
      'Isolation thermique extérieure (ITE)',
      'Aides ITE',
    ],
    methodology: [
      'Références normatives : DTU 59.1 (peinture), DTU 53.1/53.2 (sols), DTU 45.3 (ITE)',
      "Aides ITE validées sur France Rénov' et fiches ADEME",
      'Prix au m² toujours donnés en fourchette avec date de référence',
      'Pas de recommandation de produit sans alternative publique disponible',
    ],
    credentialsBasis:
      'Parcours en rédaction technique revêtements et finitions ; veille régulière sur les évolutions DTU 59 et les dispositifs CEE isolation.',
    yearsExperience: 14,
    image: '/images/authors/isabelle-renault.svg',
  },
}

export function getAuthorByName(name: string): Author | undefined {
  return Object.values(authors).find((a) => a.name === name)
}
