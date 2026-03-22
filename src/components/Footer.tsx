import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram, Shield, CreditCard, Award, ArrowRight, Building2 } from 'lucide-react'
import { popularServices, popularCities, popularRegions } from '@/lib/constants/navigation'
import NewsletterForm from './NewsletterForm'
import { companyIdentity } from '@/lib/config/company-identity'

// Navigation links
const navigationLinks = [
  { name: 'Accueil', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Villes', href: '/villes' },
  { name: 'Carte des artisans', href: '/carte-artisans' },
  { name: 'Recherche', href: '/recherche' },
  { name: 'Comment ça marche', href: '/comment-ca-marche' },
]

// Outils links
const outilsLinks = [
  { name: 'Calculateur de prix', href: '/outils/calculateur-prix' },
  { name: 'Diagnostic artisan', href: '/outils/diagnostic' },
  { name: 'Carte des artisans', href: '/carte-artisans' },
  { name: 'Tarifs artisans', href: '/tarifs' },
  { name: 'Demander un devis', href: '/devis' },
  { name: 'Urgence artisan', href: '/urgence' },
  { name: 'Problèmes courants', href: '/problemes' },
  { name: 'Vérifier un artisan', href: '/verifier-artisan' },
  { name: 'Statistiques artisans', href: '/statistiques-artisans-france' },
  { name: 'Widget pour artisans', href: '/widget' },
]

// Information links
const informationLinks = [
  { name: 'À propos', href: '/a-propos' },
  { name: 'Contact', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Blog', href: '/blog' },
  { name: 'Guides travaux', href: '/guides' },
  { name: 'Avis artisans', href: '/avis' },
]


export default function Footer() {
  return (
    <footer className="relative bg-charcoal-900 text-sand-400" role="contentinfo">
      {/* Top gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-charcoal-700/50 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-charcoal-800/80 to-transparent pointer-events-none" />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" aria-hidden="true" />

      {/* Newsletter Section Premium */}
      <div className="relative border-b border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl p-8 lg:p-10 overflow-hidden shadow-2xl shadow-primary-900/30">
            {/* Decorative gradient orbs */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-300/20 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary-200/15 rounded-full blur-3xl" aria-hidden="true" />
            <div className="relative text-center lg:text-left">
              <h3 className="font-heading text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">Restez informé</h3>
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
                <p className="text-sand-500 text-xs mt-0.5">Référencés par SIREN</p>
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
                <p className="text-sand-500 text-xs mt-0.5">Sans engagement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Internal Links Section */}
      <nav className="relative border-b border-charcoal-700" aria-label="Liens populaires">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Desktop: full grid visible */}
          <div className="hidden md:grid md:grid-cols-6 gap-8 lg:gap-12">
            {/* Services populaires */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em]">Services populaires</h4>
              <ul className="space-y-3 text-sm">
                {popularServices.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link href="/services" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group py-1.5">
                    Tous les services
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Villes populaires */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em]">Villes populaires</h4>
              <ul className="space-y-3 text-sm">
                {popularCities.map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={`/villes/${city.slug}`}
                      className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link href="/villes" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group py-1.5">
                    Toutes les villes
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Par région */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em] flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-charcoal-400" />
                Par région
              </h4>
              <ul className="space-y-3 text-sm">
                {popularRegions.map((region) => (
                  <li key={region.slug}>
                    <Link
                      href={`/regions/${region.slug}`}
                      className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5"
                    >
                      {region.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link href="/regions" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group py-1.5">
                    Toutes les régions
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link href="/departements" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group py-1.5">
                    Tous les départements
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Outils */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em]">Outils gratuits</h4>
              <ul className="space-y-3 text-sm">
                {outilsLinks.map((link) => (
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

            {/* Ressources */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em]">Ressources</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/guides" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">Guides travaux</Link></li>
                <li><Link href="/questions" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">Questions fréquentes</Link></li>
                <li><Link href="/comparaison" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">Comparatifs artisans</Link></li>
                <li><Link href="/barometre" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">Baromètre des prix</Link></li>
                <li><Link href="/glossaire" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">Glossaire</Link></li>
                <li><Link href="/statistiques-artisans-france" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">Statistiques artisans</Link></li>
              </ul>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em]">Navigation</h4>
              <ul className="space-y-3 text-sm">
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
          </div>

          {/* Mobile: collapsible accordions */}
          <div className="md:hidden space-y-2">
            <details className="group border border-charcoal-700 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-heading font-semibold text-xs uppercase tracking-[0.15em] hover:bg-white/[0.03] transition-colors">
                Services populaires
                <ArrowRight className="w-4 h-4 text-charcoal-400 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <ul className="space-y-1 text-sm px-5 pb-4">
                {popularServices.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <Link href="/services" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group py-1.5">
                    Tous les services
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </details>

            <details className="group border border-charcoal-700 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-heading font-semibold text-xs uppercase tracking-[0.15em] hover:bg-white/[0.03] transition-colors">
                Villes populaires
                <ArrowRight className="w-4 h-4 text-charcoal-400 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <ul className="space-y-1 text-sm px-5 pb-4">
                {popularCities.map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={`/villes/${city.slug}`}
                      className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <Link href="/villes" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group py-1.5">
                    Toutes les villes
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </details>

            <details className="group border border-charcoal-700 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-heading font-semibold text-xs uppercase tracking-[0.15em] hover:bg-white/[0.03] transition-colors">
                <span className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-charcoal-400" />
                  Par région
                </span>
                <ArrowRight className="w-4 h-4 text-charcoal-400 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <ul className="space-y-1 text-sm px-5 pb-4">
                {popularRegions.map((region) => (
                  <li key={region.slug}>
                    <Link
                      href={`/regions/${region.slug}`}
                      className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5"
                    >
                      {region.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <Link href="/regions" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group py-1.5">
                    Toutes les régions
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link href="/departements" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group py-1.5">
                    Tous les départements
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </details>

            <details className="group border border-charcoal-700 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-heading font-semibold text-xs uppercase tracking-[0.15em] hover:bg-white/[0.03] transition-colors">
                Outils gratuits
                <ArrowRight className="w-4 h-4 text-charcoal-400 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <ul className="space-y-1 text-sm px-5 pb-4">
                {outilsLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>

            <details className="group border border-charcoal-700 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-heading font-semibold text-xs uppercase tracking-[0.15em] hover:bg-white/[0.03] transition-colors">
                Ressources
                <ArrowRight className="w-4 h-4 text-charcoal-400 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <ul className="space-y-1 text-sm px-5 pb-4">
                <li><Link href="/guides" className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5">Guides travaux</Link></li>
                <li><Link href="/questions" className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5">Questions fréquentes</Link></li>
                <li><Link href="/comparaison" className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5">Comparatifs artisans</Link></li>
                <li><Link href="/barometre" className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5">Baromètre des prix</Link></li>
                <li><Link href="/glossaire" className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5">Glossaire</Link></li>
                <li><Link href="/statistiques-artisans-france" className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5">Statistiques artisans</Link></li>
              </ul>
            </details>

            <details className="group border border-charcoal-700 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-heading font-semibold text-xs uppercase tracking-[0.15em] hover:bg-white/[0.03] transition-colors">
                Navigation
                <ArrowRight className="w-4 h-4 text-charcoal-400 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <ul className="space-y-1 text-sm px-5 pb-4">
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sand-400 hover:text-primary-400 transition-all duration-200 inline-block py-1.5"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </nav>

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
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
                  <linearGradient id="footerBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
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
                <path fillRule="evenodd" fill="#fff" fillOpacity="0.95" d="M24 11 L38.5 24 L35 24 L35 37 L13 37 L13 24 L9.5 24Z M21 37 V29 A3 3 0 0 1 27 29 V37Z" />
              </svg>
              <span className="text-2xl font-heading font-extrabold tracking-tight text-white group-hover:text-sand-200 transition-colors duration-200">
                Services<span className="text-primary-400">Artisans</span>
              </span>
            </Link>
            <p className="text-sm text-sand-300 mb-2 font-medium">La plateforme de confiance pour trouver votre artisan</p>
            <p className="text-sm leading-relaxed mb-8 text-sand-400/80">
              {companyIdentity.description}
            </p>
            <div className="flex gap-2.5">
              <a href="https://facebook.com/servicesartisans" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center hover:bg-primary-400 hover:scale-110 border border-charcoal-700 hover:border-primary-400 transition-all duration-300 group" aria-label="Facebook">
                <Facebook className="w-[18px] h-[18px] text-sand-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="https://twitter.com/servicesartisans" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center hover:bg-primary-400 hover:scale-110 border border-charcoal-700 hover:border-primary-400 transition-all duration-300 group" aria-label="Twitter">
                <Twitter className="w-[18px] h-[18px] text-sand-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="https://linkedin.com/company/servicesartisans" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center hover:bg-primary-400 hover:scale-110 border border-charcoal-700 hover:border-primary-400 transition-all duration-300 group" aria-label="LinkedIn">
                <Linkedin className="w-[18px] h-[18px] text-sand-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a href="https://instagram.com/servicesartisans" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center hover:bg-primary-400 hover:scale-110 border border-charcoal-700 hover:border-primary-400 transition-all duration-300 group" aria-label="Instagram">
                <Instagram className="w-[18px] h-[18px] text-sand-400 group-hover:text-white transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* Informations */}
          <div>
            <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em]">Informations</h4>
            <ul className="space-y-3 text-sm">
              {informationLinks.slice(0, 6).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-400/15 text-primary-400 rounded-lg hover:bg-primary-400/25 transition-all mt-2 group">
                  Voir les services
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em]">Entreprise</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/inscription-artisan" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                  Devenir partenaire
                </Link>
              </li>
              <li>
                <Link href="/notre-processus-de-verification" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                  Processus de vérification
                </Link>
              </li>
              <li>
                <Link href="/garantie" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                  Notre garantie
                </Link>
              </li>
              <li>
                <Link href="/politique-avis" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                  Politique des avis
                </Link>
              </li>
              <li>
                <Link href="/mediation" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                  Médiation
                </Link>
              </li>
              <li>
                <Link href="/presse" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                  Espace presse
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-heading font-semibold mb-5 text-xs uppercase tracking-[0.15em]">Juridique</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/mentions-legales" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/accessibilite" className="text-sand-400 hover:text-primary-400 transition-all duration-200 hover:translate-x-1 inline-block py-1.5">
                  Accessibilité
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
                  <a href={`tel:${companyIdentity.phone}`} className="text-sm text-sand-400 hover:text-primary-400 transition-colors duration-200">{companyIdentity.phone}</a>
                </div>
              </div>
            )}
            <div className="group flex items-center gap-4 p-5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-charcoal-700 hover:border-charcoal-600 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-400/10 group-hover:bg-primary-400/15 rounded-xl flex items-center justify-center transition-colors duration-300">
                <Mail className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-0.5">Email</p>
                <a href={`mailto:${companyIdentity.email}`} className="text-sm text-sand-400 hover:text-primary-400 transition-colors duration-200">
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
              &copy; {new Date().getFullYear()} <span className="text-sand-300 font-medium">ServicesArtisans</span>. Tous droits réservés.
              <span className="hidden sm:inline"> &mdash; Données mises à jour en {new Date().getFullYear()}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-sand-500">
              <Link href="/plan-du-site" className="hover:text-primary-400 transition-colors duration-200 py-1.5">
                Plan du site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
