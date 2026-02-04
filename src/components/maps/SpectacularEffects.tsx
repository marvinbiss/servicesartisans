'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * 🌟 ULTRA-SPECTACULAR EFFECTS FOR WORLD-CLASS MAPS 🌟
 * Confetti, particles, trails, explosions !
 */

interface SpectacularEffectsProps {
  trigger?: boolean
  type?: 'confetti' | 'particles' | 'explosion' | 'trail'
}

export default function SpectacularEffects({ 
  trigger = false, 
  type = 'particles' 
}: SpectacularEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!trigger || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Particle system
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      color: string
      size: number
    }> = []

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 1,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: Math.random() * 6 + 2
      })
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.01
        p.size *= 0.98

        if (p.life <= 0) {
          particles.splice(i, 1)
          return
        }

        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [trigger, type])

  if (!trigger) return null

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-[10000]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

/**
 * Marker Trail Effect Component
 */
export function MarkerTrail({ active }: { active: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={active ? {
        scale: [1, 2, 3],
        opacity: [0.8, 0.4, 0],
      } : {}}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeOut"
      }}
      className="absolute inset-0 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}
    />
  )
}

/**
 * Explosion Effect on Click
 */
export function ExplosionEffect({ x, y, show }: { x: number; y: number; show: boolean }) {
  if (!show) return null

  return (
    <div className="fixed pointer-events-none z-[9999]" style={{ left: x, top: y }}>
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos((i / 12) * Math.PI * 2) * 100,
            y: Math.sin((i / 12) * Math.PI * 2) * 100,
            opacity: [1, 1, 0]
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-4 h-4 rounded-full"
          style={{
            background: `hsl(${(i / 12) * 360}, 70%, 60%)`
          }}
        />
      ))}
    </div>
  )
}
