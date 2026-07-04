export const dynamic = 'force-dynamic'

import Link from 'next/link'
import BereicheSection from '@/components/public/BereicheSection'

export default function HomePage() {
  return (
    <main>

      {/* ── Hero mit Hintergrundvideo ── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        overflow: 'hidden',
      }}>

        {/* Video Desktop (16:9) — versteckt auf Mobile */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
          className="hero-video-desktop"
        >
          <source src="/hero-desktop.mp4" type="video/mp4" />
        </video>

        {/* Video Mobile (9:16) — nur auf Mobile sichtbar */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
          className="hero-video-mobile"
        >
          <source src="/hero-mobile.mp4" type="video/mp4" />
        </video>

        {/* Dunkel-Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(10,8,6,0.75) 0%, rgba(10,8,6,0.3) 60%, rgba(10,8,6,0.1) 100%)',
          zIndex: 1,
        }} />

        {/* Inhalt */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '520px', paddingTop: '72px' }}>
          <p style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            color: 'var(--color-sage-muted)',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            marginBottom: '18px',
          }}>
            Naturstein · München · Seit 1987
          </p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(72px, 11vw, 120px)',
            color: '#F0EBE3',
            lineHeight: '.88',
            letterSpacing: '.02em',
            marginBottom: '22px',
          }}>
            Stein,<br />der bleibt.
          </h1>
          <p style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '16px',
            color: 'rgba(240,235,227,0.7)',
            lineHeight: 1.75,
            marginBottom: '36px',
            maxWidth: '380px',
          }}>
            Außen, Innen und Sonderanfertigungen <br />
            professionell verarbeitet in Bayern.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/kontakt" style={{
              background: 'var(--color-sage)',
              color: '#0A0806',
              fontFamily: 'var(--font-bebas)',
              fontSize: '17px',
              letterSpacing: '.14em',
              padding: '15px 36px',
              textDecoration: 'none',
            }}>
              ANFRAGEN
            </Link>
            <Link href="/aussen" style={{
              color: 'rgba(240,235,227,0.65)',
              fontFamily: 'var(--font-inter)',
              fontSize: '13px',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              padding: '15px 0',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{ width: '28px', height: '0.5px', background: 'var(--color-sage-muted)', display: 'inline-block' }} />
              Produkte entdecken
            </Link>
          </div>
        </div>

        {/* Scroll-Indikator */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '10px',
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: 'rgba(196,146,58,0.45)',
          }}>Scroll</span>
          <div style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, rgba(196,146,58,0.4), transparent)',
          }} />
        </div>
      </section>

      <BereicheSection />

      {/* Video + Hero Responsive CSS */}
      <style>{`
        .hero-video-mobile { display: none; }
        @media (max-width: 768px) {
          .hero-video-desktop { display: none; }
          .hero-video-mobile  { display: block; }
        }

        /* Hero-Sektion mobil */
        @media (max-width: 600px) {
          section:first-of-type {
            padding: 0 24px !important;
            min-height: 100svh !important;
          }
          section:first-of-type > div[style*="position: relative"] {
            padding-top: 100px !important;
            max-width: 100% !important;
          }
        }
      `}</style>

    </main>
  )
}
