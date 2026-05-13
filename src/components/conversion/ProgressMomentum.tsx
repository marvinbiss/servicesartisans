'use client'

import { useState, useEffect, useRef } from 'react'
import { Check } from 'lucide-react'

interface ProgressMomentumProps {
  /** Current step (1-based) */
  currentStep: number
  /** Total number of steps */
  totalSteps: number
}

const encouragements: Record<number, string> = {
  1: '',
  2: 'Bien ! Plus que 2 étapes',
  3: 'Presque terminé !',
  4: "C'est la dernière étape !",
}

/**
 * ProgressMomentum — Gamification-light component for step completion feedback.
 *
 * Shows a micro-animation check + encouraging text when the user advances.
 * Designed to sit above or near the step indicator.
 *
 * AUTONOMOUS: does not modify DevisForm.
 */
export default function ProgressMomentum({ currentStep, totalSteps }: ProgressMomentumProps) {
  const [showCheck, setShowCheck] = useState(false)
  const [animateBounce, setAnimateBounce] = useState(false)
  const prevStepRef = useRef(currentStep)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Only animate when step ADVANCES (not on mount or going back)
    if (currentStep > prevStepRef.current) {
      setShowCheck(true)
      setAnimateBounce(true)
      setMessage(encouragements[currentStep] || '')

      // Remove check after animation
      const checkTimer = setTimeout(() => setShowCheck(false), 1500)
      const bounceTimer = setTimeout(() => setAnimateBounce(false), 600)

      prevStepRef.current = currentStep
      return () => {
        clearTimeout(checkTimer)
        clearTimeout(bounceTimer)
      }
    }

    prevStepRef.current = currentStep
  }, [currentStep])

  // Don't show anything on step 1
  if (currentStep <= 1) return null

  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="mb-3" aria-live="polite" aria-atomic="true">
      {/* Progress bar with bounce */}
      <div className="relative h-1.5 bg-sand-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full bg-gradient-to-r from-primary-400 to-accent-500 rounded-full transition-all duration-500 ease-out ${
            animateBounce ? 'scale-x-105' : 'scale-x-100'
          }`}
          style={{
            width: `${progress}%`,
            transformOrigin: 'left center',
          }}
        />
      </div>

      {/* Encouragement message + check */}
      <div className="flex items-center gap-2 min-h-[1.5rem]">
        {/* Animated check */}
        <div
          className={`transition-all duration-300 ${
            showCheck ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Text */}
        <p
          className={`text-sm font-medium transition-all duration-300 ${
            showCheck
              ? 'text-accent-600 trancharcoal-x-0 opacity-100'
              : 'text-charcoal-400 -trancharcoal-x-2 opacity-70'
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  )
}
