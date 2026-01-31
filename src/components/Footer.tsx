import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

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
    <footer className="bg-gray-900 text-gray-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SA</span>
              </div>
              <span className="text-xl font-bold text-white">
                Services<span className="text-blue-400">Artisans</span>
              </span>
            </Link>
            <p className="text-sm mb-6">
              La plateforme de référence pour trouver les meilleurs artisans près de chez vous.
              Plus de 120 000 professionnels vérifiés.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="hover:text-white transition-colors">
                    {service.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/urgence" className="text-red-400 hover:text-red-300">
                  Urgences 24h/24
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-blue-400 hover:text-blue-300">
                  Tous les services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Localisation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Localisation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/regions" className="hover:text-white transition-colors">
                  Toutes les régions
                </Link>
              </li>
              <li>
                <Link href="/departements" className="hover:text-white transition-colors">
                  Tous les départements
                </Link>
              </li>
              <li>
                <Link href="/villes" className="hover:text-white transition-colors">
                  Toutes les villes
                </Link>
              </li>
              <li className="pt-2 border-t border-gray-800 mt-2">
                <span className="text-gray-500 text-xs">Villes populaires</span>
              </li>
              {villes.slice(0, 4).map((ville) => (
                <li key={ville.slug}>
                  <Link href={`/villes/${ville.slug}`} className="hover:text-white transition-colors">
                    {ville.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/comment-ca-marche" className="hover:text-white transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/avis" className="hover:text-white transition-colors">
                  Avis clients
                </Link>
              </li>
              <li>
                <Link href="/tarifs-artisans" className="hover:text-white transition-colors">
                  Tarifs artisans
                </Link>
              </li>
              <li>
                <Link href="/inscription-artisan" className="hover:text-white transition-colors">
                  Devenir partenaire
                </Link>
              </li>
              <li>
                <Link href="/devis" className="text-blue-400 hover:text-blue-300">
                  Demander un devis →
                </Link>
              </li>
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-white font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/a-propos" className="hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/carrieres" className="hover:text-white transition-colors">
                  Carrières
                </Link>
              </li>
              <li>
                <Link href="/presse" className="hover:text-white transition-colors">
                  Presse
                </Link>
              </li>
              <li>
                <Link href="/partenaires" className="hover:text-white transition-colors">
                  Partenaires
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li className="pt-2 border-t border-gray-800 mt-2">
                <span className="text-gray-500 text-xs">Légal</span>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:text-white transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-white transition-colors">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Adresse</p>
                <span className="text-sm">123 Avenue des Artisans<br />75001 Paris</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Téléphone</p>
                <a href="tel:0123456789" className="text-sm hover:text-white">01 23 45 67 89</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">Email</p>
                <a href="mailto:contact@servicesartisans.fr" className="text-sm hover:text-white">
                  contact@servicesartisans.fr
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>
              © {new Date().getFullYear()} ServicesArtisans. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/mentions-legales" className="hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link href="/confidentialite" className="hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link href="/cgv" className="hover:text-white transition-colors">
                CGV
              </Link>
              <Link href="/accessibilite" className="hover:text-white transition-colors">
                Accessibilité
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
