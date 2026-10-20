-- Migration 034: Storage nur für Admin/Editor, Bucket-Limit und MIME-Beschränkung
-- ============================================================
-- Bisher (Migration 028) durfte jeder aktive Mitarbeiter — auch die Rolle "viewer" —
-- Dateien hochladen und löschen; der Bucket hatte weder Größen- noch Typ-Limit.
-- Jetzt: nur aktive Admins und Editoren; max. 20 MB; nur Bilder und PDF.
-- UPDATE-Policy ist nötig, weil ImageUploader/PdfUploader mit upsert: true arbeiten.

DROP POLICY IF EXISTS "product_images_team_upload" ON storage.objects;
DROP POLICY IF EXISTS "product_images_team_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_team_delete" ON storage.objects;

CREATE POLICY "product_images_team_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "product_images_team_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "product_images_team_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('admin', 'editor')
    )
  );

UPDATE storage.buckets
SET file_size_limit = 20 * 1024 * 1024,
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
      'application/pdf'
    ]
WHERE id = 'product-images';
