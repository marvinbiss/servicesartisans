'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface MessageReactionsProps {
  onSelect: (emoji: string) => void
  onClose: () => void
  position?: 'left' | 'right'
}

const QUICK_EMOJIS = ['👍', '❤️', '😊', '😂', '😮', '😢', '🙏', '🎉']

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
  'Gestes': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💪'],
  'Coeurs': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  'Objets': ['⭐', '🌟', '✨', '💫', '🔥', '💯', '🎉', '🎊', '🎁', '🏆', '🥇', '🎯', '💡', '📌', '✅', '❌'],
}

export function MessageReactions({ onSelect, onClose, position = 'right' }: MessageReactionsProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2',
        position === 'left' ? 'right-full mr-2' : 'left-full ml-2',
        'top-0'
      )}
    >
      {/* Quick access row */}
      <div className="flex gap-1 pb-2 border-b border-gray-200 dark:border-gray-700 mb-2">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Full picker */}
      <div className="max-h-48 overflow-y-auto">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <div key={category} className="mb-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
              {category}
            </div>
            <div className="grid grid-cols-8 gap-0.5">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="w-7 h-7 flex items-center justify-center text-base hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MessageReactions
