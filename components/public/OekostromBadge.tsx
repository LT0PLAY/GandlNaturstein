import Link from 'next/link'
import styles from './OekostromBadge.module.css'

const SEAL_PATH = 'M 50.00,4.00 L 56.57,8.52 L 64.21,6.25 L 69.07,12.58 L 77.04,12.79 L 79.70,20.30 L 87.21,22.96 L 87.42,30.93 L 93.75,35.79 L 91.48,43.43 L 96.00,50.00 L 91.48,56.57 L 93.75,64.21 L 87.42,69.07 L 87.21,77.04 L 79.70,79.70 L 77.04,87.21 L 69.07,87.42 L 64.21,93.75 L 56.57,91.48 L 50.00,96.00 L 43.43,91.48 L 35.79,93.75 L 30.93,87.42 L 22.96,87.21 L 20.30,79.70 L 12.79,77.04 L 12.58,69.07 L 6.25,64.21 L 8.52,56.57 L 4.00,50.00 L 8.52,43.43 L 6.25,35.79 L 12.58,30.93 L 12.79,22.96 L 20.30,20.30 L 22.96,12.79 L 30.93,12.58 L 35.79,6.25 L 43.43,8.52 Z'

export default function OekostromBadge() {
  return (
    <Link href="/oekostrom" className={styles.badge} aria-label="100% Ökostrom-Zertifikat öffnen (PDF)">
      <svg viewBox="0 0 100 100" width="56" height="56" className={styles.seal}>
        <path d={SEAL_PATH} fill="none" stroke="var(--color-sage)" strokeWidth="2" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="var(--color-sage)" strokeWidth="1" opacity="0.5" />
        <text x="50" y="45" textAnchor="middle" className={styles.sealPercent}>100%</text>
        <text x="50" y="60" textAnchor="middle" className={styles.sealLabel}>ÖKO</text>
        <text x="50" y="71" textAnchor="middle" className={styles.sealLabel}>STROM</text>
      </svg>
      <span className={styles.badgeText}>
        <span className={styles.badgeTitle}>100% Ökostrom</span>
        <span className={styles.badgeSub}>Zertifikat ansehen →</span>
      </span>
    </Link>
  )
}
