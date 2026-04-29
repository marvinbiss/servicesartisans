import { ArrowRight } from 'lucide-react'

type FAQ = { question: string; answer: string }

type Props = {
  aideName: string
  faqs: FAQ[]
}

export default function AideFAQ({ aideName, faqs }: Props) {
  return (
    <section
      className="bg-charcoal-50 py-12 border-t border-charcoal-100"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2
          id="faq-heading"
          className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
        >
          Questions fréquentes — {aideName}
        </h2>
        <div className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-charcoal-200 bg-white p-5 open:border-emerald-300"
            >
              <summary className="cursor-pointer font-heading font-bold text-charcoal-900 list-none flex justify-between items-start gap-4">
                <span>{item.question}</span>
                <ArrowRight
                  className="w-5 h-5 rotate-90 group-open:rotate-[-90deg] transition flex-shrink-0 text-charcoal-400"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-charcoal-700 leading-relaxed text-sm">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
