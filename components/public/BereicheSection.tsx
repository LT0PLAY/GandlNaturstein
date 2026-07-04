'use client'

import Link from 'next/link'
import { useRef, useCallback, useEffect } from 'react'

interface BereichCard {
  title: string
  sub: string
  lines: string[]
  href: string
  video: string   // z.B. /videos/bereiche/massivproduktion.mp4
  gradient: string
  icon: React.ReactNode
}

function IconFactory() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* Fabrikgebäude */}
      <rect x="6" y="28" width="52" height="28" rx="0"/>
      <rect x="14" y="36" width="8" height="8" rx="0"/>
      <rect x="28" y="36" width="8" height="8" rx="0"/>
      <rect x="42" y="36" width="8" height="8" rx="0"/>
      <rect x="22" y="48" width="20" height="8" rx="0"/>
      {/* Schornsteine */}
      <rect x="12" y="16" width="6" height="14" rx="0"/>
      <rect x="26" y="10" width="6" height="18" rx="0"/>
      <rect x="42" y="20" width="6" height="8" rx="0"/>
      {/* Dampf */}
      <path d="M15 12 Q17 9 15 6"/>
      <path d="M29 6 Q31 3 29 0"/>
    </svg>
  )
}

function IconTools() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* Lineal diagonal links-oben nach rechts-unten */}
      <rect x="8" y="8" width="10" height="48" rx="0" transform="rotate(-45 32 32)"/>
      {/* Skalenstriche auf Lineal */}
      <line x1="20" y1="20" x2="23" y2="17"/>
      <line x1="27" y1="27" x2="30" y2="24"/>
      <line x1="34" y1="34" x2="37" y2="31"/>
      <line x1="41" y1="41" x2="44" y2="38"/>
      {/* Meißel diagonal rechts-oben nach links-unten */}
      <line x1="52" y1="10" x2="12" y2="50"/>
      <polygon points="52,10 58,6 60,14 54,16" strokeWidth="1.2"/>
      <polygon points="12,50 8,56 14,58 16,52" strokeWidth="1.2"/>
    </svg>
  )
}

function IconLeaf() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* Zentraler Stiel */}
      <path d="M32 56 L32 24"/>
      {/* Mittleres großes Blatt oben */}
      <path d="M32 24 C24 18 14 10 18 4 C24 8 36 16 32 24Z"/>
      <path d="M32 24 C40 18 50 10 46 4 C40 8 28 16 32 24Z"/>
      {/* Linkes Blatt */}
      <path d="M32 38 C26 32 16 28 12 32 C16 36 28 44 32 38Z"/>
      {/* Rechtes Blatt */}
      <path d="M32 38 C38 32 48 28 52 32 C48 36 36 44 32 38Z"/>
    </svg>
  )
}

const CARDS: BereichCard[] = [
  {
    title:    'MASSIVPRODUKTION',
    sub:      'EIGENES MATERIAL',
    lines:    ['JURA KALKSTEIN', '& MUSCHELKALK'],
    href:     '/aussen',
    video:    '/videos/bereiche/massivproduktion.mp4',
    gradient: 'linear-gradient(160deg, #1C1610 0%, #0E0C08 55%, #181410 100%)',
    icon:     <IconFactory />,
  },
  {
    title:    'SONDERANFERTIGUNG',
    sub:      'INDIVIDUELL NACH MASS',
    lines:    [
      'SONDERZUSCHNITT VON',
      'KERAMIKPLATTEN & NATURSTEIN',
      'FENSTERBÄNKE · KÜCHENARBEITSPLATTEN',
      'STUFENANLAGEN · UND MEHR',
    ],
    href:     '/sonderanfertigung',
    video:    '/videos/bereiche/sonderanfertigung.mp4',
    gradient: 'linear-gradient(160deg, #14100A 0%, #0C0A06 55%, #100E08 100%)',
    icon:     <IconTools />,
  },
  {
    title:    'GARTENGESTALTUNG',
    sub:      'VIELFALT FÜR IHREN AUSSENBEREICH',
    lines:    [
      'TERRASSENPLATTEN · MAUERSTEINE',
      'STELEN · BLOCKSTUFEN',
      'UND VIELES MEHR',
    ],
    href:     '/aussen',
    video:    '/videos/bereiche/gartengestaltung.mp4',
    gradient: 'linear-gradient(160deg, #120E08 0%, #0C0A06 55%, #100E06 100%)',
    icon:     <IconLeaf />,
  },
]

