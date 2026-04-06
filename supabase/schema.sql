-- Run this in your Supabase SQL editor

create table if not exists posts (
  id          uuid        default gen_random_uuid() primary key,
  type        text        not null check (type in ('image', 'video', 'audio', 'gif')),
  url         text        not null,
  public_id   text        not null,
  title       text,
  description text,
  tags        text[]      default '{}',
  width       integer,
  height      integer,
  created_at  timestamptz default now()
);

-- Row-level security
alter table posts enable row level security;

-- Anyone can read
create policy "Public read"
  on posts for select
  using (true);

-- Only authenticated users can insert
create policy "Auth insert"
  on posts for insert
  with check (auth.role() = 'authenticated');

-- Only authenticated users can delete
create policy "Auth delete"
  on posts for delete
  using (auth.role() = 'authenticated');
