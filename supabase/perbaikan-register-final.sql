-- Prasyarat: enum public.peran_pengguna sudah memiliki nilai pengguna.
-- Jalankan pengecekan: select enum_range(null::public.peran_pengguna);

alter table public.pengguna alter column peran set default 'pengguna'::public.peran_pengguna;
alter table public.pengguna alter column status_pendaftaran set default 'menunggu';

create or replace function public.isi_profil_dari_auth(target_id uuid)
returns public.pengguna
language plpgsql security definer set search_path=public,auth
as $$
declare u auth.users%rowtype; hasil public.pengguna;
begin
  select * into u from auth.users where id=target_id;
  if u.id is null then raise exception 'Akun Auth tidak ditemukan'; end if;
  insert into public.pengguna(id,nama,peran,aktif,avatar_url,role_admin,hak_akses,email,telepon,alamat,golongan_darah,jenis_pengguna,status_pendaftaran,dibuat_pada,diperbarui_pada)
  values(
    u.id,
    coalesce(nullif(u.raw_user_meta_data->>'nama',''),nullif(u.raw_user_meta_data->>'full_name',''),split_part(u.email,'@',1),'Pengguna'),
    'pengguna'::public.peran_pengguna,true,
    coalesce(nullif(u.raw_user_meta_data->>'avatar_url',''),nullif(u.raw_user_meta_data->>'picture','')),
    'pengguna','{}'::text[],u.email,
    nullif(u.raw_user_meta_data->>'telepon',''),nullif(u.raw_user_meta_data->>'alamat',''),nullif(u.raw_user_meta_data->>'golongan_darah',''),
    coalesce(nullif(u.raw_user_meta_data->>'jenis_pengguna',''),'umum'),'menunggu',coalesce(u.created_at,now()),now()
  ) on conflict(id) do update set
    email=coalesce(excluded.email,public.pengguna.email),
    nama=case when coalesce(public.pengguna.nama,'')='' then excluded.nama else public.pengguna.nama end,
    telepon=coalesce(excluded.telepon,public.pengguna.telepon),alamat=coalesce(excluded.alamat,public.pengguna.alamat),
    golongan_darah=coalesce(excluded.golongan_darah,public.pengguna.golongan_darah),
    jenis_pengguna=coalesce(excluded.jenis_pengguna,public.pengguna.jenis_pengguna),diperbarui_pada=now()
  returning * into hasil;
  return hasil;
end $$;

create or replace function public.pmi_auth_pengguna_baru()
returns trigger language plpgsql security definer set search_path=public,auth
as $$ begin perform public.isi_profil_dari_auth(new.id); return new; end $$;

-- Hapus semua trigger sinkronisasi lama yang diketahui agar satu trigger gagal tidak membatalkan signup.
drop trigger if exists sesudah_auth_pengguna_baru on auth.users;
drop trigger if exists pmi_auth_pengguna_baru on auth.users;
drop trigger if exists pmi_auth_pengguna_sinkron on auth.users;
drop trigger if exists on_auth_user_created on auth.users;
create trigger pmi_auth_pengguna_baru after insert on auth.users for each row execute function public.pmi_auth_pengguna_baru();

-- Fallback dari halaman register. Fungsi hanya membaca data resmi auth.users.
create or replace function public.pastikan_profil_pendaftar(target_id uuid)
returns boolean language plpgsql security definer set search_path=public,auth
as $$ begin
  if not exists(select 1 from auth.users where id=target_id) then return false; end if;
  perform public.isi_profil_dari_auth(target_id);
  return true;
end $$;
grant execute on function public.pastikan_profil_pendaftar(uuid) to anon,authenticated;

-- Backfill semua akun lama.
do $$ declare r record; begin for r in select id from auth.users loop perform public.isi_profil_dari_auth(r.id); end loop; end $$;

select (select count(*) from auth.users) akun_auth,
       (select count(*) from public.pengguna) profil_pengguna,
       (select count(*) from auth.users u left join public.pengguna p on p.id=u.id where p.id is null) belum_sinkron,
       (select count(*) from public.pengguna where status_pendaftaran='menunggu') pendaftar_baru;