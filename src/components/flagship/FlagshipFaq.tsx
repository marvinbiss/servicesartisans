import { HelpCircle } from 'lucide-react'

export type FaqItem = {
  question: string
  answer: string
}

type Props = {
  title?: string
  items: FaqItem[]
}

/**
 * Server-side FAQ block for flagship articles. Uses native <details>/<summary>
 * for progressive disclosure — no hydration cost, still crawlable.
 *
 * Pair with getFAQSchema() + JsonLd to emit FAQPage structured data.
 *
 * `answer` is rendered via dangerouslySetInnerHTML to support inline `<strong>`,
 * `<a href>` and `<em>` markup (~100+ flagship pages already pass HTML strings).
 * SAFETY : answers are hardcoded string literals authored by the editorial team
 * inside .tsx source files — never user-supplied. Do NOT pipe user input here.
 */
export default function FlagshipFaq({ title = 'Questions fréquentes', items }: Props) {
  if (!items || items.length === 0) return null
  return (
    <section className="my-10">
      <h2 className="font-heading text-2xl font-bold text-sand-900 flex items-center gap-2 mb-4">
        <HelpCircle className="w-6 h-6 text-primary-600" aria-hidden />
        {title}
      </h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="group border border-sand-200 rounded-lg bg-white overflow-hidden"
          >
            <summary className="cursor-pointer select-none p-4 font-semibold text-sand-900 hover:bg-sand-50 transition-colors">
              {item.question}
            </summary>
            <div
              className="px-4 pb-4 text-sand-700 text-sm md:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          </details>
        ))}
      </div>
    </section>
  )
}
