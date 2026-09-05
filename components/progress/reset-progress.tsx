'use client'

import { useState } from 'react'
import { t, type Locale } from '@/lib/i18n'
import { Button } from '@/lib/ui'
import { useProgress } from './provider'

/** Clears everything, behind one confirmation — it cannot be undone. */
export function ResetProgress({ locale }: { locale: Locale }) {
  const { ready, total, reset } = useProgress()
  const [confirming, setConfirming] = useState(false)

  if (!ready || total === 0) return null

  if (!confirming) {
    return (
      <Button
        variant="text"
        label={t(locale, 'progress.reset')}
        onClick={() => setConfirming(true)}
        className="min-h-11"
      />
    )
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-2">
      <span>{t(locale, 'progress.resetConfirm', { count: total })}</span>
      <Button
        size="none"
        label={t(locale, 'progress.resetYes')}
        onClick={() => {
          reset()
          setConfirming(false)
        }}
        className="min-h-9 px-2.5 font-semibold"
      />
      <Button
        variant="text"
        label={t(locale, 'progress.resetNo')}
        onClick={() => setConfirming(false)}
        className="min-h-9"
      />
    </span>
  )
}
