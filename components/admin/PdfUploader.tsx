'use client'

import { useState, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import styles from './PdfUploader.module.css'

interface PdfUploaderProps {
  field:       string
  currentUrl?: string
}

export default function PdfUploader({ field, currentUrl }: PdfUploaderProps) {
  const [url,       setUrl]       = useState<string>(currentUrl ?? '')
  const [filename,  setFilename]  = useState<string>(currentUrl ? decodeFilename(currentUrl) : '')
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function decodeFilename(u: string) {
    try {
      const parts = decodeURIComponent(u).split('/')
      return parts[parts.length - 1] ?? 'Datei'
    } catch { return 'Datei' }
  }

  async function handleFile(file: File) {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Nur PDF-Dateien erlaubt.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Datei zu groß (max. 20 MB).')
      return
    }

    setUploading(true)
    setError('')

    const supabase = createSupabaseBrowserClient()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `jobs/pdfs/${Date.now()}_${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true, contentType: 'application/pdf' })

    if (uploadError) {
      setError(`Upload fehlgeschlagen: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setUrl(data.publicUrl)
    setFilename(file.name)
    setUploading(false)
  }

  function handleRemove() {
    setUrl('')
    setFilename('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={styles.wrapper}>
      {/* Hidden input — speichert die URL ins Formular */}
      <input type="hidden" name={field} value={url} />

      {url ? (
        /* PDF vorhanden — Vorschau */
        <div className={styles.fileCard}>
          <span className={styles.fileIcon}>PDF</span>
          <div className={styles.fileInfo}>
            <p className={styles.fileName}>{filename}</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
              Öffnen ↗
            </a>
          </div>
          <button type="button" onClick={handleRemove} className={styles.removeBtn} aria-label="Entfernen">
            ✕
          </button>
        </div>
      ) : (
        /* Dropzone */
        <div
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(styles.dragOver) }}
          onDragLeave={(e) => e.currentTarget.classList.remove(styles.dragOver)}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove(styles.dragOver)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          {uploading ? (
            <span className={styles.uploadingText}>Wird hochgeladen…</span>
          ) : (
            <span className={styles.dropText}>
              PDF hierher ziehen oder klicken<br />
              <small>Nur PDF · max. 20 MB</small>
            </span>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
