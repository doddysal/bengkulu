alter table public.berita add column if not exists foto_album jsonb not null default '[]'::jsonb;
alter table public.berita add column if not exists nama_penulis text;
alter table public.berita add column if not exists avatar_penulis text;
alter table public.berita add column if not exists izinkan_komentar boolean not null default true;
alter table public.berita add column if not exists jumlah_suka integer not null default 0;

create table if not exists public.komentar_berita(
  id uuid primary key default gen_random_uuid(),
  berita_id uuid not null references public.berita(id) on delete cascade,
  pengguna_id uuid not null references auth.users(id) on delete cascade,
  nama_pengguna text not null,
  isi text not null check(char_length(isi) between 1 and 2000),
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);
create table if not exists public.suka_berita(
  id uuid primary key default gen_random_uuid(),
  berita_id uuid not null references public.berita(id) on delete cascade,
  pengguna_id uuid not null references auth.users(id) on delete cascade,
  dibuat_pada timestamptz not null default now(),
  unique(berita_id,pengguna_id)
);
create index if not exists idx_komentar_berita on public.komentar_berita(berita_id,dibuat_pada desc);
create index if not exists idx_suka_berita on public.suka_berita(berita_id);
alter table public.komentar_berita enable row level security;
alter table public.suka_berita enable row level security;
drop policy if exists komentar_baca on public.komentar_berita;
create policy komentar_baca on public.komentar_berita for select to anon,authenticated using(true);
drop policy if exists komentar_tambah on public.komentar_berita;
create policy komentar_tambah on public.komentar_berita for insert to authenticated with check(pengguna_id=auth.uid());
drop policy if exists komentar_ubah on public.komentar_berita;
create policy komentar_ubah on public.komentar_berita for update to authenticated using(pengguna_id=auth.uid() or public.peran_saat_ini() in('admin','superadmin')) with check(pengguna_id=auth.uid() or public.peran_saat_ini() in('admin','superadmin'));
drop policy if exists komentar_hapus on public.komentar_berita;
create policy komentar_hapus on public.komentar_berita for delete to authenticated using(pengguna_id=auth.uid() or public.peran_saat_ini() in('admin','superadmin'));
drop policy if exists suka_baca on public.suka_berita;
create policy suka_baca on public.suka_berita for select to anon,authenticated using(true);
drop policy if exists suka_kelola on public.suka_berita;
create policy suka_kelola on public.suka_berita for all to authenticated using(pengguna_id=auth.uid()) with check(pengguna_id=auth.uid());