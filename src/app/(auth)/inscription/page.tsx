'use client'

/**
 * Décision produit 2026-06-05 : plus d'espace particulier. Les inscriptions
 * de comptes client sont fermées (/api/auth/signup renvoie 403, la connexion
 * role='client' est bloquée côté signin). La route reste servie pour les
 * bookmarks/liens externes mais affiche un écran de fermeture : les demandes
 * de devis se font sans compte, les artisans passent par /inscription-artisan.
 * Historique du formulaire : git log de ce fichier.
 */

import Link from 'next/link'
import { FileText, Wrench, ArrowRight, Info } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'

export default function InscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg w-full">
          <Breadcrumb
            items={[{ label: 'Inscription' }]}
            className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-500"
          />

          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">SA</span>
              </div>
              <span className="text-2xl font-bold text-white">
                Services<span className="text-primary-300">Artisans</span>
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">
              Pas besoin de compte pour vos travaux
            </h1>
            <p className="text-charcoal-400">
              Les inscriptions particuliers sont fermées : demandez vos devis directement, sans
              créer de compte.
            </p>
          </div>

          <div className="mb-8 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl flex items-start gap-3 text-primary-200">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              Vos demandes de devis sont transmises aux artisans RGE de votre ville en quelques
              minutes — gratuitement et sans engagement. Vous êtes recontacté directement par
              l'artisan.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/devis"
              className="flex items-center justify-between gap-3 w-full p-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all"
            >
              <span className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                Demander un devis gratuit
              </span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/inscription-artisan"
              className="flex items-center justify-between gap-3 w-full p-5 bg-charcoal-800 border border-charcoal-700 hover:bg-charcoal-700 text-white rounded-xl font-medium transition-all"
            >
              <span className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-primary-300" />
                Vous êtes artisan ? Créer un compte artisan
              </span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-charcoal-400 text-sm">
              Déjà un compte artisan ?{' '}
              <Link
                href="/connexion"
                className="text-primary-300 hover:text-primary-200 font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-charcoal-700">
            <p className="text-charcoal-400 text-sm mb-3">Liens utiles :</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link href="/comment-ca-marche" className="text-primary-300 hover:text-primary-200">
                Comment ça marche ?
              </Link>
              <Link href="/faq" className="text-primary-300 hover:text-primary-200">
                Questions fréquentes
              </Link>
              <Link href="/contact" className="text-primary-300 hover:text-primary-200">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-charcoal-800/50 py-10 border-t border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-white mb-6">Explorez nos services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <PopularServicesLinks className="[&_h3]:text-sand-500 [&_a]:bg-charcoal-700 [&_a]:text-sand-500 [&_a:hover]:bg-primary-500 [&_a:hover]:text-white" />
            <PopularCitiesLinks className="[&_h3]:text-sand-500 [&_a]:bg-charcoal-700 [&_a]:text-sand-500 [&_a:hover]:bg-primary-500 [&_a:hover]:text-white" />
          </div>
        </div>
      </section>
    </div>
  )
}
