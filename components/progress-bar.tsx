'use client'

import { useEffect, useState } from 'react'

/** Thin bar under the header showing how far down the article the reader is. */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable <= 0 ? 0 : Math.min(1, window.scrollY / scrollable))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="sticky top-16 z-40 -mt-0.5 h-1.5 w-full">
      <div
        className="h-full origin-left border-b-2 border-brand-900 bg-accent-400 transition-transform duration-75"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
