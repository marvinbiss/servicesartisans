import type { Aide } from '@/lib/aides/aides-catalog'

type Props = {
  demarche: Aide['demarche']
}

export default function AideDemarche({ demarche }: Props) {
  return (
    <section className="bg-white py-12" aria-labelledby="demarche-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2
          id="demarche-heading"
          className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-8"
        >
          Démarche en {demarche.length} étapes
        </h2>
        <ol className="space-y-6">
          {demarche.map((step, idx) => (
            <li
              key={`${idx}-${step.name.slice(0, 24)}`}
              className="flex gap-4 rounded-2xl border border-charcoal-100 bg-white p-5"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-600 text-white font-bold flex items-center justify-center">
                {idx + 1}
              </div>
              <div>
                <h3 className="font-heading font-bold text-charcoal-900 mb-2">{step.name}</h3>
                <p className="text-sm text-charcoal-700 leading-relaxed">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
