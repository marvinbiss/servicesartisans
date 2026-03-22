'use client'

import React, { useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { renderMarkdown } from './utils'
import type { EstimationContext } from './utils'
import type { UseEstimationChatReturn } from './hooks/useEstimationChat'
import type { UseLeadSubmitReturn } from './hooks/useLeadSubmit'
import { LeadForm } from './LeadForm'

interface ChatPanelProps {
  context: EstimationContext
  chat: UseEstimationChatReturn
  lead: UseLeadSubmitReturn
  prompts: string[]
}

export const ChatPanel = memo(function ChatPanel({
  context,
  chat,
  lead,
  prompts,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages])

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  return (
    <>
      {/* Chat messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        role="log"
        aria-live="polite"
      >
        {/* Welcome message */}
        {chat.messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-sand-100 px-4 py-3 text-sm text-charcoal-800">
              {context.artisan ? (
                <>
                  Bonjour ! Je suis l'assistant IA d'estimation de{' '}
                  <strong>{context.artisan.name}</strong>,{' '}
                  {context.metier.toLowerCase()} à{' '}
                  <strong>{context.ville}</strong>. Décrivez votre
                  projet et je vous donnerai une estimation de prix.
                </>
              ) : (
                <>
                  Bonjour ! Je suis l'assistant IA d'estimation.
                  Dites-moi quel projet vous avez en tête avec votre{' '}
                  <strong>{context.metier.toLowerCase()}</strong> à{' '}
                  <strong>{context.ville}</strong>, et je vous
                  donnerai une estimation de prix.
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        {chat.messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={
              'flex ' +
              (msg.role === 'user' ? 'justify-end' : 'justify-start')
            }
          >
            <div
              className={
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ' +
                (msg.role === 'user'
                  ? 'rounded-tr-sm bg-primary-400 text-white'
                  : 'rounded-tl-sm bg-sand-100 text-charcoal-800')
              }
            >
              {msg.role === 'assistant'
                ? renderMarkdown(msg.content)
                : msg.content}
              {/* Streaming cursor */}
              {msg.role === 'assistant' &&
                idx === chat.messages.length - 1 &&
                chat.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-charcoal-400 animate-pulse rounded-sm align-text-bottom" />
                )}
            </div>
          </motion.div>
        ))}

        {/* Quick prompts (before first user message) */}
        {!chat.hasUserMessages && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 pt-1"
          >
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => chat.sendMessage(prompt)}
                disabled={chat.isStreaming}
                className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-100 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </motion.div>
        )}

        {/* Lead form (slide up after trigger) */}
        <AnimatePresence>
          {chat.showLeadForm && !lead.leadSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
            >
              <LeadForm context={context} lead={lead} />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <form
        onSubmit={chat.handleChatSubmit}
        className="flex items-center gap-2 border-t border-sand-200 px-3 py-2.5 shrink-0"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={chat.inputValue}
          onChange={(e) => chat.setInputValue(e.target.value)}
          placeholder="Décrivez votre besoin..."
          disabled={chat.isStreaming}
          className="flex-1 rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-400 disabled:opacity-50"
          style={{ fontSize: '16px' }}
        />
        <button
          type="submit"
          disabled={chat.isStreaming || !chat.inputValue.trim()}
          aria-label="Envoyer le message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-400 text-white hover:bg-primary-600 transition-colors disabled:opacity-40"
        >
          {chat.isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </>
  )
})
