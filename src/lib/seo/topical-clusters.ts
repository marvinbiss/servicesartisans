/**
 * Topical Clusters — Mappage formel des clusters thematiques SEO
 *
 * Chaque service (pilier) est relie a ses pages satellites :
 * - tarifs, devis, avis, urgence, problemes (intents)
 * - articles de blog associes
 * - guides thematiques
 * - services connexes
 *
 * Utilise par TopicalClusterLinks et BlogClusterLinks pour distribuer
 * le link equity de maniere structuree au sein de chaque cluster.
 */

import { relatedServices } from '@/lib/constants/navigation'
import { allArticles } from '@/lib/data/blog/articles'
import { tradeContent } from '@/lib/data/trade-content'
import { getProblemsByService } from '@/lib/data/problems'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClusterLink {
  path: string
  label: string
  priority: number // 1 = highest
  type: 'pillar' | 'tarifs' | 'devis' | 'avis' | 'urgence' | 'blog' | 'guide' | 'probleme' | 'service' | 'barometre'
}

export interface TopicalCluster {
  service: string       // slug du service
  serviceName: string   // nom affiche
  pillar: string        // page pilier (ex: /services/plombier)
  cluster: ClusterLink[]
}

// ---------------------------------------------------------------------------
// Blog article -> service mapping (reverse of DeepPageLinks SERVICE_ARTICLE_MAP)
// ---------------------------------------------------------------------------

const SERVICE_ARTICLE_MAP: Record<string, string[]> = {
  'plombier': ['prix-plombier-2026-tarifs-horaires', 'comment-choisir-son-plombier', 'fuite-eau-que-faire-urgence'],
  'electricien': ['prix-electricien-2026-tarifs-travaux', 'comment-choisir-electricien-guide', 'electricite-normes-securite'],
  'serrurier': ['prix-serrurier-2026-tarifs-interventions', 'comment-choisir-serrurier-conseils', 'securiser-maison-cambriolage-solutions'],
  'chauffagiste': ['prix-chauffagiste-2026-installation-entretien', 'comment-choisir-chauffagiste-guide', 'chauffage-pompe-chaleur-vs-chaudiere-gaz-2026'],
  'peintre-en-batiment': ['prix-peintre-batiment-2026-guide-complet', 'peinture-interieure-conseils', 'renover-facade-ravalement-guide'],
  'menuisier': ['prix-menuisier-2026-tarifs-travaux', 'comment-choisir-menuisier-guide', 'menuiseries-bois-pvc-alu-comparatif'],
  'carreleur': ['prix-carreleur-2026-pose-fourniture', 'comment-choisir-carreleur-guide', 'guide-carrelage-salle-de-bain'],
  'couvreur': ['prix-toiture-2026-refection-reparation-materiaux', 'comment-choisir-couvreur-guide', 'toiture-renovation-prix-2026'],
  'macon': ['prix-macon-2026-gros-oeuvre-renovation', 'comment-choisir-macon-guide', 'agrandir-maison-extension-guide'],
  'jardinier': ['prix-jardinier-paysagiste-2026', 'comment-choisir-jardinier-paysagiste', 'amenager-terrasse-exterieure-guide'],
  'vitrier': ['prix-vitrier-2026-remplacement-vitrage', 'comment-choisir-vitrier-guide', 'guide-fenetre-double-vitrage'],
  'climaticien': ['prix-climaticien-2026-installation-entretien', 'comment-choisir-climaticien-guide', 'climatisation-reversible-guide'],
  'cuisiniste': ['prix-cuisiniste-2026-pose-cuisine', 'comment-choisir-cuisiniste-guide', 'renover-cuisine-guide-complet-etapes'],
  'solier': ['prix-solier-revetement-sol-2026', 'comment-choisir-solier-guide', 'beton-cire-vs-resine-vs-carrelage'],
  'nettoyage': ['prix-nettoyage-professionnel-2026', 'comment-choisir-entreprise-nettoyage', 'entretien-annuel-maison-checklist-complete'],
  'terrassier': ['prix-extension-maison-2026', 'construire-garage-guide-permis-budget', 'permis-construire-declaration-prealable-guide'],
  'charpentier': ['prix-toiture-2026-refection-reparation-materiaux', 'toiture-renovation-prix-2026', 'types-de-tuiles-guide'],
  'zingueur': ['comment-choisir-zingueur-guide', 'prix-toiture-2026-refection-reparation-materiaux', 'etancheite-toiture-terrasse-solutions'],
  'etancheiste': ['etancheite-toiture-terrasse-solutions', 'humidite-moisissure-maison-solutions', 'prix-toiture-2026-refection-reparation-materiaux'],
  'facadier': ['prix-ravalement-facade-2026', 'renover-facade-ravalement-guide', 'types-enduit-facade'],
  'platrier': ['plaque-de-platre-ba13-guide', 'prix-renovation-appartement-2026-budget', 'renovation-maison-par-ou-commencer'],
  'pompe-a-chaleur': ['prix-pompe-a-chaleur-2026', 'chauffage-pompe-chaleur-vs-chaudiere-gaz-2026', 'cumul-aides-renovation-2026-tableau'],
  'panneaux-solaires': ['panneaux-solaires-rentabilite-2026', 'prix-panneaux-solaires-2026', 'installer-panneau-solaire-maison-2026'],
  'isolation-thermique': ['prix-isolation-thermique-2026-tarifs', 'isolation-combles-materiaux-guide', 'cumul-aides-renovation-2026-tableau'],
  'renovation-energetique': ['travaux-renovation-energetique-par-ou-commencer', 'dpe-obligatoire-2026-guide', 'eco-ptz-2026-conditions-montant'],
  'salle-de-bain': ['renovation-salle-de-bain-budget-etapes', 'tendances-salle-de-bain-2026', 'prix-salle-de-bain-complete-2026'],
  'ramoneur': ['ramonage-obligatoire-avant-hiver', 'entretien-chaudiere-annuel', 'preparer-maison-hiver-checklist'],
  'domoticien': ['comment-choisir-domoticien-guide', 'domotique-maison-connectee-guide-debutant', 'prix-domotique-maison-2026'],
  'borne-recharge': ['prix-borne-recharge-domicile-2026', 'electricite-normes-securite', 'domotique-maison-connectee-guide-debutant'],
  'alarme-securite': ['securite-alarme-maison-guide-2026', 'securiser-maison-cambriolage-solutions', 'domotique-maison-connectee-guide-debutant'],
}

