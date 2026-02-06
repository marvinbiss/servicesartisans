import Link from 'next/link'
import { ChevronRight, Eye, Ear, Hand, Brain, Mail, Phone } from 'lucide-react'

export default function AccessibilitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Accessibilité</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Déclaration d'accessibilité
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            ServicesArtisans s'engage à rendre son site web accessible à tous,
            conformément au Référentiel Général d'Amélioration de l'Accessibilité (RGAA).
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* État de conformité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">État de conformité</h2>
            <p className="text-gray-600 mb-4">
              Le site ServicesArtisans est en <strong>conformité partielle</strong> avec le
              Référentiel Général d'Amélioration de l'Accessibilité (RGAA) version 4.1.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Taux de conformité :</strong> 85% des critères RGAA sont respectés.
              </p>
            </div>
          </section>

          {/* Nos engagements */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nos engagements</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Déficiences visuelles</h3>
                  <p className="text-gray-600 text-sm">
                    Compatibilité avec les lecteurs d'écran, contrastes suffisants, textes alternatifs pour les images.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Ear className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Déficiences auditives</h3>
                  <p className="text-gray-600 text-sm">
                    Pas de contenu audio automatique, alternatives textuelles disponibles.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Hand className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Déficiences motrices</h3>
                  <p className="text-gray-600 text-sm">
                    Navigation au clavier, zones de clic suffisantes, pas de limite de temps.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Déficiences cognitives</h3>
                  <p className="text-gray-600 text-sm">
                    Langage clair et simple, structure de page cohérente, navigation intuitive.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contenus non accessibles */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contenus non accessibles</h2>
            <p className="text-gray-600 mb-4">
              Les contenus suivants ne sont pas encore conformes :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Certaines cartes interactives ne sont pas entièrement accessibles au clavier</li>
              <li>Quelques formulaires complexes nécessitent des améliorations pour les lecteurs d'écran</li>
              <li>Certains documents PDF ne sont pas encore balisés pour l'accessibilité</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Ces éléments sont en cours de correction et seront mis à jour prochainement.
            </p>
          </section>

          {/* Technologies utilisées */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technologies utilisées</h2>
            <p className="text-gray-600 mb-4">
              L'accessibilité de ce site repose sur les technologies suivantes :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>HTML5</li>
              <li>WAI-ARIA (Accessible Rich Internet Applications)</li>
              <li>CSS3</li>
              <li>JavaScript</li>
            </ul>
          </section>

          {/* Environnement de test */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Environnement de test</h2>
            <p className="text-gray-600 mb-4">
              Les tests d'accessibilité ont été réalisés avec les configurations suivantes :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>NVDA 2023 avec Firefox</li>
              <li>VoiceOver avec Safari sur macOS</li>
              <li>VoiceOver avec Safari sur iOS</li>
              <li>TalkBack avec Chrome sur Android</li>
            </ul>
          </section>

          {/* Retour d'information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Retour d'information et contact</h2>
            <p className="text-gray-600 mb-4">
              Si vous rencontrez un défaut d'accessibilité vous empêchant d'accéder à un contenu
              ou une fonctionnalité du site, vous pouvez nous contacter :
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:accessibilite@servicesartisans.fr"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Mail className="w-5 h-5" />
                accessibilite@servicesartisans.fr
              </a>
              <a
                href="tel:+33123456789"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Phone className="w-5 h-5" />
                01 23 45 67 89
              </a>
            </div>
          </section>

          {/* Voies de recours */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Voies de recours</h2>
            <p className="text-gray-600 mb-4">
              Si vous constatez un défaut d'accessibilité qui vous empêche d'accéder à un contenu
              ou une fonctionnalité et que vous nous l'avez signalé sans obtenir de réponse satisfaisante,
              vous êtes en droit de :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Écrire au Défenseur des droits</li>
              <li>Contacter le délégué du Défenseur des droits dans votre région</li>
              <li>Envoyer un courrier par voie postale (gratuit, ne pas mettre de timbre) :
                Défenseur des droits - Libre réponse 71120 - 75342 Paris CEDEX 07</li>
            </ul>
          </section>

          {/* Date */}
          <section className="border-t pt-6">
            <p className="text-gray-500 text-sm">
              Cette déclaration d'accessibilité a été établie le 1er janvier 2024.
              Dernière mise à jour : 15 janvier 2024.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
