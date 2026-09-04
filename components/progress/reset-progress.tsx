'use client'

import { useState } from 'react'
import { t, type Locale } from '@/lib/i18n'
import { useProgress } from './provider'

/** Clears everything, behind one confirmation — it cannot be undone. */
export function ResetProgress({ locale }: { locale: Locale }) {
  const { ready, total, reset } = useProgress()
  const [confirming, setConfirming] = useState(false)

  if (!ready || total === 0) return null

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="underline decoration-2 underline-offset-4 hover:text-brand-600 dark:hover:text-accent-400"
      >
        {t(locale, 'progress.reset')}
      </button>
    )
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-2">
      <span>{t(locale, 'progress.resetConfirm', { count: total })}</span>
      <button
        type="button"
        onClick={() => {
          reset()
          setConfirming(false)
        }}
        className="rounded-retro border-2 px-2 py-0.5 font-semibold hover:bg-accent-400 hover:text-brand-900"
      >
        {t(locale, 'progress.resetYes')}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="underline decoration-2 underline-offset-4"
      >
        {t(locale, 'progress.resetNo')}
      </button>
    </span>
  )
}
