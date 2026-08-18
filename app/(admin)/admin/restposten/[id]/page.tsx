export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { updateRestposten } from '@/lib/actions/restposten'
import RestpostenForm from '../RestpostenForm'
import type { Restposten } from '@/lib/types'
import styles from '../../form.module.css'

async function getItem(id: string): Promise<Restposten | null> {
  const { data } = await createSupabaseAdminClient().from('restposten').select('*').eq('id', id).single()
  return (data as Restposten) ?? null
}

export default async function EditRestpostenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getItem(id)
  if (!item) notFound()

  const action = updateRestposten.bind(null, id)

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Restposten</p>
          <h1 className={styles.pageTitle}>{item.title}</h1>
        </div>
      </div>
      <RestpostenForm action={action} item={item} />
    </div>
  )
}
