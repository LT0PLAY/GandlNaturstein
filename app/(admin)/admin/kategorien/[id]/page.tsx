import { redirect, notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { updateCategory } from '@/lib/actions/categories'
import KategorieForm from '@/components/admin/KategorieForm'
import type { Category } from '@/lib/types'
import styles from '../../form.module.css'

async function getCategory(id: string): Promise<Category | null> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('categories').select('*').eq('id', id).single()
    return data as Category
  } catch { return null }
}

export default async function EditKategoriePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await getCategory(id)
  if (!category) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    const result = await updateCategory(id, formData)
    if (result.success) redirect('/admin/kategorien')
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>// Kategorien</p>
        <h1 className={styles.pageTitle}>Bearbeiten: {category.name}</h1>
      </div>
      <KategorieForm category={category} action={handleUpdate} />
    </div>
  )
}
