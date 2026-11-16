-- Jalankan setelah enum public.peran_pengguna memiliki nilai pengguna.
create or replace function public.pastikan_profil_pendaftar(target_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  u auth.users%rowtype;
begin
  select * into u from auth.users where id = target_id;
  if u.id is null then return false; end if;

  insert into public.pengguna(
    id,nama,peran,aktif,avatar_url,role_admin,hak_akses,email,
    telepon,alamat,golongan_darah,jenis_pengguna,status_pendaftaran,
    dibuat_pada,diperbarui_pada
  ) values(
    u.id,
    coalesce(nullif(u.raw_user_meta_data->>'nama',''),nullif(u.raw_user_meta_data->>'full_name',''),split_part(u.email,'@',1),'Pengguna'),
    'pengguna'::public.peran_pengguna,
    true,
    coalesce(nullif(u.raw_user_meta_data->>'avatar_url',''),nullif(u.raw_user_meta_data->>'picture','')),
    'pengguna','{}'::text[],u.email,
    nullif(u.raw_user_meta_data->>'telepon',''),
    nullif(u.raw_user_meta_data->>'alamat',''),
    nullif(u.raw_user_meta_data->>'golongan_darah',''),
    coalesce(nullif(u.raw_user_meta_data->>'jenis_pengguna',''),'umum'),
    'menunggu',coalesce(u.created_at,now()),now()
  )
  on conflict(id) do update set
    email=coalesce(excluded.email,public.pengguna.email),
    nama=case when coalesce(public.pengguna.nama,'')='' then excluded.nama else public.pengguna.nama end,
    telepon=coalesce(excluded.telepon,public.pengguna.telepon),
    alamat=coalesce(excluded.alamat,public.pengguna.alamat),
    golongan_darah=coalesce(excluded.golongan_darah,public.pengguna.golongan_darah),
    jenis_pengguna=coalesce(excluded.jenis_pengguna,public.pengguna.jenis_pengguna),
    diperbarui_pada=now();

  return true;
end;
$$;

grant execute on function public.pastikan_profil_pendaftar(uuid) to anon, authenticated;

-- Backfill akun Auth yang belum mempunyai profil.
select public.pastikan_profil_pendaftar(u.id)
from auth.users u
left join public.pengguna p on p.id=u.id
where p.id is null;

select
  (select count(*) from auth.users) as akun_auth,
  (select count(*) from public.pengguna) as profil_pengguna,
  (select count(*) from auth.users u left join public.pengguna p on p.id=u.id where p.id is null) as belum_sinkron,
  (select count(*) from public.pengguna where status_pendaftaran='menunggu') as pendaftar_baru;