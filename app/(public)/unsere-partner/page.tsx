export const dynamic = 'force-dynamic'

import { createSupabaseAdminClient } from '@/lib/supabase'
import type { Partner } from '@/lib/types'

export const metadata = {
  title: 'Unsere Partner – Gandl Natursteine',
  description: 'Unsere Partner und Zertifizierungen.',
}

async function getPartners(): Promise<Partner[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order')
    return (data as Partner[]) ?? []
  } catch { return [] }
}

export default async function UnserePartnerPage() {
  const partners = await getPartners()

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 24px 100px' }}>
      <p style={{
        fontFamily: 'var(--font-inter)', fontSize: '13px', letterSpacing: '.14em',
        textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '14px',
      }}>
        // Zusammenarbeit
      </p>
      <h1 style={{
        fontFamily: 'var(--font-bebas)', fontSize: 'clamp(40px, 6vw, 64px)', color: '#dcdcd6',
        letterSpacing: '.02em', lineHeight: '.95', marginBottom: '20px',
      }}>
        Unsere Partner
      </h1>
      <p style={{
        fontFamily: 'var(--font-inter)', fontSize: '16px', color: '#9caea1',
        lineHeight: 1.8, marginBottom: '48px', maxWidth: '620px',
      }}>
        Verlässliche Partnerschaften, Zertifikate und Auszeichnungen, auf die wir bei Gandl Natursteine bauen.
      </p>

      {partners.length === 0 ? (
        <p style={{ color: '#9caea1', fontFamily: 'var(--font-inter)' }}>
          Aktuell sind keine Partner hinterlegt.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {partners.map((p) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap',
              padding: '28px 0', borderBottom: '0.5px solid rgba(155, 174, 159, 0.12)',
            }}>
              <div style={{
                width: '140px', height: '90px', flexShrink: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(220, 220, 214, 0.04)', border: '0.5px solid rgba(155, 174, 159, 0.1)',
                padding: '10px',
              }}>
                {p.logo_url
                  ? <img src={p.logo_url} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  : <span style={{ color: '#999', fontSize: '12px', fontFamily: 'var(--font-inter)' }}>{p.name}</span>}
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <p style={{
                  fontFamily: 'var(--font-bebas)', fontSize: '24px', color: '#dcdcd6', letterSpacing: '.02em', marginBottom: '4px',
                }}>
                  {p.name}
                </p>
                {p.website_url && (
                  <a href={p.website_url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--color-sage)', fontFamily: 'var(--font-inter)', fontSize: '14px', textDecoration: 'none' }}>
                    Website besuchen ↗
                  </a>
                )}
              </div>

              {p.pdfs?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxWidth: '420px' }}>
                  {p.pdfs.map((pdf, i) => (
                    <a
                      key={i}
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        border: '0.5px solid rgba(155, 174, 159, 0.25)', color: '#9caea1',
                        fontFamily: 'var(--font-inter)', fontSize: '13px', padding: '7px 12px',
                        textDecoration: 'none',
                      }}
                    >
                      {pdf.title} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
