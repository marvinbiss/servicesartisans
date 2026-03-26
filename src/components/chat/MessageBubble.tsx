'use client'

import { useState, useRef } from 'react'
import {
  Check,
  CheckCheck,
  MoreVertical,
  Reply,
  Copy,
} from 'lucide-react'
import { ChatMessage } from '@/lib/realtime/chat-service'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
  currentUserId: string
  onReply?: (message: ChatMessage) => void
  showAvatar?: boolean
  replyToMessage?: ChatMessage
}

export function MessageBubble({
  message,
  isOwn,
  currentUserId: _currentUserId,
  onReply,
  showAvatar: _showAvatar = true,
  replyToMessage,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setShowMenu(false)
  }

  return (
    <div
      className={cn(
        'group relative flex',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Action buttons (hover) */}
      <div
        className={cn(
          'absolute top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isOwn ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'
        )}
      >
        <button
          onClick={() => onReply?.(message)}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
          title="Répondre"
        >
          <Reply className="w-4 h-4" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Context menu */}
          {showMenu && (
            <div
              className={cn(
                'absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[140px]',
                isOwn ? 'right-0' : 'left-0'
              )}
            >
              <button
                onClick={handleCopy}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copier
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message content */}
      <div className="max-w-[70%]">
        {/* Reply preview */}
        {replyToMessage && (
          <div
            className={cn(
              'text-xs px-3 py-1.5 mb-1 rounded-t-lg border-l-2',
              isOwn
                ? 'bg-blue-500/20 border-blue-300 text-blue-100'
                : 'bg-gray-200 dark:bg-gray-700 border-gray-400 text-gray-600 dark:text-gray-300'
            )}
          >
            <span className="font-medium">
              {replyToMessage.sender_type === 'artisan' ? 'Artisan' : 'Client'}
            </span>
            <p className="truncate">{replyToMessage.content}</p>
          </div>
        )}

        {/* Main bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md',
            replyToMessage && 'rounded-t-none'
          )}
        >
          {/* Text content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Timestamp and status */}
          <div
            className={cn(
              'flex items-center gap-1 mt-1',
              isOwn ? 'justify-end' : 'justify-start'
            )}
          >
            <span
              className={cn(
                'text-xs',
                isOwn ? 'text-blue-200' : 'text-gray-400'
              )}
            >
              {formatTime(message.created_at)}
            </span>
            {isOwn && (
              message.read_at ? (
                <CheckCheck className="w-3 h-3 text-blue-200" />
              ) : (
                <Check className="w-3 h-3 text-blue-200" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