// ---------------------------------------------------------------------------
// Cluster builder
// ---------------------------------------------------------------------------

/**
 * Build the full topical cluster for a given service.
 * Returns pillar page + all satellite pages ordered by priority.
 */
export function getTopicalCluster(serviceSlug: string): TopicalCluster | null {
  const trade = tradeContent[serviceSlug]
  if (!trade) return null

  const serviceName = trade.name
  const cluster: ClusterLink[] = []

  // 1. Pillar page (priority 1)
  cluster.push({
    path: `/services/${serviceSlug}`,
    label: `${serviceName} en France`,
    priority: 1,
    type: 'pillar',
  })

  // 2. Intent pages (priority 2)
  cluster.push({
    path: `/tarifs/${serviceSlug}`,
    label: `Tarifs ${serviceName.toLowerCase()}`,
    priority: 2,
    type: 'tarifs',
  })
  cluster.push({
    path: `/devis/${serviceSlug}`,
    label: `Devis ${serviceName.toLowerCase()}`,
    priority: 2,
    type: 'devis',
  })
  cluster.push({
    path: `/avis/${serviceSlug}`,
    label: `Avis ${serviceName.toLowerCase()}`,
    priority: 2,
    type: 'avis',
  })
  if (trade.emergencyInfo) {
    cluster.push({
      path: `/urgence/${serviceSlug}`,
      label: `${serviceName} urgence`,
      priority: 2,
      type: 'urgence',
    })
  }

  // 3. Barometre (priority 3)
  cluster.push({
    path: `/barometre/tarifs/${serviceSlug}`,
    label: `Baromètre prix ${serviceName.toLowerCase()}`,
    priority: 3,
    type: 'barometre',
  })

  // 4. Blog articles (priority 3)
  const articleSlugs = SERVICE_ARTICLE_MAP[serviceSlug] || []
  for (const slug of articleSlugs) {
    const article = allArticles[slug]
    if (article) {
      cluster.push({
        path: `/blog/${slug}`,
        label: article.title,
        priority: 3,
        type: 'blog',
      })
    }
  }

  // 5. Problemes (priority 4)
  const serviceProblems = getProblemsByService(serviceSlug)
  for (const p of serviceProblems.slice(0, 3)) {
    cluster.push({
      path: `/problemes/${p.slug}`,
      label: p.name,
      priority: 4,
      type: 'probleme',
    })
  }

  // 6. Related services (priority 5 — cross-silo, lower priority)
  const related = relatedServices[serviceSlug] || []
  for (const relSlug of related.slice(0, 3)) {
    const relTrade = tradeContent[relSlug]
    if (relTrade) {
      cluster.push({
        path: `/services/${relSlug}`,
        label: relTrade.name,
        priority: 5,
        type: 'service',
      })
    }
  }

  return { service: serviceSlug, serviceName, pillar: `/services/${serviceSlug}`, cluster }
}

