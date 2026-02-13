'use client'

import { useState } from 'react'
import { HelpCircle, Plus, Minus } from 'lucide-react'

interface ArticleFAQProps {
  items: { question: string; answer: string }[]
}

export function ArticleFAQ({ items }: ArticleFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (items.length === 0) return null

  return (
    <div className="article-faq mt-14">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-amber-500" />
        Questions fréquentes
      </h2>

      <div className="space-y-3" role="region" aria-label="Questions fréquentes">
        {items.map((item, index) => {
          const isOpen = openIndex === index
          const headingId = `article-faq-heading-${index}`
          const panelId = `article-faq-panel-${index}`

          return (
            <div
              key={index}
              className="article-faq-item"
            >
              <h3>
                <button
                  id={headingId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="article-faq-button"
                >
                  <span className="pr-4">{item.question}</span>
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isOpen ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                    aria-hidden="true"
                  >
                    {isOpen ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>
                </button>
              </h3>

              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className="article-faq-answer"
                >
                  {item.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
