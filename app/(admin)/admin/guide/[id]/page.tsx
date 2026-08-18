export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { updateGuideEntry } from '@/lib/actions/guide'
import GuideForm from '../GuideForm'
import type { GuideEntry } from '@/lib/types'
import styles from '../../form.module.css'

async function getEntry(id: string): Promise<GuideEntry | null> {
  const { data } = await createSupabaseAdminClient().from('guide_entries').select('*').eq('id', id).single()
  return (data as GuideEntry) ?? null
}

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

export default async function EditGuideEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [entry, products] = await Promise.all([getEntry(id), getProducts()])
  if (!entry) notFound()

  const action = updateGuideEntry.bind(null, id)

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Ausstellungsguide</p>
          <h1 className={styles.pageTitle}>#{entry.number} {entry.name}</h1>
        </div>
      </div>
      <GuideForm action={action} entry={entry} products={products} />
    </div>
  )
}
