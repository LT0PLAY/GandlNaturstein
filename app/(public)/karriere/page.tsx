import type { Metadata } from 'next'
import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { JobListing } from '@/lib/types'
import { canonical, jobJsonLd, SITE_NAME, SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const description = 'Werden Sie Teil des Gandl-Teams. Aktuelle Stellenangebote für Naturstein-Fachkräfte im Münchner Raum.'
  return {
    title:       `Karriere – ${SITE_NAME}`,
    description,
    alternates:  { canonical: canonical('/karriere') },
    openGraph: {
      title:       `Karriere – ${SITE_NAME}`,
      description,
      url:         `${SITE_URL}/karriere`,
      siteName:    SITE_NAME,
      type:        'website',
    },
  }
}

async function getJobs(): Promise<JobListing[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('job_listings')
      .select('*')
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('sort_order')
      .order('created_at', { ascending: false })
    return (data as JobListing[]) ?? []
  } catch { return [] }
}

function JobCard({ job }: { job: JobListing }) {
  return (
    <article style={{
      borderTop: '0.5px solid rgba(196,146,58,0.12)',
      padding: '40px 0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        {/* Info */}
        <div style={{ flex: '1', minWidth: '240px' }}>
          {(job.department || job.employment_type) && (
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '12px',
              letterSpacing: '.18em', textTransform: 'uppercase',
              color: 'var(--color-gold)', marginBottom: '10px',
            }}>
              {[job.department, job.employment_type].filter(Boolean).join(' · ')}
            </p>
          )}
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(24px, 3vw, 36px)',
            color: '#F0EBE3', letterSpacing: '.04em', marginBottom: '8px',
          }}>
            {job.title}
          </h2>
          {job.location && (
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '12px',
              color: 'var(--color-text-muted)', letterSpacing: '.04em',
            }}>
              📍 {job.location}
            </p>
          )}
          {job.description && (
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '16px',
              color: 'var(--color-text-muted)', lineHeight: 1.8,
              marginTop: '14px', maxWidth: '600px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as React.CSSProperties}>
              {job.description}
            </p>
          )}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', flexShrink: 0 }}>
          {job.pdf_url && (
            <a
              href={job.pdf_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '0.5px solid rgba(196,146,58,0.3)',
                padding: '10px 20px',
                fontFamily: 'var(--font-bebas)', fontSize: '15px',
                letterSpacing: '.12em', color: 'var(--color-gold)',
                textDecoration: 'none', transition: 'border-color .2s',
              }}
            >
              ↓ Stellenanzeige (PDF)
            </a>
          )}
          {job.linkedin_url && (
            <a
              href={job.linkedin_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '0.5px solid rgba(196,146,58,0.15)',
                padding: '10px 20px',
                fontFamily: 'var(--font-bebas)', fontSize: '15px',
                letterSpacing: '.12em', color: 'rgba(240,235,227,0.55)',
                textDecoration: 'none', transition: 'border-color .2s, color .2s',
              }}
            >
              ↗ LinkedIn-Anzeige
            </a>
          )}
          <Link
            href="/kontakt"
            style={{
              display: 'inline-block',
              background: 'var(--color-gold)',
              padding: '12px 28px',
              fontFamily: 'var(--font-bebas)', fontSize: '16px',
              letterSpacing: '.14em', color: '#0D0D0C',
              textDecoration: 'none',
            }}
          >
            Jetzt bewerben
          </Link>
        </div>
      </div>

      {/* Fotos */}
      {(job.images ?? []).length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '28px', flexWrap: 'wrap' }}>
          {job.images.map((url, i) => (
            <img key={i} src={url} alt={job.title}
              style={{ width: '120px', height: '90px', objectFit: 'cover', filter: 'brightness(0.8) saturate(0.85)' }} />
          ))}
        </div>
      )}
    </article>
  )
}

export default async function KarrierePage() {
  const jobs = await getJobs()

  return (
    <>
      {/* JSON-LD: one JobPosting per published listing */}
      {jobs.map((job) => (
        <script
          key={job.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd(job)) }}
        />
      ))}

      {/* ── Hero ── */}
      <section style={{
        padding: '100px 40px 64px',
        borderBottom: '0.5px solid rgba(196,146,58,0.08)',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(56px, 9vw, 96px)',
          color: '#F0EBE3', letterSpacing: '.03em', lineHeight: '.9',
          marginBottom: '24px',
        }}>
          Werden Sie<br />Teil des Teams.
        </h1>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '16px',
          color: 'var(--color-text-muted)', maxWidth: '520px', lineHeight: 1.85,
          margin: '0 auto',
        }}>
          Wir suchen Menschen, die Naturstein genauso schätzen wie wir
          handwerkliches Können trifft auf ein familiäres, engagiertes Team.
        </p>
      </section>

      {/* ── Stellen ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 80px' }}>
        {jobs.length === 0 ? (
          <div style={{ padding: '72px 0', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-bebas)', fontSize: '28px',
              color: '#F0EBE3', letterSpacing: '.04em', marginBottom: '12px',
            }}>
              Aktuell keine offenen Stellen
            </p>
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '16px',
              color: 'var(--color-text-muted)', marginBottom: '28px',
            }}>
              Wir freuen uns jederzeit über Initiativbewerbungen.
            </p>
            <Link href="/kontakt" style={{
              background: '#C4923A', color: '#0D0D0C',
              fontFamily: 'var(--font-bebas)', fontSize: '16px',
              letterSpacing: '.14em', padding: '14px 36px', textDecoration: 'none',
            }}>
              Initiativbewerbung senden
            </Link>
          </div>
        ) : (
          <>
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '12px',
              letterSpacing: '.16em', textTransform: 'uppercase',
              color: 'var(--color-text-dim)', padding: '32px 0 0',
              marginBottom: '0',
            }}>
              {jobs.length} {jobs.length === 1 ? 'offene Stelle' : 'offene Stellen'}
            </p>
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}

            {/* Initiativbewerbung */}
            <div style={{
              borderTop: '0.5px solid rgba(196,146,58,0.12)',
              padding: '52px 0 0',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px',
            }}>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '12px',
                letterSpacing: '.18em', textTransform: 'uppercase',
                color: 'var(--color-gold)',
              }}>Nichts Passendes dabei?</p>
              <h3 style={{
                fontFamily: 'var(--font-bebas)', fontSize: 'clamp(24px, 3vw, 36px)',
                color: '#F0EBE3', letterSpacing: '.04em',
              }}>Initiativbewerbung jederzeit willkommen</h3>
              <Link href="/kontakt" style={{
                border: '0.5px solid rgba(196,146,58,0.3)',
                color: 'var(--color-gold)',
                fontFamily: 'var(--font-bebas)', fontSize: '15px',
                letterSpacing: '.12em', padding: '12px 28px',
                textDecoration: 'none', marginTop: '4px',
              }}>
                Anfrage senden →
              </Link>
            </div>
          </>
        )}
      </section>
    </>
  )
}
