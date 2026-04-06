-- Run this in your Supabase SQL editor to add YouTube post support

alter table posts
  drop constraint if exists posts_type_check;

alter table posts
  add constraint posts_type_check
    check (type in ('image', 'video', 'audio', 'gif', 'youtube'));
