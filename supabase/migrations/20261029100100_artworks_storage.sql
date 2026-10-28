-- Photographs of the works, one optimised file each, named after the SHA-256 of the original.
--
-- The bucket is public: published photographs are served from their public address and cached.
-- A draft's photograph has an address nobody can guess and that appears nowhere until the work is
-- published. Visitors cannot list the bucket; only the admin uploads, lists and deletes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artworks', 'artworks', true, 15728640, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;

create policy "Admin lists artwork photographs" on storage.objects
  for select to authenticated using (bucket_id = 'artworks' and (select public.is_admin()));
create policy "Admin uploads artwork photographs" on storage.objects
  for insert to authenticated with check (bucket_id = 'artworks' and (select public.is_admin()));
create policy "Admin replaces artwork photographs" on storage.objects
  for update to authenticated using (bucket_id = 'artworks' and (select public.is_admin()))
  with check (bucket_id = 'artworks' and (select public.is_admin()));
create policy "Admin deletes artwork photographs" on storage.objects
  for delete to authenticated using (bucket_id = 'artworks' and (select public.is_admin()));
