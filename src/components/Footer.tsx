import Link from 'next/link'
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Shield,
  CreditCard,
  Award,
  Building2,
} from 'lucide-react'
import NewsletterForm from './NewsletterForm'
import { companyIdentity } from '@/lib/config/company-identity'
import { formatPhoneForTel } from '@/lib/validation/phone'
import { PlatformPhoneLabel } from '@/components/ui/PlatformPhoneLabel'
import FooterClusterLinks from '@/components/seo/FooterClusterLinks'
import DynamicFooterLinks from '@/components/seo/DynamicFooterLinks'

// Navigation links — money pages & essential hubs only (link equity optimization)
// Audit P0 2026-05-03 : ajout `/barometre/rge` pour sortir le hub sitemap
// de l'état orphan (0 lien interne entrant détecté).
// Sprint T Ahrefs 2026-05-03 : ajout `/rge/glossaire` (entité canonique
// DefinedTermSet Sprint O) — boost interne sitewide (~459K pages × 1 lien).
// Sprint U Ahrefs 2026-05-03 : fix lien cassé `/qualifications-rge` (route
// inexistante, 404 sur 459K pages) → `/rge/qualifications` (hub réel).
// Sprint W Ahrefs 2026-05-03 : retrait du lien `/comparatifs` (route jamais
// créée — 459K pages × 1 lien 404 sortant). Le 301 vers `/comparaison`
// (page existante la plus proche) est actif via gone-paths.ts bloc 14
// pour préserver tout backlink externe résiduel.
const navigationLinks = [
  { name: 'Services', href: '/services' },
  { name: 'Tarifs', href: '/tarifs' },
  { name: 'Devis gratuit', href: '/devis' },
  { name: 'Rénovation énergétique', href: '/renovation-energetique' },
  { name: 'Aides 2026', href: '/aides' },
  { name: 'Artisans RGE', href: '/rge' },
  { name: 'Qualifications RGE', href: '/rge/qualifications' },
  { name: 'Glossaire RGE', href: '/rge/glossaire' },
  { name: 'Baromètre RGE', href: '/barometre/rge' },
  { name: 'Problèmes & dépannages', href: '/problemes' },
  { name: 'Départements', href: '/departements' },
  { name: 'Villes', href: '/villes' },
  { name: '36 000 communes (open data)', href: '/communes' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Devenir partenaire', href: '/inscription-artisan' },
]

export default function Footer() {
  return (
    <footer className="relative bg-charcoal-900 text-sand-400" role="contentinfo">
      {/* Top gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-charcoal-700/50 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-charcoal-800/80 to-transparent pointer-events-none" />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]"
        aria-hidden="true"
      />

      {/* ─── Cluster Links (SEO — PageRank equity to top clusters + cities + resources) ── */}
      <FooterClusterLinks />

      {/* Dynamic rotating money page links (SEO — PageRank equity distribution) */}
      <DynamicFooterLinks />

      {/* Newsletter Section Premium */}
      <div className="relative border-b border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl p-8 lg:p-10 overflow-hidden shadow-2xl shadow-primary-900/30">
            {/* Decorative gradient orbs */}
            <div
              className="absolute -top-20 -right-20 w-60 h-60 bg-primary-300/20 rounded-full blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary-200/15 rounded-full blur-3xl"
              aria-hidden="true"
            />
            <div className="relative text-center lg:text-left">
              <h3 className="font-heading text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">
                Restez informé
              </h3>
              <p className="text-white/80 text-base">Recevez nos conseils et offres exclusives</p>
            </div>
            <div className="relative w-full lg:w-auto">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Premium */}
      <div className="relative border-b border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
            <div className="group flex items-center gap-3.5 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm rounded-2xl border border-charcoal-700 hover:border-charcoal-600 p-5 transition-all duration-300">
              <div className="w-12 h-12 bg-accent-500/10 group-hover:bg-accent-500/15 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <Shield className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Artisans référencés SIREN</p>
                <p className="text-sand-500 text-xs mt-0.5">Identité vérifiée</p>
              </div>
            </div>
            <div className="group flex items-center gap-3.5 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm rounded-2xl border border-charcoal-700 hover:border-charcoal-600 p-5 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-400/10 group-hover:bg-primary-400/15 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <Building2 className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">101 départements</p>
                <p className="text-sand-500 text-xs mt-0.5">Couverture nationale</p>
              </div>
            </div>
            <div className="group flex items-center gap-3.5 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm rounded-2xl border border-charcoal-700 hover:border-charcoal-600 p-5 transition-all duration-300">
              <div className="w-12 h-12 bg-secondary-500/10 group-hover:bg-secondary-500/15 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <Award className="w-6 h-6 text-secondary-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">100% gratuit</p>
                <p className="text-sand-500 text-xs mt-0.5">Sans engagement</p>
              </div>
            </div>
            <div className="group flex items-center gap-3.5 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm rounded-2xl border border-charcoal-700 hover:border-charcoal-600 p-5 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-400/10 group-hover:bg-primary-400/15 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <CreditCard className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Devis gratuit</p>
                <p className="text-sand-500 text-xs mt-0.5">Comparez jusqu'à 3 offres</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact footer navigation — reduced to essential links only (PageRank optimization) */}

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                className="flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
              >
                <defs>
                  <linearGradient
                    id="footerBg"
                    x1="0"
                    y1="0"
                    x2="48"
                    y2="48"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#E86B4B" />
                    <stop offset="1" stopColor="#C24B2A" />
                  </linearGradient>
                  <radialGradient id="footerShine" cx=".32" cy=".26" r=".65">
                    <stop stopColor="#fff" stopOpacity=".16" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#footerBg)" />
                <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#footerShine)" />
                <path
                  fillRule="evenodd"
                  fill="#fff"
                  fillOpacity="0.95"
                  d="M24 11 L38.5 24 L35 24 L35 37 L13 37 L13 24 L9.5 24Z M21 37 V29 A3 3 0 0 1 27 29 V37Z"
                />
              </svg>
              <span className="text-2xl font-heading font-extrabold tracking-tight text-white group-hover:text-sand-200 transition-colors duration-200">
                Services<span className="text-primary-400">Artisans</span>
              </span>
            </Link>
            <p className="text-sm text-sand-300 mb-2 font-medium">
              La plateforme de confiance pour trouver votre artisan
            </p>
            <p className="text-sm leading-relaxed mb-8 text-sand-400/80">
              {companyIdentity.description}
            </p>
            <div className="flex gap-2.5">
              <a
                href="https://facebook.com/servicesartisans"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center hover:bg-primary-400 hover:scale-110 border border-charcoal-700 hover:border-primary-400 transition-all duration-300 group"
                aria-label="Facebook"
              >
                <Facebook className="w-[18px] h-[18px] text-sand-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a
                href="https://x.com/servicesartisans"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center hover:bg-primary-400 hover:scale-110 border border-charcoal-700 hover:border-primary-400 transition-all duration-300 group"
                aria-label="X"
              >
                <Twitter className="w-[18px] h-[18px] text-sand-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a
                href="https://linkedin.com/company/servicesartisans"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center hover:bg-primary-400 hover:scale-110 border border-charcoal-700 hover:border-primary-400 transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-[18px] h-[18px] text-sand-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a
                href="https://instagram.com/servicesartisans"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center hover:bg-primary-400 hover:scale-110 border border-charcoal-700 hover:border-primary-400 transition-all duration-300 group"
                aria-label="Instagram"
              >
                <Instagram className="w-[18px] h-[18px] text-sand-400 group-hover:text-white transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* Navigation — money pages & essential hubs */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2">
            <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em]">
              Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em]">
              Juridique
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/cgv"
                  className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                >
                  CGV
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                >
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibilite"
                  className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                >
                  Accessibilité
                </Link>
              </li>
              <li>
                <Link
                  href="/droit-acces"
                  className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                >
                  Droit d&apos;accès
                </Link>
              </li>
              <li>
                <Link
                  href="/droit-opposition"
                  className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                >
                  Droit d&apos;opposition
                </Link>
              </li>
              <li>
                <Link
                  href="/violation-donnees"
                  className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                >
                  Violation de données
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact section */}
        <div className="mt-16 pt-10 border-t border-charcoal-700">
          <div className="grid md:grid-cols-3 gap-6">
            {companyIdentity.address && (
              <div className="group flex items-center gap-4 p-5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-charcoal-700 hover:border-charcoal-600 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-400/10 group-hover:bg-primary-400/15 rounded-xl flex items-center justify-center transition-colors duration-300">
                  <MapPin className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm mb-0.5">Adresse</p>
                  <span className="text-sm text-sand-400">{companyIdentity.address}</span>
                </div>
              </div>
            )}
            {companyIdentity.phone && (
              <div className="group flex items-center gap-4 p-5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-charcoal-700 hover:border-charcoal-600 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-400/10 group-hover:bg-primary-400/15 rounded-xl flex items-center justify-center transition-colors duration-300">
                  <Phone className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm mb-0.5">Téléphone</p>
                  <a
                    href={`tel:${formatPhoneForTel(companyIdentity.phone)}`}
                    className="text-sm text-sand-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    {companyIdentity.phone}
                  </a>
                  <PlatformPhoneLabel variant="inline" className="mt-1" />
                </div>
              </div>
            )}
            <div className="group flex items-center gap-4 p-5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-charcoal-700 hover:border-charcoal-600 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-400/10 group-hover:bg-primary-400/15 rounded-xl flex items-center justify-center transition-colors duration-300">
                <Mail className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-0.5">Email</p>
                <a
                  href={`mailto:${companyIdentity.email}`}
                  className="text-sm text-sand-400 hover:text-primary-400 transition-colors duration-200"
                >
                  {companyIdentity.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal separator before copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-charcoal-700/60 to-transparent" />
      </div>

      {/* Bottom Bar */}
      <div className="relative bg-charcoal-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-sand-500">
              &copy; {new Date().getFullYear()}{' '}
              <span className="text-sand-300 font-medium">ServicesArtisans</span>. Tous droits
              réservés.
              <span className="hidden sm:inline">
                {' '}
                — Données mises à jour en {new Date().getFullYear()}
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-sand-500">
              <Link
                href="/plan-du-site"
                className="hover:text-primary-400 transition-colors duration-200 py-1.5"
              >
                Plan du site
              </Link>
              <Link
                href="/datasets/rge"
                className="hover:text-primary-400 transition-colors duration-200 py-1.5"
              >
                Dataset RGE
              </Link>
              <Link
                href="/developpeurs"
                className="hover:text-primary-400 transition-colors duration-200 py-1.5"
              >
                API développeurs
              </Link>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-charcoal-800/60 text-xs text-sand-500/80 text-center">
            Données RGE&nbsp;: Source ADEME — France Rénov&apos; · Licence{' '}
            <a
              href="https://data.ademe.fr/datasets/liste-des-entreprises-rge-2"
              target="_blank"
              rel="noopener nofollow"
              className="underline hover:text-primary-400 transition-colors duration-200"
            >
              Etalab 2.0
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
