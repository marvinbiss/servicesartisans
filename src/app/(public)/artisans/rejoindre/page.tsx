import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2, Phone, Star, ShieldCheck, Wallet, Users,
  MapPin, Clock, BadgeCheck, TrendingUp,
} from 'lucide-react'
import { ArtisanLeadForm } from '@/components/conversion/ArtisanLeadForm'
import { ArtisanTestimonials } from '@/components/conversion/ArtisanTestimonials'
import { LandingStickyCTA } from '@/components/conversion/LandingStickyCTA'
import AnimatedCounter from '@/components/conversion/AnimatedCounter'
import { getProviderCount } from '@/lib/data/stats'

export const metadata: Metadata = {
  title: 'Devenez artisan partenaire — recevez des demandes de devis | ServicesArtisans',
  description:
    'Recevez des demandes de devis qualifiées près de chez vous. Inscription gratuite, paiement au résultat, sans engagement. Rejoignez ServicesArtisans.',
  // Landing publicitaire : pas de concurrence SEO avec les pages organiques
  robots: { index: false, follow: false },
}

/** Première lettre en majuscule (métiers/villes venant de l'ad) */
function cap(s: string): string {
  const t = s.trim()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''
}

function firstParam(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

const benefits = [
  {
    icon: Wallet,
    title: 'Gratuit, paiement au résultat',
    text: "Aucun abonnement à l'aveugle. Vous ne payez que pour les demandes qui vous intéressent.",
  },
  {
    icon: MapPin,
    title: 'Des clients près de chez vous',
    text: 'Recevez uniquement des demandes dans votre zone et vos métiers.',
  },
  {
    icon: ShieldCheck,
    title: 'Demandes qualifiées',
    text: 'Des projets réels, avec budget et coordonnées. Fini les contacts qui ne répondent pas.',
  },
  {
    icon: BadgeCheck,
    title: 'Profil vérifié qui rassure',
    text: 'Badge de vérification, avis clients et visibilité locale qui boostent votre crédibilité.',
  },
]

const steps = [
  { n: '1', title: 'Inscrivez-vous', text: 'Métier, zone, SIRET. 2 minutes, gratuit.' },
  { n: '2', title: 'Recevez des demandes', text: 'Notification dès qu’un client cherche votre métier près de chez vous.' },
  { n: '3', title: 'Décrochez le chantier', text: 'Vous répondez, vous signez. Vous gardez 100 % de votre marge.' },
]

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function RejoindreArtisanPage({ searchParams }: PageProps) {
  const metier = cap(firstParam(searchParams.metier))
  const ville = cap(firstParam(searchParams.ville))
  const codePostal = firstParam(searchParams.codePostal)

  // Vrai nombre d'artisans actifs (0 si DB indisponible → fallback qualitatif)
  const artisanCount = await getProviderCount()
  const hasCount = artisanCount > 0

  // Message-match avec l'ad : le H1 reprend le métier (+ la ville) ciblé
  const eyebrow =
    metier && ville ? `${metier} à ${ville}` : metier ? metier : ''

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Barre minimale — logo + téléphone, sans navigation */}
      <header className="border-b border-sand-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.svg" alt="ServicesArtisans" width={32} height={32} />
            <span className="font-heading font-bold text-charcoal-900">ServicesArtisans</span>
          </Link>
          <a
            href="tel:+33000000000"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-charcoal-700 hover:text-primary-600"
          >
            <Phone className="w-4 h-4" />
            Besoin d&apos;aide&nbsp;?
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-100 text-accent-800 px-3 py-1 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Inscription gratuite · sans engagement
            </span>

            <h1 className="mt-5 font-heading text-4xl lg:text-5xl font-extrabold leading-tight text-charcoal-900">
              {eyebrow && (
                <span className="block text-primary-600">{eyebrow} :</span>
              )}
              Plus de chantiers,{' '}
              <span className="text-primary-600">moins de prospection.</span>
            </h1>

            <p className="mt-5 text-lg text-charcoal-600 max-w-xl">
              {hasCount ? (
                <>
                  Rejoignez les{' '}
                  <AnimatedCounter
                    end={artisanCount}
                    className="font-bold text-charcoal-900"
                  />{' '}
                  artisans qui reçoivent des demandes de devis qualifiées près de chez eux.
                </>
              ) : (
                <>
                  Recevez des demandes de devis qualifiées de clients près de chez vous.
                </>
              )}{' '}
              Vous choisissez les projets, vous gardez votre marge. Pas d&apos;abonnement,
              vous payez seulement au résultat.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                'Demandes réelles avec budget et coordonnées',
                'Uniquement dans votre métier et votre zone',
                'Profil vérifié qui inspire confiance',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-charcoal-700">
                  <CheckCircle2 className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              {hasCount && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary-500" />
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-charcoal-900">
                      <AnimatedCounter end={artisanCount} />
                    </div>
                    <div className="text-xs text-charcoal-500">Artisans inscrits</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary-500" />
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-charcoal-900">Temps réel</div>
                  <div className="text-xs text-charcoal-500">Réponse aux demandes</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-secondary-500" />
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-charcoal-900">Vérifiés</div>
                  <div className="text-xs text-charcoal-500">Avis clients</div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de capture — pré-rempli depuis l'ad */}
          <div className="lg:pl-6">
            <ArtisanLeadForm
              initialMetier={metier}
              initialVille={ville}
              initialCodePostal={codePostal}
            />
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="bg-white border-y border-sand-200">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="font-heading text-2xl lg:text-3xl font-bold text-charcoal-900 text-center">
            Pourquoi les artisans choisissent ServicesArtisans
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-sand-50 p-6 ring-1 ring-sand-200">
                <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="mt-4 font-semibold text-charcoal-900">{title}</h3>
                <p className="mt-2 text-sm text-charcoal-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages artisans */}
      <ArtisanTestimonials />

      {/* Comment ça marche */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="font-heading text-2xl lg:text-3xl font-bold text-charcoal-900 text-center">
          Comment ça marche
        </h2>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {steps.map(({ n, title, text }) => (
            <div key={n} className="relative rounded-2xl bg-white p-6 ring-1 ring-sand-200">
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center">
                {n}
              </div>
              <h3 className="mt-4 font-semibold text-charcoal-900">{title}</h3>
              <p className="mt-2 text-sm text-charcoal-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bandeau final */}
      <section className="bg-gradient-primary">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <TrendingUp className="w-10 h-10 text-white/90 mx-auto" />
          <h2 className="mt-4 font-heading text-2xl lg:text-3xl font-bold text-white">
            Prêt à développer votre activité&nbsp;?
          </h2>
          <p className="mt-3 text-white/90 max-w-xl mx-auto">
            Rejoignez le réseau gratuitement et recevez votre première demande dès cette semaine.
          </p>
          <Link
            href="/inscription-artisan"
            className="mt-7 inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-sand-50 transition-colors"
          >
            Je m&apos;inscris gratuitement
          </Link>
        </div>
      </section>

      {/* Pied minimal */}
      <footer className="bg-white border-t border-sand-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-charcoal-500">
          <span>© ServicesArtisans</span>
          <div className="flex items-center gap-5">
            <Link href="/mentions-legales" className="hover:text-charcoal-700">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-charcoal-700">Confidentialité</Link>
            <Link href="/contact" className="hover:text-charcoal-700">Contact</Link>
          </div>
        </div>
      </footer>

      {/* CTA fixe mobile */}
      <LandingStickyCTA />
    </div>
  )
}
