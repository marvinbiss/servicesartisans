'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Building2, Loader2, CheckCircle2, XCircle, AlertCircle, X, Search } from 'lucide-react'
import { useSiretValidation } from '@/lib/hooks/useAutocomplete'

interface CompanyInfo {
  name: string
  active: boolean
  address?: string
  activity?: string
  siren?: string
}

interface SiretAutocompleteProps {
  value?: string
  placeholder?: string
  onValidated?: (siret: string, company: CompanyInfo | null) => void
  onClear?: () => void
  className?: string
  inputClassName?: string
  disabled?: boolean
  showCompanyPreview?: boolean
  autoFocus?: boolean
}

export function SiretAutocomplete({
  value = '',
  placeholder = 'Numéro SIRET (14 chiffres)...',
  onValidated,
  onClear,
  className = '',
  inputClassName = '',
  disabled = false,
  showCompanyPreview = true,
  autoFocus = false
}: SiretAutocompleteProps) {
  const {
    siret,
    setSiret,
    rawSiret,
    isValid,
    isLoading,
    error,
    companyInfo,
    clear
  } = useSiretValidation()

  const [isFocused, setIsFocused] = useState(false)
  const [extendedInfo, setExtendedInfo] = useState<CompanyInfo | null>(null)
  const [loadingExtended, setLoadingExtended] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync with external value
  useEffect(() => {
    if (value && value !== siret) {
      setSiret(value)
    }
  }, [value, setSiret, siret])

  // Fetch extended company info when SIRET is valid
  useEffect(() => {
    if (!isValid || !rawSiret) {
      setExtendedInfo(null)
      return
    }

    const fetchExtendedInfo = async () => {
      setLoadingExtended(true)
      try {
        // Try Pappers first for richer data
        const { getEntrepriseParSiren } = await import('@/lib/api/pappers')
        const entreprise = await getEntrepriseParSiren(rawSiret.substring(0, 9))

        if (entreprise) {
          const info: CompanyInfo = {
            name: entreprise.nom || entreprise.nomCommercial || companyInfo?.name || '',
            active: entreprise.actif,
            address: entreprise.siege?.adresse
              ? `${entreprise.siege.adresse}, ${entreprise.siege.codePostal} ${entreprise.siege.ville}`
              : undefined,
            activity: entreprise.libelleNAF,
            siren: rawSiret.substring(0, 9)
          }
          setExtendedInfo(info)
          onValidated?.(rawSiret, info)
        } else {
          // Fallback to basic info
          const info: CompanyInfo = {
            name: companyInfo?.name || '',
            active: companyInfo?.active || false,
            siren: rawSiret.substring(0, 9)
          }
          setExtendedInfo(info)
          onValidated?.(rawSiret, info)
        }
      } catch {
        // Fallback to companyInfo from SIRENE
        if (companyInfo) {
          const info: CompanyInfo = {
            name: companyInfo.name,
            active: companyInfo.active,
            siren: rawSiret.substring(0, 9)
          }
          setExtendedInfo(info)
          onValidated?.(rawSiret, info)
        }
      } finally {
        setLoadingExtended(false)
      }
    }

    fetchExtendedInfo()
  }, [isValid, rawSiret, companyInfo, onValidated])

  // Handle clear
  const handleClear = useCallback(() => {
    clear()
    setExtendedInfo(null)
    inputRef.current?.focus()
    onClear?.()
  }, [clear, onClear])

  // Get status icon
  const getStatusIcon = () => {
    if (isLoading || loadingExtended) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
    }
    if (rawSiret.length === 14) {
      if (isValid === true) {
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      }
      if (isValid === false) {
        return <XCircle className="w-5 h-5 text-red-500" />
      }
    }
    if (rawSiret.length > 0 && rawSiret.length < 14) {
      return <AlertCircle className="w-5 h-5 text-amber-500" />
    }
    return <Search className="w-5 h-5 text-gray-400" />
  }

  // Get border color based on status
  const getBorderColor = () => {
    if (rawSiret.length === 14) {
      if (isValid === true) return 'border-green-500 focus-within:ring-green-500/20'
      if (isValid === false) return 'border-red-500 focus-within:ring-red-500/20'
    }
    if (isFocused) return 'border-blue-500 focus-within:ring-blue-500/20'
    return 'border-gray-200'
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Container */}
      <div
        className={`
          relative bg-white rounded-xl border-2 transition-all
          focus-within:ring-4
          ${getBorderColor()}
        `}
      >
        {/* Left Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Building2 className="w-5 h-5 text-gray-400" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={siret}
          onChange={(e) => setSiret(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`
            w-full pl-10 pr-20 py-3.5
            bg-transparent
            placeholder:text-gray-400 text-gray-900
            font-mono tracking-wider text-lg
            disabled:bg-gray-100 disabled:cursor-not-allowed
            focus:outline-none
            ${inputClassName}
          `}
          autoComplete="off"
          inputMode="numeric"
        />

        {/* Right Actions */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Status Icon */}
          {getStatusIcon()}

          {/* Clear Button */}
          {siret && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Effacer"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Character Counter */}
      <div className="absolute right-3 -bottom-5 text-xs text-gray-400">
        {rawSiret.length}/14
      </div>

      {/* Error Message */}
      {error && rawSiret.length === 14 && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Company Preview Card */}
      {showCompanyPreview && isValid && extendedInfo && (
        <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 truncate">
                  {extendedInfo.name}
                </h4>
                <span className={`
                  px-2 py-0.5 text-xs font-medium rounded-full
                  ${extendedInfo.active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                  }
                `}>
                  {extendedInfo.active ? 'Active' : 'Cessée'}
                </span>
              </div>

              {extendedInfo.activity && (
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {extendedInfo.activity}
                </p>
              )}

              {extendedInfo.address && (
                <p className="mt-1 text-sm text-gray-500 truncate">
                  📍 {extendedInfo.address}
                </p>
              )}

              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span className="font-mono">SIREN: {extendedInfo.siren}</span>
                <span className="font-mono">SIRET: {rawSiret}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Hint */}
      {rawSiret.length > 0 && rawSiret.length < 14 && isFocused && (
        <div className="mt-2 text-sm text-gray-500">
          Entrez encore {14 - rawSiret.length} chiffre{14 - rawSiret.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
