export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Weitere Infos – Gandl Natursteine',
  description: 'Informationen zu Lieferung, Verarbeitung, Pflege und Garantie bei Gandl Natursteine.',
}

const INFOS = [
  {
    label: 'Lieferung & Abholung',
    title: 'Direktlieferung in die Region',
    text: `Wir liefern Natursteinprodukte in einem Umkreis von ca. 80 km um Inning am Ammersee.
Für größere Projekte sprechen wir individuelle Lieferbedingungen ab.
Auf Wunsch können Sie Ihre Bestellung auch direkt bei uns abholen nach vorheriger Terminvereinbarung.`,
    icon: '↗',
  },
  {
    label: 'Verarbeitung & Montage',
    title: 'Fachgerechte Verlegung',
    text: `Auf Wunsch übernehmen wir die fachgerechte Verlegung Ihrer Natursteine  von der Terrassenplatte bis zur individuellen Sonderanfertigung.
Unser erfahrenes Team berät Sie zur optimalen Unterkonstruktion, Verfugung und Pflege.`,
    icon: '◈',
  },
  {
    label: 'Pflege & Wartung',
    title: 'Langlebigkeit durch richtige Pflege',
    text: `Naturstein ist robust aber nicht pflegefrei. Wir empfehlen geeignete Imprägnierungsmittel und beraten Sie zu Reinigung und Schutz je nach Steinart und Standort.
Gepflegter Naturstein hält ein Leben lang.`,
    icon: '◎',
  },
  {
    label: 'Muster & Beratung',
    title: 'Vor dem Kauf überzeugen',
    text: `In unserem Showroom in Inning am Ammersee können Sie Oberflächen, Farben und Formate in Originalgröße erleben.
Wir stellen Ihnen gerne Muster bereit und beraten Sie kostenlos und unverbindlich.`,
    icon: '⊞',
  },
  {
    label: 'Qualität & Herkunft',
    title: 'Zertifizierter Naturstein',
    text: `Unsere Produkte stammen aus zertifizierten Steinbrüchen in Europa.
Wir legen Wert auf nachhaltige Beschaffung, transparente Lieferketten und geprüfte Qualität.
Auf Wunsch erhalten Sie Herkunftsnachweise und technische Datenblätter.`,
    icon: '◫',
  },
  {
    label: 'Zahlungsarten',
    title: 'Flexible Zahlungsmöglichkeiten',
    text: `Wir akzeptieren Überweisung, EC-Karte und Barzahlung.
Für Großprojekte und gewerbliche Kunden bieten wir Zahlungsziele nach Absprache an.
Details finden Sie in unseren AGB und Versand- & Zahlungsbedingungen.`,
    icon: '◻',
  },
]

export default function WeitereInfosPage() {
  return (
    <>
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
          Alles, was Sie<br />wissen sollten.
        </h1>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '16px',
          color: 'var(--color-text-muted)', maxWidth: '500px', lineHeight: 1.85,
          margin: '0 auto',
        }}>
          Von Lieferung über Pflege bis zu Zahlungsoptionen  hier finden Sie
          die wichtigsten Informationen rund um Ihren Natursteinkauf.
        </p>
      </section>

      {/* ── Info-Grid ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1px',
          background: 'rgba(196,146,58,0.06)',
          marginTop: '1px',
        }}>
          {INFOS.map((info) => (
            <div key={info.label} style={{ background: '#080806', padding: '48px 40px' }}>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '12px',
                letterSpacing: '.18em', textTransform: 'uppercase',
                color: 'var(--color-gold)', marginBottom: '12px',
              }}>{info.label}</p>
              <h2 style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: 'clamp(22px, 2.5vw, 30px)',
                color: '#F0EBE3', letterSpacing: '.04em', marginBottom: '16px',
              }}>{info.title}</h2>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '15px',
                color: 'var(--color-text-muted)', lineHeight: 1.9,
                whiteSpace: 'pre-wrap',
              }}>{info.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Links ── */}
      <section style={{
        background: '#080806',
        borderTop: '0.5px solid rgba(196,146,58,0.08)',
        padding: '64px 40px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '15px',
          letterSpacing: '.18em', textTransform: 'uppercase',
          color: 'var(--color-gold)', marginBottom: '24px',
        }}>Rechtliches</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'AGB', href: '/agb' },
            { label: 'Versand & Zahlung', href: '/versand-zahlung' },
            { label: 'Widerrufsrecht', href: '/widerrufsrecht' },
            { label: 'Datenschutz', href: '/datenschutz' },
            { label: 'Impressum', href: '/impressum' },
          ].map((l) => (
            <a key={l.href} href={l.href} style={{
              fontFamily: 'var(--font-inter)', fontSize: '12px',
              letterSpacing: '.08em', color: 'var(--color-text-muted)',
              textDecoration: 'none', padding: '8px 16px',
              border: '0.5px solid rgba(196,146,58,0.1)',
              transition: 'color .2s, border-color .2s',
            }}>
              {l.label}
            </a>
          ))}
        </div>
        <div style={{ marginTop: '40px' }}>
          <Link href="/kontakt" style={{
            background: '#C4923A', color: '#0D0D0C',
            fontFamily: 'var(--font-bebas)', fontSize: '15px',
            letterSpacing: '.14em', padding: '14px 40px', textDecoration: 'none',
          }}>
            Frage stellen →
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 700px) {
          div[style*="repeat(2, 1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="padding: 48px 40px"] { padding: 36px 24px !important; }
        }
        @media (max-width: 600px) {
          section[style*="padding: 100px 40px"] { padding: 80px 24px 48px !important; }
          section[style*="padding: 64px 40px"] { padding: 48px 24px !important; }
        }
      `}</style>
    </>
  )
}
