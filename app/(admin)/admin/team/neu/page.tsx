export const dynamic = 'force-dynamic'

import NewTeamMemberForm from './NewTeamMemberForm'
import styles from '../../form.module.css'

export default function NeuerMitarbeiterPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>// Team</p>
        <h1 className={styles.pageTitle}>Mitarbeiter einladen</h1>
      </div>
      <p className={styles.hint} style={{ marginBottom: '28px' }}>
        Der Mitarbeiter erhält eine Einladungs-E-Mail und kann sich dann einloggen.
      </p>

      <NewTeamMemberForm />
    </div>
  )
}
