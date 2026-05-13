import { Euro } from 'lucide-react'

import YmylDisclaimer from '@/components/aides/YmylDisclaimer'
import type { AideMontant } from '@/lib/aides/aides-catalog'

type Props = {
  aideName: string
  montants: AideMontant[]
}

export default function AideMontants({ aideName, montants }: Props) {
  return (
    <section
      className="bg-white py-12 border-t border-charcoal-100"
      aria-labelledby="montants-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center">
            <Euro className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2
            id="montants-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900"
          >
            Montants {aideName} en 2026
          </h2>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-charcoal-100">
          <table className="w-full text-left">
            <thead className="bg-charcoal-50 text-sm text-charcoal-700">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Catégorie
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Montant maximum
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Conditions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 bg-white text-sm text-charcoal-800">
              {montants.map((m) => (
                <tr key={`${m.label}-${m.max}`}>
                  <th scope="row" className="px-5 py-4 font-medium align-top">
                    {m.label}
                  </th>
                  <td className="px-5 py-4 font-semibold text-accent-700 align-top whitespace-nowrap">
                    {m.max}
                  </td>
                  <td className="px-5 py-4 text-charcoal-600 align-top">{m.condition ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <YmylDisclaimer className="mt-4" />
      </div>
    </section>
  )
}
