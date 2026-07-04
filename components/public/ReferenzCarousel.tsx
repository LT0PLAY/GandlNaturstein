'use client'

import { useState, useEffect, useCallback } from 'react'

type Slide = {
  image: string
  label?: string
}

type Props = {
  slides: Slide[]
  title: string
  autoInterval?: number
}

export default function ReferenzCarousel({ slides, title, autoInterval = 2500 }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const t = setInterval(next, autoInterval)
    return () => clearInterval(t)
  }, [paused, next, autoInterval, slides.length])

  if (!slides.length) return null

  const slide = slides[current]

  return (
    <div
      style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#080806' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          style={{
            position: i === 0 ? 'relative' : 'absolute',
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity .8s ease',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          {/* Bild */}
          <div style={{ position: 'relative', aspectRatio: '16/7', overflow: 'hidden' }}>
            <img
              src={s.image}
              alt={`${title} – ${i + 1}`}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: 'brightness(0.6) saturate(0.85)',
              }}
            />
            {/* Vignette: Bild verschmilzt mit Hintergrund */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `
                radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(8,8,6,0.7) 100%),
                linear-gradient(to bottom, rgba(8,8,6,0.5) 0%, transparent 20%, transparent 70%, rgba(8,8,6,0.95) 100%),
                linear-gradient(to right, rgba(8,8,6,0.6) 0%, transparent 15%, transparent 85%, rgba(8,8,6,0.6) 100%)
              `,
            }} />
          </div>

          {/* Text-Overlay unten links */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 48px 40px',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            {s.label && (
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '13px',
                color: 'rgba(240,235,227,0.6)', letterSpacing: '.06em',
                maxWidth: '480px', lineHeight: 1.6,
              }}>
                {s.label}
              </p>
            )}
            {/* Slide-Nummer */}
            <span style={{
              fontFamily: 'var(--font-bebas)', fontSize: '11px',
              color: 'rgba(196,146,58,0.5)', letterSpacing: '.14em',
              marginLeft: 'auto',
            }}>
              {String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      ))}

      {/* Navigation dots */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '16px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: '8px', alignItems: 'center',
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? '24px' : '6px',
                height: '2px',
                background: i === current ? 'var(--color-gold)' : 'rgba(196,146,58,0.3)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all .3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Pfeil-Navigation */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((i) => (i - 1 + slides.length) % slides.length)}
            style={{
              position: 'absolute', left: '16px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.4)', border: '0.5px solid rgba(196,146,58,0.2)',
              color: 'rgba(196,146,58,0.7)', width: '40px', height: '40px',
              cursor: 'pointer', fontSize: '16px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ‹
          </button>
          <button
            onClick={next}
            style={{
              position: 'absolute', right: '16px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.4)', border: '0.5px solid rgba(196,146,58,0.2)',
              color: 'rgba(196,146,58,0.7)', width: '40px', height: '40px',
              cursor: 'pointer', fontSize: '16px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
