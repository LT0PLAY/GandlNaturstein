'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  action:    () => Promise<unknown>
  isActive:  boolean
  className?: string
}

// Schaltet Aktiv/Inaktiv direkt aus der Liste heraus um (ohne Formular zu öffnen).
export default function ToggleActiveButton({ action, isActive, className }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      await action()
      router.refresh()
    })
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className={className}>
      {isPending ? '…' : isActive ? 'Deaktivieren' : 'Aktivieren'}
    </button>
  )
}
