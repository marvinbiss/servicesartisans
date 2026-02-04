import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { getFAQSchema, getBreadcrumbSchema } from '@/lib/seo/jsonld'

export const metadata: Metadata = {
  title: 'FAQ - Questions frequentes | ServicesArtisans',
  description: 'Trouvez les reponses a vos questions sur ServicesArtisans. Comment demander un devis, choisir un artisan, garanties et plus.',
  alternates: {
    canonical: 'https://servicesartisans.fr/faq',
  },
  openGraph: {
    title: 'FAQ - Questions frequentes | ServicesArtisans',
    description: 'Trouvez les reponses a vos questions sur ServicesArtisans.',
    url: 'https://servicesartisans.fr/faq',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

// FAQ data for structured data
const faqItems = [
  { question: 'Qu\'est-ce que ServicesArtisans ?', answer: 'ServicesArtisans est une plateforme gratuite qui met en relation les particuliers avec des artisans qualifies et verifies. Nous couvrons plus de 50 metiers du batiment dans toute la France.' },
  { question: 'Le service est-il gratuit ?', answer: 'Oui, notre service est entierement gratuit pour les particuliers. Vous pouvez demander autant de devis que vous le souhaitez sans aucun engagement.' },
  { question: 'Comment fonctionne ServicesArtisans ?', answer: 'C\'est simple : 1) Decrivez votre projet, 2) Recevez jusqu\'a 3 devis d\'artisans qualifies, 3) Comparez et choisissez le professionnel qui vous convient.' },
  { question: 'Comment demander un devis ?', answer: 'Cliquez sur "Demander un devis", remplissez le formulaire en decrivant votre projet, et nous transmettons votre demande aux artisans qualifies de votre region.' },
  { question: 'Les artisans sont-ils assures ?', answer: 'Oui, tous nos artisans partenaires doivent justifier d\'une assurance responsabilite civile professionnelle et d\'une garantie decennale pour les travaux concernes.' },
  { question: 'Quelles garanties ai-je sur les travaux ?', answer: 'Les travaux sont couverts par les garanties legales : garantie de parfait achevement (1 an), garantie biennale (2 ans) et garantie decennale (10 ans) selon la nature des travaux.' },
]

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const faqSchema = getFAQSchema(faqItems)
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ])

  return (
    <>
      <JsonLd data={[faqSchema, breadcrumbSchema]} />
      {children}
    </>
  )
}
