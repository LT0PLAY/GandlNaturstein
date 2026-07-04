'use client'

import { useState, useCallback, useEffect } from 'react'

type Props = {
  images: string[]
  title: string
}

export default function SideCarousel({ images, title }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length])
  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length])

  useEffect(() => {
    if (paused || images.length <= 1) return
    const t = setInterval(next, 3500)
    return () => clearInterval(t)
  }, [paused, next, images.length])

  if (!images.length) return null

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: '420px', overflow: 'hidden', background: '#080806' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${title} ${i + 1}`}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: i === current ? 1 : 0,
            transition: 'opacity .7s ease',
            filter: 'brightness(0.85) saturate(0.8)',
          }}
        />
      ))}

      {/* Verlauf rechts — Übergang zur Beschreibungsspalte */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, transparent 50%, rgba(10,9,7,0.6) 80%, rgba(10,9,7,0.98) 100%)',
        pointerEvents: 'none',
      }} />
      {/* Verlauf unten */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(10,9,7,0.3) 0%, transparent 20%, transparent 80%, rgba(10,9,7,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Pfeile */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.45)', border: '0.5px solid rgba(196,146,58,0.25)',
              color: 'rgba(196,146,58,0.8)', width: '36px', height: '36px',
              cursor: 'pointer', fontSize: '18px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 2,
            }}
          >
            ‹
          </button>
          <button
            onClick={next}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.45)', border: '0.5px solid rgba(196,146,58,0.25)',
              color: 'rgba(196,146,58,0.8)', width: '36px', height: '36px',
              cursor: 'pointer', fontSize: '18px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 2,
            }}
          >
            ›
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '7px', alignItems: 'center', zIndex: 2,
        }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? '22px' : '5px', height: '2px',
                background: i === current ? 'var(--color-gold)' : 'rgba(196,146,58,0.3)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all .3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      <span style={{
        position: 'absolute', bottom: '14px', right: '16px',
        fontFamily: 'var(--font-bebas)', fontSize: '11px',
        color: 'rgba(196,146,58,0.45)', letterSpacing: '.14em', zIndex: 2,
      }}>
        {String(current + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </span>
    </div>
  )
}
