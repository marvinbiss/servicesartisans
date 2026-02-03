'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface FunnelStep {
  name: string
  value: number
  color?: string
}

interface FunnelChartProps {
  data: FunnelStep[]
  showPercentage?: boolean
  showConversion?: boolean
  height?: number
  className?: string
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#EF4444', // red
  '#84CC16', // lime
]

export function FunnelChart({
  data,
  showPercentage = true,
  showConversion = true,
  height = 400,
  className,
}: FunnelChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data])

  const processedData = useMemo(() => {
    return data.map((step, index) => {
      const prevValue = index > 0 ? data[index - 1].value : step.value
      const conversion = prevValue > 0 ? (step.value / prevValue) * 100 : 0
      const percentage = maxValue > 0 ? (step.value / maxValue) * 100 : 0
      const width = Math.max(20, percentage)

      return {
        ...step,
        conversion: parseFloat(conversion.toFixed(1)),
        percentage: parseFloat(percentage.toFixed(1)),
        width,
        color: step.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }
    })
  }, [data, maxValue])

  const stepHeight = height / data.length

  return (
    <div className={cn('relative', className)} style={{ height }}>
      {processedData.map((step, index) => (
        <div
          key={step.name}
          className="flex items-center gap-4"
          style={{ height: stepHeight }}
        >
          {/* Left: Label */}
          <div className="w-32 flex-shrink-0 text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {step.name}
            </div>
            {showConversion && index > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {step.conversion}% conversion
              </div>
            )}
          </div>

          {/* Center: Bar */}
          <div className="flex-1 flex justify-center">
            <div
              className="relative rounded-lg transition-all duration-500 flex items-center justify-center"
              style={{
                width: `${step.width}%`,
                height: stepHeight - 8,
                backgroundColor: step.color,
              }}
            >
              <span className="text-white font-bold text-sm">
                {step.value.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right: Percentage */}
          {showPercentage && (
            <div className="w-16 flex-shrink-0">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {step.percentage}%
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Connecting lines */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height }}
      >
        {processedData.slice(0, -1).map((step, index) => {
          const nextStep = processedData[index + 1]
          const y1 = stepHeight * index + stepHeight / 2
          const y2 = stepHeight * (index + 1) + stepHeight / 2
          const x1 = 128 + (step.width / 100) * 200 + 100
          const x2 = 128 + (nextStep.width / 100) * 200 + 100

          return (
            <line
              key={`line-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#E5E7EB"
              strokeWidth="2"
              strokeDasharray="4"
            />
          )
        })}
      </svg>
    </div>
  )
}

export default FunnelChart
