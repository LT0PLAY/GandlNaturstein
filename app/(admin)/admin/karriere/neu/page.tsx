export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import { createJobListing } from '@/lib/actions/karriere'
import KarriereForm from '../KarriereForm'
import styles from '../../form.module.css'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export default async function NeueStellePage() {
  if (SUPABASE_CONFIGURED) {
    const user = await getCurrentUser()
    if (user && (user.role as string) !== 'admin') redirect('/admin')
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Karriere</p>
          <h1 className={styles.pageTitle}>Neue Stelle</h1>
        </div>
      </div>
      <KarriereForm action={createJobListing} />
    </div>
  )
}
