export const dynamic = 'force-dynamic'

import { createSupabaseAdminClient } from '@/lib/supabase'
import { createGuideEntry } from '@/lib/actions/guide'
import GuideForm from '../GuideForm'
import styles from '../../form.module.css'

async function getProducts() {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('products')
      .select('id, name, thumbnail, images')
      .is('deleted_at', null)
      .order('name')
    return data ?? []
  } catch { return [] }
}

export default async function NeueGuideNummerPage() {
  const products = await getProducts()

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Ausstellungsguide</p>
          <h1 className={styles.pageTitle}>Neue Nummer</h1>
        </div>
      </div>
      <GuideForm action={createGuideEntry} products={products} />
    </div>
  )
}
