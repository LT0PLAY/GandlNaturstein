export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { getCustomerDocuments, customerLogout } from '@/lib/actions/customerAccess'
import { CUSTOMER_SESSION_COOKIE, isValidCustomerSessionToken } from '@/lib/customerSession'
import styles from '@/app/(public)/category.module.css'

export const metadata: Metadata = {
  title: 'Kundenbereich – Gandl Natursteine',
  robots: { index: false, follow: false },
}

export default async function KundenbereichPage() {
  // Die Middleware (proxy.ts) prüft das schon vor dem Rendern — dieser Check
  // hier ist eine zweite, serverseitige Absicherung direkt in der Seite.
  const cookieStore = await cookies()
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value
  if (!isValidCustomerSessionToken(token)) redirect('/kundenbereich/login')

  const documents = await getCustomerDocuments()

  return (
    <div className={styles.pageBg}>
      <section className={styles.page}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div className={styles.hero}>
            <p className={styles.label}>// Privatbereich</p>
            <h1 className={styles.title}>Kundenbereich</h1>
            <p className={styles.subtitle}>Ihre persönlichen Unterlagen zum Ansehen und Herunterladen.</p>
          </div>
          <form action={customerLogout}>
            <button
              type="submit"
              style={{
                fontFamily: 'var(--font-inter)', fontSize: '13px', letterSpacing: '.06em',
                padding: '0 18px', height: '38px', border: '0.5px solid rgba(155,174,159,0.4)',
                background: 'transparent', color: 'var(--color-gold)', cursor: 'pointer',
              }}
            >
              Abmelden
            </button>
          </form>
        </div>

        {documents.length === 0 ? (
          <div className={styles.empty}>
            <p>Aktuell sind keine Dokumente für Sie hinterlegt.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div className={styles.cardImage}>
                  {doc.thumbnail ? (
                    <img src={doc.thumbnail} alt={doc.title} className={styles.img} />
                  ) : (
                    <div className={styles.imgPlaceholder}><span>PDF</span></div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{doc.title}</h3>
                  {doc.info_text && <p className={styles.cardSurface}>{doc.info_text}</p>}
                  <span className={styles.cardCta}>Ansehen / Herunterladen →</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
