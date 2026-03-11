import { useEffect, useRef, useState, type ReactNode } from 'react'

type DeferredSectionProps = {
  children: ReactNode
  minHeight?: number
  rootMargin?: string
}

export function DeferredSection({
  children,
  minHeight = 720,
  rootMargin = '320px 0px',
}: DeferredSectionProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (shouldRender) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    if (typeof IntersectionObserver === 'undefined') {
      setShouldRender(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setShouldRender(true)
        observer.disconnect()
      },
      { rootMargin },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [rootMargin, shouldRender])

  return (
    <div ref={sentinelRef} style={shouldRender ? undefined : { minHeight }}>
      {shouldRender ? children : null}
    </div>
  )
}
