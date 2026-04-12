import Link from 'next/link'

// ---------------------------------------------------------------------------
// Hub cross-linking map
// ---------------------------------------------------------------------------

const HUB_META: Record<string, { label: string; description: string }> = {
  '/guides': { label: 'Guides travaux', description: 'Conseils pratiques pour vos projets' },
  '/faq': { label: 'Questions fréquentes', description: "Réponses d'experts à vos questions" },
  '/comparaison': { label: 'Comparatifs artisans', description: 'Comparez les corps de métier' },
  '/barometre': { label: 'Baromètre des prix', description: 'Tarifs moyens actualisés' },
  '/glossaire': { label: 'Glossaire', description: 'Termes techniques expliqués' },
  '/normes': { label: 'Normes et réglementations', description: 'Obligations légales en vigueur' },
  '/calendrier-travaux': {
    label: 'Calendrier travaux',
    description: 'Meilleure période pour chaque chantier',
  },
  '/checklist-travaux': {
    label: 'Checklist travaux',
    description: 'Ne rien oublier avant de commencer',
  },
  '/avant-apres': { label: 'Avant/Après', description: 'Réalisations et transformations' },
  '/carte-artisans': {
    label: 'Carte des artisans',
    description: "Couverture nationale en un coup d'œil",
  },
  '/badge-artisan': {
    label: 'Badge Artisan Vérifié',
    description: 'Certification gratuite pour artisans',
  },
  '/statistiques-artisans-france': {
    label: 'Statistiques artisans',
    description: 'Chiffres clés du secteur',
  },
  '/tarifs': { label: 'Tarifs artisans', description: 'Grilles tarifaires par métier' },
  '/avis': { label: 'Avis artisans', description: "Retours d'expérience clients" },
  '/problemes': { label: 'Problèmes courants', description: 'Solutions aux incidents fréquents' },
  '/devis': { label: 'Demander un devis', description: 'Comparez gratuitement les artisans' },
  '/outils': { label: 'Outils gratuits', description: 'Calculateur de prix et diagnostic artisan' },
}

const HUB_LINKS: Record<string, string[]> = {
  '/guides': ['/faq', '/comparaison', '/normes', '/barometre'],
  '/faq': ['/guides', '/glossaire', '/comparaison', '/problemes'],
  '/comparaison': ['/tarifs', '/avis', '/guides', '/avant-apres'],
  '/barometre': ['/tarifs', '/comparaison', '/statistiques-artisans-france', '/guides'],
  '/glossaire': ['/faq', '/normes', '/guides'],
  '/normes': ['/glossaire', '/guides', '/faq', '/barometre'],
  '/calendrier-travaux': ['/guides', '/checklist-travaux', '/barometre'],
  '/checklist-travaux': ['/guides', '/calendrier-travaux', '/devis', '/avant-apres'],
  '/avant-apres': ['/comparaison', '/avis', '/guides', '/carte-artisans'],
  '/carte-artisans': [
    '/avant-apres',
    '/statistiques-artisans-france',
    '/barometre',
    '/badge-artisan',
  ],
  '/badge-artisan': ['/carte-artisans', '/avant-apres', '/avis'],
  '/statistiques-artisans-france': ['/barometre', '/comparaison', '/guides', '/carte-artisans'],
  '/outils': ['/tarifs', '/problemes', '/devis', '/guides'],
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RelatedHubsProps {
  currentPath: string
  extraLinks?: { href: string; label: string }[]
}

export default function RelatedHubs({ currentPath, extraLinks }: RelatedHubsProps) {
  const targets = HUB_LINKS[currentPath]
  if (!targets && !extraLinks) return null

  const links = [
    ...(targets || [])
      .map((href) => {
        const meta = HUB_META[href]
        return meta ? { href, label: meta.label, description: meta.description } : null
      })
      .filter((x): x is { href: string; label: string; description: string } => x !== null),
    ...(extraLinks || []).map((l) => ({ ...l, description: '' })),
  ]

  if (links.length === 0) return null

  return (
    <section className="py-10 border-t border-charcoal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-sm font-semibold text-stone-800 mb-4">À découvrir aussi</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col gap-1 p-4 rounded-xl bg-sand-50 hover:bg-clay-50 border border-charcoal-100 hover:border-clay-200 transition-colors"
            >
              <span className="text-sm font-medium text-stone-800 group-hover:text-clay-600 transition-colors">
                {link.label}
              </span>
              {link.description && (
                <span className="text-xs text-stone-500">{link.description}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
