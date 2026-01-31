'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ]

    const variants = {
      primary: [
        'bg-blue-600 text-white',
        'hover:bg-blue-700 active:bg-blue-800',
        'focus:ring-blue-500',
        'shadow-[0_4px_14px_0_rgba(37,99,235,0.3)]',
        'hover:shadow-[0_6px_20px_0_rgba(37,99,235,0.4)]',
        'hover:-translate-y-0.5',
      ],
      secondary: [
        'bg-violet-600 text-white',
        'hover:bg-violet-700 active:bg-violet-800',
        'focus:ring-violet-500',
      ],
      outline: [
        'bg-transparent border-2 border-blue-600 text-blue-600',
        'hover:bg-blue-50 active:bg-blue-100',
        'focus:ring-blue-500',
      ],
      ghost: [
        'bg-transparent text-gray-700',
        'hover:bg-gray-100 active:bg-gray-200',
        'focus:ring-gray-500',
      ],
      danger: [
        'bg-red-600 text-white',
        'hover:bg-red-700 active:bg-red-800',
        'focus:ring-red-500',
      ],
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
