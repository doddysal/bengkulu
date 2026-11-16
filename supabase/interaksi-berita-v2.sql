alter table public.komentar_berita add column if not exists avatar_url text;

create or replace function public.komentar_berita_dengan_avatar(target_berita uuid)
returns table(
  id uuid,
  berita_id uuid,
  pengguna_id uuid,
  nama_pengguna text,
  isi text,
  dibuat_pada timestamptz,
  avatar_url text
)
language sql stable security definer set search_path=public as $$
  select k.id,k.berita_id,k.pengguna_id,k.nama_pengguna,k.isi,k.dibuat_pada,
         coalesce(nullif(k.avatar_url,''),nullif(p.avatar_url,'')) as avatar_url
  from public.komentar_berita k
  left join public.pengguna p on p.id=k.pengguna_id
  where k.berita_id=target_berita
  order by k.dibuat_pada asc
$$;

grant execute on function public.komentar_berita_dengan_avatar(uuid) to anon,authenticated;

create or replace function public.ringkasan_interaksi_berita_v2(target_ids uuid[])
returns table(
  berita_id uuid,
  jumlah_suka bigint,
  jumlah_komentar bigint,
  avatar_penyuka text[],
  avatar_komentator text[]
)
language sql stable security definer set search_path=public as $$
  with target as (select unnest(target_ids) as berita_id),
  suka as (
    select s.berita_id,count(*)::bigint jumlah_suka,
      coalesce((array_agg(distinct p.avatar_url) filter(where p.avatar_url is not null and p.avatar_url<>''))[1:5],array[]::text[]) avatar_penyuka
    from public.suka_berita s left join public.pengguna p on p.id=s.pengguna_id
    where s.berita_id=any(target_ids) group by s.berita_id
  ),
  komentar as (
    select k.berita_id,count(*)::bigint jumlah_komentar,
      coalesce((array_agg(distinct coalesce(nullif(k.avatar_url,''),nullif(p.avatar_url,''))) filter(where coalesce(nullif(k.avatar_url,''),nullif(p.avatar_url,'')) is not null))[1:5],array[]::text[]) avatar_komentator
    from public.komentar_berita k left join public.pengguna p on p.id=k.pengguna_id
    where k.berita_id=any(target_ids) group by k.berita_id
  )
  select t.berita_id,coalesce(s.jumlah_suka,0),coalesce(k.jumlah_komentar,0),
         coalesce(s.avatar_penyuka,array[]::text[]),coalesce(k.avatar_komentator,array[]::text[])
  from target t left join suka s using(berita_id) left join komentar k using(berita_id)
$$;

grant execute on function public.ringkasan_interaksi_berita_v2(uuid[]) to anon,authenticated;

update public.komentar_berita k
set avatar_url=p.avatar_url
from public.pengguna p
where p.id=k.pengguna_id and nullif(p.avatar_url,'') is not null and nullif(k.avatar_url,'') is null;