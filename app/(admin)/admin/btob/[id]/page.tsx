export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import { getCustomerDocument, updateCustomerDocument } from '@/lib/actions/customerAccess'
import DocumentForm from '../DocumentForm'
import styles from '../../form.module.css'

const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (SUPABASE_CONFIGURED) {
    const user = await getCurrentUser()
    if (!user || (user.role as string) !== 'admin') redirect('/admin/login')
  }

  const { id } = await params
  const doc = await getCustomerDocument(id)
  if (!doc) notFound()

  const boundAction = updateCustomerDocument.bind(null, id)

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// BtoB Login</p>
          <h1 className={styles.pageTitle}>Dokument bearbeiten</h1>
        </div>
      </div>
      <DocumentForm action={boundAction} doc={doc} />
    </div>
  )
}
