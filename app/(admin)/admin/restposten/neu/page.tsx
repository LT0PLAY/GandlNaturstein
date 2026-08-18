export const dynamic = 'force-dynamic'

import { createRestposten } from '@/lib/actions/restposten'
import RestpostenForm from '../RestpostenForm'
import styles from '../../form.module.css'

export default function NeuerRestpostenPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Restposten</p>
          <h1 className={styles.pageTitle}>Neuer Restposten</h1>
        </div>
      </div>
      <RestpostenForm action={createRestposten} />
    </div>
  )
}
