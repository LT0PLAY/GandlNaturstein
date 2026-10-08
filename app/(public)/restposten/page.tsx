export const dynamic = 'force-dynamic'

import { canonical } from '@/lib/seo'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getPageHeroImage } from '@/lib/actions/pageHeroes'
import PageHero from '@/components/public/PageHero'
import type { Restposten } from '@/lib/types'
import { PRICE_DISCLAIMER } from '@/lib/types'
import RestpostenAddButton from './RestpostenAddButton'

export const metadata = {
  title: 'Aktuelle Restposten – Gandl Natursteine',
  description: 'Aktuelle Restposten und Sonderangebote von Gandl Natursteine.',
  alternates: { canonical: canonical('/restposten') },
}

async function getItems(): Promise<Restposten[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('restposten')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order')
      .order('created_at', { ascending: false })
    return (data as Restposten[]) ?? []
  } catch { return [] }
}

export default async function RestpostenPage() {
  const [items, heroImage] = await Promise.all([getItems(), getPageHeroImage('restposten')])

  return (
    <>
      {heroImage && (
        <PageHero
          label="// Sonderangebote"
          title="Aktuelle Restposten"
          subtitle="Reststücke, Auslaufware und Sonderangebote – solange der Vorrat reicht."
          image={heroImage}
        />
      )}
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '64px 24px 100px' }}>
      {!heroImage && (
        <>
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '13px', letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '14px',
          }}>
            // Sonderangebote
          </p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)', fontSize: 'clamp(40px, 6vw, 64px)', color: '#dcdcd6',
            letterSpacing: '.02em', lineHeight: '.95', marginBottom: '20px',
          }}>
            Aktuelle Restposten
          </h1>
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '16px', color: '#9caea1',
            lineHeight: 1.8, marginBottom: '48px', maxWidth: '620px',
          }}>
            Reststücke, Auslaufware und Sonderangebote – solange der Vorrat reicht.
          </p>
        </>
      )}

      {items.length === 0 ? (
        <p style={{ color: '#9caea1', fontFamily: 'var(--font-inter)' }}>
          Aktuell sind keine Restposten verfügbar.
        </p>
      ) : (
        <>
        {items.some((r) => r.price != null) && (
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--color-text-dim)',
            letterSpacing: '.03em', marginBottom: '16px',
          }}>
            Alle Preisangaben {PRICE_DISCLAIMER}.
          </p>
        )}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2px',
        }}>
          {items.map((r) => (
            <div key={r.id} style={{
              border: '0.5px solid rgba(155, 174, 159, 0.18)', background: 'var(--color-bg-card)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ position: 'relative', paddingTop: '75%', background: '#1C1C1C' }}>
                {r.images?.[0] && (
                  <img src={r.images[0]} alt={r.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{
                  fontFamily: 'var(--font-bebas)', fontSize: '22px', color: '#dcdcd6',
                  letterSpacing: '.02em', marginBottom: '8px', lineHeight: 1.1,
                }}>
                  {r.title}
                </p>
                {r.description && (
                  <p style={{
                    fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#9caea1',
                    lineHeight: 1.6, marginBottom: '14px', flex: 1,
                  }}>
                    {r.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: 'auto', flexWrap: 'wrap' }}>
                  {r.price != null && (
                    <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', color: 'var(--color-sage)' }}>
                      {r.price.toLocaleString('de-DE')} €
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {r.external_link && (
                      <a href={r.external_link} target="_blank" rel="noopener noreferrer" style={{
                        color: '#9caea1', fontFamily: 'var(--font-inter)', fontSize: '13px', textDecoration: 'none',
                      }}>
                        Zur Anzeige ↗
                      </a>
                    )}
                    <RestpostenAddButton item={r} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
    </>
  )
}
