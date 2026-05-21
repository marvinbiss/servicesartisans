import Link from 'next/link'
import { getServiceWeight } from '@/lib/constants/navigation'

// ---------------------------------------------------------------------------
// FooterClusterLinks — liens strategiques par cluster dans le footer
// ---------------------------------------------------------------------------
// Affiche les services les plus recherches avec des liens vers tarifs,
// devis et guides. Distribue le PageRank vers les pages les plus
// importantes de chaque cluster thematique.
//
// ~49 liens totaux : 6 services + 6 villes + 13 régions + 5 pages utiles + 20 top combos.
// Liens statiques, pas de DB — safe pour le footer global.
// ---------------------------------------------------------------------------

/** Top 6 services par volume de recherche — sorted by SERVICE_WEIGHT.
 * Pivot full RGE 2026-05-03 : serrurier retiré (commodity hors RGE) —
 * remplacé par pompe-a-chaleur (gravity hub RGE, weight 7). */
const TOP_SERVICES: { slug: string; name: string }[] = [
  { slug: 'plombier', name: 'Plombier' },
  { slug: 'electricien', name: 'Électricien' },
  { slug: 'chauffagiste', name: 'Chauffagiste' },
  { slug: 'pompe-a-chaleur', name: 'Pompe à chaleur' },
  { slug: 'couvreur', name: 'Couvreur' },
  { slug: 'macon', name: 'Maçon' },
].sort((a, b) => getServiceWeight(b.slug) - getServiceWeight(a.slug))

/** Top 6 villes par population */
const TOP_CITIES: { slug: string; name: string }[] = [
  { slug: 'paris', name: 'Paris' },
  { slug: 'lyon', name: 'Lyon' },
  { slug: 'marseille', name: 'Marseille' },
  { slug: 'toulouse', name: 'Toulouse' },
  { slug: 'bordeaux', name: 'Bordeaux' },
  { slug: 'lille', name: 'Lille' },
]

/** Top 5 services × top 4 villes = 20 liens stratégiques — sorted by weight.
 * Pivot full RGE 2026-05-03 : serrurier retiré → pompe-a-chaleur. */
const COMBO_SERVICES: { slug: string; name: string }[] = [
  { slug: 'plombier', name: 'Plombier' },
  { slug: 'electricien', name: 'Électricien' },
  { slug: 'pompe-a-chaleur', name: 'Pompe à chaleur' },
  { slug: 'chauffagiste', name: 'Chauffagiste' },
  { slug: 'couvreur', name: 'Couvreur' },
].sort((a, b) => getServiceWeight(b.slug) - getServiceWeight(a.slug))

const COMBO_CITIES: { slug: string; name: string }[] = [
  { slug: 'paris', name: 'Paris' },
  { slug: 'lyon', name: 'Lyon' },
  { slug: 'marseille', name: 'Marseille' },
  { slug: 'toulouse', name: 'Toulouse' },
]

interface FooterLink {
  href: string
  label: string
}

