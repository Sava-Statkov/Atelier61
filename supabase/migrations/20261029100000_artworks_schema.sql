-- Artworks, their photographs, categories and cycles: the single source of truth for the works.
--
-- Visitors (role `anon`) read only published works. Only the admin writes; the admin is the user
-- whose app_metadata has role = "admin" (set by hand, see docs/assets.md). Sign-ups are disabled.
--
-- Concepts are kept apart:
--   category  what kind of work it is (Живопис, Акварел, Шарж, …), one per work
--   cycle     the body of work it belongs to (Каменната книга на България, …), at most one per work
--   exhibitions stay in src/content/exhibitions.ts and point to works by slug

-- ---------------------------------------------------------------------------------------------
-- Who is the admin
-- ---------------------------------------------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- order of the filter on the works page
  sort_order integer not null default 0
);

create table public.cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  -- the work that represents the cycle; foreign key added below, after artworks exists
  featured_artwork_id uuid,
  -- order of the rooms on the home page and of the filter
  sort_order integer not null default 0
);

-- New works get the next number, so they are added at the end of the order.
create sequence public.artworks_sort_order_seq;

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  -- empty while unknown; nothing is guessed
  title text check (title is null or length(btrim(title)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid references public.categories (id) on delete restrict,
  cycle_id uuid references public.cycles (id) on delete restrict,
  year smallint check (year between 1900 and 2100),
  -- as the artist states it, e.g. "масло върху платно"
  technique text,
  description text,
  height_cm numeric(6, 1) check (height_cm > 0),
  width_cm numeric(6, 1) check (width_cm > 0),
  depth_cm numeric(6, 1) check (depth_cm > 0),
  -- ids from src/content/sources.ts, cited on the work's page
  sources text[] not null default '{}',
  -- internal editorial note; never readable by visitors (see the grants below)
  note text,
  sort_order bigint not null default nextval('public.artworks_sort_order_seq'),
  published boolean not null default false,
  -- the work on the home page wall, beside the name; at most one (index below)
  on_home boolean not null default false,
  created_at timestamptz not null default now(),
  -- deferred, so that reorder_artworks can swap positions in one statement
  constraint artworks_sort_order_key unique (sort_order) deferrable initially deferred
);

alter sequence public.artworks_sort_order_seq owned by public.artworks.sort_order;

alter table public.cycles
  add constraint cycles_featured_artwork_id_fkey
  foreign key (featured_artwork_id) references public.artworks (id) on delete set null;

create table public.artwork_images (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  -- path inside the "artworks" storage bucket: "<sha256 of the original>.webp"
  storage_path text not null unique,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  -- the first photograph is the main view
  sort_order integer not null default 0,
  alt text,
  -- artist: photographed or owned by the artist or his family; licensed: third party with written
  -- permission (record it in credit); unknown: never shown publicly
  rights text not null default 'artist' check (rights in ('artist', 'licensed', 'unknown')),
  credit text,
  -- tiny blurred preview shown while the photograph loads
  blur_data_url text check (blur_data_url is null or length(blur_data_url) < 4096),
  -- SHA-256 of the original file: the same photograph cannot be imported twice
  source_hash text not null unique check (source_hash ~ '^[0-9a-f]{64}$'),
  original_filename text,
  created_at timestamptz not null default now()
);

create index artworks_published_order_idx on public.artworks (published, sort_order, id);
create unique index artworks_on_home_key on public.artworks (on_home) where on_home;
create index artworks_category_id_idx on public.artworks (category_id);
create index artworks_cycle_id_idx on public.artworks (cycle_id);
create index artwork_images_artwork_order_idx on public.artwork_images (artwork_id, sort_order);
create index cycles_featured_artwork_id_idx on public.cycles (featured_artwork_id);

-- ---------------------------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.cycles enable row level security;
alter table public.artworks enable row level security;
alter table public.artwork_images enable row level security;

create policy "Categories are public" on public.categories
  for select to anon, authenticated using (true);
create policy "Admin adds categories" on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin edits categories" on public.categories
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes categories" on public.categories
  for delete to authenticated using ((select public.is_admin()));

create policy "Cycles are public" on public.cycles
  for select to anon, authenticated using (true);
create policy "Admin adds cycles" on public.cycles
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin edits cycles" on public.cycles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes cycles" on public.cycles
  for delete to authenticated using ((select public.is_admin()));

create policy "Published works are public, the admin sees all" on public.artworks
  for select to anon, authenticated using (published or (select public.is_admin()));
create policy "Admin adds works" on public.artworks
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin edits works" on public.artworks
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes works" on public.artworks
  for delete to authenticated using ((select public.is_admin()));

create policy "Photographs of published works are public, the admin sees all" on public.artwork_images
  for select to anon, authenticated using (
    (select public.is_admin())
    or (
      rights <> 'unknown'
      and exists (select 1 from public.artworks a where a.id = artwork_id and a.published)
    )
  );
create policy "Admin adds photographs" on public.artwork_images
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin edits photographs" on public.artwork_images
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin deletes photographs" on public.artwork_images
  for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------------------------
-- Grants. Visitors read only the public columns; internal notes and file names stay private.
-- The admin signs in, so is `authenticated`; row level security limits that role to the admin.
-- ---------------------------------------------------------------------------------------------

revoke all on table public.categories, public.cycles, public.artworks, public.artwork_images from anon, authenticated;

grant select on table public.categories, public.cycles to anon;
grant select (
  id, title, slug, category_id, cycle_id, year, technique, description,
  height_cm, width_cm, depth_cm, sources, sort_order, published, on_home, created_at
) on table public.artworks to anon;
grant select (
  id, artwork_id, storage_path, width, height, sort_order, alt, rights, credit, blur_data_url
) on table public.artwork_images to anon;

grant select, insert, update, delete on table public.categories, public.cycles, public.artworks, public.artwork_images to authenticated;
grant usage on sequence public.artworks_sort_order_seq to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Functions used by the admin. They run with the caller's rights, so row level security applies.
-- ---------------------------------------------------------------------------------------------

-- One imported photograph becomes one draft work, in a single transaction.
create function public.create_artwork_with_image(
  p_slug text,
  p_title text,
  p_category_id uuid,
  p_cycle_id uuid,
  p_storage_path text,
  p_width integer,
  p_height integer,
  p_blur_data_url text,
  p_source_hash text,
  p_original_filename text,
  p_rights text,
  p_credit text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only the admin can import photographs' using errcode = '42501';
  end if;

  insert into public.artworks (slug, title, category_id, cycle_id)
  values (p_slug, nullif(btrim(p_title), ''), p_category_id, p_cycle_id)
  returning id into new_id;

  insert into public.artwork_images (
    artwork_id, storage_path, width, height, blur_data_url, source_hash, original_filename, rights, credit
  )
  values (
    new_id, p_storage_path, p_width, p_height, p_blur_data_url, p_source_hash, p_original_filename,
    coalesce(p_rights, 'artist'), nullif(btrim(p_credit), '')
  );

  return new_id;
end;
$$;

-- Puts the given works in the given order, using the positions they already occupy, so works that
-- are not in the list (e.g. hidden by a filter in the admin) keep their place.
create function public.reorder_artworks(p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only the admin can reorder works' using errcode = '42501';
  end if;

  with slots as (
    select sort_order, row_number() over (order by sort_order, id) as position
    from public.artworks
    where id = any (p_ids)
  ),
  wanted as (
    select id, position from unnest(p_ids) with ordinality as w (id, position)
  )
  update public.artworks a
  set sort_order = s.sort_order
  from wanted w
  join slots s on s.position = w.position
  where a.id = w.id;
end;
$$;

revoke all on function public.create_artwork_with_image(text, text, uuid, uuid, text, integer, integer, text, text, text, text, text) from public, anon;
revoke all on function public.reorder_artworks(uuid[]) from public, anon;
grant execute on function public.create_artwork_with_image(text, text, uuid, uuid, text, integer, integer, text, text, text, text, text) to authenticated;
grant execute on function public.reorder_artworks(uuid[]) to authenticated;
