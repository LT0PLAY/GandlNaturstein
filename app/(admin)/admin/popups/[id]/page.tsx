export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { updatePopup } from '@/lib/actions/popups'
import PopupForm from '../PopupForm'
import type { Popup } from '@/lib/types'
import styles from '../../form.module.css'

async function getPopup(id: string): Promise<Popup | null> {
  const { data } = await createSupabaseAdminClient().from('popups').select('*').eq('id', id).single()
  return (data as Popup) ?? null
}

export default async function EditPopupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const popup = await getPopup(id)
  if (!popup) notFound()

  const action = updatePopup.bind(null, id)

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Popups</p>
          <h1 className={styles.pageTitle}>{popup.title}</h1>
        </div>
      </div>
      <PopupForm action={action} popup={popup} />
    </div>
  )
}
