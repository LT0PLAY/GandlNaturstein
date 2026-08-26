export const dynamic = 'force-dynamic'

import { createPopup } from '@/lib/actions/popups'
import PopupForm from '../PopupForm'
import styles from '../../form.module.css'

export default function NeuesPopupPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Popups</p>
          <h1 className={styles.pageTitle}>Neues Popup</h1>
        </div>
      </div>
      <PopupForm action={createPopup} />
    </div>
  )
}