function BereichCard({ card }: { card: BereichCard }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef  = useRef<HTMLAnchorElement>(null)

  const onEnter = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.style.opacity = '1'
    v.play().catch(() => {/* autoplay blocked, ignore */})
  }, [])

  const onLeave = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.style.opacity = '0'
    setTimeout(() => { v.pause(); v.currentTime = 0 }, 400)
  }, [])

  // Mobile: Video startet automatisch wenn Karte in Bildschirmmitte gescrollt wird
  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches
    if (!isTouch) return
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? onEnter() : onLeave() },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onEnter, onLeave])

  return (
    <Link
      ref={cardRef}
      href={card.href}
      className="bereich-card"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Hintergrund-Gradient */}
      <div className="bereich-bg" style={{ background: card.gradient }} />

      {/* Hover-Video */}
      <video
        ref={videoRef}
        className="bereich-video"
        src={card.video}
        muted
        loop
        playsInline
        preload="none"
      />

      {/* Dunkles Overlay */}
      <div className="bereich-overlay" />

      {/* Inhalt */}
      <div className="bereich-body">
        <div className="bereich-top">
          <div className="bereich-icon">{card.icon}</div>
          <h3 className="bereich-title">{card.title}</h3>
          <p className="bereich-sub">{card.sub}</p>
          <div className="bereich-lines">
            {card.lines.map((line, i) => (
              <p key={i} className="bereich-line">{line}</p>
            ))}
          </div>
        </div>
        <div className="bereich-btn-wrap">
          <span className="bereich-cta">MEHR ERFAHREN →</span>
        </div>
      </div>
    </Link>
  )
}

export default function BereicheSection() {
  return (
    <section className="bereiche-section">
      <p className="bereiche-label">Unsere Bereiche</p>
      <div className="bereiche-grid">
        {CARDS.map((card) => (
          <BereichCard key={card.href + card.title} card={card} />
        ))}
      </div>

      <style>{`
        /* ── Bereiche Section ── */
        .bereiche-section {
          padding: 80px 40px;
          border-top: 0.5px solid rgba(196,146,58,0.12);
        }
        .bereiche-label {
          font-family: var(--font-inter), sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: rgba(196,146,58,0.85);
          letter-spacing: .18em;
          text-transform: uppercase;
          margin-bottom: 40px;
          text-align: center;
        }
        .bereiche-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }

        /* ── Karte ── */
        .bereich-card {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 560px;
          text-decoration: none;
          border: 0.5px solid rgba(196,146,58,0.2);
          overflow: hidden;
          transition: border-color .35s;
        }
        .bereich-card:hover { border-color: rgba(196,146,58,0.6); }

        /* Gradient-Hintergrund */
        .bereich-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        /* Video – initial unsichtbar, fade on hover via JS */
        .bereich-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
          opacity: 0;
          transition: opacity .4s ease;
        }

        /* Overlay – über Video (leicht verdunkelt) */
        .bereich-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.35) 0%,
            rgba(0,0,0,0.60) 60%,
            rgba(0,0,0,0.78) 100%
          );
          pointer-events: none;
        }

        /* Inhalt */
        .bereich-body {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
          padding: 40px 32px 36px;
          text-align: center;
          align-items: center;
        }
        .bereich-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        /* Icon */
        .bereich-icon {
          width: 54px;
          height: 54px;
          color: #C4923A;
          margin-bottom: 26px;
          opacity: .9;
        }
        .bereich-icon svg { width: 100%; height: 100%; }

        /* Titel */
        .bereich-title {
          font-family: var(--font-bebas), sans-serif;
          font-size: clamp(30px, 3.2vw, 42px);
          color: #F0EBE3;
          letter-spacing: .06em;
          line-height: .95;
          margin-bottom: 12px;
          text-align: center;
        }

        /* Subtitle bronze */
        .bereich-sub {
          font-family: var(--font-inter), sans-serif;
          font-size: 10px;
          letter-spacing: .2em;
          color: #C4923A;
          margin-bottom: 24px;
          font-weight: 500;
          text-transform: uppercase;
          text-align: center;
        }

        /* Feature-Zeilen */
        .bereich-lines {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 0;
          width: 100%;
        }
        .bereich-line {
          font-family: var(--font-inter), sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(240,235,227,0.82);
          letter-spacing: .06em;
          text-transform: uppercase;
          text-align: center;
          line-height: 1.6;
        }

        /* Button-Wrapper – zentriert, volle Breite */
        .bereich-btn-wrap {
          width: 100%;
          margin-top: 36px;
          display: flex;
          justify-content: center;
        }
        .bereich-cta {
          display: inline-block;
          background: #C4923A;
          color: #0A0806;
          font-family: var(--font-bebas), sans-serif;
          font-size: 15px;
          letter-spacing: .16em;
          padding: 14px 40px;
          transition: background .2s;
          text-align: center;
          min-width: 200px;
        }
        .bereich-card:hover .bereich-cta { background: #D4A24A; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .bereiche-grid    { grid-template-columns: 1fr; }
          .bereich-card     { min-height: 400px; }
          .bereiche-section { padding: 60px 20px; }
          .bereich-body     { padding: 36px 24px 28px; }
        }
      `}</style>
    </section>
  )
}
