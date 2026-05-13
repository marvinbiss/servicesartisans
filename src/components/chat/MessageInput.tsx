'use client'

import { useState, useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { ChatMessage } from '@/lib/realtime/chat-service'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSend: (content: string) => void
  onTyping?: () => void
  replyTo?: ChatMessage | null
  onCancelReply?: () => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = 'Écrivez votre message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    if (!message.trim() || disabled) return

    onSend(message.trim())
    setMessage('')
    inputRef.current?.focus()
  }, [message, disabled, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    onTyping?.()
  }

  return (
    <div className="border-t border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900">
      {/* Reply banner */}
      {replyTo && (
        <div className="flex items-center gap-3 px-4 py-2 bg-charcoal-50 dark:bg-charcoal-800 border-b border-charcoal-200 dark:border-charcoal-700">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-blue-600 font-medium">Réponse à</div>
            <p className="text-sm text-charcoal-600 dark:text-charcoal-300 truncate">
              {replyTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-charcoal-200 dark:hover:bg-charcoal-700 rounded text-charcoal-500"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main input area */}
      <div className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          {/* Text input */}
          <Input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />

          {/* Send button */}
          <Button type="submit" disabled={disabled || !message.trim()} className={cn('px-4')}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default MessageInput
