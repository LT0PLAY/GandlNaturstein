-- Storage Bucket Policies für product-images
-- Der Bucket selbst wird im Dashboard angelegt (siehe Anleitung)

-- Öffentlicher Lesezugriff auf alle Bilder
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Jeder darf Bilder lesen
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Nur eingeloggte Team-Mitglieder dürfen hochladen
CREATE POLICY "product_images_team_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Nur eingeloggte Team-Mitglieder dürfen löschen
CREATE POLICY "product_images_team_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );
