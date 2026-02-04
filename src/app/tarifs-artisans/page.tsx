import { Metadata } from 'next'
import Link from 'next/link'
import { Check, X, Star, ArrowRight, Zap, Crown, Building } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'

export const metadata: Metadata = {
  title: 'Tarifs Artisans - Offres et abonnements | ServicesArtisans',
  description: 'Decouvrez nos offres pour les artisans. Inscription gratuite, visibilite maximale et demandes de devis qualifiees.',
}

const plans = [
  {
    name: 'Gratuit',
    icon: Zap,
    price: '0',
    period: '/mois',
    description: 'Pour demarrer et tester la plateforme',
    features: [
      { text: 'Fiche artisan basique', included: true },
      { text: 'Visibilite dans les recherches', included: true },
      { text: '5 demandes de devis/mois', included: true },
      { text: 'Avis clients', included: true },
      { text: 'Badge verifie', included: false },
      { text: 'Mise en avant', included: false },
      { text: 'Statistiques detaillees', included: false },
      { text: 'Support prioritaire', included: false },
    ],
    cta: 'Creer mon profil',
    ctaLink: '/inscription-artisan',
    popular: false,
  },
  {
    name: 'Pro',
    icon: Star,
    price: '49',
    period: '/mois',
    description: 'Pour developper votre activite',
    features: [
      { text: 'Fiche artisan complete', included: true },
      { text: 'Visibilite prioritaire', included: true },
      { text: 'Demandes de devis illimitees', included: true },
      { text: 'Avis clients', included: true },
      { text: 'Badge verifie', included: true },
      { text: 'Mise en avant locale', included: true },
      { text: 'Statistiques detaillees', included: true },
      { text: 'Support prioritaire', included: false },
    ],
    cta: 'Essai gratuit 14 jours',
    ctaLink: '/inscription-artisan?plan=pro',
    popular: true,
  },
  {
    name: 'Premium',
    icon: Crown,
    price: '99',
    period: '/mois',
    description: 'Pour les artisans ambitieux',
    features: [
      { text: 'Fiche artisan premium', included: true },
      { text: 'Visibilite maximale', included: true },
      { text: 'Demandes de devis illimitees', included: true },
      { text: 'Avis clients + reponses', included: true },
      { text: 'Badge verifie + premium', included: true },
      { text: 'Mise en avant nationale', included: true },
      { text: 'Statistiques avancees', included: true },
      { text: 'Support prioritaire 24/7', included: true },
    ],
    cta: 'Essai gratuit 14 jours',
    ctaLink: '/inscription-artisan?plan=premium',
    popular: false,
  },
]

const faqs = [
  {
    q: 'Puis-je changer d\'offre a tout moment ?',
    a: 'Oui, vous pouvez upgrader ou downgrader votre abonnement a tout moment. Le changement prend effet immediatement.',
  },
  {
    q: 'Y a-t-il un engagement ?',
    a: 'Non, tous nos abonnements sont sans engagement. Vous pouvez resilier a tout moment.',
  },
  {
    q: 'Comment fonctionne l\'essai gratuit ?',
    a: 'L\'essai gratuit de 14 jours vous donne acces a toutes les fonctionnalites de l\'offre choisie. Aucune carte bancaire requise.',
  },
  {
    q: 'Les demandes de devis sont-elles qualifiees ?',
    a: 'Oui, nous verifions chaque demande pour vous envoyer uniquement des projets serieux correspondant a vos competences et votre zone d\'intervention.',
  },
]

const breadcrumbItems = [
  { label: 'Tarifs artisans' }
]

export default function TarifsArtisansPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Breadcrumb items={breadcrumbItems} className="mb-6 justify-center text-blue-200 [&_a]:text-blue-200 [&_a:hover]:text-white [&_svg]:text-blue-300 [&>span]:text-white" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Developpez votre activite
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Rejoignez plus de 4 000 artisans et recevez des demandes de devis qualifiees
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.name}
                  className={`bg-white rounded-2xl border-2 ${
                    plan.popular ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-200'
                  } p-8 relative`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Le plus populaire
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 ${plan.popular ? 'bg-blue-100' : 'bg-gray-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-8 h-8 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 mt-1">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}EUR</span>
                      <span className="text-gray-500">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.ctaLink}
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Offre Entreprise</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Vous avez plusieurs equipes ou agences ? Contactez-nous pour une offre sur mesure
                avec des tarifs degressifs et un accompagnement personnalise.
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>+ Multi-comptes et multi-agences</li>
                <li>+ Tableau de bord centralise</li>
                <li>+ Account manager dedie</li>
              </ul>
            </div>
            <Link
              href="/contact"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              Nous contacter
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Questions frequentes
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related links */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Explorer le reseau</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <PopularServicesLinks />
            <PopularCitiesLinks />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/inscription-artisan"
              className="bg-blue-50 hover:bg-blue-100 rounded-xl p-6 transition-colors group"
            >
              <h3 className="font-semibold text-blue-700 group-hover:text-blue-800 mb-2">S'inscrire maintenant</h3>
              <p className="text-blue-600 text-sm">Creez votre profil artisan gratuitement</p>
            </Link>
            <Link
              href="/avis"
              className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 transition-colors group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2">Avis clients</h3>
              <p className="text-gray-600 text-sm">Ce que disent nos clients de nos artisans</p>
            </Link>
            <Link
              href="/comment-ca-marche"
              className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 transition-colors group"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2">Comment ca marche</h3>
              <p className="text-gray-600 text-sm">Tout savoir sur notre plateforme</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pret a developper votre activite ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez ServicesArtisans et recevez vos premieres demandes de devis
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/inscription-artisan"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Creer mon profil gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/urgence"
              className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-800 transition-colors text-lg"
            >
              Services d'urgence
            </Link>
          </div>
        </div>
      </section>

      {/* Footer links */}
    </div>
  )
}
