create table if not exists public.hero_slide(
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  subjudul text not null default '',
  teks_tombol text not null default 'Selengkapnya',
  tautan_tombol text not null default '#berita',
  url_gambar text not null,
  id_publik_gambar text,
  posisi_teks text not null default 'kiri' check(posisi_teks in('kiri','tengah','kanan')),
  lapisan_gelap numeric(3,2) not null default 0.55 check(lapisan_gelap between 0 and 0.9),
  urutan integer not null default 0,
  aktif boolean not null default true,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);
create index if not exists idx_hero_slide_aktif_urutan on public.hero_slide(aktif,urutan);
alter table public.hero_slide enable row level security;
drop policy if exists hero_slide_baca on public.hero_slide;
create policy hero_slide_baca on public.hero_slide for select to anon,authenticated using(aktif=true or public.peran_saat_ini() in('editor','admin','superadmin'));
drop policy if exists hero_slide_kelola on public.hero_slide;
create policy hero_slide_kelola on public.hero_slide for all to authenticated using(public.peran_saat_ini() in('admin','superadmin')) with check(public.peran_saat_ini() in('admin','superadmin'));
drop trigger if exists hero_slide_set_diperbarui on public.hero_slide;
create trigger hero_slide_set_diperbarui before update on public.hero_slide for each row execute function public.set_diperbarui_pada();