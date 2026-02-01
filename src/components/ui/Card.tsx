'use client'

import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'premium'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white border border-gray-200 rounded-xl',
      outlined: 'bg-transparent border-2 border-gray-200 rounded-xl',
      elevated: 'bg-white rounded-xl shadow-lg',
      premium: 'bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl shadow-md',
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={clsx(
          variants[variant],
          paddings[padding],
          hover && 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function CardHeader({ title, subtitle, action, className, ...props }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between', className)} {...props}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={clsx('mt-4', className)} {...props}>
      {children}
    </div>
  )
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={clsx('mt-6 pt-4 border-t border-gray-100', className)} {...props}>
      {children}
    </div>
  )
}

export default Card
