'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { MoreHorizontal, MoreVertical } from 'lucide-react'

export interface ActionItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger' | 'success' | 'warning'
  disabled?: boolean
  divider?: boolean
}

interface ActionDropdownProps {
  actions: ActionItem[]
  trigger?: ReactNode
  align?: 'left' | 'right'
  variant?: 'horizontal' | 'vertical'
}

export function ActionDropdown({
  actions,
  trigger,
  align = 'right',
  variant = 'horizontal',
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const getVariantClasses = (itemVariant: ActionItem['variant'] = 'default') => {
    switch (itemVariant) {
      case 'danger':
        return 'text-red-600 hover:bg-red-50'
      case 'success':
        return 'text-green-600 hover:bg-green-50'
      case 'warning':
        return 'text-amber-600 hover:bg-amber-50'
      default:
        return 'text-charcoal-700 hover:bg-sand-50'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-100 rounded-lg transition-colors"
        aria-label="Ouvrir le menu d'actions"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger ||
          (variant === 'horizontal' ? (
            <MoreHorizontal className="w-5 h-5" />
          ) : (
            <MoreVertical className="w-5 h-5" />
          ))}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Actions disponibles"
          className={`absolute z-50 mt-1 w-48 bg-white rounded-lg shadow-lg border border-sand-200 py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {actions.map((action, index) => (
            <div key={index}>
              {action.divider && index > 0 && <div className="my-1 border-t border-sand-100" />}
              <button
                role="menuitem"
                onClick={() => {
                  if (!action.disabled) {
                    action.onClick()
                    setIsOpen(false)
                  }
                }}
                disabled={action.disabled}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  action.disabled
                    ? 'text-charcoal-400 cursor-not-allowed'
                    : getVariantClasses(action.variant)
                }`}
              >
                {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                {action.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
