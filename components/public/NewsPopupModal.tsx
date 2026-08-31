'use client'

import { useEffect, useState } from 'react'
import type { Popup } from '@/lib/types'
import styles from './NewsPopupModal.module.css'

interface Props {
  popup: Popup
}

// Popups werden pro Popup-Version einmal pro Browser-Sitzung angezeigt —
// ein erneuter Seitenaufruf im selben Tab zeigt es nicht nochmal, ein neuer
// Besuch (oder ein neu/aktualisiertes Popup) hingegen schon.
const DISMISS_KEY_PREFIX = 'gandl_popup_dismissed_'

export default function NewsPopupModal({ popup }: Props) {
  const [visible, setVisible] = useState(false)
  const dismissKey = `${DISMISS_KEY_PREFIX}${popup.id}_${popup.updated_at}`

  useEffect(() => {
    try {
      if (sessionStorage.getItem(dismissKey)) return
    } catch {}
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [dismissKey])

  function close() {
    setVisible(false)
    try { sessionStorage.setItem(dismissKey, '1') } catch {}
  }

  if (!visible) return null

  const isPoster = popup.layout === 'din_a5'

  return (
    <div className={styles.overlay} onClick={close}>
      {isPoster ? (
        <div className={styles.modalA5} onClick={(e) => e.stopPropagation()}>
          <button type="button" className={styles.close} onClick={close} aria-label="Schließen">✕</button>
          {popup.image_url && (
            <img src={popup.image_url} alt={popup.title} className={styles.a5Image} />
          )}
          <div className={styles.a5Overlay}>
            <h2 className={styles.a5Title}>{popup.title}</h2>
            {popup.message && <p className={styles.a5Message}>{popup.message}</p>}
            <button type="button" className={styles.a5DismissBtn} onClick={close}>Verstanden</button>
          </div>
        </div>
      ) : (
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button type="button" className={styles.close} onClick={close} aria-label="Schließen">✕</button>
          {popup.image_url && (
            <div className={styles.imageWrap}>
              <img src={popup.image_url} alt={popup.title} className={styles.image} />
            </div>
          )}
          <div className={styles.content}>
            <h2 className={styles.title}>{popup.title}</h2>
            {popup.message && <p className={styles.message}>{popup.message}</p>}
            <button type="button" className={styles.dismissBtn} onClick={close}>Verstanden</button>
          </div>
        </div>
      )}
    </div>
  )
}
