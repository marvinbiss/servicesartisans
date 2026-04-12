/**
 * Funnel chart CEE — barres horizontales empilées en CSS pur.
 * Visualise le pipeline : brouillon -> engagement -> travaux -> depose -> valide.
 */

interface FunnelStep {
  label: string
  count: number
  color: string
}

interface CeeFunnelChartProps {
  steps: FunnelStep[]
}

export function CeeFunnelChart({ steps }: CeeFunnelChartProps) {
  const maxCount = Math.max(...steps.map((s) => s.count), 1)

  return (
    <div className="bg-white border border-sand-200 shadow-sm rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Funnel des dossiers</h3>
      <div className="space-y-3">
        {steps.map((step) => {
          const pct = Math.round((step.count / maxCount) * 100)
          return (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{step.label}</span>
                <span className="text-xs font-semibold text-gray-900">{step.count}</span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: step.color,
                    minWidth: step.count > 0 ? '8px' : '0',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
