export const faqCategories = [
  {
    name: 'General',
    questions: [
      {
        q: 'Qu\'est-ce que ServicesArtisans ?',
        a: 'ServicesArtisans est une plateforme gratuite qui met en relation les particuliers avec des artisans qualifies et verifies. Nous couvrons plus de 50 metiers du batiment dans toute la France.',
      },
      {
        q: 'Le service est-il gratuit ?',
        a: 'Oui, notre service est entierement gratuit pour les particuliers. Vous pouvez demander autant de devis que vous le souhaitez sans aucun engagement.',
      },
      {
        q: 'Comment fonctionne ServicesArtisans ?',
        a: 'C\'est simple : 1) Decrivez votre projet, 2) Recevez jusqu\'a 3 devis d\'artisans qualifies, 3) Comparez et choisissez le professionnel qui vous convient.',
      },
    ],
  },
  {
    name: 'Demande de devis',
    questions: [
      {
        q: 'Comment demander un devis ?',
        a: 'Cliquez sur "Demander un devis", remplissez le formulaire en decrivant votre projet, et nous transmettons votre demande aux artisans qualifies de votre region.',
      },
      {
        q: 'Combien de devis vais-je recevoir ?',
        a: 'Vous recevrez jusqu\'a 3 devis d\'artisans differents, generalement sous 24 a 48 heures.',
      },
      {
        q: 'Suis-je oblige d\'accepter un devis ?',
        a: 'Non, vous etes libre de refuser tous les devis. Notre service est sans engagement.',
      },
      {
        q: 'Les devis sont-ils vraiment gratuits ?',
        a: 'Oui, les devis sont 100% gratuits et sans engagement. Vous ne payez que si vous decidez de faire appel a un artisan.',
      },
    ],
  },
  {
    name: 'Artisans',
    questions: [
      {
        q: 'Comment sont selectionnes les artisans ?',
        a: 'Nous verifions l\'identite, les assurances et les qualifications de chaque artisan. Nous suivons egalement les avis clients pour maintenir un niveau de qualite eleve.',
      },
      {
        q: 'Les artisans sont-ils assures ?',
        a: 'Oui, tous nos artisans partenaires doivent justifier d\'une assurance responsabilite civile professionnelle et d\'une garantie decennale pour les travaux concernes.',
      },
      {
        q: 'Puis-je voir les avis sur un artisan ?',
        a: 'Oui, chaque fiche artisan affiche les avis et notes laisses par les clients precedents.',
      },
    ],
  },
  {
    name: 'Paiement & Garanties',
    questions: [
      {
        q: 'Comment payer l\'artisan ?',
        a: 'Le paiement se fait directement entre vous et l\'artisan, selon les modalites convenues ensemble (especes, cheque, virement, etc.).',
      },
      {
        q: 'Quelles garanties ai-je sur les travaux ?',
        a: 'Les travaux sont couverts par les garanties legales : garantie de parfait achevement (1 an), garantie biennale (2 ans) et garantie decennale (10 ans) selon la nature des travaux.',
      },
      {
        q: 'Que faire en cas de litige ?',
        a: 'Contactez-nous via notre page Contact. Nous vous accompagnons dans la resolution du litige et pouvons servir de mediateur avec l\'artisan.',
      },
    ],
  },
  {
    name: 'Compte & Donnees',
    questions: [
      {
        q: 'Dois-je creer un compte ?',
        a: 'Non, vous pouvez demander un devis sans creer de compte. Cependant, un compte vous permet de suivre vos demandes et de conserver votre historique.',
      },
      {
        q: 'Comment supprimer mon compte ?',
        a: 'Vous pouvez demander la suppression de votre compte et de vos donnees en nous contactant a dpo@servicesartisans.fr.',
      },
      {
        q: 'Mes donnees sont-elles protegees ?',
        a: 'Oui, nous respectons le RGPD et protegeons vos donnees. Consultez notre politique de confidentialite pour plus de details.',
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
