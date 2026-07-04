export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/actions/auth'
import { moveProductToTrash } from '@/lib/actions/products'
import DeleteButton from '@/components/admin/DeleteButton'
import styles from '../table.module.css'

function getPublicUrl(p: any): string {
  const type     = p.category?.type     as string | undefined
  const location = p.category?.location as string | undefined
  if (type === 'sonderanfertigung') return `/sonderanfertigung/${p.slug}`
  if (type === 'extras')            return `/extras/${p.slug}`
  return `/${location ?? 'aussen'}/${p.slug}`
}

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

async function getProducts() {
  const supabase = createSupabaseAdminClient()

  // Versuche mit deleted_at-Filter (Migration 005 muss gelaufen sein)
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(name, type, location)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (!error) return data ?? []

  // Fallback: Migration noch nicht angewendet → alle Produkte ohne Filter
  console.warn('[Admin/Produkte] deleted_at-Spalte fehlt, Migration 005 ausführen!', error.message)
  const { data: all } = await supabase
    .from('products')
    .select('*, category:categories(name, type, location)')
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Bild</th>
              <th>Name</th>
              <th>Material</th>
              <th>Kategorie</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} style={p.delete_pending ? { opacity: 0.55, background: 'rgba(224,96,96,0.04)' } : undefined}>
                <td>
                  {p.thumbnail || p.images?.[0]
                    ? <img src={p.thumbnail ?? p.images[0]} alt={p.name} className={styles.thumb} />
                    : <div className={styles.thumbEmpty}>—</div>
                  }
                </td>
                <td className={styles.tdName}>
                  {p.name}
                  {p.delete_pending && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', color: '#E06060', letterSpacing: '.06em', fontFamily: 'var(--font-inter)' }}>
                      ⏳ LÖSCHANTRAG
                    </span>
                  )}
                </td>
                <td className={styles.tdMuted}>{p.material ?? '—'}</td>
                <td className={styles.tdMuted}>{(p.category as any)?.name ?? '—'}</td>
                <td>
                  <span className={styles.badge} data-active={p.is_active}>
                    {p.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td>
                  <div className={styles.btnGroup}>
                    <Link href={`/admin/produkte/${p.id}`} className={styles.btnEdit}>
                      Bearbeiten
                    </Link>
                    <a
                      href={getPublicUrl(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnEdit}
                      style={{ opacity: 0.7 }}
                    >
                      ↗ Vorschau
                    </a>
                    {p.delete_pending ? (
                      <span style={{ fontSize: '11px', color: '#E06060', fontFamily: 'var(--font-inter)', padding: '0 8px' }}>
                        <Link href="/admin/papierkorb" style={{ color: '#E06060', textDecoration: 'none' }}>→ Im Papierkorb</Link>
                      </span>
                    ) : (
                      <DeleteButton
                        action={moveProductToTrash.bind(null, p.id)}
                        confirmMsg={`Produkt „${p.name}" in den Papierkorb verschieben?`}
                        label="Papierkorb"
                        className={styles.btnDelete}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
