'use client'

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  containerClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerClassName,
      className,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className={clsx('w-full', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-charcoal-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={clsx(
              'w-full rounded-lg border transition-all duration-200',
              'px-4 py-2.5 text-charcoal-900 placeholder-charcoal-400',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-sand-400 focus:ring-primary-400 focus:border-primary-400',
              disabled && 'bg-sand-100 cursor-not-allowed opacity-60',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-charcoal-500">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
