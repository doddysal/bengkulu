-- Profil dan alur pendaftaran pengguna publik.
alter table public.pengguna add column if not exists email text;
alter table public.pengguna add column if not exists telepon text;
alter table public.pengguna add column if not exists alamat text;
alter table public.pengguna add column if not exists golongan_darah text;
alter table public.pengguna add column if not exists avatar_url text;
alter table public.pengguna add column if not exists jenis_pengguna text not null default 'umum';
alter table public.pengguna add column if not exists status_pendaftaran text not null default 'aktif';
alter table public.pengguna add column if not exists catatan_admin text;
alter table public.pengguna add column if not exists diperbarui_pada timestamptz not null default now();

alter table public.pengguna drop constraint if exists pengguna_jenis_pengguna_check;
alter table public.pengguna add constraint pengguna_jenis_pengguna_check check(jenis_pengguna in('umum','anggota','relawan','pegawai','pengurus'));
alter table public.pengguna drop constraint if exists pengguna_status_pendaftaran_check;
alter table public.pengguna add constraint pengguna_status_pendaftaran_check check(status_pendaftaran in('menunggu','aktif','ditolak','diblokir'));

create or replace function public.buat_profil_pengguna_baru()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.pengguna(
    id,nama,email,telepon,alamat,golongan_darah,jenis_pengguna,status_pendaftaran,
    peran,role_admin,hak_akses,aktif
  ) values(
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nama',''),split_part(new.email,'@',1)),
    new.email,
    nullif(new.raw_user_meta_data->>'telepon',''),
    nullif(new.raw_user_meta_data->>'alamat',''),
    nullif(new.raw_user_meta_data->>'golongan_darah',''),
    coalesce(nullif(new.raw_user_meta_data->>'jenis_pengguna',''),'umum'),
    'menunggu',
    'pengguna','pengguna','{}'::text[],true
  ) on conflict(id) do update set
    nama=excluded.nama,email=excluded.email,telepon=excluded.telepon,
    alamat=excluded.alamat,golongan_darah=excluded.golongan_darah,
    jenis_pengguna=excluded.jenis_pengguna,diperbarui_pada=now();
  return new;
end $$;

drop trigger if exists sesudah_auth_pengguna_baru on auth.users;
create trigger sesudah_auth_pengguna_baru after insert on auth.users
for each row execute function public.buat_profil_pengguna_baru();

-- Pengguna dapat membaca dan memperbarui profilnya sendiri, tetapi tidak dapat mengubah role/status admin.
drop policy if exists pengguna_baca_sendiri on public.pengguna;
create policy pengguna_baca_sendiri on public.pengguna for select to authenticated
using(id=auth.uid() or public.punya_akses('pengguna'));

drop policy if exists pengguna_daftar_sendiri on public.pengguna;
create policy pengguna_daftar_sendiri on public.pengguna for insert to authenticated
with check(id=auth.uid());

drop policy if exists pengguna_perbarui_sendiri on public.pengguna;
create policy pengguna_perbarui_sendiri on public.pengguna for update to authenticated
using(id=auth.uid() or public.punya_akses('pengguna'))
with check(id=auth.uid() or public.punya_akses('pengguna'));

-- Fungsi aman untuk admin mengubah status dan role modular.
create or replace function public.admin_perbarui_pengguna(
  target_id uuid,
  target_status text,
  target_jenis text,
  target_role text,
  target_hak text[],
  target_aktif boolean,
  target_catatan text
) returns public.pengguna language plpgsql security definer set search_path=public as $$
declare hasil public.pengguna;
begin
  if not public.punya_akses('pengguna') then raise exception 'Akses ditolak'; end if;
  update public.pengguna set
    status_pendaftaran=target_status,
    jenis_pengguna=target_jenis,
    role_admin=target_role,
    hak_akses=coalesce(target_hak,'{}'::text[]),
    aktif=target_aktif,
    catatan_admin=target_catatan,
    diperbarui_pada=now()
  where id=target_id returning * into hasil;
  return hasil;
end $$;
grant execute on function public.admin_perbarui_pengguna(uuid,text,text,text,text[],boolean,text) to authenticated;