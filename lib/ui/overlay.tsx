'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useBodyScrollLock } from '@/lib/hooks'
import { Portal } from './portal'

type Props = {
  /** Names the dialog for screen readers. */
  label: string
  onClose: () => void
  /**
   * `top` seats the panel below the header, which is where a command palette is
   * expected; `center` is for a panel the reader should not have to look for.
   */
  align?: 'top' | 'center'
  children: ReactNode
}

/**
 * A modal scrim: dims and blurs the whole page, and closes on a click outside
 * the panel or on Escape.
 *
 * Every part of "open something over the page" that is not the panel itself
 * lives here — the portal, the scroll lock, the two dismiss gestures, the
 * dialog role. A caller supplies only its own panel.
 *
 * The blur is real background blur rather than a heavier dim because the panel
 * is a flat, hard-edged card on a page of flat, hard-edged cards; without the
 * page behind it going soft, the two read as the same layer.
 */
export function Overlay({ label, onClose, align = 'top', children }: Props) {
  useBodyScrollLock(true)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <Portal>
      {/* The click is the backdrop dismiss; Escape is the keyboard path, wired
          in the effect above. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape is the keyboard path */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`fixed inset-0 z-50 flex justify-center bg-brand-900/70 p-4 backdrop-blur-md dark:bg-[oklch(0.15_0.04_258)]/75 ${
          align === 'top' ? 'items-start pt-[12vh]' : 'items-center'
        }`}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        {children}
      </div>
    </Portal>
  )
}
