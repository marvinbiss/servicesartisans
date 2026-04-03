import Link from 'next/link'

// ---------------------------------------------------------------------------
// FooterClusterLinks — liens strategiques par cluster dans le footer
// ---------------------------------------------------------------------------
// Affiche les services les plus recherches avec des liens vers tarifs,
// devis et guides. Distribue le PageRank vers les pages les plus
// importantes de chaque cluster thematique.
//
// Inclut une grille service×ville (100 liens) pour le maillage interne SEO.
// Section collapsible sur mobile via <details> natif (zéro JS client).
//
// Liens statiques, pas de DB — safe pour le footer global.
// ---------------------------------------------------------------------------

/** Top 6 services par volume de recherche (reduced for link equity concentration) */
const TOP_SERVICES: { slug: string; name: string }[] = [
  { slug: 'plombier', name: 'Plombier' },
  { slug: 'electricien', name: 'Électricien' },
  { slug: 'serrurier', name: 'Serrurier' },
  { slug: 'chauffagiste', name: 'Chauffagiste' },
  { slug: 'couvreur', name: 'Couvreur' },
  { slug: 'macon', name: 'Maçon' },
]

/** Top 6 villes par population (reduced for link equity concentration) */
const TOP_CITIES: { slug: string; name: string }[] = [
  { slug: 'paris', name: 'Paris' },
  { slug: 'lyon', name: 'Lyon' },
  { slug: 'marseille', name: 'Marseille' },
  { slug: 'toulouse', name: 'Toulouse' },
  { slug: 'bordeaux', name: 'Bordeaux' },
  { slug: 'lille', name: 'Lille' },
]

/** Top 10 services × top 10 villes pour maillage interne SEO (100 liens) */
const GRID_SERVICES: { slug: string; name: string }[] = [
  { slug: 'plombier', name: 'Plombier' },
  { slug: 'electricien', name: 'Électricien' },
  { slug: 'serrurier', name: 'Serrurier' },
  { slug: 'chauffagiste', name: 'Chauffagiste' },
  { slug: 'peintre-en-batiment', name: 'Peintre' },
  { slug: 'menuisier', name: 'Menuisier' },
  { slug: 'macon', name: 'Maçon' },
  { slug: 'couvreur', name: 'Couvreur' },
  { slug: 'carreleur', name: 'Carreleur' },
  { slug: 'plaquiste', name: 'Plaquiste' },
]

const GRID_CITIES: { slug: string; name: string }[] = [
  { slug: 'paris', name: 'Paris' },
  { slug: 'marseille', name: 'Marseille' },
  { slug: 'lyon', name: 'Lyon' },
  { slug: 'toulouse', name: 'Toulouse' },
  { slug: 'nice', name: 'Nice' },
  { slug: 'nantes', name: 'Nantes' },
  { slug: 'montpellier', name: 'Montpellier' },
  { slug: 'strasbourg', name: 'Strasbourg' },
  { slug: 'bordeaux', name: 'Bordeaux' },
  { slug: 'lille', name: 'Lille' },
]

interface FooterLink {
  href: string
  label: string
}

export default function FooterClusterLinks() {
  // Services populaires — 1 lien par service (no tarifs duplicates, link equity focused)
  const serviceLinks: FooterLink[] = TOP_SERVICES.map(s => ({
    href: `/services/${s.slug}`,
    label: s.name,
  }))

  // Villes populaires
  const cityLinks: FooterLink[] = TOP_CITIES.map(c => ({
    href: `/villes/${c.slug}`,
    label: `Artisans ${c.name}`,
  }))

  // Pages utiles — only high-value hubs (link equity concentrated)
  const utilityLinks: FooterLink[] = [
    { href: '/guides', label: 'Guides travaux' },
    { href: '/barometre', label: 'Baromètre prix' },
    { href: '/comparaison', label: 'Comparatifs' },
    { href: '/urgence', label: 'Artisan urgence' },
  ]

  return (
    <>
      {/* ─── Grille service × ville — maillage interne SEO (100 liens) ─── */}
      <div className="border-b border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Desktop : toujours visible */}
          <div className="hidden md:block">
            <h4 className="text-white font-heading font-semibold mb-5 text-sm tracking-tight">
              Trouvez un artisan près de chez vous
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-6">
              {GRID_SERVICES.map(service => (
                <div key={service.slug}>
                  <p className="text-sand-300 font-medium text-xs mb-2">{service.name}</p>
                  <ul className="space-y-1">
                    {GRID_CITIES.map(city => (
                      <li key={`${service.slug}-${city.slug}`}>
                        <Link
                          href={`/services/${service.slug}/${city.slug}`}
                          className="text-xs text-sand-500 hover:text-primary-400 transition-colors duration-200"
                        >
                          {service.name} {city.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile : collapsible via <details> natif (zéro JS) */}
          <details className="md:hidden group">
            <summary className="flex items-center justify-between cursor-pointer list-none text-white font-heading font-semibold text-sm tracking-tight py-1 [&::-webkit-details-marker]:hidden">
              <span>Trouvez un artisan près de chez vous</span>
              <svg
                className="w-4 h-4 text-sand-500 transition-transform duration-200 group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 pt-4">
              {GRID_SERVICES.map(service => (
                <div key={service.slug}>
                  <p className="text-sand-300 font-medium text-xs mb-1.5">{service.name}</p>
                  <ul className="space-y-0.5">
                    {GRID_CITIES.map(city => (
                      <li key={`${service.slug}-${city.slug}`}>
                        <Link
                          href={`/services/${service.slug}/${city.slug}`}
                          className="text-xs text-sand-500 hover:text-primary-400 transition-colors duration-200"
                        >
                          {service.name} {city.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* ─── Cluster links existants (services, villes, ressources) ─── */}
      <div className="border-b border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Services et tarifs */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-3 text-xs uppercase tracking-[0.15em]">
                Services les plus recherchés
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {serviceLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-sand-500 hover:text-primary-400 transition-colors duration-200 py-0.5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Villes */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-3 text-xs uppercase tracking-[0.15em]">
                Grandes villes
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {cityLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-sand-500 hover:text-primary-400 transition-colors duration-200 py-0.5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Pages utiles */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-3 text-xs uppercase tracking-[0.15em]">
                Ressources
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {utilityLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-sand-500 hover:text-primary-400 transition-colors duration-200 py-0.5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
