export const dynamic = 'force-dynamic'

import { createPartner } from '@/lib/actions/partners'
import PartnerForm from '../PartnerForm'
import styles from '../../form.module.css'

export default function NeuerPartnerPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Partner</p>
          <h1 className={styles.pageTitle}>Neuer Partner</h1>
        </div>
      </div>
      <PartnerForm action={createPartner} />
    </div>
  )
}
