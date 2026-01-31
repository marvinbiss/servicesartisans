import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram, Shield, CreditCard, Award, ArrowRight } from 'lucide-react'

const services = [
  { name: 'Plombier', slug: 'plombier' },
  { name: 'Électricien', slug: 'electricien' },
  { name: 'Serrurier', slug: 'serrurier' },
  { name: 'Chauffagiste', slug: 'chauffagiste' },
  { name: 'Peintre', slug: 'peintre' },
  { name: 'Couvreur', slug: 'couvreur' },
]

const villes = [
  { name: 'Paris', slug: 'paris' },
  { name: 'Lyon', slug: 'lyon' },
  { name: 'Marseille', slug: 'marseille' },
  { name: 'Toulouse', slug: 'toulouse' },
  { name: 'Bordeaux', slug: 'bordeaux' },
  { name: 'Nantes', slug: 'nantes' },
]

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-gray-400">
      {/* Newsletter Section Premium */}
      <div className="border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary-600/10 via-primary-500/5 to-transparent rounded-2xl p-8 border border-primary-500/20">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Restez informé</h3>
              <p className="text-gray-400">Recevez nos conseils et offres exclusives</p>
            </div>
            <div className="flex w-full max-w-md gap-3">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-5 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <button className="px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 whitespace-nowrap">
                S&apos;inscrire
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Premium */}
      <div className="border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Artisans vérifiés</p>
                <p className="text-gray-500 text-xs">Qualifications contrôlées</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Paiement sécurisé</p>
                <p className="text-gray-500 text-xs">SSL & 3D Secure</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Satisfaction garantie</p>
                <p className="text-gray-500 text-xs">97% clients satisfaits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Support 7j/7</p>
                <p className="text-gray-500 text-xs">Assistance dédiée</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                  <span className="text-white font-bold text-xl">SA</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">
                  Services<span className="text-primary-400">Artisans</span>
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-gray-400">
              La plateforme de référence pour trouver les meilleurs artisans près de chez vous.
              <span className="text-white font-medium"> Plus de 120 000 professionnels vérifiés</span> à votre service.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-11 h-11 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-300 group">
                <Facebook className="w-5 h-5 group-hover:text-white" />
              </a>
              <a href="#" className="w-11 h-11 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-300 group">
                <Twitter className="w-5 h-5 group-hover:text-white" />
              </a>
              <a href="#" className="w-11 h-11 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-300 group">
                <Linkedin className="w-5 h-5 group-hover:text-white" />
              </a>
              <a href="#" className="w-11 h-11 bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-300 group">
                <Instagram className="w-5 h-5 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">
                    {service.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/urgence" className="text-red-400 hover:text-red-300 flex items-center gap-1 group">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Urgences 24h/24
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 group">
                  Tous les services
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Localisation */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Localisation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/regions" className="hover:text-white transition-colors duration-200">
                  Toutes les régions
                </Link>
              </li>
              <li>
                <Link href="/departements" className="hover:text-white transition-colors duration-200">
                  Tous les départements
                </Link>
              </li>
              <li>
                <Link href="/villes" className="hover:text-white transition-colors duration-200">
                  Toutes les villes
                </Link>
              </li>
              <li className="pt-3 border-t border-slate-800 mt-3">
                <span className="text-gray-500 text-xs uppercase tracking-wider">Villes populaires</span>
              </li>
              {villes.slice(0, 4).map((ville) => (
                <li key={ville.slug}>
                  <Link href={`/villes/${ville.slug}`} className="hover:text-white transition-colors duration-200">
                    {ville.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Informations</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/comment-ca-marche" className="hover:text-white transition-colors duration-200">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/avis" className="hover:text-white transition-colors duration-200">
                  Avis clients
                </Link>
              </li>
              <li>
                <Link href="/tarifs-artisans" className="hover:text-white transition-colors duration-200">
                  Tarifs artisans
                </Link>
              </li>
              <li>
                <Link href="/inscription-artisan" className="hover:text-white transition-colors duration-200">
                  Devenir partenaire
                </Link>
              </li>
              <li>
                <Link href="/devis" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 rounded-lg hover:from-amber-500/30 hover:to-amber-600/30 transition-all mt-2 group">
                  Demander un devis
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
                <Link href="/a-propos" className="hover:text-white transition-colors duration-200">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/carrieres" className="hover:text-white transition-colors duration-200">
                  Carrières
                </Link>
              </li>
              <li>
                <Link href="/presse" className="hover:text-white transition-colors duration-200">
                  Presse
                </Link>
              </li>
              <li>
                <Link href="/partenaires" className="hover:text-white transition-colors duration-200">
                  Partenaires
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li className="pt-3 border-t border-slate-800 mt-3">
                <span className="text-gray-500 text-xs uppercase tracking-wider">Légal</span>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:text-white transition-colors duration-200">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:text-white transition-colors duration-200">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-white transition-colors duration-200">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact section */}
        <div className="mt-16 pt-10 border-t border-slate-800/50">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-0.5">Adresse</p>
                <span className="text-sm text-gray-400">42 Rue de la République, 75011 Paris</span>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-0.5">Téléphone</p>
                <a href="tel:+33184800000" className="text-sm text-gray-400 hover:text-white transition-colors">01 84 80 00 00</a>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-0.5">Email</p>
                <a href="mailto:contact@servicesartisans.fr" className="text-sm text-gray-400 hover:text-white transition-colors">
                  contact@servicesartisans.fr
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar Premium */}
      <div className="border-t border-slate-800/50 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-500">
              © {new Date().getFullYear()} <span className="text-gray-400">ServicesArtisans</span>. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-gray-500">
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
