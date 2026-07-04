import { createSupabaseAdminClient } from '@/lib/supabase'
import NewProductForm from './NewProductForm'
import type { Category } from '@/lib/types'
import styles from '../../form.module.css'

async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('categories').select('*').order('type').order('sort_order')
    return (data as Category[]) ?? []
  } catch { return [] }
}

export default async function NeuesProduktPage() {
  const categories = await getCategories()

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>// Produkte</p>
        <h1 className={styles.pageTitle}>Neues Produkt</h1>
      </div>

      <NewProductForm categories={categories} />
    </div>
  )
}
