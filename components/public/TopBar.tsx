import Link from 'next/link'
import styles from './TopBar.module.css'

export default function TopBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.trust}>
          <span className={styles.trustItem}>Fachhandel für Naturstein <span className={styles.check}>✓</span></span>
          <span className={styles.trustItem}>Premiumqualität <span className={styles.check}>✓</span></span>
          <span className={styles.trustItem}>Langjährige Erfahrung <span className={styles.check}>✓</span></span>
        </div>
        <div className={styles.links}>
          <Link href="/unsere-partner" className={styles.link}>
            Unsere Partner <span className={styles.arrow}>→</span>
          </Link>
          <Link href="/restposten" className={styles.link}>
            Aktuelle Restposten <span className={styles.arrow}>→</span>
          </Link>
          <Link href="/ausstellungsguide" className={styles.link}>
            Ausstellungsguide <span className={styles.arrow}>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
