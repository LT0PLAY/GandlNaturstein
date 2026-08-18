export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createCategory } from '@/lib/actions/categories'
import KategorieForm from '@/components/admin/KategorieForm'
import styles from '../../form.module.css'

export default function NeueKategoriePage() {
  async function handleCreate(formData: FormData) {
    'use server'
    const result = await createCategory(formData)
    if (result.success) redirect('/admin/kategorien')
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>// Kategorien</p>
        <h1 className={styles.pageTitle}>Neue Unterkategorie</h1>
      </div>
      <KategorieForm action={handleCreate} />
    </div>
  )
}
