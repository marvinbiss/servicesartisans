'use client'

import { useState } from 'react'
import { Copy, CheckCircle } from 'lucide-react'

interface WidgetCopyButtonProps {
  code: string
}

export function WidgetCopyButton({ code }: WidgetCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      aria-label="Copier le code"
    >
      {copied ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Copie !</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copier</span>
        </>
      )}
    </button>
  )
}
