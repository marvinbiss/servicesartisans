import Link from 'next/link'

// ---------------------------------------------------------------------------
// FooterClusterLinks — liens strategiques par cluster dans le footer
// ---------------------------------------------------------------------------
// Affiche les services les plus recherches avec des liens vers tarifs,
// devis et guides. Distribue le PageRank vers les pages les plus
// importantes de chaque cluster thematique.
//
// Liens statiques, pas de DB — safe pour le footer global.
// ---------------------------------------------------------------------------

/** Top services par volume de recherche */
const TOP_SERVICES: { slug: string; name: string }[] = [
  { slug: 'plombier', name: 'Plombier' },
  { slug: 'electricien', name: 'Électricien' },
  { slug: 'serrurier', name: 'Serrurier' },
  { slug: 'chauffagiste', name: 'Chauffagiste' },
  { slug: 'peintre-en-batiment', name: 'Peintre' },
  { slug: 'menuisier', name: 'Menuisier' },
  { slug: 'couvreur', name: 'Couvreur' },
  { slug: 'carreleur', name: 'Carreleur' },
  { slug: 'macon', name: 'Maçon' },
  { slug: 'climaticien', name: 'Climaticien' },
]

/** Top villes par population */
const TOP_CITIES: { slug: string; name: string }[] = [
  { slug: 'paris', name: 'Paris' },
  { slug: 'lyon', name: 'Lyon' },
  { slug: 'marseille', name: 'Marseille' },
  { slug: 'toulouse', name: 'Toulouse' },
  { slug: 'bordeaux', name: 'Bordeaux' },
  { slug: 'nantes', name: 'Nantes' },
  { slug: 'nice', name: 'Nice' },
  { slug: 'strasbourg', name: 'Strasbourg' },
  { slug: 'montpellier', name: 'Montpellier' },
  { slug: 'lille', name: 'Lille' },
]

interface FooterLink {
  href: string
  label: string
}

export default function FooterClusterLinks() {
  // Services populaires — 1 lien service + 1 lien tarifs par service
  const serviceLinks: FooterLink[] = TOP_SERVICES.slice(0, 8).flatMap(s => [
    { href: `/services/${s.slug}`, label: s.name },
    { href: `/tarifs/${s.slug}`, label: `Tarifs ${s.name.toLowerCase()}` },
  ])

  // Villes populaires
  const cityLinks: FooterLink[] = TOP_CITIES.map(c => ({
    href: `/villes/${c.slug}`,
    label: `Artisans ${c.name}`,
  }))

  // Pages utiles (guides, outils, comparaisons)
  const utilityLinks: FooterLink[] = [
    { href: '/guides', label: 'Guides travaux' },
    { href: '/barometre', label: 'Baromètre prix' },
    { href: '/comparaison', label: 'Comparatifs' },
    { href: '/glossaire', label: 'Glossaire' },
    { href: '/normes', label: 'Normes' },
    { href: '/calendrier-travaux', label: 'Calendrier travaux' },
    { href: '/problemes', label: 'Problèmes courants' },
    { href: '/urgence', label: 'Artisan urgence' },
  ]

  return (
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
  )
}
