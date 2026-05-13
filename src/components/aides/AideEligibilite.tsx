import { CheckCircle2 } from 'lucide-react'

type Props = {
  eligibilite: string[]
}

export default function AideEligibilite({ eligibilite }: Props) {
  return (
    <section
      className="bg-accent-50/40 py-12 border-y border-accent-100"
      aria-labelledby="eligibilite-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2
          id="eligibilite-heading"
          className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
        >
          Conditions d&apos;éligibilité
        </h2>
        <ul className="space-y-3">
          {eligibilite.map((cond) => (
            <li key={cond} className="flex items-start gap-3 text-charcoal-800">
              <CheckCircle2
                className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span className="leading-relaxed">{cond}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
