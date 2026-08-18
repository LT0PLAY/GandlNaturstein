export const dynamic = 'force-dynamic'

import InquiryForm from '@/components/InquiryForm/InquiryForm'
import styles from './kontakt.module.css'

export const metadata = { title: 'Kontakt & Anfrage – Gandl Natursteine' }

export default function KontaktPage() {
  return (
    <section className={styles.split}>

      {/* Video-Seite */}
      <div className={styles.videoPanel}>
        <video autoPlay muted loop playsInline className={styles.video}>
          <source src="/hero-desktop.mp4" type="video/mp4" />
        </video>
        <div className={styles.videoOverlay} />
        <div className={styles.videoCaption}>
          <p>Naturstein.<br />Handwerk.<br />Vertrauen.</p>
          <span>München · Seit 1987</span>
        </div>
      </div>

      {/* Formular-Seite */}
      <div className={styles.formPanel}>
        <div className={styles.formPanelInner}>
          <span className={styles.badge}>Kontakt</span>
          <h1 className={styles.title}>Anfrage stellen</h1>
          <p className={styles.subtitle}>
            Kein Online-Shop — wir beraten persönlich. Antwort innerhalb 1–2 Werktagen.
          </p>
          <InquiryForm />
        </div>
      </div>

    </section>
  )
}