// ---------------------------------------------------------------------------
// Helpers for components
// ---------------------------------------------------------------------------

/**
 * Get cluster links for a page, excluding the current page path.
 * Returns links sorted by priority, limited to maxLinks.
 */
export function getClusterLinksForPage(
  serviceSlug: string,
  currentPath: string,
  maxLinks: number = 8,
): ClusterLink[] {
  const cluster = getTopicalCluster(serviceSlug)
  if (!cluster) return []

  return cluster.cluster
    .filter(link => link.path !== currentPath)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxLinks)
}

/**
 * Get cluster links for a blog article.
 * Detects which service(s) the article belongs to and returns cross-links.
 */
export function getClusterLinksForArticle(
  articleSlug: string,
  maxLinks: number = 6,
): { service: string; serviceName: string; links: ClusterLink[] }[] {
  const results: { service: string; serviceName: string; links: ClusterLink[] }[] = []

  for (const [serviceSlug, slugs] of Object.entries(SERVICE_ARTICLE_MAP)) {
    if (slugs.includes(articleSlug)) {
      const cluster = getTopicalCluster(serviceSlug)
      if (cluster) {
        const links = cluster.cluster
          .filter(link => link.path !== `/blog/${articleSlug}`)
          .sort((a, b) => a.priority - b.priority)
          .slice(0, maxLinks)
        results.push({ service: serviceSlug, serviceName: cluster.serviceName, links })
      }
    }
  }

  return results
}

/**
 * Given an article slug, determine all services it belongs to.
 * Returns service slugs.
 */
export function getServicesForArticle(articleSlug: string): string[] {
  const services: string[] = []
  for (const [serviceSlug, slugs] of Object.entries(SERVICE_ARTICLE_MAP)) {
    if (slugs.includes(articleSlug)) {
      services.push(serviceSlug)
    }
  }
  return services
}

/**
 * Get related articles from the same cluster(s) as the current article.
 * Returns article slugs with their titles, excluding the current one.
 */
export function getClusterRelatedArticles(
  articleSlug: string,
  maxArticles: number = 4,
): { slug: string; title: string; serviceSlug: string }[] {
  const services = getServicesForArticle(articleSlug)
  const seen = new Set<string>([articleSlug])
  const result: { slug: string; title: string; serviceSlug: string }[] = []

  for (const serviceSlug of services) {
    const articleSlugs = SERVICE_ARTICLE_MAP[serviceSlug] || []
    for (const slug of articleSlugs) {
      if (seen.has(slug)) continue
      const article = allArticles[slug]
      if (article) {
        seen.add(slug)
        result.push({ slug, title: article.title, serviceSlug })
      }
    }
  }

  // Also pull articles from related services (cross-silo enrichment)
  for (const serviceSlug of services) {
    const related = relatedServices[serviceSlug] || []
    for (const relSlug of related.slice(0, 2)) {
      const articleSlugs = SERVICE_ARTICLE_MAP[relSlug] || []
      for (const slug of articleSlugs.slice(0, 1)) {
        if (seen.has(slug)) continue
        const article = allArticles[slug]
        if (article) {
          seen.add(slug)
          result.push({ slug, title: article.title, serviceSlug: relSlug })
        }
      }
    }
  }

  return result.slice(0, maxArticles)
}
