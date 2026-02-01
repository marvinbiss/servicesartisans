import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={clsx('space-y-1', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  )
}
