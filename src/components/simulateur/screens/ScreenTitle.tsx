'use client'

interface Props {
  children: React.ReactNode
  subtitle?: string
}

export default function ScreenTitle({ children, subtitle }: Props) {
  return (
    <div className="mb-6 text-center">
      <h3 className="text-xl font-bold text-charcoal-900 sm:text-2xl">{children}</h3>
      {subtitle && <p className="mt-1.5 text-sm text-charcoal-500">{subtitle}</p>}
    </div>
  )
}
