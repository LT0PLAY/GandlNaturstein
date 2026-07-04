'use client'

import { useState, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import styles from './ImageUploader.module.css'

interface ImageUploaderProps {
  productId?:   string
  field:        string
  label:        string
  hint?:        string
  multiple?:    boolean
  max?:         number       // max. Anzahl Bilder (z.B. 6 für Galerie)
  currentUrl?:  string
}

export default function ImageUploader({
  productId,
  field,
  label,
  hint,
  multiple = false,
  max,
  currentUrl,
}: ImageUploaderProps) {
  const [previews,   setPreviews]   = useState<{ file: File; url: string }[]>([])
  const [uploaded,   setUploaded]   = useState<string[]>(currentUrl ? [currentUrl] : [])
  const [uploading,  setUploading]  = useState(false)
  const [error,      setError]      = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    if (!files.length) return
    setUploading(true)
    setError('')

    const supabase = createSupabaseBrowserClient()
    const newUrls: string[] = []

    const remaining = max ? max - uploaded.length : Infinity
    const toUpload  = Array.from(files).slice(0, remaining)

    if (max && Array.from(files).length > remaining) {
      setError(`Maximal ${max} Fotos erlaubt. Es wurden nur ${remaining} hochgeladen.`)
    }

    for (const file of toUpload) {
      const ext  = file.name.split('.').pop()
      const path = `products/temp/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) {
        setError(`Upload fehlgeschlagen: ${uploadError.message}`)
        continue
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      newUrls.push(data.publicUrl)
    }

    setUploaded(multiple ? [...uploaded, ...newUrls] : newUrls)
    setUploading(false)
  }

  function removeImage(url: string) {
    setUploaded(uploaded.filter((u) => u !== url))
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>{label}</p>
      {hint && <p className={styles.hint}>{hint}</p>}

      {/* Hidden inputs mit den hochgeladenen URLs */}
      {uploaded.map((url, i) => (
        <input
          key={url}
          type="hidden"
          name={multiple ? `${field}_${i}` : field}
          value={url}
        />
      ))}
      {/* Marker damit der Server weiß wieviele */}
      <input type="hidden" name={`${field}_count`} value={uploaded.length} />

      {/* Vorschau */}
      {uploaded.length > 0 && (
        <div className={styles.previews}>
          {uploaded.map((url) => (
            <div key={url} className={styles.preview}>
              <img src={url} alt="" className={styles.previewImg} />
              <button type="button" onClick={() => removeImage(url)} className={styles.removeBtn}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Upload-Zone */}
      {(!uploaded.length || multiple) && !(max && uploaded.length >= max) && (
        <div
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(styles.dragOver) }}
          onDragLeave={(e) => e.currentTarget.classList.remove(styles.dragOver)}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove(styles.dragOver)
            handleFiles(e.dataTransfer.files)
          }}
        >
          {uploading
            ? <span className={styles.uploadingText}>Wird hochgeladen…</span>
            : <span className={styles.dropText}>Klicken oder Bild hierher ziehen<br/><small>JPG, PNG, WebP · max. 10MB</small></span>
          }
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
