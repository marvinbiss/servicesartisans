import { Metadata } from 'next'
import Link from 'next/link'
import { Clock, ArrowRight, FileText, Search, Users, RefreshCw } from 'lucide-react'
import { authors } from '@/lib/data/authors'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Notre équipe éditoriale',
  description:
    "Découvrez l'équipe éditoriale ServicesArtisans : rédacteurs rénovation, aides publiques et bâtiment. Sources officielles, relecture artisans RGE.",
  alternates: getAlternates('/equipe'),
  openGraph: {
    title: 'Notre équipe éditoriale | ServicesArtisans',
    description:
      'Rédacteurs spécialisés + relecture par des artisans RGE actifs. Sources officielles, mise à jour régulière.',
    url: `${SITE_URL}/equipe`,
    type: 'website',
  },
}

const allAuthors = Object.values(authors)

export default function EquipePage() {
  const breadcrumbItems = [{ label: 'Notre équipe' }]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: SITE_URL },
    { name: 'Notre équipe', url: `${SITE_URL}/equipe` },
  ])

  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Notre équipe éditoriale — ServicesArtisans',
    url: `${SITE_URL}/equipe`,
    description:
      "Présentation de l'équipe éditoriale ServicesArtisans : rédacteurs spécialisés, process éditorial en 4 étapes, relecture artisan RGE.",
    mainEntity: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
      employee: allAuthors.map((a) => ({
        '@type': 'Person',
        name: a.name,
        url: `${SITE_URL}/equipe/${a.slug}`,
        jobTitle: a.role,
      })),
    },
  }

  const faqSchema = getFAQSchema([
    {
      question: 'Qui rédige les guides ServicesArtisans ?',
      answer: `Nos ${allAuthors.length} rédacteurs internes, chacun spécialisé sur un domaine (rénovation énergétique, aides publiques, gros œuvre, second œuvre). Ils ne sont pas artisans certifiés RGE ; ils assurent uniquement la vulgarisation et le sourcing officiel. Leur biographie, méthodologie et années d'expérience sont publiées sur /equipe.`,
    },
    {
      question: 'Les articles sont-ils relus par des professionnels ?',
      answer:
        "Oui. Chaque guide technique est relu par un artisan RGE actif de notre réseau, choisi pour sa qualification sur la thématique (QualiPAC pour les PAC, Qualifelec pour l'électricité, Qualibat pour l'isolation). Cette double validation rédaction + terrain est un garde-fou contre les erreurs techniques.",
    },
    {
      question: 'Quelles sources utilisez-vous ?',
      answer:
        "Uniquement des sources officielles : ADEME, service-public.fr, France Rénov', ANAH, Journal Officiel, DTU/CSTB, CONSUEL, INSEE, CAPEB, FFB. Nous référençons chaque donnée technique ou financière citée. Nous n'utilisons ni contenu scrapé ni générateurs IA non supervisés.",
    },
    {
      question: 'À quelle fréquence les guides sont-ils mis à jour ?',
      answer:
        "Les barèmes (MaPrimeRénov', CEE), les DTU et les obligations réglementaires sont revus à chaque évolution officielle (typiquement arrêté trimestriel). La date de dernière mise à jour est indiquée sur chaque guide. Pour les YMYL (aides financières, sécurité), nous privilégions la fraîcheur à la fréquence de publication.",
    },
    {
      question: 'Peut-on contacter un rédacteur ?',
      answer:
        "Oui, chaque rédacteur a une page dédiée listant ses articles et sa méthodologie. Pour les médias ou pour un échange éditorial, utilisez notre espace presse. Nous ne proposons pas de conseil technique personnalisé par courriel — orientez-vous vers un devis d'artisan RGE pour votre projet.",
    },
  ])

  return (
    <>
      <JsonLd data={[breadcrumbSchema, aboutPageSchema, faqSchema]} />

      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <header className="mb-12 text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">
              Notre équipe éditoriale
            </h1>
            <p className="text-charcoal-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Chez ServicesArtisans, les guides sont rédigés par des rédacteurs spécialisés sur leur
              domaine et relus par des artisans RGE actifs de notre réseau. Les informations
              techniques et les barèmes d&apos;aides proviennent exclusivement de sources
              officielles.
            </p>
          </header>

          <section
            id="process-editorial"
            className="bg-white rounded-xl border border-sand-200 p-6 md:p-8 mb-12 scroll-mt-24"
          >
            <h2 className="font-heading text-xl md:text-2xl font-semibold text-charcoal-900 mb-6">
              Notre process éditorial
            </h2>
            <ol className="grid gap-5 md:grid-cols-2">
              <li className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-charcoal-900 mb-1">
                    1. Sources officielles uniquement
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    ADEME, service-public.fr, France Rénov&apos;, ANAH, Journal Officiel, DTU /
                    CSTB, Consuel. Chaque donnée technique ou financière citée est référencée.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-charcoal-900 mb-1">
                    2. Rédaction spécialisée
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    Un rédacteur dédié par grand domaine (plomberie, électricité, rénovation
                    énergétique, aides). Il ne donne pas d&apos;avis technique personnel —
                    uniquement de la vulgarisation sourcée.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-charcoal-900 mb-1">
                    3. Relecture artisan RGE
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    Chaque guide technique est relu par un artisan RGE actif du réseau, choisi pour
                    sa qualification sur la thématique (QualiPAC, Qualifelec, Qualibat&hellip;).
                    Objectif&nbsp;: pas d&apos;erreur terrain.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-charcoal-900 mb-1">
                    4. Mise à jour suivie
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    Barèmes d&apos;aides, DTU, obligations réglementaires&nbsp;: revue à chaque
                    évolution officielle. La date de dernière mise à jour est indiquée sur chaque
                    guide.
                  </p>
                </div>
              </li>
            </ol>
            <p className="text-xs text-charcoal-500 mt-6 leading-relaxed">
              <strong>Important.</strong> Nos rédacteurs ne sont pas des artisans certifiés RGE,
              Qualibat, Qualifelec ou OPQTECC — ces qualifications appartiennent aux professionnels
              qui réalisent les travaux. Les guides informent et sourcent, ils ne remplacent pas
              l&apos;étude personnalisée d&apos;un artisan RGE pour votre projet.
            </p>
          </section>

          <h2 className="font-heading text-xl md:text-2xl font-semibold text-charcoal-900 mb-4">
            Les rédacteurs
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allAuthors.map((author) => (
              <Link
                key={author.slug}
                href={`/equipe/${author.slug}`}
                className="group bg-white rounded-xl border border-sand-200 p-6 hover:shadow-md hover:border-primary-300 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-heading font-bold text-xl shrink-0">
                    {author.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-charcoal-900 group-hover:text-primary-600 transition-colors">
                      {author.name}
                    </h3>
                    <p className="text-sm text-charcoal-500">{author.role}</p>
                  </div>
                </div>

                <p className="text-charcoal-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {author.bio}
                </p>

                <div className="flex items-center gap-4 text-xs text-charcoal-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {author.yearsExperience} ans sur le sujet
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {author.expertise.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-sand-100 text-charcoal-600 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="text-sm text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Voir la méthodologie
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
