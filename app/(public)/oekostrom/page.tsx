import { canonical } from '@/lib/seo'
import Link from 'next/link'

export const metadata = {
  title: '100% Ökostrom-Zertifikat – Gandl Natursteine',
  description: 'Gandl Natursteine bezieht 100% zertifizierten Ökostrom von den Stadtwerken Fürstenfeldbruck.',
  alternates: { canonical: canonical('/oekostrom') },
}

export default function OekostromPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px 100px' }}>
      <p style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '13px',
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        color: 'var(--color-sage)',
        marginBottom: '14px',
      }}>
        // Nachhaltigkeit
      </p>
      <h1 style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: 'clamp(40px, 6vw, 64px)',
        color: '#dcdcd6',
        letterSpacing: '.02em',
        lineHeight: '.95',
        marginBottom: '20px',
      }}>
        100% Ökostrom-Zertifikat
      </h1>
      <p style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '16px',
        color: '#9caea1',
        lineHeight: 1.8,
        marginBottom: '40px',
        maxWidth: '620px',
      }}>
        Gandl Natursteine GmbH bezieht 100% regenerativen Strom aus dem alpinen Raum
        von der Stadtwerke Fürstenfeldbruck GmbH – zertifiziert nach VdTÜV-Standard 1304.
      </p>

      <div style={{
        border: '0.5px solid rgba(155, 174, 159, 0.2)',
        background: 'var(--color-bg-card)',
        overflow: 'hidden',
      }}>
        <embed
          src="/dokumente/oekostromsiegel.pdf"
          type="application/pdf"
          width="100%"
          height="900"
          style={{ display: 'block' }}
        />
      </div>

      <a
        href="/dokumente/oekostromsiegel.pdf"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          marginTop: '28px',
          background: 'var(--color-sage)',
          color: 'var(--color-bg)',
          fontFamily: 'var(--font-bebas)',
          fontSize: '15px',
          letterSpacing: '.14em',
          padding: '12px 26px',
          textDecoration: 'none',
        }}
      >
        PDF herunterladen →
      </a>

      <p style={{ marginTop: '24px' }}>
        <Link href="/" style={{ color: '#9caea1', fontFamily: 'var(--font-inter)', fontSize: '14px', textDecoration: 'none' }}>
          ← Zurück zur Startseite
        </Link>
      </p>
    </div>
  )
}
