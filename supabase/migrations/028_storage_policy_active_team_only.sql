-- Migration 028: Storage-Policies auf AKTIVE Team-Mitglieder verschärfen
-- ============================================================
-- Bisher (Migration 003) durfte JEDER mit einer gültigen Supabase-Auth-Session
-- (auth.role() = 'authenticated') Bilder/PDFs hochladen und löschen — unabhängig
-- davon, ob team_members.is_active für dieses Konto true oder false ist.
-- Ein in der App deaktivierter Mitarbeiter konnte also trotzdem direkt über die
-- Supabase-Storage-API (Browser-Client, ImageUploader/PdfUploader) weiter
-- hochladen/löschen. Jetzt: nur noch aktive Team-Mitglieder dürfen das.

DROP POLICY IF EXISTS "product_images_team_upload" ON storage.objects;
DROP POLICY IF EXISTS "product_images_team_delete" ON storage.objects;

CREATE POLICY "product_images_team_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.user_id = auth.uid()
        AND team_members.is_active = true
    )
  );

CREATE POLICY "product_images_team_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.user_id = auth.uid()
        AND team_members.is_active = true
    )
  );
