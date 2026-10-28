-- Who may read and write what. Run with `npm run test:db` (needs the local Supabase: `npx supabase start`).
-- Everything happens in a transaction that is rolled back, so the database is left as it was.
begin;
create extension if not exists pgtap with schema extensions;

select plan(23);

-- Test data, created as the database owner (row level security does not apply to it).
insert into public.artworks (slug, title, published, note)
values ('test-draft', 'Чернова', false, 'вътрешно'), ('test-public', 'Публична', true, 'вътрешно');
insert into public.artwork_images (artwork_id, storage_path, width, height, source_hash, rights)
select id, slug || '.webp', 300, 400, md5(slug) || md5(slug), 'artist' from public.artworks where slug in ('test-draft', 'test-public');
insert into public.artwork_images (artwork_id, storage_path, width, height, source_hash, rights)
select id, 'unknown.webp', 300, 400, md5('unknown') || md5('unknown'), 'unknown' from public.artworks where slug = 'test-public';

-- ---------------------------------------------------------------------------------------------
-- Visitors
-- ---------------------------------------------------------------------------------------------
set local role anon;

select results_eq($$ select count(*)::int from public.artworks where slug = 'test-draft' $$, array[0], 'Visitors do not see drafts');
select results_eq($$ select count(*)::int from public.artworks where slug in ('test-public', 'konnik') $$, array[2], 'Visitors see published works');
select results_eq(
  $$ select count(*)::int from public.artwork_images i join public.artworks a on a.id = i.artwork_id where a.slug = 'test-draft' $$,
  array[0], 'Visitors do not see the photographs of drafts');
select results_eq($$ select count(*)::int from public.artwork_images where storage_path = 'unknown.webp' $$, array[0], 'Photographs of unknown provenance are never public');
select results_eq($$ select count(*)::int from public.artwork_images where storage_path = 'test-public.webp' $$, array[1], 'Photographs of published works are public');
select throws_ok($$ select note from public.artworks $$, '42501', null, 'Visitors cannot read internal notes');
select throws_ok($$ select source_hash from public.artwork_images $$, '42501', null, 'Visitors cannot read file hashes');
select throws_ok($$ select original_filename from public.artwork_images $$, '42501', null, 'Visitors cannot read original file names');
select results_eq($$ select count(*)::int from public.categories $$, array[9], 'Visitors see the categories');
select throws_ok($$ insert into public.categories (name, slug) values ('Тест', 'test') $$, '42501', null, 'Visitors cannot add categories');
select throws_ok($$ update public.artworks set published = true where slug = 'test-draft' $$, '42501', null, 'Visitors cannot publish');

-- ---------------------------------------------------------------------------------------------
-- A signed-in user who is not the admin (sign-ups are off, but the database must not rely on it)
-- ---------------------------------------------------------------------------------------------
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "authenticated", "app_metadata": {}}';

select results_eq($$ select count(*)::int from public.artworks where slug = 'test-draft' $$, array[0], 'Other users do not see drafts');
select throws_ok($$ insert into public.categories (name, slug) values ('Тест', 'test') $$, '42501', null, 'Other users cannot add categories');
select is_empty($$ update public.artworks set title = 'x' where slug = 'test-public' returning id $$, 'Other users cannot edit works');
select is_empty($$ delete from public.artworks where slug = 'test-public' returning id $$, 'Other users cannot delete works');
select throws_ok(
  $$ select public.create_artwork_with_image('x', null, null, null, 'x.webp', 1, 1, null, repeat('b', 64), null, null, null) $$,
  '42501', null, 'Other users cannot import photographs');

-- ---------------------------------------------------------------------------------------------
-- The admin
-- ---------------------------------------------------------------------------------------------
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000002", "role": "authenticated", "app_metadata": {"role": "admin"}}';

select results_eq($$ select count(*)::int from public.artworks where slug = 'test-draft' $$, array[1], 'The admin sees drafts');
select results_eq($$ select note from public.artworks where slug = 'test-draft' $$, array['вътрешно'], 'The admin reads internal notes');
select lives_ok($$ insert into public.categories (name, slug) values ('Тест', 'test') $$, 'The admin adds categories');
select isnt(
  public.create_artwork_with_image('test-import', null, null, null, 'import.webp', 1200, 800, null, repeat('c', 64), 'IMG_1.jpg', 'artist', null),
  null, 'The admin imports a photograph as a new draft');
select throws_ok(
  $$ select public.create_artwork_with_image('test-import-2', null, null, null, 'import-2.webp', 1, 1, null, repeat('c', 64), null, null, null) $$,
  '23505', null, 'The same photograph cannot be imported twice');

select lives_ok(
  $$ select public.reorder_artworks(array(select id from public.artworks where slug in ('test-public', 'test-draft') order by slug desc)) $$,
  'The admin can call reorder');
select results_eq(
  $$ select slug from public.artworks where slug in ('test-public', 'test-draft') order by sort_order $$,
  array['test-public', 'test-draft'], 'The admin reorders works');

select * from finish();
rollback;
