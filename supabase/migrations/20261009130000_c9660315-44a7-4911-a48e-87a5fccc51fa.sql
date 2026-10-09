-- Storage buckets used by the app. They were created outside migrations in the
-- original project, so a fresh Supabase project needs them here. All private:
-- public media is served through /api/public/media/*, documents are staff-only
-- (see the storage.objects policies in earlier migrations).
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('media-library', 'media-library', false),
  ('fleet-documents', 'fleet-documents', false),
  ('customer-documents', 'customer-documents', false)
ON CONFLICT (id) DO NOTHING;
