export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/actions/auth'
import ProductsTable from './ProductsTable'
import styles from '../table.module.css'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

async function getProducts() {
  const supabase = createSupabaseAdminClient()

  // Versuche mit deleted_at-Filter (Migration 005 muss gelaufen sein)
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(name, type)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (!error) return data ?? []

  // Fallback: Migration noch nicht angewendet → alle Produkte ohne Filter
  console.warn('[Admin/Produkte] deleted_at-Spalte fehlt, Migration 005 ausführen!', error.message)
  const { data: all } = await supabase
    .from('products')
    .select('*, category:categories!products_category_id_fkey(name, type)')
    .order('created_at', { ascending: false })
  return all ?? []
}

async function getPendingCount(): Promise<number> {
  try {
    const { count } = await createSupabaseAdminClient()
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('delete_pending', true)
      .is('deleted_at', null)
    return count ?? 0
  } catch { return 0 }
}

export default async function ProduktePage() {
  const products     = await getProducts()
  const pendingCount = await getPendingCount()
  const user         = SUPABASE_CONFIGURED ? await getCurrentUser() : null
  const isAdmin      = !user || (user?.role as string) === 'admin'

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Admin</p>
          <h1 className={styles.pageTitle}>
            Produkte <span className={styles.count}>{products.length}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin && pendingCount > 0 && (
            <Link href="/admin/papierkorb" className={styles.btnWarning}>
              ⚠ {pendingCount} Löschantrag{pendingCount > 1 ? 'anträge' : ''} prüfen
            </Link>
          )}
          <Link href="/admin/produkte/neu" className={styles.btnPrimary}>
            + Neues Produkt
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p>Noch keine aktiven Produkte.</p>
          <Link href="/admin/produkte/neu" className={styles.btnPrimary}>
            Erstes Produkt anlegen
          </Link>
        </div>
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  )
}
