import styles from './PageHero.module.css'

interface Props {
  label:     string
  title:     string
  subtitle?: string
  image:     string
}

// Optionales Titelbild für feste Seiten (Partner, Restposten, Ausstellungsguide,
// Karriere, Referenzen). Wird nur gerendert, wenn im Admin ein Bild hinterlegt ist —
// sonst zeigt die jeweilige Seite ihren bisherigen einfachen Text-Header.
export default function PageHero({ label, title, subtitle, image }: Props) {
  return (
    <div className={styles.heroWrap}>
      <div className={styles.heroBanner}>
        <img src={image} alt={title} className={styles.heroImg} />
        <div className={styles.heroOverlay}>
          <div className={styles.heroInner}>
            <p className={styles.heroLabel}>{label}</p>
            <h1 className={styles.heroTitle}>{title}</h1>
            {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
