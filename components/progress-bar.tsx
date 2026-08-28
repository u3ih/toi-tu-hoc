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
    <div className="sticky top-16 z-40 -mt-px h-0.5 w-full">
      <div
        className="h-full origin-left bg-gradient-to-r from-brand-400 to-brand-600 transition-transform duration-75"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
