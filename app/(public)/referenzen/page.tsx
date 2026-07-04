import Link from 'next/link'
import type { Metadata } from 'next'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { Reference } from '@/lib/types'

export const metadata: Metadata = {
  title:       'Referenzen – Gandl Natursteine',
  description: 'Realisierte Projekte von Gandl Natursteine — Terrassenplatten, Fensterbänke, Sonderanfertigungen und mehr.',
}

async function getRefs(): Promise<Reference[]> {
  const { data } = await createSupabaseAdminClient()
    .from('project_references')
    .select('id, slug, title, subtitle, category_tags, cover_image, is_published, sort_order, created_at')
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('sort_order')
    .order('created_at', { ascending: false })
  return (data as Reference[]) ?? []
}

function Card({ r }: { r: Reference }) {
  return (
    <Link href={`/referenzen/${r.slug}`} className="ref-card" style={{ display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>

      {/* Hintergrundbild */}
      <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#0D0B07' }}>
        {r.cover_image ? (
          <img
            src={r.cover_image}
            alt={r.title}
            className="ref-card-img"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.5) saturate(0.75)',
              transition: 'transform .6s ease, filter .4s ease',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1A1610 0%, #0E0C08 100%)' }} />
        )}

        {/* Dunkles Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.8) 100%)',
        }} />

        {/* Zentrierter Text-Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '28px 24px',
          textAlign: 'center',
        }}>
          {r.category_tags?.length > 0 && (
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '12px',
              letterSpacing: '.2em', textTransform: 'uppercase',
              color: 'var(--color-gold)', marginBottom: '12px',
            }}>
              {r.category_tags.join(' / ')}
            </p>
          )}
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(22px, 2.8vw, 38px)',
            color: '#F0EBE3', letterSpacing: '.04em', lineHeight: 1,
            marginBottom: '10px',
          }}>
            {r.title}
          </h2>
          {r.subtitle && (
            <>
              <div style={{ width: '32px', height: '1.5px', background: 'var(--color-gold)', margin: '2px 0 10px' }} />
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '10px',
                letterSpacing: '.12em', textTransform: 'uppercase',
                color: 'rgba(240,235,227,0.55)',
              }}>
                {r.subtitle}
              </p>
            </>
          )}

          {/* Button */}
          <div className="ref-card-btn" style={{
            marginTop: '20px',
            padding: '8px 22px',
            border: '1px solid rgba(196,146,58,0.6)',
            fontFamily: 'var(--font-bebas)', fontSize: '12px',
            letterSpacing: '.16em', color: '#F0EBE3',
            transition: 'background .25s, border-color .25s',
          }}>
            PROJEKT ANSEHEN
          </div>
        </div>
      </div>

      <style>{`
        .ref-card:hover .ref-card-img { transform: scale(1.05); filter: brightness(0.65) saturate(0.85); }
        .ref-card:hover .ref-card-btn { background: rgba(196,146,58,0.18); border-color: var(--color-gold); }
      `}</style>
    </Link>
  )
}

export default async function ReferenzenPage() {
  const refs = await getRefs()

  return (
    <>
      {/* ── Header — zentriert, kein Label ── */}
      <section style={{
        padding: '80px 40px 52px',
        borderBottom: '0.5px solid rgba(196,146,58,0.08)',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(56px, 9vw, 96px)',
          color: '#F0EBE3', letterSpacing: '.03em', lineHeight: '.9',
          marginBottom: '20px',
        }}>
          Unsere Projekte
        </h1>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '15px',
          color: 'var(--color-text-muted)', maxWidth: '440px',
          lineHeight: 1.75, margin: '0 auto',
        }}>
          Realisierte Natursteinprojekte von der Terrasse <br></br>bis zur individuellen Sonderanfertigung.
        </p>
      </section>

      {/* ── Grid ── */}
      {refs.length === 0 ? (
        <section style={{ padding: '80px 40px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: 'var(--color-text-muted)' }}>
            Noch keine Referenzen veröffentlicht.
          </p>
        </section>
      ) : (
        <section style={{ padding: '2px 0 0' }}>
          <div className="refs-grid">
            {refs.map((r) => <Card key={r.id} r={r} />)}
          </div>
        </section>
      )}

      <style>{`
        .refs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: rgba(196,146,58,0.04);
        }
        @media (max-width: 900px) {
          .refs-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
          .refs-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}
