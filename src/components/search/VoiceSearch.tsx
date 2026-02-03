'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, MicOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Proper TypeScript types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported'
  message: string
}

interface SpeechRecognitionResult {
  isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition
}

// Extend window interface
declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor
    webkitSpeechRecognition?: ISpeechRecognitionConstructor
  }
}

interface VoiceSearchProps {
  onResult: (transcript: string) => void
  onError?: (error: string) => void
  language?: string
  className?: string
}

export function VoiceSearch({
  onResult,
  onError,
  language = 'fr-FR',
  className,
}: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setIsSupported(false)
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      onError?.('La reconnaissance vocale n\'est pas supportée par votre navigateur')
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognitionRef.current = recognition
    recognition.lang = language
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex
      const result = event.results[current]
      const text = result[0].transcript

      setTranscript(text)

      if (result.isFinal) {
        onResult(text)
        setIsListening(false)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false)
      if (event.error === 'no-speech') {
        onError?.('Aucune parole détectée')
      } else if (event.error === 'not-allowed') {
        onError?.('Accès au microphone refusé')
      } else {
        onError?.('Erreur de reconnaissance vocale')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch {
      onError?.('Erreur lors du démarrage')
    }
  }, [language, onResult, onError])

  const stopListening = useCallback(() => {
    setIsListening(false)
    setTranscript('')
  }, [])

  if (!isSupported) {
    return null
  }

  return (
    <div className={cn('relative', className)}>
      {/* Voice button */}
      <button
        onClick={isListening ? stopListening : startListening}
        className={cn(
          'p-3 rounded-full transition-all',
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        )}
        title={isListening ? 'Arrêter' : 'Recherche vocale'}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Listening overlay */}
      {isListening && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <button
              onClick={stopListening}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Animated mic icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25" />
              <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse opacity-50" />
              <div className="relative w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
                <Mic className="w-12 h-12 text-white" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Parlez maintenant...
            </h3>

            {transcript ? (
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                "{transcript}"
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Dites le nom d'un service ou d'une ville
              </p>
            )}

            {/* Sound wave animation */}
            <div className="flex justify-center items-center gap-1 mt-6 h-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 20}px`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceSearch
