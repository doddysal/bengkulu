alter table public.komentar_berita add column if not exists avatar_url text;

create or replace function public.ringkasan_interaksi_berita(target_ids uuid[])
returns table(berita_id uuid,jumlah_suka bigint,avatar_penyuka text[])
language sql stable security definer set search_path=public as $$
  select s.berita_id,
         count(*)::bigint as jumlah_suka,
         coalesce((array_agg(p.avatar_url order by s.dibuat_pada desc) filter(where p.avatar_url is not null and p.avatar_url<>''))[1:5],array[]::text[]) as avatar_penyuka
  from public.suka_berita s
  left join public.pengguna p on p.id=s.pengguna_id
  where s.berita_id=any(target_ids)
  group by s.berita_id
$$;
grant execute on function public.ringkasan_interaksi_berita(uuid[]) to anon,authenticated;