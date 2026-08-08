-- Storage bucket for playground photos.
-- Public bucket: anyone can view photos (matches the open-read data model);
-- uploading requires login and deleting is restricted to the uploader.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'playground-images',
  'playground-images',
  true,
  5242880, -- 5 MB per file; client compresses to well under this
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "playground images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'playground-images');

create policy "authenticated users can upload playground images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'playground-images' and owner_id = (select auth.uid()::text));

create policy "uploaders can delete their playground images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'playground-images' and owner_id = (select auth.uid()::text));
