import { createSupabaseAdminClient } from '@/lib/supabase'
import { createReference } from '@/lib/actions/references'
import ReferenzForm from '../ReferenzForm'
import styles from '../../form.module.css'

async function getProducts() {
  const { data } = await createSupabaseAdminClient()
    .from('products')
    .select('id, name')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('name')
  return data ?? []
}

export default async function NeueReferenzPage() {
  const products = await getProducts()

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>// Referenzen</p>
        <h1 className={styles.pageTitle}>Neue Referenz</h1>
      </div>
      <ReferenzForm action={createReference} products={products} />
    </div>
  )
}
