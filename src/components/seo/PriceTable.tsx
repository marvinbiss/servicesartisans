/**
 * PriceTable — Tableau HTML des tarifs pour Featured Snippets Google.
 * Parse les commonTasks (format "Label : prix") et rend un <table> semantique.
 */

interface PriceTableProps {
  tasks: string[]
  tradeName: string
  priceRange: { min: number; max: number; unit: string }
}

export default function PriceTable({ tasks, tradeName, priceRange }: PriceTableProps) {
  if (!tasks || tasks.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-charcoal-900 mb-4">
        Combien coûte un {tradeName.toLowerCase()} ?
      </h2>
      <p className="text-sm text-charcoal-600 mb-4">
        Tarif horaire moyen :{' '}
        <strong className="text-charcoal-900">
          {priceRange.min}–{priceRange.max} {priceRange.unit}
        </strong>
        . Voici les prix indicatifs des prestations courantes :
      </p>
      <div className="overflow-x-auto rounded-xl border border-sand-300 shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-sand-50 border-b border-sand-300">
              <th className="px-5 py-3.5 text-sm font-semibold text-charcoal-700">Prestation</th>
              <th className="px-5 py-3.5 text-sm font-semibold text-charcoal-700 text-right">
                Prix indicatif
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => {
              const colonIndex = task.indexOf(' : ')
              const label = colonIndex !== -1 ? task.slice(0, colonIndex).trim() : task.trim()
              const price = colonIndex !== -1 ? task.slice(colonIndex + 3).trim() : 'Sur devis'
              return (
                <tr
                  key={i}
                  className={`hover:bg-primary-50/60 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-sand-50/50'}`}
                >
                  <td className="px-5 py-4 text-charcoal-800 text-sm border-t border-sand-200">
                    {label}
                  </td>
                  <td className="px-5 py-4 text-charcoal-900 text-sm font-medium border-t border-sand-200 text-right whitespace-nowrap">
                    {price}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-charcoal-500 mt-3">
        * Prix indicatifs constatés en France métropolitaine. Les tarifs varient selon la région, la
        complexité des travaux et le professionnel.
      </p>
    </div>
  )
}
