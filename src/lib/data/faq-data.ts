export const faqCategories = [
  {
    name: 'Général',
    questions: [
      {
        q: 'Qu\'est-ce que ServicesArtisans ?',
        a: 'ServicesArtisans est une plateforme gratuite qui met en relation les particuliers avec des artisans qualifiés et vérifiés. Nous couvrons plus de 50 métiers du bâtiment dans toute la France.',
      },
      {
        q: 'Le service est-il gratuit ?',
        a: 'Oui, notre service est entièrement gratuit pour les particuliers. Vous pouvez demander autant de devis que vous le souhaitez sans aucun engagement.',
      },
      {
        q: 'Comment fonctionne ServicesArtisans ?',
        a: 'C\'est simple : 1) Décrivez votre projet, 2) Recevez jusqu\'à 3 devis d\'artisans qualifiés, 3) Comparez et choisissez le professionnel qui vous convient.',
      },
    ],
  },
  {
    name: 'Demande de devis',
    questions: [
      {
        q: 'Comment demander un devis ?',
        a: 'Cliquez sur "Demander un devis", remplissez le formulaire en décrivant votre projet, et nous transmettons votre demande aux artisans qualifiés de votre région.',
      },
      {
        q: 'Combien de devis vais-je recevoir ?',
        a: 'Vous recevrez jusqu\'à 3 devis d\'artisans différents, généralement sous 24 à 48 heures.',
      },
      {
        q: 'Suis-je obligé d\'accepter un devis ?',
        a: 'Non, vous êtes libre de refuser tous les devis. Notre service est sans engagement.',
      },
      {
        q: 'Les devis sont-ils vraiment gratuits ?',
        a: 'Oui, les devis sont 100% gratuits et sans engagement. Vous ne payez que si vous décidez de faire appel à un artisan.',
      },
    ],
  },
  {
    name: 'Artisans',
    questions: [
      {
        q: 'Comment sont sélectionnés les artisans ?',
        a: 'Nous vérifions l\'identité, les assurances et les qualifications de chaque artisan. Nous suivons également les avis clients pour maintenir un niveau de qualité élevé.',
      },
      {
        q: 'Les artisans sont-ils assurés ?',
        a: 'Oui, tous nos artisans partenaires doivent justifier d\'une assurance responsabilité civile professionnelle et d\'une garantie décennale pour les travaux concernés.',
      },
      {
        q: 'Puis-je voir les avis sur un artisan ?',
        a: 'Oui, chaque fiche artisan affiche les avis et notes laissés par les clients précédents.',
      },
    ],
  },
  {
    name: 'Paiement & Garanties',
    questions: [
      {
        q: 'Comment payer l\'artisan ?',
        a: 'Le paiement se fait directement entre vous et l\'artisan, selon les modalités convenues ensemble (espèces, chèque, virement, etc.).',
      },
      {
        q: 'Quelles garanties ai-je sur les travaux ?',
        a: 'Les travaux sont couverts par les garanties légales : garantie de parfait achèvement (1 an), garantie biennale (2 ans) et garantie décennale (10 ans) selon la nature des travaux.',
      },
      {
        q: 'Que faire en cas de litige ?',
        a: 'Contactez-nous via notre page Contact. Nous vous accompagnons dans la résolution du litige et pouvons servir de médiateur avec l\'artisan.',
      },
    ],
  },
  {
    name: 'Compte & Données',
    questions: [
      {
        q: 'Dois-je créer un compte ?',
        a: 'Non, vous pouvez demander un devis sans créer de compte. Cependant, un compte vous permet de suivre vos demandes et de conserver votre historique.',
      },
      {
        q: 'Comment supprimer mon compte ?',
        a: 'Vous pouvez demander la suppression de votre compte et de vos données en nous contactant à dpo@servicesartisans.fr.',
      },
      {
        q: 'Mes données sont-elles protégées ?',
        a: 'Oui, nous respectons le RGPD et protégeons vos données. Consultez notre politique de confidentialité pour plus de détails.',
      },
    ],
  },
]

// Flat array of all FAQ items for the FAQPage structured data schema
export const faqItems: { question: string; answer: string }[] = faqCategories.flatMap(
  (category) =>
    category.questions.map((q) => ({
      question: q.q,
      answer: q.a,
    }))
)
