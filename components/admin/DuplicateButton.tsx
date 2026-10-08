'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { duplicateProduct } from '@/lib/actions/products'

export default function DuplicateButton({ productId, className }: { productId: string; className?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const res = await duplicateProduct(productId)
      if (res.error || !res.id) { setError(res.error ?? 'Duplizieren fehlgeschlagen.'); return }
      router.push(`/admin/produkte/${res.id}`)
    })
  }

  return (
    <>
      <button type="button" onClick={handleClick} disabled={isPending} className={className} title="Als V2/V3 kopieren (startet inaktiv)">
        {isPending ? '…' : 'Duplizieren'}
      </button>
      {error && <span role="alert" style={{ color: '#E06060', fontSize: '13px' }}>{error}</span>}
    </>
  )
}
