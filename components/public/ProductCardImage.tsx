'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  images:     string[]
  thumbnail:  string | null
  alt:        string
  altMap?:    Record<string, string>
  className:  string
  placeholderClassName: string
  placeholderLabel: string
}

// Zeigt das Titelbild; beim Hovern wechseln die Bilder alle paar
// Sekunden automatisch durch (Titelbild + weitere Produktbilder).
export default function ProductCardImage({
  images, thumbnail, alt, altMap, className, placeholderClassName, placeholderLabel,
}: Props) {
  const ordered = thumbnail
    ? [thumbnail, ...images.filter((src) => src !== thumbnail)]
    : images

  const [index, setIndex]     = useState(0)
  const [hovering, setHover]  = useState(false)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const quickRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (hovering && ordered.length > 1) {
      // Sofort beim Hovern zügig zum nächsten Bild wechseln (kurze Verzögerung,
      // damit der Effekt spürbar sofort reagiert), danach im normalen Takt weiter.
      quickRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % ordered.length)
        timerRef.current = setInterval(() => {
          setIndex((i) => (i + 1) % ordered.length)
        }, 1800)
      }, 120)
    }
    return () => {
      if (quickRef.current) clearTimeout(quickRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [hovering, ordered.length])

  function handleLeave() {
    setHover(false)
    setIndex(0)
  }

  if (ordered.length === 0) {
    return (
      <div className={placeholderClassName}>
        <span>{placeholderLabel}</span>
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleLeave}
      style={{ position: 'absolute', inset: 0 }}
    >
      {ordered.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={altMap?.[src] ?? alt}
          className={className}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: 'opacity .6s ease',
          }}
        />
      ))}
    </div>
  )
}
