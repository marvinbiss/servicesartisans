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
  { name: 'Recherche', href: '/recherche' },
  { name: 'Comment ça marche', href: '/comment-ca-marche' },
]

// Information links
const informationLinks = [
  { name: 'À propos', href: '/a-propos' },
  { name: 'Contact', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Blog', href: '/blog' },
  { name: 'Tarifs artisans', href: '/tarifs-artisans' },
  { name: 'CGV', href: '/cgv' },
  { name: 'Mentions légales', href: '/mentions-legales' },
  { name: 'Confidentialité', href: '/confidentialite' },
]

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-gray-400" role="contentinfo">
      {/* Newsletter Section Premium */}
      <div className="border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 overflow-hidden">
            <div className="text-center lg:text-left">
              <h3 className="font-heading text-2xl font-bold text-white mb-2 tracking-tight">Restez informé</h3>
              <p className="text-blue-100">Recevez nos conseils et offres exclusives</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Trust Badges Premium */}
      <div className="border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="w-12 h-12 bg-emerald-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">350 000+ artisans</p>
                <p className="text-gray-500 text-xs">Référencés par SIREN</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="w-12 h-12 bg-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">101 départements</p>
                <p className="text-gray-500 text-xs">Couverture nationale</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">100% gratuit</p>
                <p className="text-gray-500 text-xs">Sans engagement</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="w-12 h-12 bg-purple-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Données officielles</p>
                <p className="text-gray-500 text-xs">API gouvernementale</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Internal Links Section */}
      <div className="border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Services populaires */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services populaires</h4>
              <ul className="space-y-2 text-sm">
                {popularServices.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link href="/services" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group">
                    Tous les services
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Villes populaires */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Villes populaires</h4>
              <ul className="space-y-2 text-sm">
                {popularCities.map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={`/villes/${city.slug}`}
                      className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link href="/villes" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group">
                    Toutes les villes
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Par région */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Par région
              </h4>
              <ul className="space-y-2 text-sm">
                {popularRegions.map((region) => (
                  <li key={region.slug}>
                    <Link
                      href={`/regions/${region.slug}`}
                      className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      {region.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link href="/regions" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group">
                    Toutes les régions
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link href="/departements" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group">
                    Tous les départements
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Navigation & Informations */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2 text-sm">
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <svg
                width="44"
                height="44"
                viewBox="0 0 48 48"
                fill="none"
                className="flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
              >
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="footerAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#footerLogoGrad)" />
                <path d="M24 10L9 22.5H13.5V36H34.5V22.5H39L24 10Z" fill="white" fillOpacity="0.95" />
                <path d="M21.5 24.5C21.5 22.57 23.07 21 25 21C26.38 21 27.56 21.82 28.1 22.99L31.5 20.5L32.5 21.5L29.1 24.01C29.37 24.48 29.5 25.02 29.5 25.5C29.5 27.43 27.93 29 26 29C24.62 29 23.44 28.18 22.9 27.01L19.5 29.5L18.5 28.5L21.9 25.99C21.63 25.52 21.5 24.98 21.5 24.5Z" fill="#2563eb" />
                <rect x="21.5" y="29.5" width="5" height="6.5" rx="1.5" fill="#2563eb" fillOpacity="0.25" />
                <circle cx="39" cy="9" r="5" fill="url(#footerAccent)" />
                <path d="M37.5 9L38.5 10L40.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-2xl font-heading font-extrabold tracking-tight text-white">
                Services<span className="text-primary-400">Artisans</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-gray-400">
              Le plus grand annuaire d&apos;artisans référencés de France. 350 000+ professionnels
              référencés via les données SIREN officielles dans 101 départements.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com/servicesartisans" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-300 group" aria-label="Facebook">
                <Facebook className="w-5 h-5 group-hover:text-white" />
              </a>
              <a href="https://twitter.com/servicesartisans" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-300 group" aria-label="Twitter">
                <Twitter className="w-5 h-5 group-hover:text-white" />
              </a>
              <a href="https://linkedin.com/company/servicesartisans" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-300 group" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5 group-hover:text-white" />
              </a>
              <a href="https://instagram.com/servicesartisans" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-300 group" aria-label="Instagram">
                <Instagram className="w-5 h-5 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Informations */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Informations</h4>
            <ul className="space-y-3 text-sm">
              {informationLinks.slice(0, 6).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 rounded-lg hover:from-amber-500/30 hover:to-amber-600/30 transition-all mt-2 group">
                  Voir les services
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Entreprise</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/a-propos" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/carrieres" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  Carrières
                </Link>
              </li>
              <li>
                <Link href="/presse" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  Presse
                </Link>
              </li>
              <li>
                <Link href="/partenaires" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  Partenaires
                </Link>
              </li>
              <li>
                <Link href="/inscription-artisan" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  Devenir partenaire
                </Link>
              </li>
              <li>
                <Link href="/notre-processus-de-verification" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  Processus de vérification
                </Link>
              </li>
              <li>
                <Link href="/politique-avis" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  Politique des avis
                </Link>
              </li>
              <li>
                <Link href="/mediation" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  Médiation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Juridique</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/mentions-legales" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/accessibilite" className="text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                  Accessibilité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact section */}
        <div className="mt-16 pt-10 border-t border-gray-800">
          <div className="grid md:grid-cols-3 gap-8">
            {companyIdentity.address && (
              <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium mb-0.5">Adresse</p>
                  <span className="text-sm text-gray-400">{companyIdentity.address}</span>
                </div>
              </div>
            )}
            {companyIdentity.phone && (
              <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium mb-0.5">Téléphone</p>
                  <a href={`tel:${companyIdentity.phone}`} className="text-sm text-gray-400 hover:text-white transition-colors">{companyIdentity.phone}</a>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-0.5">Email</p>
                <a href={`mailto:${companyIdentity.email}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {companyIdentity.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar Premium */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} <span className="text-gray-400">ServicesArtisans</span>. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <Link href="/mentions-legales" className="hover:text-white transition-colors duration-200">
                Mentions légales
              </Link>
              <Link href="/confidentialite" className="hover:text-white transition-colors duration-200">
                Confidentialité
              </Link>
              <Link href="/cgv" className="hover:text-white transition-colors duration-200">
                CGV
              </Link>
              <Link href="/accessibilite" className="hover:text-white transition-colors duration-200">
                Accessibilité
              </Link>
              <Link href="/faq" className="hover:text-white transition-colors duration-200">
                FAQ
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors duration-200">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
