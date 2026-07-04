export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { updateReference, removeReferenceImage } from '@/lib/actions/references'
import ReferenzForm from '../ReferenzForm'
import DeleteButton from '@/components/admin/DeleteButton'
import type { Reference } from '@/lib/types'
import styles from '../../form.module.css'
import tableStyles from '../../table.module.css'

async function getReference(id: string): Promise<Reference | null> {
  const { data } = await createSupabaseAdminClient()
    .from('project_references')
    .select('*, product:products(id,name,slug)')
    .eq('id', id)
    .single()
  return data as Reference | null
}

async function getProducts() {
  const { data } = await createSupabaseAdminClient()
    .from('products')
    .select('id, name')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('name')
  return data ?? []
}

export default async function ReferenzEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [ref, products] = await Promise.all([getReference(id), getProducts()])
  if (!ref) notFound()

  const boundAction = updateReference.bind(null, id)

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>// Referenzen</p>
          <h1 className={styles.pageTitle}>{ref.title}</h1>
        </div>
        {ref.is_published && (
          <a
            href={`/referenzen/${ref.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={tableStyles.btnEdit}
            style={{ textDecoration: 'none' }}
          >
            ↗ Vorschau
          </a>
        )}
      </div>

      <ReferenzForm action={boundAction} reference={ref} products={products} />

      {/* Galerie verwalten */}
      {ref.images && ref.images.length > 0 && (
        <div style={{ maxWidth: '800px', marginTop: '40px' }}>
          <p className={styles.sectionLabel}>Galerie verwalten</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {ref.images.map((url, i) => (
              <div key={i} style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
                <img src={url} alt="" style={{ width: '100px', height: '75px', objectFit: 'cover' }} />
                <DeleteButton
                  action={removeReferenceImage.bind(null, ref.id, url)}
                  label="Entfernen"
                  confirmMsg="Dieses Bild aus der Galerie entfernen?"
                  className={tableStyles.btnDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
