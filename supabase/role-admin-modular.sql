-- Role modular tidak mengubah enum peran lama agar kompatibel dengan modul yang sudah berjalan.
alter table public.pengguna add column if not exists role_admin text not null default 'pengguna';
alter table public.pengguna add column if not exists hak_akses text[] not null default '{}'::text[];

alter table public.pengguna drop constraint if exists pengguna_role_admin_check;
alter table public.pengguna add constraint pengguna_role_admin_check check(role_admin in(
  'pengguna','superadmin','admin_utama','admin_berita','admin_donor_darah','admin_relawan',
  'admin_sejarah','admin_prinsip','admin_visi_misi','admin_layanan','admin_agenda','admin_galeri'
));

create or replace function public.punya_akses(kode text)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.pengguna
    where id=auth.uid() and aktif=true
    and (role_admin='superadmin' or kode=any(hak_akses))
  )
$$;

-- Sinkronkan akun lama agar tidak kehilangan akses.
update public.pengguna set
  role_admin=case when peran::text='superadmin' then 'superadmin' when peran::text='admin' then 'admin_utama' else role_admin end,
  hak_akses=case
    when peran::text='superadmin' then array['dashboard','berita','donor_darah','relawan','sejarah','prinsip','visi_misi','layanan','agenda','galeri','pengguna','cms']
    when peran::text='admin' then array['dashboard','berita','donor_darah','relawan','sejarah','prinsip','visi_misi','layanan','agenda','galeri','cms']
    when peran::text='editor' then array['dashboard','berita']
    else hak_akses end;

create or replace function public.role_admin_sesuai_profile(kode text)
returns boolean language sql stable security definer set search_path=public as $$
  select case kode
    when 'sejarah' then public.punya_akses('sejarah')
    when 'prinsip' then public.punya_akses('prinsip')
    when 'visi_misi' then public.punya_akses('visi_misi')
    when 'layanan' then public.punya_akses('layanan')
    else false end
$$;

-- Karena fungsi dibutuhkan policy, buat ulang policy setelah fungsi tersedia.
drop policy if exists profil_pmi_kelola on public.profil_pmi;
create policy profil_pmi_kelola on public.profil_pmi for all to authenticated
using(public.role_admin_sesuai_profile(kode_bagian))
with check(public.role_admin_sesuai_profile(kode_bagian));

-- Berita dikelola admin berita atau superadmin.
drop policy if exists berita_kelola on public.berita;
create policy berita_kelola on public.berita for all to authenticated
using(public.punya_akses('berita')) with check(public.punya_akses('berita'));

-- Pengguna hanya dikelola superadmin/pemilik akses pengguna.
drop policy if exists pengguna_baca on public.pengguna;
create policy pengguna_baca on public.pengguna for select to authenticated
using(id=auth.uid() or public.punya_akses('pengguna'));
drop policy if exists pengguna_kelola on public.pengguna;
create policy pengguna_kelola on public.pengguna for update to authenticated
using(public.punya_akses('pengguna')) with check(public.punya_akses('pengguna'));