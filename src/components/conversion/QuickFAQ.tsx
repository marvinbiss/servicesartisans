'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: 'Est-ce vraiment gratuit ?',
    answer:
      'Oui, le service est 100% gratuit pour les particuliers. Vous recevez jusqu\'a 3 devis sans aucun frais. Ce sont les artisans qui financent le service en s\'inscrivant sur la plateforme.',
  },
  {
    question: 'Comment sont sélectionnés les artisans ?',
    answer:
      'Chaque artisan est vérifié via son numéro SIREN auprès des données officielles INSEE. Nous contrôlons l\'existence légale de l\'entreprise, son activité et sa localisation. Les avis clients permettent ensuite de garantir la qualité des prestations.',
  },
  {
    question: 'Suis-je obligé d\'accepter un devis ?',
    answer:
      'Absolument pas. Vous êtes libre de comparer les devis reçus et de choisir celui qui vous convient le mieux, ou de n\'en accepter aucun. Il n\'y a aucun engagement de votre part.',
  },
]

interface QuickFAQProps {
  className?: string
}

export default function QuickFAQ({ className = '' }: QuickFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section aria-label="Questions fréquentes" className={className}>
      <h3 className="font-heading text-sm font-semibold text-charcoal-900 mb-3">
        Les réponses à vos questions
      </h3>

      <div className="divide-y divide-sand-200 rounded-xl border border-sand-300 bg-white overflow-hidden">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index
          const panelId = `faq-panel-${index}`
          const buttonId = `faq-button-${index}`

          return (
            <div key={item.question}>
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-charcoal-800 transition-colors hover:bg-sand-50"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-charcoal-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`grid transition-[grid-template-rows] duration-200 ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-3 text-xs leading-relaxed text-charcoal-500">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
