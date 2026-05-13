'use client'

/**
 * Mounts the command palette globally — listens to Cmd/Ctrl+K + the custom
 * `sa:open-command-palette` event so any UI element (header button, mobile menu)
 * can trigger it.
 *
 * Loads the actual palette via dynamic import to keep the initial JS payload
 * lean (the palette is rarely opened by guests, but every keystroke matters
 * for INP / SEO).
 */
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'

const CommandPalette = dynamic(
  () => import('./CommandPalette').then((mod) => ({ default: mod.CommandPalette })),
  { ssr: false }
)

export const OPEN_COMMAND_PALETTE_EVENT = 'sa:open-command-palette'

export function CommandPaletteMount() {
  const [open, setOpen] = useState(false)

  const onOpen = useCallback(() => setOpen(true), [])
  const onClose = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Cmd+K (mac) or Ctrl+K (win/linux). Avoid hijacking when input/textarea is focused
      // unless the user explicitly typed in the global hotkey.
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setOpen((v) => !v)
      }
      // Slash to open (popular pattern, but only when no input is focused)
      if (e.key === '/' && !open) {
        const target = e.target as HTMLElement | null
        const tag = target?.tagName?.toLowerCase()
        const editable = target?.isContentEditable
        if (tag !== 'input' && tag !== 'textarea' && !editable) {
          e.preventDefault()
          setOpen(true)
        }
      }
    }
    const handleCustom = () => setOpen(true)
    window.addEventListener('keydown', handleKey)
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleCustom)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleCustom)
    }
  }, [open, onOpen])

  return <CommandPalette open={open} onClose={onClose} />
}

export default CommandPaletteMount
