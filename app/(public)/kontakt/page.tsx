import InquiryForm from '@/components/InquiryForm/InquiryForm'

export const metadata = { title: 'Kontakt & Anfrage – Gandl Natursteine' }

export default function KontaktPage() {
  return (
    <section style={{ padding: '60px 40px', maxWidth: '620px' }}>
      <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: '64px', color: '#F0EBE3',
                   letterSpacing: '.02em', lineHeight: '.9', marginBottom: '8px',
                   textAlign: 'center' }}>
        Anfrage stellen
      </h1>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--color-text-muted)',
                  lineHeight: 1.8, marginBottom: '40px' }}>
        Kein Online-Shop — wir beraten persönlich. Antwort innerhalb 1–2 Werktagen.
      </p>
      <InquiryForm />
    </section>
  )
}
