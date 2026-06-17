'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyCodeButtonProps {
  code: string
  className?: string
}

export default function CopyCodeButton({ code, className }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = code
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
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
      type="button"
      onClick={handleCopy}
      className={
        className ||
        'inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(200, 73, 42,0.3)] hover:shadow-[0_8px_25px_0_rgba(200, 73, 42,0.4)]'
      }
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copié !
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copier le code
        </>
      )}
    </button>
  )
}
