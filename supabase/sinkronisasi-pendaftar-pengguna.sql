-- 1. Pastikan kolom yang dibutuhkan manajemen pengguna tersedia.
alter table public.pengguna add column if not exists email text;
alter table public.pengguna add column if not exists telepon text;
alter table public.pengguna add column if not exists alamat text;
alter table public.pengguna add column if not exists golongan_darah text;
alter table public.pengguna add column if not exists avatar_url text;
alter table public.pengguna add column if not exists jenis_pengguna text not null default 'umum';
alter table public.pengguna add column if not exists status_pendaftaran text not null default 'menunggu';
alter table public.pengguna add column if not exists role_admin text not null default 'pengguna';
alter table public.pengguna add column if not exists hak_akses text[] not null default '{}'::text[];
alter table public.pengguna add column if not exists aktif boolean not null default true;
alter table public.pengguna add column if not exists catatan_admin text;
alter table public.pengguna add column if not exists dibuat_pada timestamptz not null default now();
alter table public.pengguna add column if not exists diperbarui_pada timestamptz not null default now();

-- 2. Trigger pendaftaran. SECURITY DEFINER diperlukan karena auth.users berada di schema auth.
create or replace function public.sinkronkan_auth_ke_pengguna()
returns trigger
language plpgsql
security definer
set search_path=public,auth
as $$
begin
  insert into public.pengguna(
    id,nama,email,telepon,alamat,golongan_darah,avatar_url,jenis_pengguna,
    status_pendaftaran,role_admin,hak_akses,aktif,dibuat_pada,diperbarui_pada
  ) values(
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nama',''),nullif(new.raw_user_meta_data->>'full_name',''),split_part(coalesce(new.email,''),'@',1),'Pengguna'),
    new.email,
    nullif(new.raw_user_meta_data->>'telepon',''),
    nullif(new.raw_user_meta_data->>'alamat',''),
    nullif(new.raw_user_meta_data->>'golongan_darah',''),
    coalesce(nullif(new.raw_user_meta_data->>'avatar_url',''),nullif(new.raw_user_meta_data->>'picture','')),
    coalesce(nullif(new.raw_user_meta_data->>'jenis_pengguna',''),'umum'),
    'menunggu','pengguna','{}'::text[],true,
    coalesce(new.created_at,now()),now()
  )
  on conflict(id) do update set
    nama=coalesce(nullif(public.pengguna.nama,''),excluded.nama),
    email=coalesce(excluded.email,public.pengguna.email),
    telepon=coalesce(excluded.telepon,public.pengguna.telepon),
    alamat=coalesce(excluded.alamat,public.pengguna.alamat),
    golongan_darah=coalesce(excluded.golongan_darah,public.pengguna.golongan_darah),
    avatar_url=coalesce(excluded.avatar_url,public.pengguna.avatar_url),
    diperbarui_pada=now();
  return new;
end $$;

drop trigger if exists sesudah_auth_pengguna_baru on auth.users;
drop trigger if exists on_auth_user_created on auth.users;
create trigger sesudah_auth_pengguna_baru
after insert or update of email,raw_user_meta_data on auth.users
for each row execute function public.sinkronkan_auth_ke_pengguna();

-- 3. Backfill seluruh akun Auth yang sudah terlanjur dibuat tetapi belum masuk public.pengguna.
insert into public.pengguna(
  id,nama,email,telepon,alamat,golongan_darah,avatar_url,jenis_pengguna,
  status_pendaftaran,role_admin,hak_akses,aktif,dibuat_pada,diperbarui_pada
)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'nama',''),nullif(u.raw_user_meta_data->>'full_name',''),split_part(coalesce(u.email,''),'@',1),'Pengguna'),
  u.email,
  nullif(u.raw_user_meta_data->>'telepon',''),
  nullif(u.raw_user_meta_data->>'alamat',''),
  nullif(u.raw_user_meta_data->>'golongan_darah',''),
  coalesce(nullif(u.raw_user_meta_data->>'avatar_url',''),nullif(u.raw_user_meta_data->>'picture','')),
  coalesce(nullif(u.raw_user_meta_data->>'jenis_pengguna',''),'umum'),
  'menunggu','pengguna','{}'::text[],true,u.created_at,now()
from auth.users u
on conflict(id) do update set
  email=coalesce(excluded.email,public.pengguna.email),
  avatar_url=coalesce(excluded.avatar_url,public.pengguna.avatar_url),
  diperbarui_pada=now();

-- 4. RLS: admin dengan akses pengguna dapat melihat semua; setiap pengguna dapat melihat dirinya.
alter table public.pengguna enable row level security;
drop policy if exists pengguna_baca on public.pengguna;
drop policy if exists pengguna_baca_sendiri on public.pengguna;
create policy pengguna_baca on public.pengguna
for select to authenticated
using(id=auth.uid() or public.punya_akses('pengguna'));

-- 5. Hasil diagnosis setelah migrasi.
select
  (select count(*) from auth.users) as jumlah_auth,
  (select count(*) from public.pengguna) as jumlah_profil,
  (select count(*) from auth.users u left join public.pengguna p on p.id=u.id where p.id is null) as belum_sinkron,
  (select count(*) from public.pengguna where status_pendaftaran='menunggu') as pendaftar_baru;