'use client'

import { useTransition } from 'react'

interface DeleteButtonProps {
  action:      () => Promise<unknown>
  label?:      string
  confirmMsg?: string
  className?:  string
}

export default function DeleteButton({
  action,
  label      = 'Löschen',
  confirmMsg = 'Wirklich löschen?',
  className,
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(confirmMsg)) return
    startTransition(() => { action() })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      {isPending ? '…' : label}
    </button>
  )
}
