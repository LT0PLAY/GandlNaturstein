export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { updateJobListing } from '@/lib/actions/karriere'
import KarriereForm from '../KarriereForm'
import type { JobListing } from '@/lib/types'
import styles from '../../form.module.css'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (SUPABASE_CONFIGURED) {
    const user = await getCurrentUser()
    if (user && (user.role as string) !== 'admin') redirect('/admin')
  }

  const { id } = await params
  const { data: job } = await createSupabaseAdminClient()
    .from('job_listings')
    .select('*')
    .eq('id', id)
    .single()

  if (!job) notFound()

  const boundAction = updateJobListing.bind(null, id)

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Karriere</p>
          <h1 className={styles.pageTitle}>Stelle bearbeiten</h1>
        </div>
        {(job as JobListing).is_published && (
          <a
            href="/karriere"
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: 'var(--font-inter)', fontSize: '12px',
              color: 'var(--color-sage)', letterSpacing: '.06em',
            }}
          >
            Vorschau ↗
          </a>
        )}
      </div>
      <KarriereForm action={boundAction} job={job as JobListing} />
    </div>
  )
}
