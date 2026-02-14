import Link from 'next/link'
import { popularServices, popularCities } from '@/lib/constants/navigation'
import { companyIdentity } from '@/lib/config/company-identity'

const informationLinks = [
  { name: 'À propos', href: '/a-propos' },
  { name: 'Comment ça marche', href: '/comment-ca-marche' },
  { name: 'Blog', href: '/blog' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Tarifs artisans', href: '/tarifs-artisans' },
  { name: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-900" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Logo & description */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <svg
              width="36"
              height="36"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="44" height="44" rx="14" fill="#3b82f6" />
              <path d="M24 10L9 22.5H13.5V36H34.5V22.5H39L24 10Z" fill="white" fillOpacity="0.95" />
              <path d="M21.5 24.5C21.5 22.57 23.07 21 25 21C26.38 21 27.56 21.82 28.1 22.99L31.5 20.5L32.5 21.5L29.1 24.01C29.37 24.48 29.5 25.02 29.5 25.5C29.5 27.43 27.93 29 26 29C24.62 29 23.44 28.18 22.9 27.01L19.5 29.5L18.5 28.5L21.9 25.99C21.63 25.52 21.5 24.98 21.5 24.5Z" fill="#2563eb" />
              <rect x="21.5" y="29.5" width="5" height="6.5" rx="1.5" fill="#2563eb" fillOpacity="0.25" />
              <circle cx="39" cy="9" r="5" fill="#f59e0b" />
              <path d="M37.5 9L38.5 10L40.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-heading font-bold tracking-tight text-white">
              ServicesArtisans
            </span>
          </Link>
          <p className="text-sm text-slate-400 max-w-md">
            {companyIdentity.description}
          </p>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Services */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-white uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5">
              {popularServices.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Tous les services
                </Link>
              </li>
            </ul>
          </div>

          {/* Villes populaires */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-white uppercase tracking-wider mb-4">Villes populaires</h4>
            <ul className="space-y-2.5">
              {popularCities.slice(0, 8).map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/villes/${city.slug}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/villes" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Toutes les villes
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-white uppercase tracking-wider mb-4">Informations</h4>
            <ul className="space-y-2.5">
              {informationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-heading font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${companyIdentity.email}`}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {companyIdentity.email}
                </a>
              </li>
              {companyIdentity.phone && (
                <li>
                  <a
                    href={`tel:${companyIdentity.phone}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {companyIdentity.phone}
                  </a>
                </li>
              )}
              {companyIdentity.address && (
                <li>
                  <span className="text-sm text-slate-400">
                    {companyIdentity.address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              &copy; 2024 ServicesArtisans. Tous droits réservés.
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Link href="/mentions-legales" className="hover:text-white transition-colors">
                Mentions légales
              </Link>
              <span>&middot;</span>
              <Link href="/confidentialite" className="hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <span>&middot;</span>
              <Link href="/cgv" className="hover:text-white transition-colors">
                CGU
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