export default function FooterClusterLinks() {
  // Services populaires — 6 liens
  const serviceLinks: FooterLink[] = TOP_SERVICES.map((s) => ({
    href: `/services/${s.slug}`,
    label: s.name,
  }))

  // Villes populaires — 6 liens
  const cityLinks: FooterLink[] = TOP_CITIES.map((c) => ({
    href: `/villes/${c.slug}`,
    label: `Artisans ${c.name}`,
  }))

  // Pages utiles — 9 liens
  const utilityLinks: FooterLink[] = [
    { href: '/simulateur-aides-renovation', label: 'Simulateur aides' },
    { href: '/guides', label: 'Guides travaux' },
    { href: '/barometre', label: 'Baromètre prix' },
    { href: '/comparaison', label: 'Comparatifs' },
    { href: '/urgence', label: 'Artisan urgence' },
    { href: '/diagnostic', label: 'Diagnostic immobilier' },
    { href: '/travaux', label: 'Travaux rénovation' },
    { href: '/badge', label: 'Badge artisan vérifié' },
    { href: '/questions', label: 'Questions fréquentes' },
  ]

  // Transparence E-E-A-T — signal YMYL pour Google + réassurance utilisateur.
  // Ces pages (méthodologie, sources, études, normes, garantie) sont rarement
  // visitées mais critiques pour la crédibilité éditoriale + PageRank juice.
  const trustLinks: FooterLink[] = [
    { href: '/methodologie', label: 'Notre méthodologie' },
    { href: '/sources', label: 'Sources officielles' },
    { href: '/transparence-ia', label: 'Transparence IA' },
    { href: '/etudes', label: 'Études & données' },
    { href: '/normes', label: 'Normes applicables' },
    { href: '/garantie', label: 'Garantie plateforme' },
  ]

  // Régions — 13 régions métropolitaines
  const regionLinks: FooterLink[] = [
    { href: '/regions/ile-de-france', label: 'Île-de-France' },
    { href: '/regions/auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes' },
    { href: '/regions/provence-alpes-cote-d-azur', label: "Provence-Alpes-Côte d'Azur" },
    { href: '/regions/occitanie', label: 'Occitanie' },
    { href: '/regions/nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
    { href: '/regions/hauts-de-france', label: 'Hauts-de-France' },
    { href: '/regions/grand-est', label: 'Grand Est' },
    { href: '/regions/bretagne', label: 'Bretagne' },
    { href: '/regions/pays-de-la-loire', label: 'Pays de la Loire' },
    { href: '/regions/normandie', label: 'Normandie' },
    { href: '/regions/bourgogne-franche-comte', label: 'Bourgogne-Franche-Comté' },
    { href: '/regions/centre-val-de-loire', label: 'Centre-Val de Loire' },
    { href: '/regions/corse', label: 'Corse' },
  ]

  // Rénovation énergétique — primes CEE, artisans RGE, attribution ADEME
  const renovationLinks: FooterLink[] = [
    { href: '/cee', label: 'Primes CEE' },
    { href: '/rge', label: 'Artisans RGE' },
    { href: '/rge/qualifications', label: 'Qualifications RGE' },
    { href: '/cee/coup-de-pouce-2026', label: 'Coup de pouce 2026' },
    { href: '/cee/mandataire-vs-direct', label: 'Mandataire vs direct' },
    { href: '/maprimerenov-cumulaison-cee', label: 'Cumul MaPrimeRénov’ & CEE' },
    { href: '/rge/comment-devenir-rge', label: 'Devenir artisan RGE' },
    { href: '/rge/fraude-rge-comment-verifier', label: 'Vérifier un RGE' },
    { href: '/rge/tarifs-audit-energetique', label: 'Tarifs audit énergétique' },
    { href: '/rge/sources', label: 'Sources & méthodologie' },
    { href: '/ademe', label: 'Données ADEME' },
  ]

  // Top combinaisons service×ville — 20 liens
  const comboLinks: FooterLink[] = COMBO_SERVICES.flatMap((s) =>
    COMBO_CITIES.map((c) => ({
      href: `/services/${s.slug}/${c.slug}`,
      label: `${s.name} ${c.name}`,
    }))
  )

  return (
    <>
      {/* ─── Cluster links (services, villes, ressources) ─── */}
      <div className="border-b border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Services populaires */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-3 text-xs uppercase tracking-[0.15em]">
                Services les plus recherchés
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {serviceLinks.map((link) => (
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

            {/* Villes populaires */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-3 text-xs uppercase tracking-[0.15em]">
                Grandes villes
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {cityLinks.map((link) => (
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

            {/* Régions */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-3 text-xs uppercase tracking-[0.15em]">
                Régions
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {regionLinks.map((link) => (
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
                {utilityLinks.map((link) => (
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

            {/* Rénovation énergétique — primes CEE, RGE, ADEME */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-3 text-xs uppercase tracking-[0.15em]">
                Rénovation énergétique
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {renovationLinks.map((link) => (
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

      {/* ─── Transparence E-E-A-T (méthodo, sources, études, normes, garantie) ─── */}
      <div className="border-b border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h4 className="text-white font-heading font-semibold mb-3 text-xs uppercase tracking-[0.15em]">
            Transparence & méthodologie
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {trustLinks.map((link) => (
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

      {/* ─── Top combinaisons service × ville (20 liens pill) ─── */}
      <div className="border-b border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h4 className="text-white font-heading font-semibold mb-4 text-xs uppercase tracking-[0.15em]">
            Top combinaisons
          </h4>
          <div className="flex flex-wrap gap-2">
            {comboLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-block text-xs text-sand-400 hover:text-primary-400 bg-charcoal-700/50 hover:bg-charcoal-700 rounded-full px-3 py-1.5 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
