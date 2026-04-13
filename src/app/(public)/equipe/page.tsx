import { Metadata } from 'next'
import Link from 'next/link'
import { Award, Clock, ArrowRight } from 'lucide-react'
import { authors } from '@/lib/data/authors'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: "Notre équipe d'experts | ServicesArtisans",
  description:
    "Découvrez l'équipe éditoriale de ServicesArtisans : journalistes spécialisés, experts certifiés en bâtiment, rénovation et habitat. +80 ans d'expérience cumulée.",
  alternates: getAlternates('/equipe'),
  openGraph: {
    title: "Notre équipe d'experts | ServicesArtisans",
    description:
      "Découvrez l'équipe éditoriale de ServicesArtisans : journalistes spécialisés, experts certifiés en bâtiment, rénovation et habitat.",
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

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <header className="mb-12 text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">
              Notre équipe d&apos;experts
            </h1>
            <p className="text-charcoal-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Chez ServicesArtisans, chaque article est rédigé et vérifié par des professionnels du
              bâtiment et de l&apos;habitat. Notre équipe cumule plus de 80 ans d&apos;expérience
              terrain et détient des certifications reconnues (RGE, Qualibat, Qualifelec, OPQTECC).
            </p>
          </header>

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
                    <h2 className="font-heading font-semibold text-charcoal-900 group-hover:text-primary-600 transition-colors">
                      {author.name}
                    </h2>
                    <p className="text-sm text-charcoal-500">{author.role}</p>
                  </div>
                </div>

                <p className="text-charcoal-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {author.bio}
                </p>

                <div className="flex items-center gap-4 text-xs text-charcoal-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {author.yearsExperience} ans d&apos;exp.
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    {author.certifications.length} certification
                    {author.certifications.length > 1 ? 's' : ''}
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
                  Voir le profil
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
