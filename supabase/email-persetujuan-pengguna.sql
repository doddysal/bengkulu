-- Audit email status pengguna. Jalankan satu kali di Supabase SQL Editor.
create table if not exists public.notifikasi_status_pengguna(
  id bigint generated always as identity primary key,
  pengguna_id uuid not null references public.pengguna(id) on delete cascade,
  status text not null check(status in('aktif','ditolak','diblokir')),
  email text not null,
  provider_id text,
  dikirim_pada timestamptz not null default now(),
  constraint notifikasi_status_pengguna_unik unique(pengguna_id,status)
);
alter table public.notifikasi_status_pengguna enable row level security;
-- Tabel audit hanya diakses Edge Function dengan service role.

create index if not exists notifikasi_status_pengguna_idx
on public.notifikasi_status_pengguna(pengguna_id,dikirim_pada desc);