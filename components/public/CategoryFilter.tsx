'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Category } from '@/lib/types'
import styles from '@/app/(public)/category.module.css'

interface Props {
  categories: Category[]
  basePath: string  // z.B. '/aussen', '/innen', '/extras'
}

export default function CategoryFilter({ categories, basePath }: Props) {
  const pathname  = usePathname()
  // /aussen/kategorie/pflaster → 'pflaster', /aussen → ''
  const activeSlug = pathname.startsWith(`${basePath}/kategorie/`)
    ? pathname.slice(`${basePath}/kategorie/`.length)
    : ''

  if (categories.length === 0) return null

  return (
    <div className={styles.filters}>
      <Link
        href={basePath}
        className={`${styles.chip} ${!activeSlug ? styles.chipActive : ''}`}
      >
        Alle
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`${basePath}/kategorie/${cat.slug}`}
          className={`${styles.chip} ${activeSlug === cat.slug ? styles.chipActive : ''}`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  )
}
