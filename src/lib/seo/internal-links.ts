interface InternalLink {
  text: string
  href: string
}

/**
 * Maps keywords found in article slugs and tags to their corresponding
 * service pages. Used to generate contextual "Services associés" links.
 */
const serviceMapping: Record<string, { slug: string; label: string }> = {
  // Plombier / Plomberie
  'plombier': { slug: 'plombier', label: 'plombier' },
  'plomberie': { slug: 'plombier', label: 'plombier' },
  'canalisations': { slug: 'plombier', label: 'plombier' },
  // Électricien / Électricité
  'électricien': { slug: 'electricien', label: 'électricien' },
  'electricien': { slug: 'electricien', label: 'électricien' },
  'électricité': { slug: 'electricien', label: 'électricien' },
  'electricite': { slug: 'electricien', label: 'électricien' },
  'domotique': { slug: 'electricien', label: 'électricien' },
  // Serrurier / Serrurerie
  'serrurier': { slug: 'serrurier', label: 'serrurier' },
  'serrurerie': { slug: 'serrurier', label: 'serrurier' },
  'serrure': { slug: 'serrurier', label: 'serrurier' },
  // Chauffagiste / Chauffage
  'chauffagiste': { slug: 'chauffagiste', label: 'chauffagiste' },
  'chauffage': { slug: 'chauffagiste', label: 'chauffagiste' },
  'chaudière': { slug: 'chauffagiste', label: 'chauffagiste' },
  'chaudiere': { slug: 'chauffagiste', label: 'chauffagiste' },
  'pompe à chaleur': { slug: 'chauffagiste', label: 'chauffagiste' },
  'pompe-a-chaleur': { slug: 'chauffagiste', label: 'chauffagiste' },
  // Menuisier / Menuiserie
  'menuisier': { slug: 'menuisier', label: 'menuisier' },
  'menuiserie': { slug: 'menuisier', label: 'menuisier' },
  'fenêtre': { slug: 'menuisier', label: 'menuisier' },
  'fenêtres': { slug: 'menuisier', label: 'menuisier' },
  'fenetres': { slug: 'menuisier', label: 'menuisier' },
  // Carreleur / Carrelage
  'carreleur': { slug: 'carreleur', label: 'carreleur' },
  'carrelage': { slug: 'carreleur', label: 'carreleur' },
  // Couvreur / Toiture
  'couvreur': { slug: 'couvreur', label: 'couvreur' },
  'toiture': { slug: 'couvreur', label: 'couvreur' },
  'couverture': { slug: 'couvreur', label: 'couvreur' },
  // Peintre en bâtiment
  'peintre': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'peinture': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'ravalement': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  'façade': { slug: 'peintre-en-batiment', label: 'peintre en bâtiment' },
  // Maçon / Maçonnerie
  'maçon': { slug: 'macon', label: 'maçon' },
  'macon': { slug: 'macon', label: 'maçon' },
  'maçonnerie': { slug: 'macon', label: 'maçon' },
  'maconnerie': { slug: 'macon', label: 'maçon' },
  'gros œuvre': { slug: 'macon', label: 'maçon' },
  // Climaticien / Climatisation
  'climaticien': { slug: 'climaticien', label: 'climaticien' },
  'climatisation': { slug: 'climaticien', label: 'climaticien' },
  'pac air-air': { slug: 'climaticien', label: 'climaticien' },
  // Jardinier paysagiste
  'jardinier': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
  'paysagiste': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
  'jardin': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
  'paysagisme': { slug: 'jardinier-paysagiste', label: 'jardinier paysagiste' },
  // Vitrier
  'vitrier': { slug: 'vitrier', label: 'vitrier' },
  'vitrerie': { slug: 'vitrier', label: 'vitrier' },
  'vitrage': { slug: 'vitrier', label: 'vitrier' },
  'double vitrage': { slug: 'vitrier', label: 'vitrier' },
  // Cuisiniste
  'cuisiniste': { slug: 'cuisiniste', label: 'cuisiniste' },
  'cuisine': { slug: 'cuisiniste', label: 'cuisiniste' },
  // Solier / Moquettiste
  'solier': { slug: 'solier-moquettiste', label: 'solier moquettiste' },
  'parquet': { slug: 'solier-moquettiste', label: 'solier moquettiste' },
  'revêtement de sol': { slug: 'solier-moquettiste', label: 'solier moquettiste' },
  // Entreprise de nettoyage
  'nettoyage': { slug: 'entreprise-de-nettoyage', label: 'entreprise de nettoyage' },
  // Charpentier
  'charpentier': { slug: 'charpentier', label: 'charpentier' },
  'charpente': { slug: 'charpentier', label: 'charpentier' },
  // Terrassier
  'terrassier': { slug: 'terrassier', label: 'terrassier' },
  'terrassement': { slug: 'terrassier', label: 'terrassier' },
  // Zingueur
  'zingueur': { slug: 'zingueur', label: 'zingueur' },
  'zinguerie': { slug: 'zingueur', label: 'zingueur' },
  'gouttière': { slug: 'zingueur', label: 'zingueur' },
  'gouttiere': { slug: 'zingueur', label: 'zingueur' },
  // Étanchéiste
  'étanchéiste': { slug: 'etancheiste', label: 'étanchéiste' },
  'etancheiste': { slug: 'etancheiste', label: 'étanchéiste' },
  'étanchéité': { slug: 'etancheiste', label: 'étanchéiste' },
  'etancheite': { slug: 'etancheiste', label: 'étanchéiste' },
  // Façadier
  'façadier': { slug: 'facadier', label: 'façadier' },
  'facadier': { slug: 'facadier', label: 'façadier' },
  'enduit': { slug: 'facadier', label: 'façadier' },
  // Plâtrier
  'plâtrier': { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  'platrier': { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  'plaquiste': { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  'placo': { slug: 'platrier-plaquiste', label: 'plâtrier plaquiste' },
  // Métallier / Ferronnier
  'métallier': { slug: 'metallier-serrurier', label: 'métallier serrurier' },
  'metallier': { slug: 'metallier-serrurier', label: 'métallier serrurier' },
  'ferronnier': { slug: 'ferronnier', label: 'ferronnier' },
  'ferronnerie': { slug: 'ferronnier', label: 'ferronnier' },
  // Storiste
  'storiste': { slug: 'storiste', label: 'storiste' },
  'store': { slug: 'storiste', label: 'storiste' },
  'volet roulant': { slug: 'storiste', label: 'storiste' },
  // Salle de bain
  'salle de bain': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  'salle-de-bain': { slug: 'salle-de-bain', label: 'spécialiste salle de bain' },
  // Architecte intérieur / Décorateur
  'architecte intérieur': { slug: 'architecte-interieur', label: 'architecte d\'intérieur' },
  'architecte-interieur': { slug: 'architecte-interieur', label: 'architecte d\'intérieur' },
  'décorateur': { slug: 'decorateur-interieur', label: 'décorateur d\'intérieur' },
  'decorateur': { slug: 'decorateur-interieur', label: 'décorateur d\'intérieur' },
  'décoration': { slug: 'decorateur-interieur', label: 'décorateur d\'intérieur' },
  // Domoticien
  'domoticien': { slug: 'domoticien', label: 'domoticien' },
  'maison connectée': { slug: 'domoticien', label: 'domoticien' },
  // Pompe à chaleur (distinct du chauffagiste)
  'installateur pac': { slug: 'pompe-a-chaleur', label: 'installateur pompe à chaleur' },
  // Panneaux solaires
  'panneaux solaires': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'panneau solaire': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'photovoltaïque': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  'photovoltaique': { slug: 'panneaux-solaires', label: 'installateur panneaux solaires' },
  // Isolation thermique
  'isolation': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolation thermique': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  'isolant': { slug: 'isolation-thermique', label: 'spécialiste isolation thermique' },
  // Rénovation énergétique
  'rénovation énergétique': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  'renovation-energetique': { slug: 'renovation-energetique', label: 'spécialiste rénovation énergétique' },
  // Borne de recharge
  'borne de recharge': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  'borne-recharge': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  'irve': { slug: 'borne-recharge', label: 'installateur borne de recharge' },
  // Ramoneur
  'ramoneur': { slug: 'ramoneur', label: 'ramoneur' },
  'ramonage': { slug: 'ramoneur', label: 'ramoneur' },
  // Pisciniste
  'pisciniste': { slug: 'pisciniste', label: 'pisciniste' },
  'piscine': { slug: 'pisciniste', label: 'pisciniste' },
  // Alarme / Sécurité
  'alarme': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  'alarme-securite': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  'vidéosurveillance': { slug: 'alarme-securite', label: 'installateur alarme et sécurité' },
  // Antenniste
  'antenniste': { slug: 'antenniste', label: 'antenniste' },
  'antenne': { slug: 'antenniste', label: 'antenniste' },
  // Ascensoriste
  'ascensoriste': { slug: 'ascensoriste', label: 'ascensoriste' },
  'ascenseur': { slug: 'ascensoriste', label: 'ascensoriste' },
  // Diagnostiqueur
  'diagnostiqueur': { slug: 'diagnostiqueur-immobilier', label: 'diagnostiqueur immobilier' },
  'diagnostic immobilier': { slug: 'diagnostiqueur-immobilier', label: 'diagnostiqueur immobilier' },
  'dpe': { slug: 'diagnostiqueur-immobilier', label: 'diagnostiqueur immobilier' },
  // Géomètre
  'géomètre': { slug: 'geometre-expert', label: 'géomètre expert' },
  'geometre': { slug: 'geometre-expert', label: 'géomètre expert' },
  'bornage': { slug: 'geometre-expert', label: 'géomètre expert' },
  // Désinsectisation / Dératisation
  'désinsectisation': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'desinsectisation': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'punaise': { slug: 'desinsectisation', label: 'désinsectiseur' },
  'dératisation': { slug: 'deratisation', label: 'dératiseur' },
  'deratisation': { slug: 'deratisation', label: 'dératiseur' },
  // Déménageur
  'déménageur': { slug: 'demenageur', label: 'déménageur' },
  'demenageur': { slug: 'demenageur', label: 'déménageur' },
  'déménagement': { slug: 'demenageur', label: 'déménageur' },
  'demenagement': { slug: 'demenageur', label: 'déménageur' },
}

/**
 * Determines which service pages are relevant for a given article
 * based on its slug, category and tags.
 */
export function getRelatedServiceLinks(
  slug: string,
  category: string,
  tags: string[]
): InternalLink[] {
  const links: InternalLink[] = []
  const addedSlugs = new Set<string>()

  // Build search terms from the slug (split on hyphens) and lowered tags
  const slugWords = slug.toLowerCase()
  const searchTerms = [slugWords, ...tags.map((t) => t.toLowerCase())]

  // Top 5 cities for service×ville cross-links
  const TOP_CITIES = [
    { name: 'Paris', slug: 'paris' },
    { name: 'Lyon', slug: 'lyon' },
    { name: 'Marseille', slug: 'marseille' },
    { name: 'Toulouse', slug: 'toulouse' },
    { name: 'Nice', slug: 'nice' },
  ]

  let firstServiceSlug: string | null = null

  for (const term of searchTerms) {
    for (const [keyword, service] of Object.entries(serviceMapping)) {
      if (term.includes(keyword) && !addedSlugs.has(service.slug)) {
        links.push({
          text: `Trouver un ${service.label} qualifié`,
          href: `/services/${service.slug}`,
        })
        // Add top-city variants for the first matched service only
        if (!firstServiceSlug) {
          firstServiceSlug = service.slug
          for (const city of TOP_CITIES) {
            links.push({
              text: `${service.label.charAt(0).toUpperCase() + service.label.slice(1)} à ${city.name}`,
              href: `/services/${service.slug}/${city.slug}`,
            })
          }
        }
        addedSlugs.add(service.slug)
      }
    }
  }

  // Always add devis link for Tarifs articles
  if (category === 'Tarifs') {
    links.push({ text: 'Demander un devis gratuit', href: '/devis' })
  }

  // Add general links based on category
  if (category === 'Réglementation' || category === 'Aides & Subventions') {
    links.push({ text: 'Comment ça marche ?', href: '/comment-ca-marche' })
  }

  if (category === 'Fiches métier') {
    links.push({ text: 'Devenir artisan partenaire', href: '/inscription-artisan' })
  }

  // Add urgence link when relevant
  if (
    tags.some((t) => t.toLowerCase() === 'urgence') ||
    slug.includes('urgence') ||
    slug.includes('depannage')
  ) {
    links.push({ text: 'Artisan en urgence', href: '/urgence' })
  }

  // Limit to 5 links max
  return links.slice(0, 5)
}

interface ArticleMeta {
  category: string
  tags: string[]
  title: string
  readTime?: string
}

/**
 * Scores and selects the most relevant related articles based on
 * shared category and overlapping tags.
 */
export function getRelatedArticleSlugs(
  currentSlug: string,
  category: string,
  tags: string[],
  allSlugs: string[],
  allArticlesMap: Record<string, ArticleMeta>
): { slug: string; title: string; category: string; readTime: string }[] {
  const currentTags = tags.map((t) => t.toLowerCase())

  const scored = allSlugs
    .filter((s) => s !== currentSlug)
    .map((s) => {
      const article = allArticlesMap[s]
      if (!article) return { slug: s, title: '', category: '', readTime: '', score: 0 }

      let score = 0

      // Same category => +2
      if (article.category === category) score += 2

      // Each overlapping tag => +3
      const articleTags = article.tags.map((t) => t.toLowerCase())
      for (const tag of articleTags) {
        if (currentTags.includes(tag)) score += 3
      }

      return { slug: s, title: article.title, category: article.category, readTime: article.readTime || '', score }
    })
    .filter((s) => s.score > 0 && s.title)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  return scored
}
