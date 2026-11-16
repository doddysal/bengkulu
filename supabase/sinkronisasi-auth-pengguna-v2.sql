-- PATCH 25 V2
-- Sinkronisasi minimal dan aman dari auth.users ke public.pengguna.
-- Script ini tidak menghapus trigger lain dan tidak bergantung pada fungsi punya_akses().

begin;

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

create or replace function public.pmi_sinkronkan_auth_pengguna()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.pengguna(
    id,nama,email,telepon,alamat,golongan_darah,avatar_url,
    jenis_pengguna,status_pendaftaran,role_admin,hak_akses,
    aktif,dibuat_pada,diperbarui_pada
  ) values(
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'nama',''),
      nullif(new.raw_user_meta_data->>'full_name',''),
      nullif(split_part(coalesce(new.email,''),'@',1),''),
      'Pengguna'
    ),
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
    nama=case when coalesce(public.pengguna.nama,'')='' then excluded.nama else public.pengguna.nama end,
    email=coalesce(excluded.email,public.pengguna.email),
    telepon=coalesce(excluded.telepon,public.pengguna.telepon),
    alamat=coalesce(excluded.alamat,public.pengguna.alamat),
    golongan_darah=coalesce(excluded.golongan_darah,public.pengguna.golongan_darah),
    avatar_url=coalesce(excluded.avatar_url,public.pengguna.avatar_url),
    diperbarui_pada=now();
  return new;
end;
$$;

-- Hanya mengelola trigger milik patch ini. Trigger aplikasi lain tidak disentuh.
drop trigger if exists pmi_auth_pengguna_sinkron on auth.users;
create trigger pmi_auth_pengguna_sinkron
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.pmi_sinkronkan_auth_pengguna();

-- Backfill akun yang sudah pernah mendaftar.
insert into public.pengguna(
  id,nama,email,telepon,alamat,golongan_darah,avatar_url,
  jenis_pengguna,status_pendaftaran,role_admin,hak_akses,
  aktif,dibuat_pada,diperbarui_pada
)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data->>'nama',''),
    nullif(u.raw_user_meta_data->>'full_name',''),
    nullif(split_part(coalesce(u.email,''),'@',1),''),
    'Pengguna'
  ),
  u.email,
  nullif(u.raw_user_meta_data->>'telepon',''),
  nullif(u.raw_user_meta_data->>'alamat',''),
  nullif(u.raw_user_meta_data->>'golongan_darah',''),
  coalesce(nullif(u.raw_user_meta_data->>'avatar_url',''),nullif(u.raw_user_meta_data->>'picture','')),
  coalesce(nullif(u.raw_user_meta_data->>'jenis_pengguna',''),'umum'),
  'menunggu','pengguna','{}'::text[],true,
  u.created_at,now()
from auth.users u
where not exists(select 1 from public.pengguna p where p.id=u.id)
on conflict(id) do nothing;

commit;

-- Hasil yang harus diperhatikan setelah eksekusi.
select
  (select count(*) from auth.users) as akun_auth,
  (select count(*) from public.pengguna) as profil_pengguna,
  (select count(*) from auth.users u left join public.pengguna p on p.id=u.id where p.id is null) as belum_sinkron,
  (select count(*) from public.pengguna where status_pendaftaran='menunggu') as pendaftar_baru;

select
  u.id,u.email,u.created_at,
  case when p.id is null then 'BELUM MASUK PUBLIC.PENGGUNA' else 'SUDAH SINKRON' end as status_sinkron
from auth.users u
left join public.pengguna p on p.id=u.id
order by u.created_at desc
limit 20;