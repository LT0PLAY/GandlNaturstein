export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import { createCustomerDocument } from '@/lib/actions/customerAccess'
import DocumentForm from '../DocumentForm'
import styles from '../../form.module.css'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export default async function NeuesDokumentPage() {
  if (SUPABASE_CONFIGURED) {
    const user = await getCurrentUser()
    if (!user || (user.role as string) !== 'admin') redirect('/admin/login')
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Kundenbereich</p>
          <h1 className={styles.pageTitle}>Neues Dokument</h1>
        </div>
      </div>
      <DocumentForm action={createCustomerDocument} />
    </div>
  )
}
