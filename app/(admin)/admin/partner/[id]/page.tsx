export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { updatePartner } from '@/lib/actions/partners'
import PartnerForm from '../PartnerForm'
import type { Partner } from '@/lib/types'
import styles from '../../form.module.css'

async function getPartner(id: string): Promise<Partner | null> {
  const { data } = await createSupabaseAdminClient().from('partners').select('*').eq('id', id).single()
  return (data as Partner) ?? null
}

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const partner = await getPartner(id)
  if (!partner) notFound()

  const action = updatePartner.bind(null, id)

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Partner</p>
          <h1 className={styles.pageTitle}>{partner.name}</h1>
        </div>
      </div>
      <PartnerForm action={action} partner={partner} />
    </div>
  )
}
