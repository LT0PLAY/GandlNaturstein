export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { updateInquiryStatus } from '@/lib/actions/inquiries'
import { requireTeamMember } from '@/lib/actions/authGuard'
import AnfrageView from './AnfrageView'

async function getInquiry(id: string) {
  const { data } = await createSupabaseAdminClient()
    .from('inquiries')
    .select('*, product:products(id, name, slug, bereich, article_number, thumbnail, category:categories!products_category_id_fkey(type))')
    .eq('id', id)
    .maybeSingle()
  return data
}

export default async function AnfrageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const inq = await getInquiry(id)
  if (!inq) notFound()

  const auth = await requireTeamMember()

  async function handleStatus(formData: FormData) {
    'use server'
    await updateInquiryStatus(id, formData.get('status') as string)
  }

  return <AnfrageView inq={inq} myId={auth.ok ? auth.memberId : null} statusAction={handleStatus} />
}
