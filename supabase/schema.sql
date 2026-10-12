-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists portfolio_categories (
  id text primary key,
  label text not null,
  stacks text[] not null default '{}',
  group_type text not null check (group_type in ('skill', 'other')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists portfolio_sites (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  category_id text not null references portfolio_categories(id) on delete cascade,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (url, category_id)
);

create index if not exists portfolio_sites_category_id_idx on portfolio_sites(category_id);
create index if not exists portfolio_categories_group_type_idx on portfolio_categories(group_type);

alter table portfolio_categories enable row level security;
alter table portfolio_sites enable row level security;

drop policy if exists "Public read categories" on portfolio_categories;
create policy "Public read categories" on portfolio_categories for select using (true);

drop policy if exists "Public read sites" on portfolio_sites;
create policy "Public read sites" on portfolio_sites for select using (true);

insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read portfolio images" on storage.objects;
create policy "Public read portfolio images" on storage.objects
  for select using (bucket_id = 'portfolio-images');

-- Site recommendations (one vote per IP)
create table if not exists site_recommendation_votes (
  ip_hash text primary key,
  created_at timestamptz not null default now()
);

alter table site_recommendation_votes enable row level security;

drop policy if exists "Public read recommendation votes" on site_recommendation_votes;
create policy "Public read recommendation votes" on site_recommendation_votes
  for select using (true);
