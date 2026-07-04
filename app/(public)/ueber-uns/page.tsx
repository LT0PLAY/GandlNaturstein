export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Über uns – Gandl Natursteine',
  description: 'Seit 1987 verarbeiten wir Naturstein mit Leidenschaft und Präzision. Lernen Sie das Unternehmen, unser Team und unsere Philosophie kennen.',
}

export default function UeberUnsPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section style={{
        padding: '100px 40px 72px',
        borderBottom: '0.5px solid rgba(196,146,58,0.08)',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(56px, 9vw, 96px)',
          color: '#F0EBE3', letterSpacing: '.03em', lineHeight: '.9',
          marginBottom: '28px',
        }}>
          Stein ist unsere<br />Leidenschaft.
        </h1>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '16px',
          color: 'var(--color-text-muted)', maxWidth: '560px', lineHeight: 1.85,
          margin: '0 auto',
        }}>
          Seit 1987 verarbeiten wir Naturstein mit handwerklicher Präzision und einem tiefen
          Verständnis für das Material. Was als kleiner Familienbetrieb begann, ist heute
          eines der erfahrensten Natursteinunternehmen im Münchner Raum.
        </p>
      </section>

      {/* ── Geschichte ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: '1px',
        background: 'rgba(196,146,58,0.06)',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        {[
          { year: '1987', headline: 'Die Gründung', text: 'Gegründet von Familie Gandl mit dem Ziel, hochwertige Natursteine für private und gewerbliche Projekte zugänglich zu machen. Vom ersten Tag an stand Qualität über Quantität.' },
          { year: 'Heute', headline: 'Erfahrung & Vertrauen', text: 'Über drei Jahrzehnte Erfahrung, Hunderte realisierter Projekte und eine stetige Entwicklung des Sortiments — immer mit dem Anspruch, das Beste aus dem Naturstein herauszuholen.' },
        ].map((item) => (
          <div key={item.year} style={{ padding: '52px 48px' }}>
            <p style={{
              fontFamily: 'var(--font-bebas)', fontSize: '15px',
              letterSpacing: '.18em', color: 'var(--color-gold)', marginBottom: '12px',
            }}>{item.year}</p>
            <h2 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(28px, 3vw, 40px)',
              color: '#F0EBE3', letterSpacing: '.04em', marginBottom: '16px',
            }}>{item.headline}</h2>
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '16px',
              color: 'var(--color-text-muted)', lineHeight: 1.85,
            }}>{item.text}</p>
          </div>
        ))}
      </section>

      {/* ── Werte ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 40px' }}>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '15px',
          letterSpacing: '.18em', textTransform: 'uppercase',
          color: '#C4923A', marginBottom: '16px',
        }}>Unsere Werte</p>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(36px, 5vw, 56px)',
          color: '#F0EBE3', letterSpacing: '.04em', marginBottom: '48px',
        }}>Was uns antreibt</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '32px',
        }}>
          {[
            { title: 'Handwerk', text: 'Jeder Schnitt, jede Oberfläche — von erfahrenen Fachkräften mit dem Anspruch, dass das Ergebnis überdauert.' },
            { title: 'Materialkenntnis', text: 'Wir kennen jeden Stein, den wir verkaufen. Von bayerischem Jura-Kalkstein bis zum feinen Marmor — die Herkunft und Eigenschaften spielen immer eine Rolle.' },
            { title: 'Verlässlichkeit', text: 'Termintreue, klare Kommunikation und persönliche Beratung — dafür stehen wir seit 1987.' },
          ].map((v) => (
            <div key={v.title} style={{
              borderTop: '0.5px solid rgba(196,146,58,0.2)',
              paddingTop: '28px',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '26px', letterSpacing: '.06em',
                color: '#F0EBE3', marginBottom: '12px',
              }}>{v.title}</h3>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '15px',
                color: 'var(--color-text-muted)', lineHeight: 1.85,
              }}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Standort ── */}
      <section style={{
        background: '#080806',
        borderTop: '0.5px solid rgba(196,146,58,0.08)',
        padding: '72px 40px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '15px',
          letterSpacing: '.18em', textTransform: 'uppercase',
          color: '#C4923A', marginBottom: '12px',
        }}>Wo wir sind</p>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(32px, 5vw, 56px)',
          color: '#F0EBE3', letterSpacing: '.04em', marginBottom: '16px',
        }}>
          Rudolf-Diesel-Ring 6<br />82266 Inning am Ammersee
        </h2>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '16px',
          color: 'rgba(240,235,227,0.6)', marginBottom: '36px',
          lineHeight: 1.75,
        }}>
          Mo – Fr 8 – 12 / 13 – 17 Uhr · Sa 9 – 12 Uhr
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/kontakt" style={{
            background: '#C4923A',
            color: '#0D0D0C',
            fontFamily: 'var(--font-bebas)', fontSize: '16px',
            letterSpacing: '.14em', padding: '15px 44px',
            textDecoration: 'none', display: 'inline-block',
          }}>
            Kontakt aufnehmen
          </Link>
          <Link href="/karriere" style={{
            border: '1px solid rgba(196,146,58,0.55)',
            color: '#F0EBE3',
            fontFamily: 'var(--font-bebas)', fontSize: '16px',
            letterSpacing: '.14em', padding: '15px 44px',
            textDecoration: 'none', display: 'inline-block',
          }}>
            Karriere bei Gandl
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 700px) {
          section[style*="grid-template-columns: minmax(0,1fr) minmax(0,1fr)"] {
            grid-template-columns: 1fr !important;
          }
          section[style*="repeat(3, 1fr)"] > div { padding: 0; }
        }
      `}</style>
    </>
  )
}
